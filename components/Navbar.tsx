'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { Gauge, LogOut, User } from 'lucide-react'

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="bg-secondary-dark border-b border-gray-800">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Gauge className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold">LPG Tank Management</span>
        </Link>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-gray-300">
            <User className="w-5 h-5" />
            <span>{session?.user?.name}</span>
            <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">
              {session?.user?.role}
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
