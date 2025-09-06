import { NextRequest, NextResponse } from 'next/server'
import { bot } from '@/lib/telegram/bot'
import { webhookCallback } from 'grammy'

// Create webhook handler
const handleWebhook = webhookCallback(bot, 'std/http')

export async function POST(req: NextRequest) {
  try {
    // Verify webhook secret
    const secret = req.headers.get('X-Telegram-Bot-Api-Secret-Token')
    if (!secret || secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
      console.error('Invalid webhook secret')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Additional security: Check request size limit
    const contentLength = req.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
      console.error('Request too large')
      return NextResponse.json({ error: 'Request too large' }, { status: 413 })
    }

    let body
    try {
      body = await req.json()
    } catch (error) {
      console.error('Invalid JSON in webhook request')
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    // Validate basic webhook structure
    if (!body || typeof body !== 'object' || !body.update_id) {
      console.error('Invalid webhook structure')
      return NextResponse.json({ error: 'Invalid webhook structure' }, { status: 400 })
    }
    
    // Process update
    await handleWebhook(new Request(req.url, {
      method: 'POST',
      headers: req.headers,
      body: JSON.stringify(body)
    }))
    
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    bot: 'Disciplo Bot',
    webhook: 'active'
  })
}