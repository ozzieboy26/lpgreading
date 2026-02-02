'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Users, Building2, Upload, Download, Settings, Droplets, X } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
  role: string
  active: boolean
  customerId: string | null
  customer?: { name: string } | null
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState<User[]>([])
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  const [emailRecipient, setEmailRecipient] = useState('vic@elgas.com.au') // Who receives the readings
  const [customers, setCustomers] = useState<any[]>([])
  const [stats, setStats] = useState({ users: 0, customers: 0, sites: 0, readings: 0 })
  
  // Mock tank data - in production this would come from API
  const [tanks, setTanks] = useState([
    { id: '1', tankNumber: 'T1', capacity: 5000, tankType: 'aboveground', dropPoint: 'DP-001' },
    { id: '2', tankNumber: 'T2', capacity: 3000, tankType: 'underground', dropPoint: 'DP-001' },
  ])

  // Load users on mount
  useEffect(() => {
    loadUsers()
    loadSettings()
    loadCustomers()
    loadStats()
  }, [])

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Failed to load users:', error)
    }
  }

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        setEmailRecipient(data.settings.emailRecipient)
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  const loadCustomers = async () => {
    try {
      const res = await fetch('/api/customers')
      if (res.ok) {
        const data = await res.json()
        setCustomers(data.customers)
      }
    } catch (error) {
      console.error('Failed to load customers:', error)
    }
  }

  const loadStats = async () => {
    try {
      const res = await fetch('/api/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleTankTypeChange = (tankId: string, newType: 'aboveground' | 'underground') => {
    setTanks(tanks.map(tank => 
      tank.id === tankId ? { ...tank, tankType: newType } : tank
    ))
    // In production, this would call /api/tanks/update
    console.log(`Tank ${tankId} updated to ${newType} (${newType === 'aboveground' ? '85%' : '88%'} fill level)`)
  }

  const handleImportFile = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.xlsx,.xls'
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0]
      if (!file) return

      setLoading(true)
      setMessage(null)

      try {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/import', {
          method: 'POST',
          body: formData,
        })

        const data = await res.json()

        if (res.ok) {
          setMessage({
            type: 'success',
            text: `Successfully imported ${data.imported} customers. ${data.errors.length > 0 ? `Errors: ${data.errors.join(', ')}` : ''}`
          })
          // Reload users and stats to show newly imported customers
          loadUsers()
          loadStats()
        } else {
          setMessage({ type: 'error', text: data.error || 'Failed to import file' })
        }
      } catch (error) {
        console.error('Import error:', error)
        setMessage({ type: 'error', text: 'Failed to import file' })
      } finally {
        setLoading(false)
      }
    }
    input.click()
  }

  const handleExport = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailTo: emailRecipient }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({
          type: 'success',
          text: `Tank readings exported successfully and emailed to ${data.sentTo || emailRecipient}`
        })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to export readings' })
      }
    } catch (error) {
      console.error('Export error:', error)
      setMessage({ type: 'error', text: 'Failed to export readings' })
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setShowUserModal(true)
  }

  const handleAddUser = () => {
    setEditingUser(null)
    setShowUserModal(true)
  }

  const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const userData = {
      id: editingUser?.id,
      email: formData.get('email') as string,
      name: formData.get('name') as string,
      password: formData.get('password') as string,
      role: formData.get('role') as string,
      customerId: formData.get('customerId') as string || null,
      active: formData.get('active') === 'true',
    }

    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/users', {
        method: editingUser ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({
          type: 'success',
          text: `User ${editingUser ? 'updated' : 'created'} successfully`
        })
        setShowUserModal(false)
        loadUsers()
      } else {
        setMessage({ type: 'error', text: data.error || `Failed to ${editingUser ? 'update' : 'create'} user` })
      }
    } catch (error) {
      console.error('Save user error:', error)
      setMessage({ type: 'error', text: `Failed to ${editingUser ? 'update' : 'create'} user` })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch(`/api/users?id=${userId}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: 'User deleted successfully' })
        loadUsers()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to delete user' })
      }
    } catch (error) {
      console.error('Delete user error:', error)
      setMessage({ type: 'error', text: 'Failed to delete user' })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailRecipient }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save settings' })
      }
    } catch (error) {
      console.error('Save settings error:', error)
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setLoading(false)
    }
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
          <div 
            onClick={() => router.push('/dashboard/admin/users')}
            className="card hover:border-primary transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-3xl font-bold">{stats.users}</p>
              </div>
              <Users className="w-12 h-12 text-primary opacity-50" />
            </div>
          </div>

          <div 
            onClick={() => router.push('/dashboard/admin/customers')}
            className="card hover:border-primary transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Customers</p>
                <p className="text-3xl font-bold">{stats.customers}</p>
              </div>
              <Building2 className="w-12 h-12 text-primary opacity-50" />
            </div>
          </div>

          <div 
            onClick={() => router.push('/dashboard/admin/sites')}
            className="card hover:border-primary transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Sites</p>
                <p className="text-3xl font-bold">{stats.sites}</p>
              </div>
              <Settings className="w-12 h-12 text-primary opacity-50" />
            </div>
          </div>

          <div 
            onClick={() => router.push('/dashboard/admin/readings')}
            className="card hover:border-primary transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Readings</p>
                <p className="text-3xl font-bold">{stats.readings}</p>
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
            <p className="text-gray-400 mb-2">
              Sender: <span className="text-accent font-semibold">telemetry@lpgreadings.au</span>
            </p>
            <p className="text-gray-400 mb-2">
              Recipient (who receives the Excel file):
            </p>
            <div className="mb-4 flex items-center gap-2">
              <input
                type="email"
                value={emailRecipient}
                onChange={(e) => setEmailRecipient(e.target.value)}
                className="flex-1 px-4 py-2 bg-secondary border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                placeholder="vic@elgas.com.au"
              />
              <button onClick={handleSaveSettings} className="btn btn-secondary" disabled={loading}>
                Save
              </button>
            </div>
            <button onClick={handleExport} className="btn btn-primary" disabled={loading}>
              <Download className="w-4 h-4 mr-2" />
              Export & Email
            </button>
          </div>
        </div>

        {/* Tank Management - Clickable Card */}
        <div 
          onClick={() => router.push('/dashboard/admin/tanks')}
          className="card mt-8 cursor-pointer hover:border-primary transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Droplets className="w-6 h-6 text-primary" />
              Tank Management
            </h2>
            <span className="text-primary text-sm">View All →</span>
          </div>
          <p className="text-gray-400 mb-4">
            Configure tank type for ullage calculations. Above ground tanks use 85% fill level, underground tanks use 88%.
          </p>
          <p className="text-sm text-gray-500">
            Click to manage all tanks in the system
          </p>
        </div>

        {/* User Management - Clickable Card */}
        <div 
          onClick={() => router.push('/dashboard/admin/users')}
          className="card mt-8 cursor-pointer hover:border-primary transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              User Management
            </h2>
            <span className="text-primary text-sm">View All →</span>
          </div>
          <p className="text-gray-400 mb-4">
            Manage user accounts, roles, and permissions.
          </p>
          <p className="text-sm text-gray-500">
            Click to view and manage all users
          </p>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          message.type === 'success' ? 'bg-accent/20 border border-accent text-accent' :
          'bg-red-500/20 border border-red-500 text-red-400'
        }`}>
          <div className="flex items-center justify-between">
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="ml-4">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-secondary border border-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>
              <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveUser}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingUser?.name}
                    required
                    className="w-full px-3 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingUser?.email}
                    required
                    className="w-full px-3 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Password {editingUser && '(leave blank to keep current)'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    required={!editingUser}
                    className="w-full px-3 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select
                    name="role"
                    defaultValue={editingUser?.role || 'CUSTOMER'}
                    required
                    className="w-full px-3 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="CUSTOMER">Customer</option>
                    <option value="DRIVER">Driver</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Customer (for Customer role)
                  </label>
                  <select
                    name="customerId"
                    defaultValue={editingUser?.customerId || ''}
                    className="w-full px-3 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                  >
                    <option value="">-- None --</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} ({customer.sites?.length || 0} sites)
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Link user to customer's sites for reading submission
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    name="active"
                    defaultValue={editingUser?.active ? 'true' : 'false'}
                    required
                    className="w-full px-3 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 bg-secondary border border-gray-700 rounded-lg hover:bg-secondary-light"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
