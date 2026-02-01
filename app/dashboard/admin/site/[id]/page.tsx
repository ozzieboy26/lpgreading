'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import TankGauge from '@/components/TankGauge'
import { MapPin, ArrowLeft, Building2, Droplets, Calendar } from 'lucide-react'

export default function SiteDetailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const siteId = params.id as string
  
  const [site, setSite] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTankForGauge, setSelectedTankForGauge] = useState<any>(null)

  useEffect(() => {
    if (siteId) {
      loadSiteDetails()
    }
  }, [siteId])

  const loadSiteDetails = async () => {
    try {
      const res = await fetch(`/api/sites/${siteId}`)
      if (res.ok) {
        const data = await res.json()
        setSite(data.site)
      } else {
        router.push('/dashboard/tanks')
      }
    } catch (error) {
      console.error('Failed to load site:', error)
      router.push('/dashboard/tanks')
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
            <p className="text-gray-400 mt-4">Loading site details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!site) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/dashboard/tanks')}
          className="mb-4 flex items-center gap-2 text-primary hover:text-primary-light"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tank Management
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <MapPin className="w-8 h-8 text-primary" />
            {site.dropPointNumber}
          </h1>
          <p className="text-gray-400">{site.address}</p>
          {site.suburb && (
            <p className="text-gray-400">
              {site.suburb}{site.state ? `, ${site.state}` : ''} {site.postcode || ''}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Site Information */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Site Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Drop Point Number</p>
                  <p className="font-medium">{site.dropPointNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Customer</p>
                  <p 
                    className="font-medium text-primary cursor-pointer hover:text-primary-light"
                    onClick={() => router.push(`/dashboard/admin/customer/${site.customer.id}`)}
                  >
                    {site.customer.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Droplets className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Total Tanks</p>
                  <p className="font-medium">{site.tanks?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Contact */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Customer Contact</h2>
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Email</p>
              <p className="font-medium">{site.customer.email}</p>
              {site.customer.phone && (
                <>
                  <p className="text-sm text-gray-400 mt-3">Phone</p>
                  <p className="font-medium">{site.customer.phone}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tanks */}
        <div className="card mt-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Droplets className="w-5 h-5" />
            Tanks ({site.tanks?.length || 0})
          </h2>
          {site.tanks && site.tanks.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {site.tanks.map((tank: any) => {
                const latestReading = tank.tankReadings?.[0]
                return (
                  <div 
                    key={tank.id}
                    className="p-4 bg-secondary rounded-lg hover:bg-secondary-light"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold text-primary">Tank {tank.tankNumber}</p>
                      {latestReading && (
                        <span className="px-2 py-1 bg-accent/20 text-accent text-xs rounded">
                          {latestReading.percentage?.toFixed(1)}%
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">Capacity: {tank.capacity}L</p>
                    <p className="text-sm text-gray-400">Product: {tank.product}</p>
                    
                    {latestReading ? (
                      <>
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <p className="text-xs text-gray-500">Latest Reading:</p>
                          <p className="text-sm">{latestReading.reading}L ({latestReading.percentage?.toFixed(1)}%)</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(latestReading.submittedAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            by {latestReading.user?.name}
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedTankForGauge({
                            ...tank,
                            ...latestReading,
                            tankNumber: tank.tankNumber,
                            capacity: tank.capacity,
                          })}
                          className="w-full mt-3 btn btn-primary text-sm py-2"
                        >
                          View Gauge
                        </button>
                      </>
                    ) : (
                      <p className="text-xs text-gray-500 mt-3">No readings yet</p>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">No tanks configured</p>
          )}
        </div>
      </div>

      {/* Tank Gauge Modal */}
      {selectedTankForGauge && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-gray-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {site.dropPointNumber} - Tank {selectedTankForGauge.tankNumber}
                </h2>
                <button
                  onClick={() => setSelectedTankForGauge(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="flex justify-center">
                <TankGauge
                  percentage={selectedTankForGauge.percentage || 0}
                  capacity={selectedTankForGauge.capacity}
                  currentVolume={selectedTankForGauge.reading || 0}
                  tankNumber={selectedTankForGauge.tankNumber}
                  tankType="aboveground"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
