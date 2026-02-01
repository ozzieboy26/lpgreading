'use client'

import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function ReadingsListPage() {
  const router = useRouter()
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/dashboard/admin')}
          className="mb-4 flex items-center gap-2 text-primary hover:text-primary-light"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold mb-4">Tank Readings</h1>
        <div className="card">
          <p className="text-center py-12 text-gray-400">
            Readings list will be implemented here.<br/>
            For now, use the Export function on the admin dashboard.
          </p>
        </div>
      </div>
    </div>
  )
}
