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
  fileBuffer: Buffer | ArrayBuffer
): Promise<{ success: number; errors: string[] }> {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(fileBuffer as any)
  
  const worksheet = workbook.getWorksheet(1)
  if (!worksheet) {
    throw new Error('No worksheet found in Excel file')
  }

  let success = 0
  const errors: string[] = []
  const BATCH_SIZE = 5 // Process 5 rows at a time to avoid connection pool exhaustion

  // Read the header row to detect column positions
  const headerRow = worksheet.getRow(1)
  const columnMap: { [key: string]: number } = {}
  
  headerRow.eachCell((cell, colNumber) => {
    const headerValue = cell.value?.toString().toLowerCase().trim() || ''
    
    // Map various possible header names to standard field names
    if (headerValue.includes('customer') && (headerValue.includes('name') || headerValue.includes('customer'))) {
      columnMap['customerName'] = colNumber
    } else if (headerValue.includes('drop') && headerValue.includes('customer')) {
      columnMap['customerName'] = colNumber
    } else if (headerValue.includes('contact') && headerValue.includes('name')) {
      columnMap['contactName'] = colNumber
    } else if (headerValue === 'contact') {
      columnMap['contactName'] = colNumber
    } else if (headerValue === 'email' || headerValue.includes('e-mail')) {
      columnMap['email'] = colNumber
    } else if (headerValue === 'phone' || headerValue.includes('telephone') || headerValue.includes('mobile')) {
      columnMap['phone'] = colNumber
    } else if (headerValue === 'address' || headerValue.includes('street')) {
      columnMap['address'] = colNumber
    } else if (headerValue === 'sitename' || headerValue.includes('site') && headerValue.includes('name')) {
      columnMap['siteName'] = colNumber
    } else if (headerValue === 'suburb' || headerValue.includes('city')) {
      columnMap['suburb'] = colNumber
    } else if (headerValue === 'state' || headerValue.includes('state') || headerValue.includes('province')) {
      columnMap['state'] = colNumber
    } else if (headerValue === 'postcode' || headerValue.includes('zip') || headerValue === 'post code') {
      columnMap['postcode'] = colNumber
    } else if ((headerValue.includes('drop') && headerValue.includes('point')) || (headerValue.includes('drop') && headerValue.includes('pont'))) {
      // Handle both "DROP POINT" and "DROP PONT" (typo)
      columnMap['dropPoint'] = colNumber
    } else if (headerValue.includes('tank') && headerValue.includes('number')) {
      columnMap['tankNumber'] = colNumber
    } else if (headerValue.includes('tanksize')) {
      // Handle TANKSIZE_T1, TANKSIZE_T2, etc. - store as tankSize1, tankSize2, etc.
      const match = headerValue.match(/tanksize[_\s]*t?(\d+)/)
      if (match) {
        const tankNum = match[1]
        columnMap[`tankSize${tankNum}`] = colNumber
      }
    } else if (headerValue.includes('capacity')) {
      columnMap['capacity'] = colNumber
    } else if (headerValue.includes('serial')) {
      columnMap['serialNumber'] = colNumber
    } else if (headerValue === 'product' || headerValue.includes('gas type')) {
      columnMap['product'] = colNumber
    } else if (headerValue.includes('tank') && headerValue.includes('type')) {
      columnMap['tankType'] = colNumber
    } else if (headerValue === 'notes') {
      columnMap['notes'] = colNumber
    }
  })

  // Log detected columns for debugging
  console.log('Detected columns:', columnMap)

  // Collect all row data first
  const rowDataList: any[] = []
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return // Skip header
    rowDataList.push({ row, rowNumber })
  })

  // Process rows in batches to avoid connection pool exhaustion
  for (let i = 0; i < rowDataList.length; i += BATCH_SIZE) {
    const batch = rowDataList.slice(i, i + BATCH_SIZE)
    const batchPromises = batch.map(({ row, rowNumber }) => processRow(row, rowNumber, columnMap, errors))
    
    const results = await Promise.all(batchPromises)
    success += results.filter(r => r === true).length
  }

  return { success, errors }
}

