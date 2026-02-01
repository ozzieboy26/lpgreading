'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Building2, ArrowLeft, MapPin } from 'lucide-react'

export default function CustomersListPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      const res = await fetch('/api/customers')
      if (res.ok) {
        const data = await res.json()
        setCustomers(data.customers)
      }
    } catch (error) {
      console.error('Failed to load customers:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/dashboard/admin')}
          className="mb-4 flex items-center gap-2 text-primary hover:text-primary-light"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary" />
            All Customers
          </h1>
          <p className="text-gray-400">
            Total: {customers.length} customers
          </p>
        </div>

        <div className="card">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading customers...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4">Customer Name</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Phone</th>
                    <th className="text-left py-3 px-4">Sites</th>
                    <th className="text-left py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr 
                      key={customer.id} 
                      className="border-b border-gray-800 hover:bg-secondary cursor-pointer"
                      onClick={() => router.push(`/dashboard/admin/customer/${customer.id}`)}
                    >
                      <td className="py-3 px-4 font-semibold text-primary">{customer.name}</td>
                      <td className="py-3 px-4">{customer.email}</td>
                      <td className="py-3 px-4 text-gray-400">{customer.phone || '—'}</td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {customer.sites?.length || 0} site(s)
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded ${
                          customer.active ? 'bg-accent/20 text-accent' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {customer.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
