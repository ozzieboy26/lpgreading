'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { User, ArrowLeft, Mail, Building2, Calendar, Shield, Activity } from 'lucide-react'

export default function UserDetailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      loadUserDetails()
    }
  }, [userId])

  const loadUserDetails = async () => {
    try {
      const res = await fetch(`/api/users/${userId}`)
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        router.push('/dashboard/admin/users')
      }
    } catch (error) {
      console.error('Failed to load user:', error)
      router.push('/dashboard/admin/users')
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
            <p className="text-gray-400 mt-4">Loading user details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/dashboard/admin/users')}
          className="mb-4 flex items-center gap-2 text-primary hover:text-primary-light"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Users List
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <User className="w-8 h-8 text-primary" />
            {user.name}
          </h1>
          <div className="flex gap-2">
            <span className={`px-3 py-1 text-sm rounded ${
              user.role === 'ADMIN' ? 'bg-primary/20 text-primary' :
              user.role === 'CUSTOMER' ? 'bg-blue-500/20 text-blue-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              {user.role}
            </span>
            <span className={`px-3 py-1 text-sm rounded ${
              user.active ? 'bg-accent/20 text-accent' : 'bg-red-500/20 text-red-400'
            }`}>
              {user.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* User Information */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">User Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Role</p>
                  <p className="font-medium">{user.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Created</p>
                  <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Linked Customer */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Linked Customer
            </h2>
            {user.customer ? (
              <div 
                className="p-4 bg-secondary rounded-lg hover:bg-secondary-light cursor-pointer"
                onClick={() => router.push(`/dashboard/admin/customer/${user.customer.id}`)}
              >
                <p className="font-semibold text-primary">{user.customer.name}</p>
                <p className="text-sm text-gray-400 mt-1">{user.customer.email}</p>
                {user.customer.phone && (
                  <p className="text-sm text-gray-400">{user.customer.phone}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {user.customer.sites?.length || 0} site(s)
                </p>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">No linked customer</p>
            )}
          </div>
        </div>

        {/* Recent Readings */}
        <div className="card mt-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Readings ({user.tankReadings?.length || 0})
          </h2>
          {user.tankReadings && user.tankReadings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Site</th>
                    <th className="text-left py-3 px-4">Tank</th>
                    <th className="text-left py-3 px-4">Reading</th>
                    <th className="text-left py-3 px-4">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {user.tankReadings.map((reading: any) => (
                    <tr key={reading.id} className="border-b border-gray-800">
                      <td className="py-3 px-4 text-sm">
                        {new Date(reading.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {reading.site.dropPointNumber}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        Tank {reading.tank.tankNumber}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {reading.reading}L
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {reading.percentage?.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">No readings submitted yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
