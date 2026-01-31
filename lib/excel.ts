import ExcelJS from 'exceljs'
import { prisma } from './prisma'

interface TankReadingExport {
  id: string
  reading: number
  percentage: number | null
  estimatedVolume: number | null
  notes: string | null
  submittedAt: Date
  user: {
    name: string
    email: string
  }
  site: {
    dropPointNumber: string
    address: string
    customer: {
      name: string
    }
  }
  tank: {
    tankNumber: string
    capacity: number
  }
}

export async function generateTankReadingsExcel(
  startDate?: Date,
  endDate?: Date
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Tank Readings')

  // Set column headers
  worksheet.columns = [
    { header: 'Reading ID', key: 'id', width: 20 },
    { header: 'Customer Name', key: 'customerName', width: 25 },
    { header: 'Drop Point Number', key: 'dropPoint', width: 18 },
    { header: 'Site Address', key: 'address', width: 40 },
    { header: 'Tank Number', key: 'tankNumber', width: 12 },
    { header: 'Tank Capacity (L)', key: 'capacity', width: 15 },
    { header: 'Reading', key: 'reading', width: 12 },
    { header: 'Percentage', key: 'percentage', width: 12 },
    { header: 'Est. Volume (L)', key: 'volume', width: 15 },
    { header: 'Notes', key: 'notes', width: 30 },
    { header: 'Submitted By', key: 'submittedBy', width: 20 },
    { header: 'Submitted At', key: 'submittedAt', width: 20 },
  ]

  // Style the header row
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF3B82F6' },
  }
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }

  // Fetch tank readings
  const whereClause: any = { exported: false }
  if (startDate || endDate) {
    whereClause.submittedAt = {}
    if (startDate) whereClause.submittedAt.gte = startDate
    if (endDate) whereClause.submittedAt.lte = endDate
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
        include: {
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

  // Add data rows
  readings.forEach((reading) => {
    worksheet.addRow({
      id: reading.id,
      customerName: reading.site.customer.name,
      dropPoint: reading.site.dropPointNumber,
      address: reading.site.address,
      tankNumber: reading.tank.tankNumber,
      capacity: reading.tank.capacity,
      reading: reading.reading,
      percentage: reading.percentage ? `${reading.percentage.toFixed(1)}%` : '',
      volume: reading.estimatedVolume?.toFixed(2) || '',
      notes: reading.notes || '',
      submittedBy: reading.user.name,
      submittedAt: reading.submittedAt.toLocaleString(),
    })
  })

  // Add borders and alignment to all cells
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      }
      if (rowNumber > 1) {
        cell.alignment = { vertical: 'middle' }
      }
    })
  })

  // Mark readings as exported
  await prisma.tankReading.updateMany({
    where: { id: { in: readings.map((r) => r.id) } },
    data: {
      exported: true,
      exportedAt: new Date(),
    },
  })

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}

export async function importCustomersFromExcel(
  fileBuffer: Buffer
): Promise<{ success: number; errors: string[] }> {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(fileBuffer)
  
  const worksheet = workbook.getWorksheet(1)
  if (!worksheet) {
    throw new Error('No worksheet found in Excel file')
  }

  let success = 0
  const errors: string[] = []

  // Expected columns: Customer Name, Email, Phone, Drop Point, Address, Suburb, State, Postcode, Tank Number, Tank Capacity
  worksheet.eachRow(async (row, rowNumber) => {
    if (rowNumber === 1) return // Skip header

    try {
      const customerName = row.getCell(1).value?.toString().trim()
      const email = row.getCell(2).value?.toString().trim()
      const phone = row.getCell(3).value?.toString().trim()
      const dropPoint = row.getCell(4).value?.toString().trim()
      const address = row.getCell(5).value?.toString().trim()
      const suburb = row.getCell(6).value?.toString().trim()
      const state = row.getCell(7).value?.toString().trim()
      const postcode = row.getCell(8).value?.toString().trim()
      const tankNumber = row.getCell(9).value?.toString().trim()
      const tankCapacity = parseFloat(row.getCell(10).value?.toString() || '0')

      if (!customerName || !email || !dropPoint || !address) {
        errors.push(`Row ${rowNumber}: Missing required fields`)
        return
      }

      // Create or update customer
      const customer = await prisma.customer.upsert({
        where: { id: email }, // Using email as unique identifier
        update: { name: customerName, phone: phone || '' },
        create: {
          name: customerName,
          email: email,
          phone: phone || '',
        },
      })

      // Create or update site
      const site = await prisma.site.upsert({
        where: { dropPointNumber: dropPoint },
        update: {
          address,
          suburb,
          state,
          postcode,
        },
        create: {
          dropPointNumber: dropPoint,
          address,
          suburb,
          state,
          postcode,
          customerId: customer.id,
        },
      })

      // Create tank if provided
      if (tankNumber && tankCapacity > 0) {
        await prisma.tank.upsert({
          where: {
            siteId_tankNumber: {
              siteId: site.id,
              tankNumber: tankNumber,
            },
          },
          update: { capacity: tankCapacity },
          create: {
            tankNumber,
            capacity: tankCapacity,
            siteId: site.id,
          },
        })
      }

      success++
    } catch (error) {
      errors.push(`Row ${rowNumber}: ${error}`)
    }
  })

  return { success, errors }
}
