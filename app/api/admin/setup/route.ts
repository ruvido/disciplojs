import { NextResponse } from 'next/server'
import { createAdminUserIfMissing } from '@/lib/admin/setup'

export async function POST() {
  try {
    // Security: Only allow in development or with proper authentication
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Setup endpoint not available in production' },
        { status: 403 }
      )
    }

    const success = await createAdminUserIfMissing()
    
    if (success) {
      return NextResponse.json({ 
        message: 'Admin user setup completed',
        email: 'ruvido@gmail.com'
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to setup admin user' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Admin setup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Admin setup endpoint',
    instructions: 'Send POST request to create admin user (dev only)'
  })
}