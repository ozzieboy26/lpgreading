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

    console.log('Starting export for:', emailTo || process.env.EMAIL_TO || 'default recipient')

    // Generate Excel file
    const excelBuffer = await generateTankReadingsExcel(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    )

    console.log('Excel generated, size:', excelBuffer.length, 'bytes')

    // Try to send email, but don't fail if it doesn't work
    const fileName = `tank-readings-${new Date().toISOString().split('T')[0]}.xlsx`
    let emailSent = false
    let emailError = null
    
    try {
      await sendTankReadingEmail(excelBuffer, fileName, emailTo)
      emailSent = true
      console.log('Email sent successfully to:', emailTo || process.env.EMAIL_TO)
    } catch (emailErr: any) {
      emailError = emailErr.message || 'Unknown email error'
      console.error('Failed to send email:', emailError)
      console.error('Full email error:', emailErr)
    }

    // Return success with download option if email failed
    return NextResponse.json({
      success: true,
      emailSent,
      emailError,
      message: emailSent 
        ? 'Tank readings exported and emailed successfully'
        : 'Tank readings exported (email failed - check SMTP settings)',
      fileName,
      downloadUrl: `/api/export/download?date=${new Date().toISOString().split('T')[0]}`,
      sentTo: emailTo || process.env.EMAIL_TO || 'vic@elgas.com.au',
    })
  } catch (error: any) {
    console.error('Export error details:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to export tank readings' },
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
