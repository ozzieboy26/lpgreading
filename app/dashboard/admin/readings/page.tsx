'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { Search, Download, Filter, Calendar } from 'lucide-react'

interface Reading {
  id: string
  reading: number
  percentage: number
  estimatedVolume: number
  notes: string | null
  submittedAt: string
  exported: boolean
  user: {
    name: string
    email: string
  }
  site: {
    dropPointNumber: string
    address: string
    customer: {
      name: string
    }
  }
  tank: {
    tankNumber: string
    capacity: number
  }
}

export default function ReadingsListPage() {
  const router = useRouter()
  const [readings, setReadings] = useState<Reading[]>([])
  const [filteredReadings, setFilteredReadings] = useState<Reading[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [exportedFilter, setExportedFilter] = useState<'all' | 'exported' | 'pending'>('all')
  
  useEffect(() => {
    loadReadings()
  }, [])

  useEffect(() => {
    filterReadings()
  }, [searchTerm, exportedFilter, readings])

  const loadReadings = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/readings')
      if (res.ok) {
        const data = await res.json()
        setReadings(data.readings)
      }
    } catch (error) {
      console.error('Failed to load readings:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterReadings = () => {
    let filtered = readings

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter((r) =>
        r.site.customer.name.toLowerCase().includes(search) ||
        r.site.dropPointNumber.toLowerCase().includes(search) ||
        r.site.address.toLowerCase().includes(search) ||
        r.tank.tankNumber.toLowerCase().includes(search) ||
        r.user.name.toLowerCase().includes(search)
      )
    }

    // Apply exported filter
    if (exportedFilter === 'exported') {
      filtered = filtered.filter((r) => r.exported)
    } else if (exportedFilter === 'pending') {
      filtered = filtered.filter((r) => !r.exported)
    }

    setFilteredReadings(filtered)
  }
  
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
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Tank Readings</h1>
          <p className="text-gray-400">
            {filteredReadings.length} reading(s) found
            {exportedFilter === 'pending' && ' (pending export)'}
            {exportedFilter === 'exported' && ' (exported)'}
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-full"
                  placeholder="Search by customer, drop point, address, tank, or user..."
                />
              </div>
            </div>

            {/* Export Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setExportedFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  exportedFilter === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-secondary hover:bg-secondary-light text-gray-400'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setExportedFilter('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  exportedFilter === 'pending'
                    ? 'bg-primary text-white'
                    : 'bg-secondary hover:bg-secondary-light text-gray-400'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setExportedFilter('exported')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  exportedFilter === 'exported'
                    ? 'bg-primary text-white'
                    : 'bg-secondary hover:bg-secondary-light text-gray-400'
                }`}
              >
                Exported
              </button>
            </div>
          </div>
        </div>

        {/* Readings Table */}
        {loading ? (
          <div className="card text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading readings...</p>
          </div>
        ) : filteredReadings.length === 0 ? (
          <div className="card text-center py-12">
            <Download className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">
              {searchTerm || exportedFilter !== 'all'
                ? 'No readings match your filters.'
                : 'No readings submitted yet.'}
            </p>
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Drop Point</th>
                  <th className="text-left py-3 px-4">Tank</th>
                  <th className="text-left py-3 px-4">Reading</th>
                  <th className="text-left py-3 px-4">Percentage</th>
                  <th className="text-left py-3 px-4">Volume</th>
                  <th className="text-left py-3 px-4">Submitted By</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredReadings.map((reading) => (
                  <tr key={reading.id} className="border-b border-gray-800 hover:bg-secondary">
                    <td className="py-3 px-4">{reading.site.customer.name}</td>
                    <td className="py-3 px-4">{reading.site.dropPointNumber}</td>
                    <td className="py-3 px-4">Tank {reading.tank.tankNumber}</td>
                    <td className="py-3 px-4">{reading.reading.toFixed(0)}L</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-sm font-semibold ${
                        reading.percentage > 70
                          ? 'bg-accent/20 text-accent'
                          : reading.percentage > 30
                          ? 'bg-primary/20 text-primary'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {reading.percentage.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4">{reading.estimatedVolume.toFixed(0)}L</td>
                    <td className="py-3 px-4 text-sm text-gray-400">{reading.user.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-400">
                      {new Date(reading.submittedAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded ${
                        reading.exported
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {reading.exported ? 'Exported' : 'Pending'}
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
  )
}
