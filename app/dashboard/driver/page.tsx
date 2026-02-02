'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import TankGauge from '@/components/TankGauge'
import { Search, Gauge, MapPin, Droplets, Battery, Signal, X } from 'lucide-react'

export default function DriverDashboard() {
  const { data: session } = useSession()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTankForGauge, setSelectedTankForGauge] = useState<any>(null)
  const [telemetryData, setTelemetryData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadTankData()
  }, [])
  
  // Real-time search as user types
  const filteredData = telemetryData.filter((item) => {
    const search = searchTerm.toLowerCase()
    return (
      item.dropPointNumber?.toLowerCase().includes(search) ||
      item.customerName?.toLowerCase().includes(search) ||
      item.address?.toLowerCase().includes(search) ||
      item.tankNumber?.toLowerCase().includes(search)
    )
  })
  
  const loadTankData = async () => {
    try {
      setLoading(true)
      console.log('Driver portal: Loading tank data...')
      
      // Fetch all sites with their tanks and latest readings
      const res = await fetch('/api/sites')
      if (!res.ok) {
        console.error('Failed to fetch sites:', res.status, res.statusText)
        return
      }
      
      const data = await res.json()
      console.log('Driver portal: Loaded sites:', data.sites?.length || 0)
      
      // Transform sites/tanks into telemetry format
      const telemetry: any[] = []
      
      for (const site of data.sites || []) {
        for (const tank of site.tanks || []) {
          // Get latest reading for this tank
          try {
            const readingRes = await fetch(`/api/readings/latest?tankId=${tank.id}`)
            const readingData = await readingRes.json()
            const latestReading = readingData.reading
            
            telemetry.push({
              id: tank.id,
              dropPointNumber: site.dropPointNumber,
              address: site.address,
              customerName: site.customer?.name || 'Unknown',
              tankNumber: tank.tankNumber,
              reading: latestReading?.reading || 0,
              percentage: latestReading?.percentage || 0,
              capacity: tank.capacity,
              tankType: 'aboveground', // Default, should be in tank model
              temperature: null,
              pressure: null,
              batteryLevel: null,
              signalStrength: null,
              timestamp: latestReading?.submittedAt || new Date().toISOString(),
            })
          } catch (readingError) {
            console.error(`Failed to fetch reading for tank ${tank.id}:`, readingError)
            // Still add the tank even if reading fetch fails
            telemetry.push({
              id: tank.id,
              dropPointNumber: site.dropPointNumber,
              address: site.address,
              customerName: site.customer?.name || 'Unknown',
              tankNumber: tank.tankNumber,
              reading: 0,
              percentage: 0,
              capacity: tank.capacity,
              tankType: 'aboveground',
              temperature: null,
              pressure: null,
              batteryLevel: null,
              signalStrength: null,
              timestamp: new Date().toISOString(),
            })
          }
        }
      }
      
      console.log('Driver portal: Total tanks loaded:', telemetry.length)
      console.log('Driver portal: Sample tank data:', telemetry[0])
      setTelemetryData(telemetry)
    } catch (error) {
      console.error('Failed to load tank data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const calculateUllage = (percentage: number, capacity: number, tankType: 'aboveground' | 'underground') => {
    const currentVolume = (percentage / 100) * capacity
    const targetPercentage = tankType === 'aboveground' ? 0.85 : 0.88 // 85% or 88%
    const targetVolume = targetPercentage * capacity
    const ullage = targetVolume - currentVolume
    return Math.max(0, ullage)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Driver Portal</h1>
          <p className="text-gray-400">
            Welcome back, {session?.user?.name}! Search and view tank telemetry data.
          </p>
        </div>

        {/* Search Bar */}
        <div className="card mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Search className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-semibold">Search Tanks</h2>
          </div>

          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full"
              placeholder="Search by drop point, customer name, address, or tank number..."
            />
            <p className="text-sm text-gray-400 mt-2">
              {filteredData.length} tank(s) found
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </div>
        </div>

        {/* Telemetry Cards */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading tank data...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
          {filteredData.map((data) => (
            <div key={data.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    {data.dropPointNumber}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {data.customerName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {data.address}
                  </p>
                  <p className="text-gray-400 mt-1">
                    Tank {data.tankNumber} - {data.tankType === 'aboveground' ? 'Above Ground' : 'Underground'}
                  </p>
                </div>
                <span className="px-3 py-1 bg-accent/20 text-accent text-sm rounded">
                  {data.percentage.toFixed(1)}%
                </span>
              </div>

              <div className="space-y-3">
                {/* Current Level */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-2">
                    <Droplets className="w-4 h-4" />
                    Current Level
                  </span>
                  <span className="font-semibold">
                    {data.reading}L / {data.capacity}L
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-secondary rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full ${
                      data.percentage > 70
                        ? 'bg-accent'
                        : data.percentage > 30
                        ? 'bg-primary'
                        : 'bg-danger'
                    }`}
                    style={{ width: `${data.percentage}%` }}
                  ></div>
                </div>

                {/* Ullage Display */}
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-medium">
                      Ullage to {data.tankType === 'aboveground' ? '85%' : '88%'}:
                    </span>
                    <span className="text-primary text-lg font-bold">
                      {calculateUllage(data.percentage, data.capacity, data.tankType).toFixed(0)}L
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Space available to reach {data.tankType === 'aboveground' ? '85%' : '88%'} capacity ({data.tankType === 'aboveground' ? 'Above Ground' : 'Underground'})
                  </p>
                </div>

                {/* Temperature & Pressure */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-800">
                  <div>
                    <p className="text-gray-400 text-sm">Temperature</p>
                    <p className="font-semibold">{data.temperature}°C</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Pressure</p>
                    <p className="font-semibold">{data.pressure} bar</p>
                  </div>
                </div>

                {/* Battery & Signal */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-800">
                  <div className="flex items-center gap-2">
                    <Battery className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">Battery: {data.batteryLevel}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Signal className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">Signal: {data.signalStrength}/5</span>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="pt-3 border-t border-gray-800">
                  <p className="text-gray-400 text-xs">
                    Last updated: {new Date(data.timestamp).toLocaleString()}
                  </p>
                </div>

                {/* View Gauge Button */}
                <button
                  onClick={() => setSelectedTankForGauge(data)}
                  className="w-full mt-3 btn btn-primary"
                >
                  <Gauge className="w-4 h-4 mr-2" />
                  View Tank Gauge
                </button>
              </div>
            </div>
          ))}
        </div>
        )}

        {!loading && filteredData.length === 0 && (
          <div className="card text-center py-12">
            <Gauge className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">
              {searchTerm 
                ? `No tanks found matching "${searchTerm}". Try searching for drop point like "002257" or customer name.`
                : telemetryData.length === 0
                ? 'No tanks found in the system. Contact admin to import customer data.'
                : 'No tanks match your search.'}
            </p>
            {searchTerm && telemetryData.length > 0 && (
              <button
                onClick={() => setSearchTerm('')}
                className="btn btn-primary mt-4"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* Tank Gauge Modal */}
        {selectedTankForGauge && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-background border border-gray-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">
                    {selectedTankForGauge.dropPointNumber} - Tank {selectedTankForGauge.tankNumber}
                  </h2>
                  <button
                    onClick={() => setSelectedTankForGauge(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="flex justify-center">
                  <TankGauge
                    percentage={selectedTankForGauge.percentage}
                    capacity={selectedTankForGauge.capacity}
                    currentVolume={selectedTankForGauge.reading}
                    tankNumber={selectedTankForGauge.tankNumber}
                    tankType={selectedTankForGauge.tankType}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
