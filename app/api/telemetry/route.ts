import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const dropPoint = searchParams.get('dropPoint')

    const whereClause: any = {}

    if (search) {
      whereClause.OR = [
        { dropPointNumber: { contains: search, mode: 'insensitive' } },
        { tankNumber: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (dropPoint) {
      whereClause.dropPointNumber = dropPoint
    }

    const telemetryData = await prisma.telemetryData.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      take: 100,
    })

    return NextResponse.json({ data: telemetryData })
  } catch (error) {
    console.error('Telemetry fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch telemetry data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // This endpoint would typically sync data from Power BI
    // Implementation depends on Power BI API integration
    
    return NextResponse.json({
      success: true,
      message: 'Telemetry sync initiated',
    })
  } catch (error) {
    console.error('Telemetry sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync telemetry data' },
      { status: 500 }
    )
  }
}
