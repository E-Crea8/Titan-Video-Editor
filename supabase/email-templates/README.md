# Titan Video Editor - Email Templates

This folder contains email templates for the Titan Video Editor application.

## Available Templates

| Template | Purpose | Trigger |
|----------|---------|---------|
| `welcome.html` | Welcome email for new users | User signs up (email or OAuth) |
| `project-reminder.html` | Reminder for unfinished projects | Scheduled (3 days of inactivity) |
| `export-complete.html` | Notification when video export is ready | Video export completed |

## Setting Up in Supabase

### 1. Configure Auth Email Templates

Go to **Supabase Dashboard** → **Authentication** → **Email Templates**

Update the following templates:

#### Confirmation Email
Use the content from `welcome.html` for the confirmation email template.

#### Magic Link Email
```html
<h2>Your Magic Link</h2>
<p>Click the button below to sign in to Titan Video Editor:</p>
<a href="{{ .ConfirmationURL }}">Sign In</a>
```

### 2. Set Up Edge Functions for Custom Emails

Create Edge Functions to send custom notification emails:

```typescript
// supabase/functions/send-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  const { to, subject, template, data } = await req.json()
  
  // Load template and replace variables
  const html = await loadTemplate(template, data)
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Titan Video Editor <noreply@titangrouppartners.com>',
      to,
      subject,
      html,
    }),
  })

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

### 3. Database Triggers for Automated Emails

Create triggers in Supabase for automated email sending:

```sql
-- Trigger for welcome email on new user signup
CREATE OR REPLACE FUNCTION send_welcome_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Call Edge Function to send email
  PERFORM
    net.http_post(
      url := 'https://your-project.supabase.co/functions/v1/send-email',
      headers := '{"Authorization": "Bearer YOUR_SERVICE_KEY"}'::jsonb,
      body := json_build_object(
        'to', NEW.email,
        'subject', 'Welcome to Titan Video Editor!',
        'template', 'welcome',
        'data', json_build_object('Name', NEW.raw_user_meta_data->>'name')
      )::jsonb
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION send_welcome_email();
```

### 4. Scheduled Project Reminders

Set up a cron job in Supabase to send project reminders:

```sql
-- pg_cron extension required
SELECT cron.schedule(
  'project-reminders',
  '0 10 * * *', -- Every day at 10 AM
  $$
    SELECT send_project_reminder(user_id, project_id)
    FROM projects
    WHERE updated_at < NOW() - INTERVAL '3 days'
    AND status = 'draft'
  $$
);
```

## Template Variables

### welcome.html
- `{{ .Name }}` - User's name
- `{{ .SiteURL }}` - Application URL

### project-reminder.html
- `{{ .Name }}` - User's name
- `{{ .ProjectName }}` - Name of the project
- `{{ .LastEdited }}` - Last edit date
- `{{ .Progress }}` - Project completion percentage
- `{{ .ProjectID }}` - Project ID for deep linking
- `{{ .SiteURL }}` - Application URL

### export-complete.html
- `{{ .VideoName }}` - Name of the video
- `{{ .Duration }}` - Video duration
- `{{ .Resolution }}` - Video resolution
- `{{ .FileSize }}` - File size
- `{{ .Format }}` - Video format
- `{{ .DownloadURL }}` - Download link
- `{{ .SiteURL }}` - Application URL

## Testing Emails

Use the Supabase CLI to test emails locally:

```bash
supabase functions serve send-email --env-file .env.local
```

Then trigger a test email:

```bash
curl -X POST http://localhost:54321/functions/v1/send-email \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com", "subject": "Test", "template": "welcome", "data": {"Name": "John"}}'
```

## Email Provider Setup

We recommend using [Resend](https://resend.com) for sending transactional emails:

1. Sign up at resend.com
2. Add and verify your domain
3. Create an API key
4. Add to Supabase secrets: `RESEND_API_KEY`

Alternative providers:
- SendGrid
- Mailgun
- Amazon SES
- Postmark

