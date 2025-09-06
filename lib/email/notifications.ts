import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Sanitize user input for HTML emails
function sanitizeForEmail(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

export async function sendApprovalEmail(userId: string) {
  try {
    // Get user details
    const { data: user } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', userId)
      .single()
    
    if (!user) {
      console.error('User not found')
      return false
    }

    // Generate magic link token (valid for 7 days)
    const token = Buffer.from(`${userId}:${Date.now()}`).toString('base64')
    // const magicLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}` // TODO: implement magic link verification

    // Store token in database (you might want to add a tokens table)
    // For now, we'll use the direct login approach

    const { error } = await resend.emails.send({
      from: 'Disciplo <noreply@disciplo.com>',
      to: user.email,
      subject: '🎉 Your Disciplo Account Has Been Approved!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            ul { margin: 20px 0; }
            li { margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Disciplo! 🎯</h1>
            </div>
            <div class="content">
              <h2>Hi ${sanitizeForEmail(user.name)},</h2>
              
              <p>Great news! Your Disciplo account has been approved and you now have full access to our transformation community.</p>
              
              <p><strong>What you can do now:</strong></p>
              <ul>
                <li>✅ Create your first battleplan (30-60-90 day transformation)</li>
                <li>✅ Join accountability groups in your area</li>
                <li>✅ Connect with other members on their journey</li>
                <li>✅ Track your daily routines and progress</li>
                <li>✅ Connect your Telegram for notifications</li>
              </ul>

              <center>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" class="button">
                  Login to Disciplo
                </a>
              </center>

              <p><strong>Next Steps:</strong></p>
              <ol>
                <li>Login to your account</li>
                <li>Connect your Telegram for group access</li>
                <li>Create your first battleplan</li>
                <li>Join your local accountability group</li>
              </ol>

              <p>If you have Telegram, connect it to:</p>
              <ul>
                <li>Join the main community group automatically</li>
                <li>Receive daily routine reminders</li>
                <li>Get accountability check-ins</li>
              </ul>

              <p>We're excited to support you on your transformation journey!</p>
              
              <p>Best regards,<br>
              The Disciplo Team</p>
            </div>
            <div class="footer">
              <p>Need help? Reply to this email or visit our support page.</p>
              <p>© 2024 Disciplo. Built for transformation.</p>
            </div>
          </div>
        </body>
        </html>
      `
    })

    if (error) {
      console.error('Error sending approval email:', error)
      return false
    }

    console.log('Approval email sent to:', user.email)
    return true
  } catch (error) {
    console.error('Error in sendApprovalEmail:', error)
    return false
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const { error } = await resend.emails.send({
      from: 'Disciplo <noreply@disciplo.com>',
      to: email,
      subject: 'Welcome to Disciplo - Account Under Review',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Account Under Review ⏳</h1>
            </div>
            <div class="content">
              <h2>Hi ${sanitizeForEmail(name)},</h2>
              
              <p>Thank you for joining Disciplo! Your registration has been received and is currently under review by our team.</p>
              
              <p><strong>What happens next?</strong></p>
              <ul>
                <li>Our admin team will review your application</li>
                <li>This usually takes 1-2 business days</li>
                <li>You'll receive an email once approved</li>
                <li>Then you can start your transformation journey!</li>
              </ul>

              <p>While you wait, you can:</p>
              <ul>
                <li>Learn more about the battleplan methodology</li>
                <li>Think about your 30-60-90 day transformation priority</li>
                <li>Prepare your daily routines across the 4 pillars</li>
              </ul>

              <p>We're excited to have you join our community!</p>
              
              <p>Best regards,<br>
              The Disciplo Team</p>
            </div>
            <div class="footer">
              <p>Questions? Reply to this email for support.</p>
              <p>© 2024 Disciplo. Built for transformation.</p>
            </div>
          </div>
        </body>
        </html>
      `
    })

    if (error) {
      console.error('Error sending welcome email:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in sendWelcomeEmail:', error)
    return false
  }
}

export async function sendDailyReminderEmail(userId: string) {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', userId)
      .single()
    
    if (!user) return false

    // Get active battleplan
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
    
    if (!battleplan) return false

    let routinesHtml = ''
    battleplan.pillars?.forEach((pillar) => {
      const emojiMap = {
        interiority: '🧘',
        relationships: '🤝',
        resources: '💼',
        health: '💪'
      } as const
      
      const emoji = emojiMap[pillar.type as keyof typeof emojiMap] || '📝'
      
      if (pillar.routines && pillar.routines.length > 0) {
        routinesHtml += `<h3>${emoji} ${pillar.type.charAt(0).toUpperCase() + pillar.type.slice(1)}</h3><ul>`
        pillar.routines.forEach((routine) => {
          routinesHtml += `<li>☐ ${routine.title}</li>`
        })
        routinesHtml += '</ul>'
      }
    })

    const { error } = await resend.emails.send({
      from: 'Disciplo <noreply@disciplo.com>',
      to: user.email,
      subject: `🌅 Daily Routines - ${battleplan.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 10px 25px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            h3 { color: #1f2937; margin-top: 20px; }
            ul { list-style: none; padding-left: 0; }
            li { padding: 5px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Good Morning, ${sanitizeForEmail(user.name)}! ☀️</h1>
            </div>
            <div class="content">
              <p>Here are your routines for today:</p>
              
              ${routinesHtml}
              
              <center>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/battleplan/track" class="button">
                  Track Progress
                </a>
              </center>
              
              <p><em>You've got this! One day at a time. 💪</em></p>
            </div>
          </div>
        </body>
        </html>
      `
    })

    return !error
  } catch (error) {
    console.error('Error sending daily reminder:', error)
    return false
  }
}