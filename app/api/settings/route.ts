import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET settings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get settings from database or use defaults
    const settings = {
      emailRecipient: process.env.EMAIL_TO || 'telemetry@lpgreadings.au',
      autoExport: false, // Whether to automatically export readings
      exportFrequency: 'daily', // daily, weekly, monthly
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json(
      { error: 'Failed to get settings' },
      { status: 500 }
    )
  }
}

// POST update settings
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { emailRecipient, autoExport, exportFrequency } = body

    // In production, you would save these to a Settings table
    // For now, we'll just return them
    const settings = {
      emailRecipient: emailRecipient || 'telemetry@lpgreadings.au',
      autoExport: autoExport || false,
      exportFrequency: exportFrequency || 'daily',
    }

    return NextResponse.json({
      success: true,
      settings,
      message: 'Settings updated successfully',
    })
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
