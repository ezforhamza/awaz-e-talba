# Election Scheduler Backend Setup

The election scheduling has been moved to the backend for reliability and consistency. Here's how it works:

## 🏗️ Backend Components Created

### 1. Database Functions
- `update_election_statuses()` - Automatically starts/stops elections based on time
- `force_start_election(election_id)` - Admin can force start elections before scheduled time  
- `stop_election(election_id)` - Admin can manually stop elections
- `get_election_schedule_status()` - Get upcoming scheduled events

### 2. Edge Function
- **election-scheduler** - Serverless function that calls the database functions
- Deployed at: `/functions/v1/election-scheduler`
- Can be triggered via HTTP POST requests

### 3. Logging System
- `election_schedule_log` table tracks all automatic and manual status changes
- Includes timestamps, election details, and action types

## 🔧 How It Works

### Automatic Scheduling
1. **Auto-Start**: Elections with `auto_start=true` automatically become `active` at their `start_date`
2. **Auto-Stop**: Active elections automatically become `completed` at their `end_date`
3. **Logging**: All changes are logged with timestamps and details

### Manual Admin Controls  
1. **Force Start**: Admins can start draft elections before their scheduled time
2. **Manual Stop**: Admins can stop active elections early
3. **Status Check**: Admins can view upcoming scheduled events

## 🚀 Setting Up Periodic Execution

Since Supabase doesn't include pg_cron by default, you need to set up external scheduling:

### Option 1: Cron Job (Linux/Mac)
```bash
# Add to crontab (runs every minute)
* * * * * curl -X POST https://your-project.supabase.co/functions/v1/election-scheduler

# Or every 5 minutes
*/5 * * * * curl -X POST https://your-project.supabase.co/functions/v1/election-scheduler
```

### Option 2: GitHub Actions (Recommended)
Create `.github/workflows/election-scheduler.yml`:
```yaml
name: Election Scheduler
on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes
  workflow_dispatch:  # Allow manual trigger

jobs:
  schedule-elections:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Election Scheduler
        run: |
          curl -X POST https://your-project.supabase.co/functions/v1/election-scheduler
```

### Option 3: External Monitoring Service
Use services like:
- **UptimeRobot** (free tier available)
- **Cronhook.io**  
- **EasyCron**

Set them to call your Edge Function URL every 1-5 minutes.

### Option 4: Manual Trigger (Development)
You can manually trigger the scheduler:
```javascript
// From your frontend admin panel
import { electionSchedulerService } from '@/services/electionSchedulerService';

const result = await electionSchedulerService.triggerScheduler();
console.log(result);
```

## 📊 Monitoring & Debugging

### Check Scheduler Status
```sql
-- See upcoming scheduled events
SELECT get_election_schedule_status();
```

### View Schedule Logs  
```sql
-- See recent automatic/manual changes
SELECT * FROM election_schedule_log 
ORDER BY performed_at DESC 
LIMIT 10;
```

### Test Edge Function
```bash
curl -X POST https://your-project.supabase.co/functions/v1/election-scheduler
```

## 🎯 Admin Usage

### Force Start Election (Before Scheduled Time)
```javascript
const { forceStartElection } = useElections();
await forceStartElection(electionId);
```

### Stop Election Early
```javascript
const { stopElection } = useElections();
await stopElection(electionId);
```

### Check Status
```javascript
const status = await electionSchedulerService.getScheduleStatus();
const logs = await electionSchedulerService.getScheduleLogs();
```

## 🔐 Security Notes

- All database functions use `SECURITY DEFINER` for controlled access
- Edge function uses service role key for admin operations
- Manual admin functions validate election state before making changes
- All actions are logged for audit trail

## ⚡ Benefits of Backend Scheduling

1. **Reliability**: Runs even when no users are online
2. **Consistency**: Exact timing regardless of user timezones  
3. **Scalability**: Handles multiple elections simultaneously
4. **Audit Trail**: Complete log of all status changes
5. **Admin Control**: Force start elections when needed
6. **No Frontend Dependency**: Works without browser sessions

The election system will now automatically manage election lifecycles without requiring any frontend intervention!