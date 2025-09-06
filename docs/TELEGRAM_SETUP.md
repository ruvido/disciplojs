# Telegram Bot Setup Guide

## Overview
This guide covers setting up the Telegram bot for Disciplo, including bot creation, webhook configuration, and integration with the platform.

## Prerequisites
- Supabase project set up with database
- Vercel deployment or local development environment
- Telegram account

## Step 1: Create Telegram Bot

### 1.1 Contact BotFather
1. Open Telegram and search for `@BotFather`
2. Start a conversation with `/start`
3. Create new bot with `/newbot`
4. Choose a name and username for your bot
5. Save the **Bot Token** (format: `123456789:ABCD...`)

### 1.2 Configure Bot Settings
```
/setdescription - Set bot description
/setuserpic - Add bot avatar
/setcommands - Configure bot commands
```

**Suggested Commands:**
```
start - Connect your account to Disciplo
help - Show available commands
battleplan - View your current battleplan
checkin - Mark today's routines complete
group - Show group information
profile - View your profile
```

## Step 2: Environment Variables

Add to your `.env.local`:
```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_BOT_USERNAME=your_bot_username
TELEGRAM_WEBHOOK_SECRET=random_secret_string_here
```

Generate webhook secret:
```bash
openssl rand -hex 32
```

## Step 3: Webhook Setup

### 3.1 Local Development
For local testing with ngrok:
```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Note the HTTPS URL (e.g., https://abc123.ngrok.io)
```

### 3.2 Set Webhook URL
```bash
# Replace with your actual values
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-domain.com/api/telegram/webhook",
    "secret_token": "your_webhook_secret"
  }'
```

### 3.3 Verify Webhook
```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
```

## Step 4: Bot Integration Features

### 4.1 User Connection Flow
1. User clicks connection link from webapp
2. Bot sends verification message with deep link
3. User confirms connection in Telegram
4. Database updates with telegram_id and username

### 4.2 Group Management
- Bot must be added as admin to Telegram groups
- Sync group membership with database
- Handle user join/leave events
- Send announcements and notifications

### 4.3 Commands Implementation

**User Commands:**
- `/start <token>` - Connect account with verification token
- `/battleplan` - Show current battleplan progress
- `/checkin` - Quick routine completion
- `/profile` - Display user profile and stats

**Admin Commands:**
- `/announce <message>` - Send group announcement
- `/stats` - Show group statistics
- `/meeting <date>` - Create meeting poll

## Step 5: Database Integration

### 5.1 User Verification
When user connects Telegram:
```sql
UPDATE users 
SET telegram_id = $1, telegram_username = $2 
WHERE id = $3;
```

### 5.2 Group Sync
Track group membership:
```sql
-- Update group when bot is added
INSERT INTO groups (name, telegram_chat_id, type) 
VALUES ($1, $2, 'local')
ON CONFLICT (telegram_chat_id) DO UPDATE SET name = $1;

-- Sync member list
INSERT INTO group_members (group_id, user_id) 
SELECT $1, u.id FROM users u WHERE u.telegram_id = ANY($2);
```

## Step 6: Webhook Handler

The webhook endpoint `/api/telegram/webhook/route.ts` handles:
- Message processing and command routing
- User authentication and verification
- Group event handling (joins, leaves, promotions)
- Security validation with webhook secret

## Step 7: Testing

### 7.1 Bot Commands Test
1. Send `/start` to your bot
2. Verify connection flow works
3. Test all implemented commands
4. Check database updates

### 7.2 Group Integration Test
1. Add bot to test group as admin
2. Verify group appears in database
3. Test member sync functionality
4. Test announcement features

### 7.3 Webhook Debugging
- Check Vercel function logs
- Verify webhook secret validation
- Monitor database updates
- Test error handling

## Step 8: Production Deployment

### 8.1 Environment Setup
- Set production environment variables in Vercel
- Update webhook URL to production domain
- Configure proper CORS settings

### 8.2 Security Considerations
- Validate all webhook requests with secret token
- Sanitize user input from messages
- Rate limit bot interactions
- Log security events

### 8.3 Monitoring
- Set up logging for bot interactions
- Monitor webhook response times
- Track user connection rates
- Alert on errors or unusual activity

## Troubleshooting

### Common Issues
1. **Webhook not receiving updates**: Check URL, SSL certificate, and secret token
2. **Bot not responding**: Verify token and webhook configuration
3. **Database connection failed**: Check Supabase credentials and network
4. **Group sync issues**: Ensure bot has admin permissions

### Debug Commands
```bash
# Check webhook status
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"

# Delete webhook (for testing)
curl -X POST "https://api.telegram.org/bot<TOKEN>/deleteWebhook"

# Test bot connection
curl "https://api.telegram.org/bot<TOKEN>/getMe"
```

## Development Workflow

1. **Local Testing**: Use ngrok for webhook testing
2. **Staging**: Deploy to Vercel preview for integration testing
3. **Production**: Set production webhook and monitor

## Security Best Practices

- Never commit bot tokens to repository
- Use webhook secrets for request validation  
- Implement rate limiting for bot commands
- Validate and sanitize all user inputs
- Log security events and suspicious activity
- Regular token rotation for production bots