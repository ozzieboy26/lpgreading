# PostgreSQL Database Setup Commands
# Run these in PowerShell one at a time

# 1. Generate Prisma Client for PostgreSQL
npx prisma generate

# 2. Push schema to database (creates tables)
npx prisma db push

# 3. Seed the database with default users
npx prisma db seed

# 4. Test the build
npm run build

# 5. Start production server locally to test
npm start

# After testing locally, you're ready to deploy to Vercel or Render!
