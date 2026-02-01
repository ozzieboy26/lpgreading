import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET sites for a customer
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    const dropPoint = searchParams.get('dropPoint')
    const customerName = searchParams.get('customerName')

    let whereClause: any = {}

    // Filter by customerId if provided (for customer login)
    if (customerId) {
      whereClause.customerId = customerId
    }

    // Search by drop point
    if (dropPoint) {
      whereClause.dropPointNumber = {
        contains: dropPoint,
        mode: 'insensitive',
      }
    }

    // Search by customer name
    if (customerName) {
      whereClause.customer = {
        name: {
          contains: customerName,
          mode: 'insensitive',
        },
      }
    }

    const sites = await prisma.site.findMany({
      where: whereClause,
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
          select: {
            id: true,
            tankNumber: true,
            capacity: true,
            product: true,
            serialNumber: true,
          },
        },
      },
      orderBy: {
        dropPointNumber: 'asc',
      },
    })

    return NextResponse.json({ sites })
  } catch (error) {
    console.error('Get sites error:', error)
    return NextResponse.json(
      { error: 'Failed to get sites' },
      { status: 500 }
    )
  }
}
