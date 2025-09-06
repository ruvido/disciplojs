# Supabase Setup Instructions

## 1. Run Migrations in Order

Go to your Supabase dashboard → SQL Editor and run each file in sequence:

1. **001_initial_schema.sql** - Creates users, groups, and membership tables
2. **002_battleplans.sql** - Creates battleplan system with pillars and routines
3. **003_logbooks_polls.sql** - Creates group logbooks and polls
4. **004_rls_policies.sql** - Sets up Row Level Security
5. **005_initial_data.sql** - Adds initial admin user and sample template
6. **006_bot_functions.sql** - Functions for Telegram bot integration

**Note**: The default main group will be created automatically when:
- The bot is added as admin to its first Telegram group, OR
- You manually set it from the admin dashboard

## 2. Enable Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Disable "Confirm email" for testing (enable in production)

## 3. Set Admin Password

1. Go to **Authentication** → **Users**
2. Find `admin@disciplo.com`
3. Click "Reset password"
4. Set a password

## 4. Configure Storage

1. Go to **Storage**
2. Create bucket named `avatars`
3. Make it public
4. Add policy for authenticated users to upload

## 5. Get Your Keys

Go to **Settings** → **API** and copy:
- Project URL
- anon public key  
- service_role secret key

## 6. Enable Realtime (Optional)

For live updates:
1. Go to **Database** → **Replication**
2. Enable tables: `group_members`, `polls`, `poll_votes`

## Troubleshooting

If migrations fail:
- Check for typos in SQL
- Run `DROP TABLE IF EXISTS table_name CASCADE;` to reset
- Make sure UUID extension is enabled

## Test the Setup

Run this query to verify:
```sql
SELECT 
  (SELECT COUNT(*) FROM users) as users_count,
  (SELECT COUNT(*) FROM groups) as groups_count,
  (SELECT COUNT(*) FROM battleplan_templates) as templates_count;
```

Should return: 1 user, 1 group, 1 template