from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Annotated
from datetime import datetime, timedelta, timezone
import stripe

from app.models import User
from app.config import settings
from app.auth import get_current_user
from app.logger import logger
from app.db import get_db


stripe.api_key = settings.stripe_api_key

router = APIRouter(prefix="/payment", tags=["payment"])


@router.post("/checkout")
async def create_checkout_session(
    current_user: Annotated[User, Depends(get_current_user)]
):
    """Create a Stripe Checkout Session for premium subscription"""
    try:
        # Check if user is already premium
        if current_user.is_premium and current_user.premium_expiry:
            now = datetime.now(timezone.utc)
            expiry = current_user.premium_expiry
            if expiry.tzinfo is None:
                expiry = expiry.replace(tzinfo=timezone.utc)
            
            if expiry > now:
                logger.info(
                    "User already has active premium subscription",
                    user_id=current_user.id,
                    expiry=current_user.premium_expiry,
                    event="checkout_already_premium"
                )
                raise HTTPException(
                    status_code=400,
                    detail={
                        "message": "You already have an active premium subscription!",
                        "code": "ALREADY_PREMIUM",
                        "expiry": current_user.premium_expiry.isoformat()
                    }
                )
        
        # Determine success and cancel URLs
        frontend_url = settings.frontend_url or "http://localhost:3000" # add later settings.frontend_url or.  for production    
        success_url = f"{frontend_url}/dashboard?premium=success"
        cancel_url = f"{frontend_url}/pricing?checkout=cancelled"
        
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': 'QuestPath Premium Subscription',
                        'description': 'Unlock unlimited goals, priority AI processing, and premium features',
                    },
                    'unit_amount': 500,  # $5.00
                    'recurring': {
                        'interval': 'month',
                    },
                },
                'quantity': 1,
            }],
            metadata={
                "user_id": str(current_user.id),
                "user_email": current_user.email,
            },
            mode='subscription',
            success_url=success_url,
            cancel_url=cancel_url,
            customer_email=current_user.email,
            client_reference_id=str(current_user.id),
        )
        
        logger.info(
            "Checkout session created",
            user_id=current_user.id,
            session_id=checkout_session.id,
            event="checkout_created"
        )
        
        return {"url": checkout_session.url}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            "Failed to create checkout session",
            error=str(e),
            user_id=current_user.id,
            event="checkout_error"
        )
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Failed to create checkout session. Please try again.",
                "code": "CHECKOUT_ERROR",
                "error": str(e)
            }
        )


