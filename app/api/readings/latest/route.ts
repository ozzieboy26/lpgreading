import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET latest reading for a tank
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tankId = searchParams.get('tankId')

    if (!tankId) {
      return NextResponse.json({ error: 'Tank ID required' }, { status: 400 })
    }

    // Get latest reading for this tank
    const latestReading = await prisma.tankReading.findFirst({
      where: { tankId },
      orderBy: { submittedAt: 'desc' },
      include: {
        tank: {
          select: {
            tankNumber: true,
            capacity: true,
          },
        },
      },
    })

    if (!latestReading) {
      return NextResponse.json({ reading: null })
    }

    return NextResponse.json({
      reading: {
        id: latestReading.id,
        percentage: latestReading.percentage,
        reading: latestReading.reading,
        estimatedVolume: latestReading.estimatedVolume,
        submittedAt: latestReading.submittedAt,
        tankNumber: latestReading.tank.tankNumber,
        capacity: latestReading.tank.capacity,
      },
    })
  } catch (error) {
    console.error('Get latest reading error:', error)
    return NextResponse.json(
      { error: 'Failed to get latest reading' },
      { status: 500 }
    )
  }
}
