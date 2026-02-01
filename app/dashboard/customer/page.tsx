'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import TankGauge from '@/components/TankGauge'
import { Droplets, MapPin, Send, History, CheckCircle } from 'lucide-react'

export default function CustomerDashboard() {
  const { data: session } = useSession()
  const [sites, setSites] = useState<any[]>([])
  const [selectedSite, setSelectedSite] = useState('')
  const [tanks, setTanks] = useState<any[]>([])
  const [selectedTank, setSelectedTank] = useState('')
  const [reading, setReading] = useState('')
  const [readingUnit, setReadingUnit] = useState<'liters' | 'percentage'>('liters')
  const [readingDate, setReadingDate] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [latestReading, setLatestReading] = useState<any>(null)

  useEffect(() => {
    // Set current date and time as default
    const now = new Date()
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16)
    setReadingDate(localDateTime)
    
    // Fetch customer sites when session is available
    if (session?.user?.customerId) {
      fetchSites()
    }
  }, [session])

  useEffect(() => {
    if (selectedSite) {
      fetchTanks(selectedSite)
    }
  }, [selectedSite])

  useEffect(() => {
    if (selectedTank) {
      fetchLatestReading(selectedTank)
    }
  }, [selectedTank])

  const fetchSites = async () => {
    try {
      // Fetch real sites from API based on customer's customerId
      const customerId = session?.user?.customerId
      if (!customerId) {
        console.log('No customerId in session')
        return
      }

      const res = await fetch(`/api/sites?customerId=${customerId}`)
      if (res.ok) {
        const data = await res.json()
        setSites(data.sites)
      }
    } catch (error) {
      console.error('Failed to fetch sites:', error)
    }
  }

  const fetchTanks = async (siteId: string) => {
    try {
      // Find selected site and set its tanks
      const site = sites.find(s => s.id === siteId)
      if (site && site.tanks) {
        setTanks(site.tanks)
      }
    } catch (error) {
      console.error('Failed to fetch tanks:', error)
    }
  }

  const fetchLatestReading = async (tankId: string) => {
    try {
      const res = await fetch(`/api/readings/latest?tankId=${tankId}`)
      if (res.ok) {
        const data = await res.json()
        setLatestReading(data.reading)
      }
    } catch (error) {
      console.error('Failed to fetch latest reading:', error)
    }
  }

  const calculateUllage = (percentage: number, tankCapacity: number, tankType: 'aboveground' | 'underground') => {
    const currentVolume = (percentage / 100) * tankCapacity
    const targetPercentage = tankType === 'aboveground' ? 0.85 : 0.88 // 85% or 88%
    const targetVolume = targetPercentage * tankCapacity
    const ullage = targetVolume - currentVolume
    return Math.max(0, ullage) // Don't show negative ullage
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    try {
      const selectedTankData = tanks.find(t => t.id === selectedTank)
      let volumeInLiters = parseFloat(reading)
      let percentageValue = 0

      if (readingUnit === 'percentage') {
        percentageValue = parseFloat(reading)
        volumeInLiters = (percentageValue / 100) * selectedTankData.capacity
      } else {
        // Convert liters to percentage
        percentageValue = (volumeInLiters / selectedTankData.capacity) * 100
      }

      // Submit to API
      const res = await fetch('/api/readings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tankId: selectedTank,
          siteId: selectedSite,
          reading: volumeInLiters,
          percentage: percentageValue,
          readingDate: readingDate,
          notes: notes,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to submit reading')
      }

      const data = await res.json()
      
      setSuccess(true)
      setReading('')
      setNotes('')
      
      // Reset date to current time
      const now = new Date()
      const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
      setReadingDate(localDateTime)
      
      // Refresh the latest reading for the gauge
      fetchLatestReading(selectedTank)
      
      setTimeout(() => setSuccess(false), 5000)
    } catch (error: any) {
      console.error('Error submitting reading:', error)
      alert(`Failed to submit reading: ${error.message || 'Please try again.'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Customer Dashboard</h1>
          <p className="text-gray-400">
            Welcome back, {session?.user?.name}! Submit your tank readings below.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Submit Reading Form */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-6">
              <Droplets className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold">Submit Tank Reading</h2>
            </div>

            {success && (
              <div className="mb-4 p-4 bg-accent/10 border border-accent rounded-lg flex items-center gap-2 text-accent">
                <CheckCircle className="w-5 h-5" />
                <span>Reading submitted successfully!</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Site Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  Select Site
                </label>
                <select
                  value={selectedSite}
                  onChange={(e) => setSelectedSite(e.target.value)}
                  className="input"
                  required
                >
                  <option value="">-- Choose a site --</option>
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.dropPointNumber} - {site.address}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tank Selection */}
              {selectedSite && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select Tank
                  </label>
                  <select
                    value={selectedTank}
                    onChange={(e) => setSelectedTank(e.target.value)}
                    className="input"
                    required
                  >
                    <option value="">-- Choose a tank --</option>
                    {tanks.map((tank) => (
                      <option key={tank.id} value={tank.id}>
                        Tank {tank.tankNumber} ({tank.capacity}L) - {tank.tankType === 'aboveground' ? 'Above Ground (85%)' : 'Underground (88%)'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Reading Input */}
              {selectedTank && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Reading Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={readingDate}
                      onChange={(e) => setReadingDate(e.target.value)}
                      className="input"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Defaults to current date/time. You can modify if needed.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Reading Unit
                    </label>
                    <div className="flex items-center space-x-4">
                      <button
                        type="button"
                        onClick={() => setReadingUnit('liters')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${
                          readingUnit === 'liters'
                            ? 'bg-primary text-white'
                            : 'bg-secondary hover:bg-secondary-light text-gray-400'
                        }`}
                      >
                        Liters (L)
                      </button>
                      <button
                        type="button"
                        onClick={() => setReadingUnit('percentage')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${
                          readingUnit === 'percentage'
                            ? 'bg-primary text-white'
                            : 'bg-secondary hover:bg-secondary-light text-gray-400'
                        }`}
                      >
                        Percentage (%)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tank Reading {readingUnit === 'liters' ? '(Liters)' : '(%)'}
                    </label>
                    <input
                      type="number"
                      value={reading}
                      onChange={(e) => setReading(e.target.value)}
                      className="input"
                      placeholder={readingUnit === 'liters' ? 'Enter reading in liters' : 'Enter percentage (0-100)'}
                      min="0"
                      max={readingUnit === 'percentage' ? '100' : undefined}
                      step={readingUnit === 'percentage' ? '0.1' : '0.01'}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="input"
                      rows={3}
                      placeholder="Any additional notes..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn btn-primary py-3 flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Submit Reading</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </form>
          </div>

          {/* Recent Readings / Tank Gauge */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-6">
              <History className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold">Current Tank Status</h2>
            </div>

            {selectedTank && latestReading ? (
              <div className="flex justify-center">
                <TankGauge
                  percentage={latestReading.percentage || 0}
                  capacity={latestReading.capacity}
                  currentVolume={latestReading.estimatedVolume || 0}
                  tankNumber={latestReading.tankNumber}
                  tankType={tanks.find(t => t.id === selectedTank)?.tankType || 'aboveground'}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-400 text-center py-8">
                  {selectedTank 
                    ? 'No readings available for this tank yet.'
                    : 'Select a tank to view current status.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
