# Admin Setup Guide

The admin system is now configured and ready to use. Here's how it works:

## Admin User Credentials

- **Email**: `ruvido@gmail.com`
- **Password**: `solemio77`
- **Role**: `admin` (automatically assigned)

## Setup Process

### 1. Automatic Setup (Recommended)

When you run `npm run build`, the system will:

1. Run `npm run setup:admin` to check/create the admin user
2. If Supabase is properly configured, create the admin user automatically
3. If Supabase is not configured, skip admin setup (no errors)

### 2. Manual Setup via API (Development)

If you need to create the admin user manually during development:

```bash
# Start the development server
npm run dev

# In another terminal, call the setup endpoint
curl -X POST http://localhost:3000/api/admin/setup
```

### 3. Manual Setup via Script

Run the admin setup script directly:

```bash
npm run setup:admin
```

## Login Process

1. Go to `/login`
2. Enter admin credentials:
   - Email: `ruvido@gmail.com`
   - Password: `solemio77`
3. After successful login, you'll be redirected to `/admin/dashboard`

## Admin Dashboard Features

The admin dashboard (`/admin/dashboard`) includes:

- **User Management**: Approve/reject new user registrations
- **Statistics**: Total users, approved users, groups, and active battleplans
- **Pending Approvals**: Queue of users waiting for approval

## Security Features

### Route Protection

- Admin routes (`/admin/*`) are protected by middleware
- Only users with `role: 'admin'` can access admin pages
- Non-admin users are redirected to `/dashboard`
- Unauthenticated users are redirected to `/login`

### Automatic User Approval Flow

1. New users register and wait for approval (`approved: false`)
2. Admin approves users from the dashboard
3. Approved users are automatically added to the main group
4. Email notifications are sent (when configured)

## Environment Configuration

The admin system works with or without Supabase configuration:

```env
# Required for full functionality
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: Email notifications
RESEND_API_KEY=your_resend_key
```

## Database Schema

The admin system relies on these database tables:

```sql
-- Users table with roles
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role user_role DEFAULT 'member', -- 'admin', 'group_admin', 'member'
  approved BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMP,
  approved_by UUID REFERENCES users(id)
);

-- Groups table
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE -- Main group flag
);

-- Group membership with auto-join trigger
CREATE TABLE group_members (
  group_id UUID REFERENCES groups(id),
  user_id UUID REFERENCES users(id),
  role TEXT DEFAULT 'member'
);
```

## Troubleshooting

### Admin User Not Found

If the admin user doesn't exist:

1. Check Supabase configuration in `.env.local`
2. Run `npm run setup:admin` manually
3. Use the API endpoint: `POST /api/admin/setup` (dev only)

### Cannot Access Admin Dashboard

1. Verify you're logged in with correct credentials
2. Check that user has `role: 'admin'` in the database
3. Ensure user has `approved: true`

### Build Issues

If you encounter build issues:

1. The admin setup script gracefully skips if Supabase isn't configured
2. Admin user creation can be done at runtime via API
3. The system works without pre-created admin users (they can be created later)

## Files Created/Modified

### New Files
- `scripts/seed-admin.ts` - Admin user creation script
- `lib/admin/setup.ts` - Admin utilities
- `app/api/admin/setup/route.ts` - Admin setup API endpoint
- `ADMIN_SETUP.md` - This documentation

### Modified Files
- `package.json` - Added setup scripts and dependencies
- `app/login/actions.ts` - Already redirects admins properly
- `middleware.ts` - Already protects admin routes
- `app/admin/dashboard/page.tsx` - Admin dashboard with user approval

## Next Steps

1. Configure Supabase with your remote instance
2. Run the application and test admin login
3. Create additional admin users if needed via the dashboard
4. Set up email notifications for user approvals

The admin system is ready to use once Supabase is properly configured!