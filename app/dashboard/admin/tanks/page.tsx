'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { Droplets, Search } from 'lucide-react'

interface Tank {
  id: string
  tankNumber: string
  capacity: number
  product: string
  serialNumber: string | null
  site: {
    dropPointNumber: string
    address: string
    customer: {
      name: string
    }
  }
}

export default function TanksManagementPage() {
  const router = useRouter()
  const [tanks, setTanks] = useState<Tank[]>([])
  const [filteredTanks, setFilteredTanks] = useState<Tank[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Mock tank types for now - in production this would come from database
  const [tankTypes, setTankTypes] = useState<{ [key: string]: 'aboveground' | 'underground' }>({})

  useEffect(() => {
    loadTanks()
  }, [])

  useEffect(() => {
    filterTanks()
  }, [searchTerm, tanks])

  const loadTanks = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/sites')
      if (res.ok) {
        const data = await res.json()
        const allTanks: Tank[] = []
        data.sites.forEach((site: any) => {
          site.tanks?.forEach((tank: any) => {
            allTanks.push({
              ...tank,
              site: {
                dropPointNumber: site.dropPointNumber,
                address: site.address,
                customer: site.customer,
              },
            })
          })
        })
        setTanks(allTanks)
      }
    } catch (error) {
      console.error('Failed to load tanks:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterTanks = () => {
    if (!searchTerm) {
      setFilteredTanks(tanks)
      return
    }

    const search = searchTerm.toLowerCase()
    const filtered = tanks.filter((tank) =>
      tank.site.dropPointNumber.toLowerCase().includes(search) ||
      tank.tankNumber.toLowerCase().includes(search) ||
      tank.site.customer.name.toLowerCase().includes(search) ||
      tank.site.address.toLowerCase().includes(search)
    )
    setFilteredTanks(filtered)
  }

  const handleTankTypeChange = (tankId: string, newType: 'aboveground' | 'underground') => {
    setTankTypes(prev => ({ ...prev, [tankId]: newType }))
    // In production, this would call /api/tanks/update
    console.log(`Tank ${tankId} updated to ${newType} (${newType === 'aboveground' ? '85%' : '88%'} fill level)`)
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
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Droplets className="w-8 h-8 text-primary" />
            Tank Management
          </h1>
          <p className="text-gray-400">
            Configure tank type for ullage calculations. Above ground tanks use 85% fill level, underground tanks use 88%.
          </p>
        </div>

        {/* Search Bar */}
        <div className="card mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
              placeholder="Search by drop point, tank number, customer, or address..."
            />
          </div>
          <p className="text-sm text-gray-400 mt-2">
            {filteredTanks.length} tank(s) found
          </p>
        </div>

        {/* Tanks Table */}
        {loading ? (
          <div className="card text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading tanks...</p>
          </div>
        ) : filteredTanks.length === 0 ? (
          <div className="card text-center py-12">
            <Droplets className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">
              {searchTerm ? 'No tanks match your search.' : 'No tanks found in the system.'}
            </p>
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Drop Point</th>
                  <th className="text-left py-3 px-4">Tank Number</th>
                  <th className="text-left py-3 px-4">Capacity (L)</th>
                  <th className="text-left py-3 px-4">Product</th>
                  <th className="text-left py-3 px-4">Tank Type</th>
                  <th className="text-left py-3 px-4">Fill Level</th>
                </tr>
              </thead>
              <tbody>
                {filteredTanks.map((tank) => {
                  const tankType = tankTypes[tank.id] || 'aboveground'
                  return (
                    <tr key={tank.id} className="border-b border-gray-800 hover:bg-secondary">
                      <td className="py-3 px-4">{tank.site.customer.name}</td>
                      <td className="py-3 px-4">{tank.site.dropPointNumber}</td>
                      <td className="py-3 px-4">Tank {tank.tankNumber}</td>
                      <td className="py-3 px-4">{tank.capacity}L</td>
                      <td className="py-3 px-4">{tank.product}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleTankTypeChange(tank.id, 'aboveground')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              tankType === 'aboveground'
                                ? 'bg-primary text-white'
                                : 'bg-secondary hover:bg-secondary-light text-gray-400'
                            }`}
                          >
                            Above Ground
                          </button>
                          <button
                            onClick={() => handleTankTypeChange(tank.id, 'underground')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              tankType === 'underground'
                                ? 'bg-primary text-white'
                                : 'bg-secondary hover:bg-secondary-light text-gray-400'
                            }`}
                          >
                            Underground
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 bg-accent/20 text-accent text-sm rounded font-semibold">
                          {tankType === 'aboveground' ? '85%' : '88%'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
