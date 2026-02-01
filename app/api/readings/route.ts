import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendIndividualReadingEmail } from '@/lib/email'

// POST - Submit a new tank reading
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tankId, siteId, reading, percentage, readingDate, notes } = body

    // Validate required fields
    if (!tankId || !siteId || reading === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get tank details for calculations
    const tank = await prisma.tank.findUnique({
      where: { id: tankId },
      include: {
        site: {
          include: {
            customer: true,
          },
        },
      },
    })

    if (!tank) {
      return NextResponse.json({ error: 'Tank not found' }, { status: 404 })
    }

    // Calculate percentage and volume
    let finalPercentage = percentage
    let estimatedVolume = reading

    if (percentage !== undefined && percentage !== null) {
      // If percentage provided, calculate volume
      estimatedVolume = (percentage / 100) * tank.capacity
    } else {
      // If reading provided, calculate percentage
      finalPercentage = (reading / tank.capacity) * 100
    }

    // Create the tank reading
    const tankReading = await prisma.tankReading.create({
      data: {
        reading: reading,
        percentage: finalPercentage,
        estimatedVolume: estimatedVolume,
        notes: notes || null,
        submittedAt: readingDate ? new Date(readingDate) : new Date(),
        userId: session.user.id!,
        siteId: siteId,
        tankId: tankId,
        exported: false,
      },
    })

    // Send email notification
    try {
      await sendIndividualReadingEmail({
        customerName: tank.site.customer.name,
        dropPoint: tank.site.dropPointNumber,
        address: tank.site.address,
        tankNumber: tank.tankNumber,
        capacity: tank.capacity,
        reading: reading,
        percentage: finalPercentage,
        volume: estimatedVolume,
        submittedBy: session.user.name || session.user.email || 'Unknown User',
        submittedAt: tankReading.submittedAt,
        notes: notes || '',
      })
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError)
      // Don't fail the whole request if email fails
    }

    return NextResponse.json({
      success: true,
      reading: {
        id: tankReading.id,
        reading: tankReading.reading,
        percentage: tankReading.percentage,
        estimatedVolume: tankReading.estimatedVolume,
        submittedAt: tankReading.submittedAt,
      },
    })
  } catch (error) {
    console.error('Submit reading error:', error)
    return NextResponse.json(
      { error: 'Failed to submit reading' },
      { status: 500 }
    )
  }
}

// GET - Get all readings (for admin export)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let whereClause: any = {}

    if (startDate && endDate) {
      whereClause.submittedAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    const readings = await prisma.tankReading.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        site: {
          select: {
            dropPointNumber: true,
            address: true,
            customer: {
              select: {
                name: true,
              },
            },
          },
        },
        tank: {
          select: {
            tankNumber: true,
            capacity: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    })

    return NextResponse.json({ readings })
  } catch (error) {
    console.error('Get readings error:', error)
    return NextResponse.json(
      { error: 'Failed to get readings' },
      { status: 500 }
    )
  }
}
