import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Redirect to dashboard if accessing root while logged in
    if (path === '/' && token) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Admin-only routes
    if (path.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Driver-only routes
    if (path.startsWith('/driver') && token?.role !== 'DRIVER' && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        
        // Public routes
        if (path === '/' || path === '/login' || path.startsWith('/api/auth')) {
          return true
        }

        // All other routes require authentication
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/admin/:path*',
    '/driver/:path*',
    '/api/export/:path*',
    '/api/import/:path*',
    '/api/telemetry/:path*',
  ],
}
