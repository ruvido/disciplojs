import { Bot } from 'grammy'
import { createClient } from '@supabase/supabase-js'

// Initialize bot for sending messages
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!)

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function notifyUserApproval(userId: string) {
  try {
    // Get user details
    const { data: user } = await supabase
      .from('users')
      .select('name, telegram_id')
      .eq('id', userId)
      .single()
    
    if (!user?.telegram_id) {
      console.log('User has no Telegram ID, skipping notification')
      return
    }
    
    // Send approval message
    await bot.api.sendMessage(
      user.telegram_id,
      `🎉 Great news, ${user.name}!\n\n` +
      `Your Disciplo account has been approved! You now have full access to:\n\n` +
      `• Create and track battleplans\n` +
      `• Join accountability groups\n` +
      `• Connect with the community\n\n` +
      `Login to the webapp to get started: ${process.env.NEXT_PUBLIC_APP_URL}/login\n\n` +
      `Welcome to your transformation journey! 🚀`
    )
    
    // Check if there's a default group to add them to
    const { data: defaultGroup } = await supabase
      .from('groups')
      .select('telegram_chat_id, name')
      .eq('is_default', true)
      .single()
    
    if (defaultGroup?.telegram_chat_id) {
      await bot.api.sendMessage(
        user.telegram_id,
        `You've been added to our main community group: ${defaultGroup.name}\n` +
        `Look for the group invite in your Telegram messages!`
      )
      
      // Note: Actually adding them to the group requires the bot to be admin
      // and use invite links or chat member management
    }
    
    return true
  } catch (error) {
    console.error('Error sending approval notification:', error)
    return false
  }
}

export async function notifyDailyReminder(userId: string) {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('name, telegram_id')
      .eq('id', userId)
      .single()
    
    if (!user?.telegram_id) return
    
    // Get active battleplan with today's routines
    const { data: battleplan } = await supabase
      .from('battleplans')
      .select(`
        title,
        pillars (
          type,
          routines (title)
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()
    
    if (!battleplan) return
    
    let message = `🌅 Good morning, ${user.name}!\n\n`
    message += `Today's routines for "${battleplan.title}":\n\n`
    
    battleplan.pillars?.forEach((pillar) => {
      const emoji = {
        interiority: '🧘',
        relationships: '🤝',
        resources: '💼',
        health: '💪'
      }[pillar.type]
      
      if (pillar.routines && pillar.routines.length > 0) {
        message += `${emoji} *${pillar.type}*\n`
        pillar.routines.forEach((routine) => {
          message += `  □ ${routine.title}\n`
        })
        message += '\n'
      }
    })
    
    message += `Track your progress: ${process.env.NEXT_PUBLIC_APP_URL}/battleplan/track\n\n`
    message += `You've got this! 💪`
    
    await bot.api.sendMessage(user.telegram_id, message, { parse_mode: 'Markdown' })
    
    return true
  } catch (error) {
    console.error('Error sending daily reminder:', error)
    return false
  }
}

export async function notifyGroupActivity(groupId: string, activity: string) {
  try {
    const { data: group } = await supabase
      .from('groups')
      .select('telegram_chat_id, name')
      .eq('id', groupId)
      .single()
    
    if (!group?.telegram_chat_id) return
    
    await bot.api.sendMessage(group.telegram_chat_id, activity)
    
    return true
  } catch (error) {
    console.error('Error sending group notification:', error)
    return false
  }
}

export async function sendWeeklyProgress(userId: string) {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('name, telegram_id')
      .eq('id', userId)
      .single()
    
    if (!user?.telegram_id) return
    
    // Get weekly stats
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    const { data: logs } = await supabase
      .from('routine_logs')
      .select('completed')
      .eq('user_id', userId)
      .gte('date', oneWeekAgo.toISOString())
    
    const completedCount = logs?.filter(log => log.completed).length || 0
    const totalCount = logs?.length || 0
    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
    
    let message = `📊 *Weekly Progress Report*\n\n`
    message += `Great work this week, ${user.name}!\n\n`
    message += `✅ Routines completed: ${completedCount}/${totalCount}\n`
    message += `📈 Completion rate: ${completionRate}%\n\n`
    
    if (completionRate >= 80) {
      message += `🌟 Outstanding work! You're crushing it!\n`
    } else if (completionRate >= 60) {
      message += `💪 Good progress! Keep pushing!\n`
    } else {
      message += `🤗 Every step counts! Let's make next week even better!\n`
    }
    
    message += `\nView full stats: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
    
    await bot.api.sendMessage(user.telegram_id, message, { parse_mode: 'Markdown' })
    
    return true
  } catch (error) {
    console.error('Error sending weekly progress:', error)
    return false
  }
}