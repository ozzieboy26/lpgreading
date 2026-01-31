# LPG Tank Management System - Deployment Guide

## Pre-Deployment Checklist

### 1. Test Production Build Locally
```powershell
cd c:\Users\reidb\qoder\lpg-tank-management
npm run build
npm start
```
Visit http://localhost:3000 to verify everything works.

---

## Option 1: Deploy to Vercel (Recommended - Easiest)

### Prerequisites
- GitHub account
- Vercel account (free at vercel.com)

### Step 1: Prepare Database
**IMPORTANT**: Vercel doesn't support SQLite. You need PostgreSQL.

**Option A: Use Vercel Postgres (Recommended)**
1. Go to vercel.com/dashboard
2. Create a new Postgres database
3. Copy the connection string

**Option B: Use External Database**
- Supabase (supabase.com) - Free tier available
- Railway (railway.app) - Free tier available
- Neon (neon.tech) - Free tier available

### Step 2: Update Database Configuration
1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Run migrations:
```powershell
npx prisma migrate dev --name init
npx prisma generate
npx prisma db push
npx prisma db seed
```

### Step 3: Push to GitHub
```powershell
cd c:\Users\reidb\qoder\lpg-tank-management
git init
git add .
git commit -m "Initial commit - LPG Tank Management System"
gh repo create lpg-tank-management --private --source=. --push
```

### Step 4: Deploy to Vercel
1. Go to vercel.com/new
2. Import your GitHub repository
3. Configure environment variables:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `NEXTAUTH_URL` - Your Vercel domain (e.g., https://your-app.vercel.app)
   - `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
   - `ENCRYPTION_KEY` - Generate with: `openssl rand -hex 32`
   - `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD` - Email settings
   - `EMAIL_TO` - vic@elgas.com.au
4. Click "Deploy"

### Step 5: Set up Database (First Time)
After deployment, run these commands:
```powershell
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Run Prisma commands on Vercel
vercel env pull .env.production
npx prisma db push
npx prisma db seed
```

---

## Option 2: Deploy to Your Own Windows Server

### Prerequisites
- Windows Server with IIS or Node.js
- PostgreSQL or SQL Server installed
- Domain name with SSL certificate

### Step 1: Install Node.js on Server
Download and install Node.js LTS from nodejs.org

### Step 2: Set up Database
1. Install PostgreSQL
2. Create database:
```sql
CREATE DATABASE lpg_tank_db;
```

3. Update `.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/lpg_tank_db"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret-here"
NODE_ENV="production"
```

### Step 3: Build and Deploy
```powershell
# On your local machine
npm run build

# Copy these folders/files to server:
# - .next/
# - node_modules/
# - public/
# - prisma/
# - package.json
# - .env (with production values)

# On the server
cd C:\path\to\app
npx prisma generate
npx prisma db push
npx prisma db seed
npm start
```

### Step 4: Set up as Windows Service
Use `pm2` or `nssm` to run as a service:

**Using PM2:**
```powershell
npm install -g pm2
pm2 start npm --name "lpg-tank-app" -- start
pm2 startup
pm2 save
```

### Step 5: Configure IIS (Optional)
Set up IIS as reverse proxy to Node.js application.

---

## Option 3: Deploy with Docker

### Step 1: Create Dockerfile
Already created at `c:\Users\reidb\qoder\lpg-tank-management\Dockerfile`

### Step 2: Build Docker Image
```powershell
docker build -t lpg-tank-management .
```

### Step 3: Run Container
```powershell
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_URL="https://yourdomain.com" \
  -e NEXTAUTH_SECRET="your-secret" \
  --name lpg-tank-app \
  lpg-tank-management
```

---

## Security Checklist Before Going Live

- [ ] Change all default passwords (admin@lpgtank.com, etc.)
- [ ] Generate new NEXTAUTH_SECRET
- [ ] Generate new ENCRYPTION_KEY
- [ ] Use production database (not SQLite)
- [ ] Set up HTTPS/SSL certificate
- [ ] Configure email SMTP properly
- [ ] Set NODE_ENV=production
- [ ] Enable rate limiting (add later if needed)
- [ ] Set up database backups
- [ ] Configure firewall rules

---

## Environment Variables Reference

### Required
- `DATABASE_URL` - Database connection string
- `NEXTAUTH_URL` - Your app URL
- `NEXTAUTH_SECRET` - Secret key for authentication
- `ENCRYPTION_KEY` - Key for data encryption
- `NODE_ENV` - Set to "production"

### Email (Required for exports)
- `SMTP_HOST` - SMTP server
- `SMTP_PORT` - Usually 587
- `SMTP_USER` - Email username
- `SMTP_PASSWORD` - Email password
- `EMAIL_FROM` - From address
- `EMAIL_TO` - vic@elgas.com.au

### Optional (Power BI)
- `POWERBI_CLIENT_ID`
- `POWERBI_CLIENT_SECRET`
- `POWERBI_TENANT_ID`
- `POWERBI_REPORT_ID`
- `POWERBI_WORKSPACE_ID`

---

## Post-Deployment

### Test Everything
1. Login with default credentials
2. Submit a tank reading
3. Test export functionality
4. Check driver telemetry view
5. Test admin tank type toggles

### Change Default Passwords
Login to admin panel and change:
- admin@lpgtank.com (password: admin123)
- customer@example.com (password: customer123)
- driver@example.com (password: driver123)

---

## Troubleshooting

### Build Errors
```powershell
# Clear cache and rebuild
rm -rf .next
rm -rf node_modules
npm install --legacy-peer-deps
npm run build
```

### Database Connection Issues
- Check DATABASE_URL format
- Ensure database is accessible
- Run `npx prisma db push` to sync schema

### Authentication Issues
- Verify NEXTAUTH_URL matches your domain
- Check NEXTAUTH_SECRET is set
- Clear browser cookies

---

## Support

For issues, check the logs:
- Development: Check terminal output
- Vercel: Check deployment logs in dashboard
- Server: Check pm2 logs with `pm2 logs`

---

**Ready to deploy?** Choose your option above and follow the steps!
