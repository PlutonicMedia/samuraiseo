

## Problem Analysis

The Resend integration is failing with a **403 error**: "You can only send testing emails to your own email address (analytics@plutonic.dk)." This happens because the Resend API key is on the free tier without a verified sending domain.

Additionally, your domain `notify.plutonic.dk` is **already verified and active** with Lovable's built-in email system. This means Resend cannot verify DNS on this subdomain anyway (NS delegation conflict). Switching to Lovable's email system is the right move.

## Plan

### Step 1: Set up email infrastructure
Run the email infrastructure setup to create the queue system, database tables, and cron job needed for reliable email delivery.

### Step 2: Create a notification email template
Create a React Email template (`lead-notification.tsx`) for admin notifications when a new quiz submission or SEO request comes in. This replaces the Resend-based edge function.

### Step 3: Register the template
Add it to the transactional email template registry.

### Step 4: Update ResultsSection.tsx
Replace the two `supabase.functions.invoke("notify-submission", ...)` calls with calls to `send-transactional-email` using the new template. The notification email will be sent to the admin email configured in `site_settings`.

### Step 5: Deploy edge functions
Deploy all updated edge functions (`send-transactional-email`).

### Step 6: Clean up
Remove the old `notify-submission` edge function since it's no longer needed.

### What stays the same
- Admin settings page for configuring notification email address
- All quiz submission and SEO request database inserts
- The `RESEND_API_KEY` secret can be removed later if desired

### Technical detail
- The notification email is a **transactional email** (triggered by a specific user action — form submission — and the admin expects it)
- The template will fetch the `notification_email` from `site_settings` and pass it as `recipientEmail`
- Emails will be queued via pgmq with automatic retry, rate-limit handling, and dead-letter support

