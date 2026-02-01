'use client'

import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { ArrowLeft } from 'lucide-react'

export default function SitesListPage() {
  const router = useRouter()
  
  // Redirect to tank management page which has all site functionality
  if (typeof window !== 'undefined') {
    router.push('/dashboard/tanks')
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Redirecting to Tank Management...</p>
      </div>
    </div>
  )
}