@router.post("/cancel-subscription")
async def cancel_subscription(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Cancel user's premium subscription"""
    try:
        # Check if user has premium
        if not current_user.is_premium:
            raise HTTPException(
                status_code=400,
                detail="You don't have an active premium subscription"
            )
        
        # First, find the customer by email
        customers = stripe.Customer.list(email=current_user.email, limit=1)
        
        if not customers.data:
            logger.warning(
                "No Stripe customer found for user",
                user_id=current_user.id,
                email=current_user.email,
                event="cancel_no_customer"
            )
            raise HTTPException(
                status_code=404,
                detail="No payment customer found. Please contact support."
            )
        
        customer = customers.data[0]
        
        # Find active subscriptions for this customer
        subscriptions = stripe.Subscription.list(
            customer=customer.id,
            status='active',
            limit=10
        )
        
        if not subscriptions.data:
            logger.warning(
                "No active subscription found in Stripe for premium user",
                user_id=current_user.id,
                email=current_user.email,
                customer_id=customer.id,
                event="cancel_no_subscription"
            )
            raise HTTPException(
                status_code=404,
                detail="No active subscription found. It may have already been cancelled."
            )
        
        # Get the first active subscription
        user_subscription = subscriptions.data[0]
        
        # Cancel the subscription at period end (user keeps access until then)
        canceled_subscription = stripe.Subscription.modify(
            user_subscription.id,
            cancel_at_period_end=True
        )
        
        # Get the cancellation effective date
        # Handle both dict and object access patterns
        if hasattr(canceled_subscription, 'current_period_end'):
            period_end = canceled_subscription.current_period_end
        elif isinstance(canceled_subscription, dict):
            period_end = canceled_subscription.get('current_period_end')
        else:
            period_end = None
        
        if period_end:
            cancel_at = datetime.fromtimestamp(period_end, tz=timezone.utc)
        else:
            # Fallback if no period end found
            cancel_at = datetime.now(timezone.utc) + timedelta(days=30)
            logger.warning(
                "No period_end in cancelled subscription, using 30-day fallback",
                user_id=current_user.id,
                subscription_id=user_subscription.id,
                event="cancel_no_period_end"
            )
        
        logger.info(
            "Subscription cancelled",
            user_id=current_user.id,
            subscription_id=user_subscription.id,
            cancel_at=cancel_at.isoformat(),
            event="subscription_cancelled"
        )
        
        return {
            "message": "Subscription cancelled successfully",
            "access_until": cancel_at.isoformat(),
            "subscription_id": user_subscription.id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            "Failed to cancel subscription",
            error=str(e),
            user_id=current_user.id,
            event="cancel_error"
        )
        raise HTTPException(
            status_code=500,
            detail="Failed to cancel subscription. Please try again or contact support."
        )


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Handle Stripe webhook events"""
    # Log all incoming headers for debugging
    logger.info(
        "Webhook endpoint hit",
        method=request.method,
        path=str(request.url.path),
        headers=dict(request.headers),
        event="webhook_incoming"
    )
    
    try:
        payload = await request.body()
        sig_header = request.headers.get('stripe-signature')
        
        logger.info(
            "Webhook request received",
            has_signature=bool(sig_header),
            payload_length=len(payload),
            payload_preview=payload[:100].decode('utf-8', errors='ignore') if payload else None,
            event="webhook_request"
        )
        
        if not sig_header:
            logger.error("Missing Stripe signature header", event="webhook_no_signature")
            raise HTTPException(status_code=400, detail="Missing signature")
        
        # Verify webhook signature
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.stripe_webhook_secret
            )
            logger.info("Webhook signature verified successfully", event="webhook_signature_ok")
        except stripe.error.SignatureVerificationError as e:
            # Invalid signature
            logger.error(
                "Invalid webhook signature", 
                error=str(e),
                sig_header=sig_header,
                webhook_secret_prefix=settings.stripe_webhook_secret[:10] + "...",
                event="webhook_invalid_signature"
            )
            raise HTTPException(status_code=400, detail="Invalid signature")
        
    except ValueError as e:
        # Invalid payload
        logger.error("Invalid webhook payload", error=str(e), event="webhook_invalid_payload")
        raise HTTPException(status_code=400, detail="Invalid payload")
    
    # Handle the event
    event_type = event['type']
    event_data = event['data']['object']
    
    logger.info(
        "Webhook event received",
        event_type=event_type,
        event_id=event['id'],
        event="webhook_received"
    )
    
    try:
        # Handle checkout session completion
        if event_type == 'checkout.session.completed':
            await handle_checkout_completed(event_data, db)
        
        # Handle successful subscription payment
        elif event_type == 'invoice.payment_succeeded':
            await handle_payment_succeeded(event_data, db)
        
        # Handle subscription cancellation
        elif event_type == 'customer.subscription.deleted':
            await handle_subscription_deleted(event_data, db)
        
        # Handle payment failure
        elif event_type == 'invoice.payment_failed':
            await handle_payment_failed(event_data, db)
        
        else:
            logger.info(
                "Unhandled webhook event type",
                event_type=event_type,
                event="webhook_unhandled"
            )
    
    except Exception as e:
        logger.error(
            "Error processing webhook event",
            event_type=event_type,
            error=str(e),
            event="webhook_processing_error"
        )
        # Return 200 to acknowledge receipt, even if processing failed
        # Stripe will retry failed webhooks
    
    return {"status": "success"}


async def handle_checkout_completed(session, db: AsyncSession):
    """Handle successful checkout - activate premium subscription"""
    user_id = session.get('client_reference_id') or session.get('metadata', {}).get('user_id')
    
    if not user_id:
        logger.warning(
            "No user_id in checkout session (likely a test event)",
            session_id=session.get('id'),
            has_metadata=bool(session.get('metadata')),
            event="checkout_no_user_id"
        )
        return
    
    try:
        # Get user from database
        result = await db.execute(
            select(User).where(User.id == int(user_id))
        )
        user = result.scalar_one_or_none()
        
        if not user:
            logger.error(
                "User not found for checkout",
                user_id=user_id,
                session_id=session.get('id'),
                event="checkout_user_not_found"
            )
            return
        
        # Get subscription details from Stripe
        subscription_id = session.get('subscription')
        if subscription_id:
            try:
                subscription = stripe.Subscription.retrieve(subscription_id)
                # Premium expires at the end of current period
                # Stripe objects can be accessed like dicts or with dot notation
                expiry_timestamp = subscription.current_period_end if hasattr(subscription, 'current_period_end') else subscription.get('current_period_end')
                
                if expiry_timestamp:
                    premium_expiry = datetime.fromtimestamp(expiry_timestamp, tz=timezone.utc)
                else:
                    # Fallback to 30 days if no period end found
                    logger.warning(
                        "No current_period_end in subscription, using default 30-day expiry",
                        user_id=user_id,
                        subscription_id=subscription_id,
                        event="subscription_no_period_end"
                    )
                    premium_expiry = datetime.now(timezone.utc) + timedelta(days=30)
            except Exception as sub_error:
                logger.error(
                    "Failed to retrieve subscription details",
                    error=str(sub_error),
                    subscription_id=subscription_id,
                    user_id=user_id,
                    event="subscription_retrieval_error"
                )
                # Default to 30 days if subscription retrieval fails
                premium_expiry = datetime.now(timezone.utc) + timedelta(days=30)
        else:
            # Default to 30 days if no subscription info (for test events)
            logger.info(
                "No subscription ID in session, using default 30-day expiry",
                user_id=user_id,
                event="checkout_no_subscription"
            )
            premium_expiry = datetime.now(timezone.utc) + timedelta(days=30)
        
        # Update user's premium status
        user.is_premium = True
        user.premium_expiry = premium_expiry
        db.add(user)
        await db.commit()
        
        logger.info(
            "Premium subscription activated",
            user_id=user.id,
            expiry=premium_expiry.isoformat(),
            subscription_id=subscription_id,
            event="premium_activated"
        )
        
    except Exception as e:
        logger.error(
            "Failed to activate premium",
            user_id=user_id,
            error=str(e),
            event="premium_activation_error"
        )
        await db.rollback()
        raise


async def handle_payment_succeeded(invoice, db: AsyncSession):
    """Handle successful subscription payment - renew premium"""
    customer_email = invoice.get('customer_email')
    
    if not customer_email:
        logger.warning("No customer email in invoice", event="invoice_no_email")
        return
    
    try:
        # Find user by email
        result = await db.execute(
            select(User).where(User.email == customer_email)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            logger.error(
                "User not found for invoice",
                email=customer_email,
                event="invoice_user_not_found"
            )
            return
        
        # Get subscription to find expiry date
        subscription_id = invoice.get('subscription')
        if subscription_id:
            try:
                subscription = stripe.Subscription.retrieve(subscription_id)
                expiry_timestamp = subscription.current_period_end if hasattr(subscription, 'current_period_end') else subscription.get('current_period_end')
                
                if expiry_timestamp:
                    premium_expiry = datetime.fromtimestamp(expiry_timestamp, tz=timezone.utc)
                    
                    # Update premium expiry
                    user.is_premium = True
                    user.premium_expiry = premium_expiry
                    db.add(user)
                    await db.commit()
                    
                    logger.info(
                        "Premium subscription renewed",
                        user_id=user.id,
                        expiry=premium_expiry.isoformat(),
                        event="premium_renewed"
                    )
                else:
                    logger.warning(
                        "No expiry timestamp in subscription",
                        user_id=user.id,
                        subscription_id=subscription_id,
                        event="renewal_no_expiry"
                    )
            except Exception as sub_error:
                logger.error(
                    "Failed to retrieve subscription for renewal",
                    error=str(sub_error),
                    subscription_id=subscription_id,
                    user_id=user.id,
                    event="renewal_subscription_error"
                )
        
    except Exception as e:
        logger.error(
            "Failed to renew premium",
            email=customer_email,
            error=str(e),
            event="premium_renewal_error"
        )
        await db.rollback()
        raise


async def handle_subscription_deleted(subscription, db: AsyncSession):
    """Handle subscription cancellation - remove premium access"""
    customer_id = subscription.get('customer')
    
    if not customer_id:
        logger.warning("No customer ID in subscription", event="subscription_no_customer")
        return
    
    try:
        # Get customer email from Stripe
        customer = stripe.Customer.retrieve(customer_id)
        customer_email = customer.get('email')
        
        if not customer_email:
            logger.warning(
                "No email for customer",
                customer_id=customer_id,
                event="subscription_no_email"
            )
            return
        
        # Find user by email
        result = await db.execute(
            select(User).where(User.email == customer_email)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            logger.error(
                "User not found for subscription cancellation",
                email=customer_email,
                event="subscription_user_not_found"
            )
            return
        
        # Remove premium status
        user.is_premium = False
        user.premium_expiry = datetime.now(timezone.utc)
        db.add(user)
        await db.commit()
        
        logger.info(
            "Premium subscription cancelled",
            user_id=user.id,
            event="premium_cancelled"
        )
        
    except Exception as e:
        logger.error(
            "Failed to cancel premium",
            customer_id=customer_id,
            error=str(e),
            event="premium_cancellation_error"
        )
        await db.rollback()
        raise


async def handle_payment_failed(invoice, db: AsyncSession):
    """Handle failed payment - log for monitoring"""
    customer_email = invoice.get('customer_email')
    
    logger.warning(
        "Subscription payment failed",
        email=customer_email,
        invoice_id=invoice.get('id'),
        event="payment_failed"
    )
    
    # Stripe will automatically retry failed payments
    # Premium will expire naturally if payment continues to fail