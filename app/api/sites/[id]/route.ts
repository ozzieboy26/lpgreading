import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET single site with details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const site = await prisma.site.findUnique({
      where: { id: params.id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        tanks: {
          include: {
            tankReadings: {
              take: 1,
              orderBy: {
                submittedAt: 'desc',
              },
              select: {
                id: true,
                reading: true,
                percentage: true,
                estimatedVolume: true,
                submittedAt: true,
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    return NextResponse.json({ site })
  } catch (error) {
    console.error('Get site error:', error)
    return NextResponse.json(
      { error: 'Failed to get site' },
      { status: 500 }
    )
  }
}
