import Link from 'next/link'
import Image from 'next/image'
import { Lock, Gauge, Users, TrendingUp } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <nav className="bg-secondary-dark border-b border-gray-800 py-6">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex-1"></div>
          <div className="flex justify-center">
            <Image
              src="/select-logo.png"
              alt="Select Logistics and Transport"
              width={300}
              height={100}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex-1"></div>
        </div>
      </nav>

      {/* LPG Telemetry Card */}
      <div className="container mx-auto px-4 py-8">
        <div className="card text-center">
          <h2 className="text-4xl font-bold tracking-wider">LPG TELEMETRY</h2>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Truck image with centered Login button */}
        <div className="relative flex justify-center mb-16">
          <Image
            src="/select-truck.jpg"
            alt="Select Logistics LPG Tanker Truck"
            width={1200}
            height={600}
            className="rounded-lg object-cover shadow-2xl"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Glass card with backdrop blur and glow */}
            <div className="bg-secondary/30 backdrop-blur-md border border-gray-700/50 rounded-2xl p-12 shadow-[0_0_60px_20px_rgba(59,130,246,0.4)]">
              <Link href="/login" className="btn btn-primary text-5xl px-20 py-8 shadow-2xl hover:scale-105 transition-transform">
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-secondary-dark border-t border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>&copy; 2026 LPG Tank Management System. All rights reserved.</p>
          <p className="mt-2 text-sm">Secure. Encrypted. Reliable.</p>
        </div>
      </footer>
    </main>
  )
}
