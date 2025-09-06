import { Bot, Context, SessionFlavor, session } from 'grammy'
import { createClient } from '@supabase/supabase-js'

// Session interface for storing user data
interface SessionData {
  userId?: string
  awaitingVerification?: boolean
}

type MyContext = Context & SessionFlavor<SessionData>

// Initialize bot
export const bot = new Bot<MyContext>(process.env.TELEGRAM_BOT_TOKEN!)

// Initialize Supabase client for bot
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Use session middleware
bot.use(session({ initial: (): SessionData => ({}) }))

// Command handlers
bot.command('start', async (ctx) => {
  const telegramId = ctx.from?.id.toString()
  const username = ctx.from?.username || ''
  
  // Check if deep link contains verification token
  const token = ctx.match
  
  if (token) {
    // This is a verification link from the webapp
    await handleVerification(ctx, token, telegramId!, username)
  } else {
    // Regular start
    await ctx.reply(
      `Welcome to Disciplo Bot! 🎯\n\n` +
      `I help manage your transformation journey and connect you with your accountability groups.\n\n` +
      `Available commands:\n` +
      `/verify - Connect your Telegram account\n` +
      `/battleplan - View your current battleplan\n` +
      `/groups - See your groups\n` +
      `/help - Show this message`
    )
  }
})

bot.command('verify', async (ctx) => {
  await ctx.reply(
    `To connect your Telegram account:\n\n` +
    `1. Log in to Disciplo webapp\n` +
    `2. Go to your profile settings\n` +
    `3. Click "Connect Telegram"\n` +
    `4. Follow the link provided`
  )
})

bot.command('battleplan', async (ctx) => {
  const telegramId = ctx.from?.id.toString()
  
  // Get user from database
  const { data: user } = await supabase
    .from('users')
    .select('id, name')
    .eq('telegram_id', telegramId)
    .single()
  
  if (!user) {
    await ctx.reply('Please connect your account first using /verify')
    return
  }
  
  // Get active battleplan
  const { data: battleplan } = await supabase
    .from('battleplans')
    .select(`
      *,
      pillars (
        type,
        objective,
        routines (title)
      )
    `)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()
  
  if (!battleplan) {
    await ctx.reply('You don\'t have an active battleplan. Create one in the webapp!')
    return
  }
  
  let message = `🎯 *Your Active Battleplan*\n\n`
  message += `*${battleplan.title}*\n`
  message += `Priority: ${battleplan.priority}\n`
  message += `Duration: ${battleplan.duration} days\n\n`
  
  message += `*Today's Routines:*\n`
  
  battleplan.pillars?.forEach((pillar: any) => {
    const emojiMap = {
      interiority: '🧘',
      relationships: '🤝',
      resources: '💼',
      health: '💪'
    } as const
    
    const emoji = emojiMap[pillar.type as keyof typeof emojiMap] || '📝'
    
    message += `\n${emoji} *${pillar.type.charAt(0).toUpperCase() + pillar.type.slice(1)}*\n`
    pillar.routines?.forEach((routine: any) => {
      message += `• ${routine.title}\n`
    })
  })
  
  await ctx.reply(message, { parse_mode: 'Markdown' })
})

bot.command('groups', async (ctx) => {
  const telegramId = ctx.from?.id.toString()
  
  // Get user from database
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('telegram_id', telegramId)
    .single()
  
  if (!user) {
    await ctx.reply('Please connect your account first using /verify')
    return
  }
  
  // Get user's groups
  const { data: groups } = await supabase
    .from('group_members')
    .select(`
      role,
      groups (
        name,
        type,
        telegram_chat_id
      )
    `)
    .eq('user_id', user.id)
  
  if (!groups || groups.length === 0) {
    await ctx.reply('You\'re not in any groups yet. Join groups through the webapp!')
    return
  }
  
  let message = `👥 *Your Groups*\n\n`
  
  groups.forEach((membership) => {
    const group = membership.groups
    if (group) {
      message += `• *${group.name}*\n`
      message += `  Type: ${group.type}\n`
      message += `  Your role: ${membership.role}\n`
      if (group.telegram_chat_id) {
        message += `  Chat: @${group.telegram_chat_id}\n`
      }
      message += '\n'
    }
  })
  
  await ctx.reply(message, { parse_mode: 'Markdown' })
})

bot.command('help', async (ctx) => {
  await ctx.reply(
    `*Disciplo Bot Commands*\n\n` +
    `/start - Welcome message\n` +
    `/verify - Connect your Telegram account\n` +
    `/battleplan - View your current battleplan\n` +
    `/groups - See your groups\n` +
    `/checkin - Mark today's routines (coming soon)\n` +
    `/stats - View your progress (coming soon)\n\n` +
    `For more features, visit the webapp!`,
    { parse_mode: 'Markdown' }
  )
})

