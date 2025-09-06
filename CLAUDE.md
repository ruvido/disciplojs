# Disciplo - Development Guide

## Project Overview
Disciplo is a community accountability platform for personal transformation through 30-60-90 day battleplans. Built with Next.js 14+ and shadcn/ui, featuring group management with Telegram integration, personal goal tracking through the 4 pillars framework, and comprehensive admin/member dashboards.

## Core Concept
Based on the "Piano di Battaglia" (Battleplan) methodology:
- One main **Priority** that guides the transformation
- **4 Pillars**: Interiority, Relationships, Resources, Health
- Daily **Routines** for each pillar
- **Group accountability** through local groups + default main group
- **Monthly meetings** and progress tracking

## Development Priority Order
1. **Admin Dashboard** - User approval, system management
2. **Registration Flow** - Multi-step with admin approval
3. **Groups Management** - Telegram integration, member management
4. **Battleplans** - Creation, tracking, routines
5. **Logbooks** - Group meeting logs and progress

## Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **UI**: shadcn/ui + Tailwind CSS (Mobile-first)
- **Database**: Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Forms**: React Hook Form + Zod
- **Telegram Bot**: Grammy or node-telegram-bot-api
- **Deployment**: Vercel (webapp + bot functions)

## Project Structure
```
/app
  /(auth)
    /login
    /register
      /step-[step]         # Multi-step registration
    /verify-telegram       # Telegram connection page
  /(admin)
    /admin
      /dashboard           # Overview stats
      /users              # User management & approval
      /groups             # All groups management
      /battleplans        # Template management
      /settings
  /(group-admin)
    /group-admin
      /[groupId]
        /dashboard        # Group overview
        /members         # Member management
        /logbook        # Monthly meeting logs
        /polls          # Meeting scheduling
  /(member)
    /dashboard           # Personal dashboard
    /battleplan
      /new              # Create new battleplan
      /[id]            # View/edit battleplan
      /templates       # Browse templates
    /groups
      /my-groups       # User's groups
      /join           # Browse/request groups
    /profile
  /api
    /auth
      /register
      /login
      /telegram-verify
    /admin
      /users
      /approve
    /battleplans
    /groups
      /[groupId]/polls
      /[groupId]/logbook
    /telegram
      /webhook
      /send-notification

/components
  /ui                   # shadcn/ui components
  /layout
    /mobile-nav
    /desktop-sidebar
  /battleplan
    /priority-form
    /pillar-card
    /routine-item
    /progress-chart
  /group
    /member-list
    /logbook-entry
    /poll-card
  /auth
    /registration-steps
    /telegram-connect

/lib
  /supabase
    /client.ts
    /server.ts
    /middleware.ts
  /telegram
    /bot.ts
    /commands.ts
    /notifications.ts
  /utils
    /validation.ts

/hooks
  /use-user.ts
  /use-battleplan.ts
  /use-group.ts
  /use-realtime.ts

/types
  /database.ts
  /battleplan.ts
  /group.ts
```

## Database Schema (Supabase)
```sql
-- Users with roles
CREATE TYPE user_role AS ENUM ('admin', 'group_admin', 'member');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  bio TEXT,
  city TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'member',
  telegram_id TEXT UNIQUE,
  telegram_username TEXT,
  approved BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMP,
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Groups (including default main group)
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('main', 'local', 'online', 'special')),
  city TEXT,
  max_members INT DEFAULT 10,
  telegram_chat_id TEXT UNIQUE,
  is_default BOOLEAN DEFAULT FALSE, -- Main group flag
  created_at TIMESTAMP DEFAULT NOW()
);

-- Note: Default main group will be created dynamically when:
-- 1. Bot becomes admin in first Telegram group, OR
-- 2. Admin manually sets it from dashboard

-- Group membership
CREATE TABLE group_members (
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('admin', 'member')) DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

-- Trigger: Auto-add approved users to main group
CREATE OR REPLACE FUNCTION add_to_main_group()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.approved = TRUE AND OLD.approved = FALSE THEN
    INSERT INTO group_members (group_id, user_id, role)
    SELECT id, NEW.id, 'member'
    FROM groups
    WHERE is_default = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_add_to_main_group
AFTER UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION add_to_main_group();

-- Rule: One local group per person (plus the main group)
CREATE UNIQUE INDEX one_local_group_per_user ON group_members(user_id) 
WHERE group_id IN (SELECT id FROM groups WHERE type = 'local');

-- Battleplans
CREATE TABLE battleplans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  priority TEXT NOT NULL,
  priority_description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration INT CHECK (duration IN (30, 60, 90)),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Pillars (4 per battleplan)
CREATE TYPE pillar_type AS ENUM ('interiority', 'relationships', 'resources', 'health');

CREATE TABLE pillars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battleplan_id UUID REFERENCES battleplans(id) ON DELETE CASCADE,
  type pillar_type NOT NULL,
  objective TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(battleplan_id, type)
);

-- Routines
CREATE TABLE routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pillar_id UUID REFERENCES pillars(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT DEFAULT 'daily',
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Routine tracking
CREATE TABLE routine_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID REFERENCES routines(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  completed BOOLEAN DEFAULT FALSE,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(routine_id, date)
);

-- Group logbooks
CREATE TABLE logbook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  meeting_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Polls for meetings
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  closes_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  datetime TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE poll_votes (
  poll_option_id UUID REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (poll_option_id, user_id)
);

-- Battleplan templates
CREATE TABLE battleplan_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  priority_suggestion TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE template_pillars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES battleplan_templates(id) ON DELETE CASCADE,
  type pillar_type NOT NULL,
  objective_suggestion TEXT,
  routines JSONB, -- Array of routine suggestions
  UNIQUE(template_id, type)
);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
-- Add RLS for all tables...
```

