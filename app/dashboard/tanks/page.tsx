'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import { Search, Droplets, MapPin, Info } from 'lucide-react'

export default function TankManagement() {
  const { data: session } = useSession()
  const [searchType, setSearchType] = useState<'dropPoint' | 'customer'>('dropPoint')
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSite, setSelectedSite] = useState<any>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setLoading(true)
    setSelectedSite(null)

    try {
      const params = new URLSearchParams()
      if (searchType === 'dropPoint') {
        params.append('dropPoint', searchQuery)
      } else {
        params.append('customerName', searchQuery)
      }

      const res = await fetch(`/api/sites?${params}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data.sites)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const viewSiteDetails = (site: any) => {
    setSelectedSite(site)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Tank Management</h1>
          <p className="text-gray-400">
            Search and manage tank information by drop point or customer name
          </p>
        </div>

        {/* Search Form */}
        <div className="card mb-8">
          <div className="flex items-center space-x-2 mb-6">
            <Search className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-semibold">Search</h2>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Search By</label>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value as 'dropPoint' | 'customer')}
                  className="w-full px-4 py-3 bg-secondary border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                >
                  <option value="dropPoint">Drop Point Number</option>
                  <option value="customer">Customer Name</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  {searchType === 'dropPoint' ? 'Enter Drop Point' : 'Enter Customer Name'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchType === 'dropPoint' ? 'e.g., DP-001' : 'e.g., Customer Ltd'}
                    className="flex-1 px-4 py-3 bg-secondary border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary px-8"
                  >
                    {loading ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Search Results */}
        {results.length > 0 && (
          <div className="card mb-8">
            <h2 className="text-2xl font-semibold mb-4">Search Results ({results.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4">Drop Point</th>
                    <th className="text-left py-3 px-4">Customer</th>
                    <th className="text-left py-3 px-4">Address</th>
                    <th className="text-left py-3 px-4">Tanks</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((site) => (
                    <tr key={site.id} className="border-b border-gray-800 hover:bg-secondary">
                      <td className="py-3 px-4 font-semibold text-primary">{site.dropPointNumber}</td>
                      <td className="py-3 px-4">{site.customer.name}</td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          {site.address}
                          {site.suburb && site.state && (
                            <div className="text-gray-500">{site.suburb}, {site.state} {site.postcode}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-accent/20 text-accent rounded text-sm">
                          {site.tanks?.length || 0} tank(s)
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => viewSiteDetails(site)}
                          className="text-primary hover:text-primary-light flex items-center gap-1"
                        >
                          <Info className="w-4 h-4" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Site Details */}
        {selectedSite && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold">Site Details</h2>
                <p className="text-gray-400">Drop Point: {selectedSite.dropPointNumber}</p>
              </div>
              <button
                onClick={() => setSelectedSite(null)}
                className="text-gray-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Customer Information */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-primary mb-3">Customer Information</h3>
                <div>
                  <label className="text-sm text-gray-400">Name</label>
                  <p className="text-lg">{selectedSite.customer.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Email</label>
                  <p>{selectedSite.customer.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Phone</label>
                  <p>{selectedSite.customer.phone || 'N/A'}</p>
                </div>
              </div>

              {/* Site Information */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-primary mb-3">Site Information</h3>
                <div>
                  <label className="text-sm text-gray-400">Address</label>
                  <p className="text-lg">{selectedSite.address}</p>
                  {selectedSite.suburb && selectedSite.state && (
                    <p className="text-gray-400">{selectedSite.suburb}, {selectedSite.state} {selectedSite.postcode}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Tanks */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <Droplets className="w-5 h-5" />
                Tanks ({selectedSite.tanks?.length || 0})
              </h3>
              
              {selectedSite.tanks && selectedSite.tanks.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {selectedSite.tanks.map((tank: any) => (
                    <div key={tank.id} className="bg-secondary border border-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-semibold">Tank {tank.tankNumber}</h4>
                        <Droplets className="w-6 h-6 text-primary" />
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Capacity:</span>
                          <span className="font-semibold">{tank.capacity}L</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Product:</span>
                          <span>{tank.product}</span>
                        </div>
                        {tank.serialNumber && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Serial Number:</span>
                            <span className="font-mono text-xs">{tank.serialNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">No tanks configured for this site</p>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && results.length === 0 && !selectedSite && searchQuery && (
          <div className="card text-center py-12">
            <MapPin className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
            <p className="text-gray-400">
              Try searching with a different {searchType === 'dropPoint' ? 'drop point number' : 'customer name'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
