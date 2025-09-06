# Development Setup Guide

## Prerequisites
- Node.js 18+ and npm
- Git
- Supabase account
- Telegram account (for bot setup)
- Code editor (VS Code recommended)

## Initial Setup

### 1. Clone and Install
```bash
git clone <repository-url>
cd disciplojs
npm install
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.local.example .env.local

# Edit .env.local with your actual values
```

**Required Environment Variables:**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_BOT_USERNAME=your_bot_username
TELEGRAM_WEBHOOK_SECRET=random_secret_string

# Email (Resend)
RESEND_API_KEY=your_resend_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Supabase Setup

#### Option A: Remote Database (Recommended)
```bash
# Install Supabase CLI
npx supabase login

# Link to your project
npx supabase link --project-ref your_project_id

# Push migrations
npx supabase db push

# Generate types
npx supabase gen types typescript --linked > types/database.ts
```

#### Option B: Local Development
```bash
# Start local Supabase
npx supabase start

# Apply migrations
npx supabase db reset

# Generate types
npx supabase gen types typescript --local > types/database.ts
```

### 4. Database Verification
Visit your Supabase dashboard and verify tables are created:
- `users`
- `groups`
- `group_members`
- `battleplans`
- `pillars`
- `routines`
- `routine_logs`
- `logbook_entries`
- `polls`
- `poll_options`
- `poll_votes`

## Development Workflow

### 1. Start Development Server
```bash
npm run dev
```
Open http://localhost:3000

### 2. Database Migrations
When making schema changes:
```bash
# Create new migration
npx supabase migration new your_migration_name

# Edit the SQL file in supabase/migrations/

# Apply locally
npx supabase db reset

# Push to remote
npx supabase db push

# Update types
npx supabase gen types typescript --linked > types/database.ts
```

### 3. Telegram Bot Development

#### Local Testing with ngrok
```bash
# Install ngrok globally
npm install -g ngrok

# Expose local server
ngrok http 3000

# Set webhook (use ngrok HTTPS URL)
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://abc123.ngrok.io/api/telegram/webhook"}'
```

#### Bot Commands Testing
1. Add your bot to a test Telegram group
2. Make bot an admin
3. Test commands: `/start`, `/help`, `/battleplan`
4. Check webhook logs in terminal

## Code Structure

### Application Architecture
```
/app
  /(auth)           # Authentication routes
  /(admin)          # Admin dashboard
  /(member)         # Member dashboard
  /api              # API routes
  /components       # Reusable components
  /lib              # Utilities and configs
  /types            # TypeScript type definitions
```

### Key Components
- **Authentication**: Supabase Auth with custom UI
- **Database**: PostgreSQL via Supabase with RLS
- **Real-time**: Supabase real-time for live updates
- **UI**: shadcn/ui components with Tailwind CSS
- **Forms**: React Hook Form with Zod validation

### Database Patterns
```typescript
// Server-side data fetching
import { createClient } from '@/lib/supabase/server'

export async function getData() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('table_name')
    .select('*')
  
  if (error) throw error
  return data
}

// Client-side data fetching
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data } = await supabase
  .from('table_name')
  .select('*')
```

## Testing

### Manual Testing Checklist
- [ ] User registration flow
- [ ] Admin approval process
- [ ] Telegram bot connection
- [ ] Battleplan creation
- [ ] Group membership
- [ ] Routine tracking
- [ ] Admin dashboard functions

### Database Testing
```sql
-- Check user creation
SELECT * FROM users WHERE email = 'test@example.com';

-- Verify group membership
SELECT u.name, g.name FROM users u
JOIN group_members gm ON u.id = gm.user_id
JOIN groups g ON gm.group_id = g.id;

-- Test battleplan flow
SELECT b.title, p.type, r.title FROM battleplans b
JOIN pillars p ON b.id = p.battleplan_id
JOIN routines r ON p.id = r.pillar_id;
```

## Common Development Tasks

### Add New Database Table
1. Create migration file
2. Write SQL in migration
3. Apply migration locally
4. Update TypeScript types
5. Create API routes if needed
6. Add UI components

### Add New API Endpoint
1. Create file in `/app/api/`
2. Implement GET/POST handlers
3. Add authentication if needed
4. Test with Postman or curl
5. Update client-side code

### Add New Page
1. Create page file in appropriate directory
2. Add authentication middleware if needed
3. Implement server components for data
4. Add client components for interactivity
5. Update navigation menus

## Deployment

### Vercel Deployment
1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on git push
4. Update Telegram webhook URL to production

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
TELEGRAM_BOT_TOKEN=your_production_bot_token
TELEGRAM_WEBHOOK_SECRET=your_production_webhook_secret
RESEND_API_KEY=your_production_resend_key
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

## Troubleshooting

### Common Issues

**Database Connection Failed**
- Check Supabase credentials
- Verify database is not paused
- Check RLS policies

**Telegram Webhook Not Working**
- Verify webhook URL is HTTPS
- Check webhook secret matches
- Test with ngrok for local development

**Type Errors**
- Regenerate database types
- Clear Next.js cache: `rm -rf .next`
- Restart development server

**Authentication Issues**
- Check Supabase Auth configuration
- Verify redirect URLs
- Clear browser cookies/storage

### Debug Commands
```bash
# Check Supabase connection
npx supabase projects list

# View database logs
npx supabase logs db

# Check migrations status
npx supabase migration list

# Test webhook
curl -X POST "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

## Development Best Practices

### Code Quality
- Use TypeScript for type safety
- Follow React best practices
- Implement proper error handling
- Add loading states for async operations
- Validate user inputs with Zod schemas

### Database
- Always use prepared statements
- Implement proper RLS policies
- Test migrations before deploying
- Keep migrations small and focused
- Add proper indexes for performance

### Security
- Never commit secrets to git
- Validate all user inputs
- Use parameterized queries
- Implement proper authentication
- Regular dependency updates

### Performance
- Optimize database queries
- Use Next.js Image for images
- Implement proper caching
- Lazy load heavy components
- Monitor bundle size

## Getting Help

### Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Telegram Bot API](https://core.telegram.org/bots/api)

### Project-Specific Help
- Check existing issues and documentation
- Review code comments and README files
- Test with minimal reproduction cases
- Ask in project Discord/Telegram for community help