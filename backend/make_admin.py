"""
Script to grant admin privileges to a user by email.

Usage:
    python make_admin.py grant user@example.com
"""
import asyncio
import sys
from sqlalchemy import select
from app.db import async_session
from app.models import User


async def make_admin(email: str):
    """Grant admin privileges to the specified user."""
    async with async_session() as db:
        # Find user by email
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if not user:
            print(f"❌ User not found: {email}")
            return False
        
        if user.is_admin:
            print(f"✅ User {email} is already an admin")
            return True
        
        # Grant admin privileges
        user.is_admin = True
        await db.commit()
        
        print(f"✅ Successfully granted admin privileges to {email}")
        print(f"   User ID: {user.id}")
        print(f"   Display Name: {user.display_name or 'N/A'}")
        return True


async def revoke_admin(email: str):
    """Revoke admin privileges from the specified user."""
    async with async_session() as db:
        # Find user by email
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if not user:
            print(f"❌ User not found: {email}")
            return False
        
        if not user.is_admin:
            print(f"ℹ️  User {email} is not an admin")
            return True
        
        # Revoke admin privileges
        user.is_admin = False
        await db.commit()
        
        print(f"✅ Successfully revoked admin privileges from {email}")
        return True


async def list_admins():
    """List all users with admin privileges."""
    async with async_session() as db:
        result = await db.execute(select(User).where(User.is_admin == True))
        admins = result.scalars().all()
        
        if not admins:
            print("No admin users found")
            return
        
        print(f"\n📋 Admin Users ({len(admins)}):")
        print("-" * 60)
        for admin in admins:
            print(f"  • {admin.email}")
            print(f"    ID: {admin.id}")
            print(f"    Name: {admin.display_name or 'N/A'}")
            print(f"    Premium: {'Yes' if admin.is_premium else 'No'}")
            print()


def print_usage():
    """Print usage instructions."""
    print("Usage:")
    print("  python make_admin.py grant user@example.com    - Grant admin privileges")
    print("  python make_admin.py revoke user@example.com   - Revoke admin privileges")
    print("  python make_admin.py list                      - List all admins")
    print("\nExamples:")
    print("  python make_admin.py grant admin@questpath.live")
    print("  python make_admin.py revoke old_admin@example.com")
    print("  python make_admin.py list")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print_usage()
        sys.exit(1)
    
    command = sys.argv[1].lower()
    
    if command == "list":
        asyncio.run(list_admins())
    elif command in ["grant", "add", "make"]:
        if len(sys.argv) < 3:
            print("❌ Error: Please provide an email address")
            print_usage()
            sys.exit(1)
        email = sys.argv[2]
        success = asyncio.run(make_admin(email))
        sys.exit(0 if success else 1)
    elif command in ["revoke", "remove"]:
        if len(sys.argv) < 3:
            print("❌ Error: Please provide an email address")
            print_usage()
            sys.exit(1)
        email = sys.argv[2]
        success = asyncio.run(revoke_admin(email))
        sys.exit(0 if success else 1)
    else:
        print(f"❌ Unknown command: {command}")
        print_usage()
        sys.exit(1)