## Multi-Step Registration Flow
```typescript
// Step 1: Basic Info
{
  email: string,
  password: string,
  name: string,
}

// Step 2: Profile
{
  city: string,
  bio: string,
  goals: string,
}

// Step 3: Avatar Upload
{
  avatar: File
}

// Step 4: Review & Submit
// Admin approval required

// Step 5: Post-Approval (via email)
// - Connect Telegram
// - Automatically added to main group
// - Can join additional local/special groups
```

## Onboarding Flow
1. **User Registration** → Admin receives notification
2. **Admin Approval** → User gets email with magic link
3. **Auto-add to Main Group** → All members join default Telegram group
4. **Email Opens Dashboard** → Prompt to connect Telegram
5. **One-click Telegram Connection** → Bot DMs for verification
6. **Browse & Join Additional Groups** → Bot adds to selected groups
7. **Create First Battleplan** → Start transformation journey

## Group Structure
- **Main Group** (Mandatory): Set dynamically when:
  - Bot becomes admin in first Telegram group (auto-set as default)
  - Admin manually selects from dashboard
  - All approved members automatically join the default group
- **Local Groups**: One per city, max one per member
- **Special Groups**: Thematic groups, multiple allowed
- **Online Groups**: Virtual accountability groups

## Telegram Bot Integration
```typescript
// Bot commands
/start - Initial connection with deep link
/help - Show available commands
/battleplan - View current battleplan
/checkin - Mark today's routines
/group - Show group info

// Admin commands
/announce - Send group announcement
/meeting - Create meeting poll
/logbook - Add logbook entry

// Webhook events to sync
- User joins/leaves Telegram group → Update database
- Important messages → Store in logbook
- Polls → Sync with webapp

// Handle bot becoming admin in Telegram group
async function onBotPromotedToAdmin(chatId: string, chatTitle: string) {
  // If no default group exists, set this as default
  const { data } = await supabase.rpc('set_default_group_from_telegram', {
    telegram_chat_id: chatId,
    group_name: chatTitle
  });
}

// Auto-add approved users to main group
async function onUserApproved(userId: string) {
  // Database trigger handles adding to default group
  // Bot adds user to Telegram group if connected
  const defaultGroup = await getDefaultGroup();
  if (defaultGroup?.telegram_chat_id && user.telegram_id) {
    await bot.api.addChatMember(defaultGroup.telegram_chat_id, user.telegram_id);
  }
}
```

## Implementation Phases

### Phase 1: Admin Dashboard (Week 1)
```typescript
// Priority components
- Login system (Supabase Auth)
- Admin layout with navigation
- Users table with approval actions
- Basic stats dashboard
- System settings

// Key features
- Pending approvals queue
- User search and filter
- Bulk actions
- Email templates for approval/rejection
```

### Phase 2: Registration Flow (Week 1-2)
```typescript
// Multi-step form
- Step indicator component
- Form validation with Zod
- Image upload to Supabase Storage
- Preview before submit
- Admin notification system

// Post-registration
- Approval email system
- Magic link generation
- Telegram connection flow
```

