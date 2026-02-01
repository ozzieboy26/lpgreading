import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET all customers with their sites
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const customers = await prisma.customer.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        active: true,
        sites: {
          select: {
            id: true,
            dropPointNumber: true,
            address: true,
            suburb: true,
            state: true,
            postcode: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json({ customers })
  } catch (error) {
    console.error('Get customers error:', error)
    return NextResponse.json(
      { error: 'Failed to get customers' },
      { status: 500 }
    )
  }
}
