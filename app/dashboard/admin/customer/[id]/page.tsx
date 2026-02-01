'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Building2, ArrowLeft, MapPin, Users, Mail, Phone, Calendar } from 'lucide-react'

export default function CustomerDetailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const customerId = params.id as string
  
  const [customer, setCustomer] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (customerId) {
      loadCustomerDetails()
    }
  }, [customerId])

  const loadCustomerDetails = async () => {
    try {
      const res = await fetch(`/api/customers/${customerId}`)
      if (res.ok) {
        const data = await res.json()
        setCustomer(data.customer)
      } else {
        router.push('/dashboard/admin/customers')
      }
    } catch (error) {
      console.error('Failed to load customer:', error)
      router.push('/dashboard/admin/customers')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading customer details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!customer) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/dashboard/admin/customers')}
          className="mb-4 flex items-center gap-2 text-primary hover:text-primary-light"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Customers List
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary" />
            {customer.name}
          </h1>
          <span className={`px-3 py-1 text-sm rounded ${
            customer.active ? 'bg-accent/20 text-accent' : 'bg-red-500/20 text-red-400'
          }`}>
            {customer.active ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Customer Information */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="font-medium">{customer.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Phone</p>
                  <p className="font-medium">{customer.phone || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Created</p>
                  <p className="font-medium">{new Date(customer.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Accounts */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Accounts ({customer.users?.length || 0})
            </h2>
            {customer.users && customer.users.length > 0 ? (
              <div className="space-y-2">
                {customer.users.map((user: any) => (
                  <div 
                    key={user.id}
                    className="p-3 bg-secondary rounded-lg hover:bg-secondary-light cursor-pointer"
                    onClick={() => router.push(`/dashboard/admin/user/${user.id}`)}
                  >
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-400">{user.email}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${
                      user.role === 'ADMIN' ? 'bg-primary/20 text-primary' :
                      user.role === 'CUSTOMER' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">No user accounts</p>
            )}
          </div>
        </div>

        {/* Sites */}
        <div className="card mt-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Sites ({customer.sites?.length || 0})
          </h2>
          {customer.sites && customer.sites.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {customer.sites.map((site: any) => (
                <div 
                  key={site.id}
                  className="p-4 bg-secondary rounded-lg hover:bg-secondary-light cursor-pointer"
                  onClick={() => router.push(`/dashboard/admin/site/${site.id}`)}
                >
                  <p className="font-semibold text-primary">{site.dropPointNumber}</p>
                  <p className="text-sm mt-1">{site.address}</p>
                  {site.suburb && (
                    <p className="text-sm text-gray-400">
                      {site.suburb}{site.state ? `, ${site.state}` : ''} {site.postcode || ''}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {site.tanks?.length || 0} tank(s)
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">No sites</p>
          )}
        </div>
      </div>
    </div>
  )
}
