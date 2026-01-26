# Admin Analytics & Event Tracking

## What You Get

This system tracks everything happening in your application:

### 📊 Dashboard Endpoint: `/admin/stats`

**Shows:**
- Total users, new users today/this week
- Active premium subscribers
- Total goals, goals created today/this week
- Recent events (last 100)
- Event counts by type
- Top 10 users by XP
- Recent signups

**Example:**
```bash
curl https://questpath.live/admin/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "timestamp": "2026-01-26T12:00:00Z",
  "users": {
    "total": 234,
    "today": 5,
    "this_week": 23,
    "premium_active": 12
  },
  "goals": {
    "total": 567,
    "today": 8,
    "this_week": 45
  },
  "events_today": {
    "total": 89,
    "by_type": {
      "user_registered": 5,
      "premium_purchased": 2,
      "premium_cancelled": 1,
      "goal_created": 12
    },
    "recent": [...]
  },
  "top_users": [...],
  "recent_signups": [...]
}
```

---

### 🔍 Events Endpoint: `/admin/events`

**Query specific events:**

```bash
# Get all events from last 24 hours
curl https://questpath.live/admin/events

# Get premium purchase events from last 48 hours
curl "https://questpath.live/admin/events?event_type=premium_purchased&hours=48"

# Get all events for specific user
curl "https://questpath.live/admin/events?user_id=17&hours=168"
```

**Parameters:**
- `event_type`: Filter by event type
- `user_id`: Filter by user ID
- `hours`: Look back hours (default 24)
- `limit`: Max events (default 100)

---

## Event Types Tracked

| Event | When It Fires | Data Included |
|-------|--------------|---------------|
| `user_registered` | User creates account | email |
| `premium_purchased` | User buys premium | subscription_id, expiry |
| `premium_renewed` | Subscription renews | subscription_id, expiry |
| `premium_cancelled` | Subscription cancelled | customer_id |

*More events will be added as you expand tracking*

---

## Setup

### 1. Run Migration

```bash
cd backend
source .venv/Scripts/activate  # or .venv/bin/activate on Linux
alembic upgrade head
```

This creates the `events` table.

### 2. Access the Dashboard

Visit in browser (login required):
```
https://questpath.live/admin/stats
```

Or use API docs:
```
https://questpath.live/docs#/admin
```

---

## Adding More Event Tracking

### Track Goal Creation:

```python
# In app/goals.py
from app.events import log_event

# After creating goal:
await log_event(
    db, 
    "goal_created",
    user_id=current_user.id,
    data={"goal_id": new_goal.id, "title": new_goal.title}
)
```

### Track Quiz Completion:

```python
# In app/quizzes.py
await log_event(
    db,
    "quiz_completed", 
    user_id=current_user.id,
    data={"level_id": level_id, "score": score, "passed": passed}
)
```

### Track Login:

```python
# In app/users.py login endpoint
await log_event(db, "user_login", user_id=user.id)
```

---

## Next Steps (Optional)

### 1. Add Visitor Tracking (Frontend)

Add Google Analytics to track visitors who don't sign up:

```tsx
// frontend/app/layout.tsx
<Script 
  src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXX"
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXX');
  `}
</Script>
```

### 2. Create Admin UI (Future)

Build a frontend dashboard at `/admin` showing:
- Realtime stats
- Charts and graphs
- User activity timeline
- Feature usage analytics

### 3. Add Alerts

Get notified when:
- Error rate > 5%
- New premium purchase
- Subscription cancellation
- Daily signup summary

---

## Security

**Current:** Requires any authenticated user token

**Recommended for production:** Add admin-only check:

```python
# In app/admin.py
def is_admin(user: User):
    # Add admin field to User model
    if not user.is_admin:
        raise HTTPException(403, "Admin access required")

@router.get("/stats")
async def get_admin_stats(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    is_admin(current_user)  # Check admin
    # ... rest of code
```

---

## What This Solves

✅ "Who's using the app?" → See total/active users  
✅ "What are they doing?" → Event tracking shows actions  
✅ "Most popular features?" → Event counts by type  
✅ "When did someone buy/cancel?" → Events with timestamps  
✅ "Top users?" → Sorted by XP  
✅ "Recent activity?" → Last 100 events  

**No external services needed. Zero extra resource usage. All data in your PostgreSQL.**
