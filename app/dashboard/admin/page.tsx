'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import { Users, Building2, Upload, Download, Settings, Droplets } from 'lucide-react'

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('overview')
  
  // Mock tank data - in production this would come from API
  const [tanks, setTanks] = useState([
    { id: '1', tankNumber: 'T1', capacity: 5000, tankType: 'aboveground', dropPoint: 'DP-001' },
    { id: '2', tankNumber: 'T2', capacity: 3000, tankType: 'underground', dropPoint: 'DP-001' },
  ])

  const handleTankTypeChange = (tankId: string, newType: 'aboveground' | 'underground') => {
    setTanks(tanks.map(tank => 
      tank.id === tankId ? { ...tank, tankType: newType } : tank
    ))
    // In production, this would call /api/tanks/update
    console.log(`Tank ${tankId} updated to ${newType} (${newType === 'aboveground' ? '85%' : '88%'} fill level)`)
  }

  const handleImportFile = () => {
    // Create file input element
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.xlsx,.xls'
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0]
      if (file) {
        alert(`Selected file: ${file.name}\n\nIn production, this would upload to /api/import`)
      }
    }
    input.click()
  }

  const handleExport = async () => {
    alert('Exporting tank readings to Excel and emailing to vic@elgas.com.au...\n\nIn production, this would call /api/export')
  }

  const handleEditUser = (email: string) => {
    alert(`Edit user: ${email}\n\nIn production, this would open an edit modal`)
  }

  const handleAddUser = () => {
    alert('Add New User\n\nIn production, this would open a form to create a new user')
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">
            Welcome back, {session?.user?.name}! Manage your system below.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card hover:border-primary transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-3xl font-bold">3</p>
              </div>
              <Users className="w-12 h-12 text-primary opacity-50" />
            </div>
          </div>

          <div className="card hover:border-primary transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Customers</p>
                <p className="text-3xl font-bold">1</p>
              </div>
              <Building2 className="w-12 h-12 text-primary opacity-50" />
            </div>
          </div>

          <div className="card hover:border-primary transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Sites</p>
                <p className="text-3xl font-bold">1</p>
              </div>
              <Settings className="w-12 h-12 text-primary opacity-50" />
            </div>
          </div>

          <div className="card hover:border-primary transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Readings</p>
                <p className="text-3xl font-bold">0</p>
              </div>
              <Download className="w-12 h-12 text-primary opacity-50" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Upload className="w-6 h-6 text-primary" />
              Import Customer Data
            </h2>
            <p className="text-gray-400 mb-4">
              Upload an Excel file to import customer information, sites, and tanks.
            </p>
            <button onClick={handleImportFile} className="btn btn-primary">
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </button>
          </div>

          <div className="card">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Download className="w-6 h-6 text-primary" />
              Export Tank Readings
            </h2>
            <p className="text-gray-400 mb-4">
              Export all tank readings to Excel and email to vic@elgas.com.au
            </p>
            <button onClick={handleExport} className="btn btn-primary">
              <Download className="w-4 h-4 mr-2" />
              Export & Email
            </button>
          </div>
        </div>

        {/* User Management */}
        <div className="card mt-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Droplets className="w-6 h-6 text-primary" />
            Tank Management
          </h2>
          <p className="text-gray-400 mb-6">
            Configure tank type for ullage calculations. Above ground tanks use 85% fill level, underground tanks use 88%.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4">Drop Point</th>
                  <th className="text-left py-3 px-4">Tank Number</th>
                  <th className="text-left py-3 px-4">Capacity (L)</th>
                  <th className="text-left py-3 px-4">Tank Type</th>
                  <th className="text-left py-3 px-4">Fill Level</th>
                </tr>
              </thead>
              <tbody>
                {tanks.map((tank) => (
                  <tr key={tank.id} className="border-b border-gray-800 hover:bg-secondary">
                    <td className="py-3 px-4">{tank.dropPoint}</td>
                    <td className="py-3 px-4">Tank {tank.tankNumber}</td>
                    <td className="py-3 px-4">{tank.capacity}L</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleTankTypeChange(tank.id, 'aboveground')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            tank.tankType === 'aboveground'
                              ? 'bg-primary text-white'
                              : 'bg-secondary hover:bg-secondary-light text-gray-400'
                          }`}
                        >
                          Above Ground
                        </button>
                        <button
                          onClick={() => handleTankTypeChange(tank.id, 'underground')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            tank.tankType === 'underground'
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
                        {tank.tankType === 'aboveground' ? '85%' : '88%'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Management */}
        <div className="card mt-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            User Management
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Role</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-800 hover:bg-secondary">
                  <td className="py-3 px-4">System Administrator</td>
                  <td className="py-3 px-4">admin@lpgtank.com</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">
                      ADMIN
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-accent/20 text-accent text-xs rounded">
                      Active
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button 
                      onClick={() => handleEditUser('admin@lpgtank.com')}
                      className="text-primary hover:text-primary-light mr-2"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-secondary">
                  <td className="py-3 px-4">Demo Customer User</td>
                  <td className="py-3 px-4">customer@example.com</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                      CUSTOMER
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-accent/20 text-accent text-xs rounded">
                      Active
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button 
                      onClick={() => handleEditUser('customer@example.com')}
                      className="text-primary hover:text-primary-light mr-2"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-gray-800 hover:bg-secondary">
                  <td className="py-3 px-4">Demo Driver</td>
                  <td className="py-3 px-4">driver@example.com</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                      DRIVER
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-accent/20 text-accent text-xs rounded">
                      Active
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button 
                      onClick={() => handleEditUser('driver@example.com')}
                      className="text-primary hover:text-primary-light mr-2"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <button onClick={handleAddUser} className="btn btn-primary">
              <Users className="w-4 h-4 mr-2" />
              Add New User
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