### Phase 3: Groups Management (Week 2-3)
```typescript
// Group features
- Group CRUD for admins
- Member management
- Telegram sync
- Auto-add to main group
- Local group restriction

// Group admin tools
- Member approval
- Remove members
- Group settings
```

### Phase 4: Battleplans (Week 3-4)
```typescript
// Core battleplan features
- Creation wizard
- 4 pillars with routines
- Daily tracking
- Progress visualization
- Active/archive states

// Templates (nice to have)
- Template library
- Clone from template
- Share as template
```

### Phase 5: Logbooks (Week 4)
```typescript
// Logbook system
- Rich text editor
- Meeting date selector
- Read-only for members
- Edit for group admins
- Monthly archive view
```

## Key Features Implementation

### 1. Mobile-First UI
- Bottom navigation for mobile
- Swipeable cards for battleplans
- Touch-friendly routine checkboxes
- Progressive disclosure for complex forms
- Native-like transitions

### 2. Battleplan Creation
- Guided wizard with progress indicator
- Priority selection with examples
- Pillar objectives with suggestions
- Routine builder with templates
- Review before submission

### 3. Daily Routine Tracking
- Today's view with all routines
- Swipe to complete
- Streak tracking
- Missed routine notifications
- Weekly/monthly progress views

### 4. Group Features
- Member directory with avatars
- Group chat link to Telegram
- Shared battleplans view
- Group statistics dashboard
- Meeting scheduler with polls

### 5. Admin Dashboard
- Pending approvals queue
- User management table
- Group health metrics
- System-wide statistics
- Telegram bot status

### 6. Group Admin Tools
- Member approval/removal
- Logbook editor (rich text)
- Poll creation wizard
- Group settings management
- Telegram sync status

## Development Commands
```bash
# Initial setup
npx create-next-app@latest disciplo --typescript --tailwind --app
cd disciplo
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card form input label select tabs toast avatar dialog

# Install dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install react-hook-form zod @hookform/resolvers
npm install grammy # or node-telegram-bot-api
npm install date-fns recharts
npm install @tiptap/react @tiptap/starter-kit # for rich text logbooks

# Development
npm run dev

# Type checking
npm run type-check

# Build
npm run build

# Database
npx supabase init
npx supabase db push
npx supabase gen types typescript --local > types/database.ts
```

## Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Telegram
TELEGRAM_BOT_TOKEN=
TELEGRAM_BOT_USERNAME=
TELEGRAM_WEBHOOK_SECRET=
TELEGRAM_MAIN_GROUP_ID= # Default group all members join

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

# Email (for notifications)
RESEND_API_KEY=
```

## Deployment (Vercel)
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Configure Supabase webhooks
5. Set up Telegram webhook
6. Configure custom domain

## UI Components Priority
1. **Core Components** (Week 1)
   - Authentication forms
   - Dashboard layouts
   - Mobile navigation
   - Data tables for admin

2. **Registration Components** (Week 1-2)
   - Multi-step form
   - File upload
   - Progress indicator
   - Success/error states

3. **Group Components** (Week 2-3)
   - Member list
   - Group cards
   - Join request flow
   - Telegram connect

4. **Battleplan Components** (Week 3-4)
   - Priority selector
   - Pillar cards
   - Routine checklist
   - Progress charts

5. **Logbook Components** (Week 4)
   - Rich text editor
   - Entry viewer
   - Date picker
   - Archive list

## Performance Optimization
- Use Next.js Image for avatars
- Implement virtual scrolling for long lists
- Cache Telegram bot responses
- Use Supabase realtime selectively
- Lazy load heavy components
- Optimize bundle with dynamic imports

## Security Considerations
- Row Level Security on all tables
- Rate limiting on API routes
- Telegram webhook validation
- File upload restrictions (size, type)
- CORS configuration
- Input sanitization
- Admin approval required for all users

## MVP Checklist (Priority Order)
- [ ] Admin dashboard with user management
- [ ] Multi-step registration with approval
- [ ] Telegram bot setup
- [ ] Main group auto-assignment
- [ ] Groups management (CRUD, members)
- [ ] Battleplan creation with 4 pillars
- [ ] Daily routine tracking
- [ ] Group logbooks
- [ ] Mobile-responsive UI
- [ ] Basic notifications

## Post-MVP Features
- [ ] Battleplan templates library
- [ ] Advanced analytics
- [ ] Email notifications
- [ ] Export functionality
- [ ] Advanced search
- [ ] Achievements system
- [ ] API for mobile app
- [ ] Group meeting recordings
- [ ] Mentor matching system