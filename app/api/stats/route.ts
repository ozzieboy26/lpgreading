import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get counts for dashboard cards
    const [usersCount, customersCount, sitesCount, readingsCount] = await Promise.all([
      prisma.user.count(),
      prisma.customer.count(),
      prisma.site.count(),
      prisma.tankReading.count(),
    ])

    return NextResponse.json({
      users: usersCount,
      customers: customersCount,
      sites: sitesCount,
      readings: readingsCount,
    })
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json(
      { error: 'Failed to get statistics' },
      { status: 500 }
    )
  }
}
