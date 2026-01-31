'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    // Route based on user role
    const role = session.user?.role

    if (role === 'ADMIN') {
      router.push('/dashboard/admin')
    } else if (role === 'DRIVER') {
      router.push('/dashboard/driver')
    } else if (role === 'CUSTOMER') {
      router.push('/dashboard/customer')
    } else {
      router.push('/login')
    }
  }, [session, status, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    </div>
  )
}