// Helper function to process a single row
async function processRow(
  row: any,
  rowNumber: number,
  columnMap: { [key: string]: number },
  errors: string[]
): Promise<boolean> {
  try {
        // Extract data using detected column positions
        const customerName = columnMap['customerName'] ? row.getCell(columnMap['customerName']).value?.toString().trim() : undefined
        const contactName = columnMap['contactName'] ? row.getCell(columnMap['contactName']).value?.toString().trim() : undefined
        const email = columnMap['email'] ? row.getCell(columnMap['email']).value?.toString().trim() : undefined
        const phone = columnMap['phone'] ? row.getCell(columnMap['phone']).value?.toString().trim() : undefined
        const address = columnMap['address'] ? row.getCell(columnMap['address']).value?.toString().trim() : undefined
        const siteName = columnMap['siteName'] ? row.getCell(columnMap['siteName']).value?.toString().trim() : undefined
        const suburb = columnMap['suburb'] ? row.getCell(columnMap['suburb']).value?.toString().trim() : undefined
        const state = columnMap['state'] ? row.getCell(columnMap['state']).value?.toString().trim() : undefined
        const postcode = columnMap['postcode'] ? row.getCell(columnMap['postcode']).value?.toString().trim() : undefined
        const dropPoint = columnMap['dropPoint'] ? row.getCell(columnMap['dropPoint']).value?.toString().trim() : undefined
        const tankNumber = columnMap['tankNumber'] ? row.getCell(columnMap['tankNumber']).value?.toString().trim() : undefined
        const capacity = columnMap['capacity'] ? row.getCell(columnMap['capacity']).value : undefined
        const serialNumber = columnMap['serialNumber'] ? row.getCell(columnMap['serialNumber']).value?.toString().trim() : undefined
        const product = columnMap['product'] ? row.getCell(columnMap['product']).value?.toString().trim() : 'LPG'
        const tankType = columnMap['tankType'] ? row.getCell(columnMap['tankType']).value?.toString().trim() : undefined
        const notes = columnMap['notes'] ? row.getCell(columnMap['notes']).value?.toString().trim() : undefined
        
        // Extract multiple tank sizes (TANKSIZE_T1, TANKSIZE_T2, etc.)
        const tankSizes: { [key: string]: number } = {}
        for (let i = 1; i <= 8; i++) {
          const tankSizeKey = `tankSize${i}`
          if (columnMap[tankSizeKey]) {
            const value = row.getCell(columnMap[tankSizeKey]).value
            if (value) {
              const sizeStr = value.toString().replace(/[^0-9.]/g, '')
              const size = parseFloat(sizeStr)
              if (size > 0) {
                tankSizes[`T${i}`] = size
              }
            }
          }
        }
        
        // Parse capacity - handle various formats
        let tankCapacity = 0
        if (capacity) {
          const capacityStr = capacity.toString().replace(/[^0-9.]/g, '')
          tankCapacity = parseFloat(capacityStr) || 0
        }

        // Validate required fields
        if (!dropPoint) {
          errors.push(`Row ${rowNumber}: Missing Drop Point`)
          return false
        }

        // Use drop point as customer name if customer name is missing
        const finalCustomerName = customerName || dropPoint
        const finalAddress = address || siteName || `Site ${dropPoint}`
        
        // Use contact name if provided, otherwise use customer name
        const finalContactName = contactName || finalCustomerName
        const finalEmail = email || `${dropPoint.toLowerCase().replace(/[^a-z0-9]/g, '')}@customer.local`

        // Create or update customer
        const customer = await prisma.customer.upsert({
          where: { id: finalEmail },
          update: { 
            name: finalCustomerName, 
            phone: phone || '',
          },
          create: {
            id: finalEmail,
            name: finalCustomerName,
            email: finalEmail,
            phone: phone || '',
          },
        })

        // Create or update site
        const site = await prisma.site.upsert({
          where: { dropPointNumber: dropPoint },
          update: {
            address: finalAddress,
            suburb,
            state,
            postcode,
            customerId: customer.id,
          },
          create: {
            dropPointNumber: dropPoint,
            address: finalAddress,
            suburb,
            state,
            postcode,
            customerId: customer.id,
          },
        })

        // Create tanks from tankSizes columns (TANKSIZE_T1, T2, etc.)
        if (Object.keys(tankSizes).length > 0) {
          for (const [tankNum, capacity] of Object.entries(tankSizes)) {
            await prisma.tank.upsert({
              where: {
                siteId_tankNumber: {
                  siteId: site.id,
                  tankNumber: tankNum,
                },
              },
              update: { 
                capacity: capacity,
                product: product || 'LPG',
                serialNumber: serialNumber || null,
              },
              create: {
                tankNumber: tankNum,
                capacity: capacity,
                product: product || 'LPG',
                serialNumber: serialNumber || null,
                siteId: site.id,
              },
            })
          }
        } else if (tankNumber && tankCapacity > 0) {
          // Fallback: Create single tank if tank data is provided in old format
          await prisma.tank.upsert({
            where: {
              siteId_tankNumber: {
                siteId: site.id,
                tankNumber: tankNumber,
              },
            },
            update: { 
              capacity: tankCapacity,
              product: product || 'LPG',
              serialNumber: serialNumber || null,
            },
            create: {
              tankNumber,
              capacity: tankCapacity,
              product: product || 'LPG',
              serialNumber: serialNumber || null,
              siteId: site.id,
            },
          })
        }

        return true
      } catch (error: any) {
        errors.push(`Row ${rowNumber}: ${error.message || error}`)
        return false
      }
}
