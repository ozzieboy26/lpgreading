# LPG Tank Management System

A secure, enterprise-grade web application for managing LPG tank readings with SSL encryption, multi-site support, and automated reporting.

## Features

- 🔐 **Secure Authentication**: SSL/TLS encryption with role-based access (Customer, Driver, Admin)
- 🏢 **Multi-Site Management**: Customers can manage multiple delivery sites from one account
- 📊 **Tank Reading Submission**: Easy-to-use forms with validation
- 📧 **Automated Email Reports**: Excel reports automatically sent to vic@elgas.com.au
- 📥 **Bulk Import**: Import customer data from Excel spreadsheets
- 👥 **User Management**: Complete admin panel for managing users and customers
- 📈 **Telemetry Integration**: Power BI integration for real-time tank monitoring
- 🎨 **Modern UI**: Dark theme with responsive design
- 🔒 **Data Encryption**: AES-256-GCM encryption for sensitive data

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with JWT
- **Email**: Nodemailer
- **Excel**: ExcelJS
- **Security**: bcryptjs, crypto module

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- SMTP email account

### Installation

1. **Install Node.js** from https://nodejs.org/

2. **Navigate to project directory**:
   ```bash
   cd c:\Users\reidb\qoder\lpg-tank-management
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your configuration

5. **Initialize database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. **Start development server**:
   ```bash
   npm run dev
   ```

7. **Open browser**: http://localhost:3000

## Configuration

See `SETUP_INSTRUCTIONS.txt` for detailed setup guide including:
- Database configuration
- Email setup
- SSL/HTTPS configuration
- Creating admin users
- Customer data import
- Power BI integration

## Project Structure

```
lpg-tank-management/
├── app/                  # Next.js pages and API routes
│   ├── api/             # Backend API endpoints
│   ├── login/           # Authentication pages
│   ├── dashboard/       # User dashboards
│   └── admin/           # Admin panel
├── lib/                 # Utility functions
│   ├── prisma.ts        # Database client
│   ├── encryption.ts    # Security utilities
│   ├── email.ts         # Email service
│   └── excel.ts         # Excel generation
├── prisma/              # Database schema
└── components/          # Reusable UI components
```

## User Roles

### Customer
- Login to personal account
- Select from multiple sites (if applicable)
- Submit tank readings
- View reading history

### Driver
- Access telemetry data
- Search by site name or drop point
- View real-time tank levels
- Monitor delivery routes

### Admin
- Manage all users and customers
- Import customer data from Excel
- Export readings to Excel
- Configure system settings
- View audit logs

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **Data Encryption**: AES-256-GCM for sensitive data
- **Session Management**: Secure JWT tokens (8-hour expiry)
- **SSL/TLS**: HTTPS required for production
- **Role-Based Access**: Granular permission control
- **Audit Logging**: Track all system actions

## Production Deployment

### Option 1: Vercel (Recommended)
```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_REPO_URL
git push -u origin main

# Deploy via Vercel dashboard
# https://vercel.com/new
```

### Option 2: Self-Hosted
1. Set up SSL certificate (Let's Encrypt)
2. Configure reverse proxy (nginx/Apache)
3. Set environment variables
4. Run: `npm run build && npm start`

## Environment Variables

Required variables (see `.env.example`):

- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: Your application URL
- `NEXTAUTH_SECRET`: Secret for JWT signing
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`: Email configuration
- `EMAIL_TO`: vic@elgas.com.au
- `ENCRYPTION_KEY`: 32-byte hex key for data encryption

## Excel Import Format

Customer import Excel file should have these columns:

| Customer Name | Email | Phone | Drop Point | Address | Suburb | State | Postcode | Tank Number | Tank Capacity |
|--------------|-------|-------|------------|---------|--------|-------|----------|-------------|---------------|

## API Endpoints

- `POST /api/auth/[...nextauth]` - Authentication
- `GET/POST /api/export` - Export tank readings
- `POST /api/import` - Import customer data
- `GET/POST /api/telemetry` - Telemetry data

## Database Schema

Key models:
- **User**: Authentication and access control
- **Customer**: Customer information
- **Site**: Delivery sites with drop points
- **Tank**: Tank specifications
- **TankReading**: Reading submissions
- **TelemetryData**: Real-time monitoring data
- **AuditLog**: System activity tracking

## Support

For issues or questions:
1. Check `SETUP_INSTRUCTIONS.txt`
2. Review code comments
3. Check framework documentation

## License

Proprietary - All rights reserved

## Contact

For support, contact: vic@elgas.com.au

---

Built with ❤️ using Next.js and TypeScript