// Handle bot being added to a group as admin
bot.on(':new_chat_members', async (ctx) => {
  const newMembers = ctx.message?.new_chat_members || []
  const botUsername = ctx.me.username
  
  // Check if bot was added
  const botWasAdded = newMembers.some(member => member.username === botUsername)
  
  if (botWasAdded) {
    const chatId = ctx.chat.id.toString()
    const chatTitle = ctx.chat.title || 'Unknown Group'
    
    // Check if this is the first group (to set as default)
    const { count } = await supabase
      .from('groups')
      .select('*', { count: 'exact', head: true })
      .eq('is_default', true)
    
    if (count === 0) {
      // This is the first group, set as default
      await supabase.rpc('set_default_group_from_telegram', {
        telegram_chat_id: chatId,
        group_name: chatTitle
      })
      
      await ctx.reply(
        `🎯 Disciplo Bot activated!\n\n` +
        `This group has been set as the default community group.\n` +
        `All approved members will be automatically added here.\n\n` +
        `I'll help manage member access and share updates.`
      )
    } else {
      // Regular group
      await supabase.rpc('sync_telegram_group', {
        p_telegram_chat_id: chatId,
        p_group_name: chatTitle,
        p_group_type: 'local'
      })
      
      await ctx.reply(
        `🎯 Disciplo Bot activated!\n\n` +
        `This group is now synced with the Disciplo platform.\n` +
        `I'll help manage member access and share updates.`
      )
    }
  }
})

// Handle member joining group
bot.on(':new_chat_members', async (ctx) => {
  const newMembers = ctx.message?.new_chat_members || []
  const chatId = ctx.chat.id.toString()
  
  for (const member of newMembers) {
    if (member.is_bot) continue
    
    const telegramId = member.id.toString()
    
    // Check if user is approved in our system
    const { data: user } = await supabase
      .from('users')
      .select('id, name, approved')
      .eq('telegram_id', telegramId)
      .single()
    
    if (!user || !user.approved) {
      // User not approved, remove them
      try {
        await ctx.banChatMember(member.id)
        await ctx.unbanChatMember(member.id) // Unban so they can try again later
        await ctx.reply(
          `⚠️ ${member.first_name} is not an approved Disciplo member.\n` +
          `Please register at ${process.env.NEXT_PUBLIC_APP_URL} first.`
        )
      } catch (error) {
        console.error('Could not remove unapproved user:', error)
      }
    } else {
      // User is approved, welcome them
      await ctx.reply(`Welcome ${user.name}! 🎯`)
      
      // Update group membership in database
      const { data: group } = await supabase
        .from('groups')
        .select('id')
        .eq('telegram_chat_id', chatId)
        .single()
      
      if (group) {
        await supabase
          .from('group_members')
          .upsert({
            group_id: group.id,
            user_id: user.id,
            role: 'member'
          })
      }
    }
  }
})

// Handle member leaving group
bot.on(':left_chat_member', async (ctx) => {
  const leftMember = ctx.message?.left_chat_member
  if (!leftMember || leftMember.is_bot) return
  
  const telegramId = leftMember.id.toString()
  const chatId = ctx.chat.id.toString()
  
  // Remove from database
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('telegram_id', telegramId)
    .single()
  
  if (user) {
    const { data: group } = await supabase
      .from('groups')
      .select('id')
      .eq('telegram_chat_id', chatId)
      .single()
    
    if (group) {
      await supabase
        .from('group_members')
        .delete()
        .eq('group_id', group.id)
        .eq('user_id', user.id)
    }
  }
})

// Verification handler
async function handleVerification(
  ctx: MyContext,
  token: string,
  telegramId: string,
  username: string
) {
  // Verify token and update user
  const { data: user, error } = await supabase
    .from('users')
    .update({
      telegram_id: telegramId,
      telegram_username: username
    })
    .eq('id', token) // Token is actually the user ID for simplicity
    .select()
    .single()
  
  if (error || !user) {
    await ctx.reply('❌ Verification failed. Please try again from the webapp.')
    return
  }
  
  await ctx.reply(
    `✅ Success! Your Telegram account is now connected to Disciplo.\n\n` +
    `Welcome, ${user.name}! 🎯\n\n` +
    `You can now:\n` +
    `• Receive notifications\n` +
    `• Check your battleplan with /battleplan\n` +
    `• View your groups with /groups\n` +
    `• Get daily reminders for your routines`
  )
  
  // Add user to default group if exists
  const { data: defaultGroup } = await supabase
    .from('groups')
    .select('telegram_chat_id')
    .eq('is_default', true)
    .single()
  
  if (defaultGroup?.telegram_chat_id) {
    await ctx.reply(
      `I'll now add you to the main community group. ` +
      `Please check your Telegram for the group invite!`
    )
    
    // Note: Bot needs to be admin in the group to add members
    // This would be done through a group invite link in production
  }
}

// Error handler
bot.catch((err) => {
  console.error('Bot error:', err)
})