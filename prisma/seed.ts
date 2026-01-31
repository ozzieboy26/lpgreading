import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/encryption'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const adminPassword = hashPassword('admin123') // Change this password!
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lpgtank.com' },
    update: {},
    create: {
      email: 'admin@lpgtank.com',
      password: adminPassword,
      name: 'System Administrator',
      role: 'ADMIN',
      active: true,
    },
  })

  console.log('✅ Admin user created:', admin.email)

  // Create demo customer
  const customer = await prisma.customer.upsert({
    where: { id: 'demo-customer-1' },
    update: {},
    create: {
      id: 'demo-customer-1',
      name: 'Demo Customer Ltd',
      email: 'demo@example.com',
      phone: '0400 000 000',
      active: true,
    },
  })

  console.log('✅ Demo customer created:', customer.name)

  // Create customer user
  const customerPassword = hashPassword('customer123') // Change this password!
  
  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      password: customerPassword,
      name: 'Demo Customer User',
      role: 'CUSTOMER',
      active: true,
      customerId: customer.id,
    },
  })

  console.log('✅ Customer user created:', customerUser.email)

  // Create driver user
  const driverPassword = hashPassword('driver123') // Change this password!
  
  const driver = await prisma.user.upsert({
    where: { email: 'driver@example.com' },
    update: {},
    create: {
      email: 'driver@example.com',
      password: driverPassword,
      name: 'Demo Driver',
      role: 'DRIVER',
      active: true,
    },
  })

  console.log('✅ Driver user created:', driver.email)

  // Create demo site
  const site = await prisma.site.upsert({
    where: { dropPointNumber: 'DP-001' },
    update: {},
    create: {
      dropPointNumber: 'DP-001',
      address: '123 Main Street',
      suburb: 'Melbourne',
      state: 'VIC',
      postcode: '3000',
      customerId: customer.id,
    },
  })

  console.log('✅ Demo site created:', site.dropPointNumber)

  // Create demo tanks
  const tank1 = await prisma.tank.upsert({
    where: {
      siteId_tankNumber: {
        siteId: site.id,
        tankNumber: 'T1',
      },
    },
    update: {},
    create: {
      tankNumber: 'T1',
      capacity: 5000,
      product: 'LPG',
      siteId: site.id,
    },
  })

  const tank2 = await prisma.tank.upsert({
    where: {
      siteId_tankNumber: {
        siteId: site.id,
        tankNumber: 'T2',
      },
    },
    update: {},
    create: {
      tankNumber: 'T2',
      capacity: 3000,
      product: 'LPG',
      siteId: site.id,
    },
  })

  console.log('✅ Demo tanks created: T1, T2')

  // Create sample telemetry data
  await prisma.telemetryData.create({
    data: {
      dropPointNumber: 'DP-001',
      tankNumber: 'T1',
      reading: 3250,
      percentage: 65,
      temperature: 22.5,
      pressure: 8.2,
      batteryLevel: 85,
      signalStrength: 4,
      timestamp: new Date(),
    },
  })

  await prisma.telemetryData.create({
    data: {
      dropPointNumber: 'DP-001',
      tankNumber: 'T2',
      reading: 1800,
      percentage: 60,
      temperature: 23.1,
      pressure: 8.5,
      batteryLevel: 90,
      signalStrength: 5,
      timestamp: new Date(),
    },
  })

  console.log('✅ Sample telemetry data created')

  console.log('\n🎉 Seed completed successfully!')
  console.log('\n📝 Demo Credentials:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Admin:')
  console.log('  Email: admin@lpgtank.com')
  console.log('  Password: admin123')
  console.log('\nCustomer:')
  console.log('  Email: customer@example.com')
  console.log('  Password: customer123')
  console.log('\nDriver:')
  console.log('  Email: driver@example.com')
  console.log('  Password: driver123')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n⚠️  IMPORTANT: Change these passwords in production!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
