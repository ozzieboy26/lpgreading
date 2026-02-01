import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateTankReadingsExcel } from '@/lib/excel'
import { sendTankReadingEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'DRIVER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { startDate, endDate, emailTo } = body

    // Generate Excel file
    const excelBuffer = await generateTankReadingsExcel(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    )

    // Send email with optional custom recipient
    const fileName = `tank-readings-${new Date().toISOString().split('T')[0]}.xlsx`
    await sendTankReadingEmail(excelBuffer, fileName, emailTo)

    return NextResponse.json({
      success: true,
      message: 'Tank readings exported and emailed successfully',
      fileName,
      sentTo: emailTo || process.env.EMAIL_TO || 'telemetry@lpgreadings.au',
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export tank readings' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get unexported readings count
    const count = await prisma.tankReading.count({
      where: { exported: false },
    })

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Export status error:', error)
    return NextResponse.json(
      { error: 'Failed to get export status' },
      { status: 500 }
    )
  }
}
