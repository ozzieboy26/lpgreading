'use client'

import { useEffect, useRef } from 'react'

interface TankGaugeProps {
  percentage: number
  capacity: number
  currentVolume: number
  tankNumber: string
  tankType?: 'aboveground' | 'underground'
}

export default function TankGauge({ 
  percentage, 
  capacity, 
  currentVolume, 
  tankNumber,
  tankType = 'aboveground' 
}: TankGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = 140
    
    // Draw outer circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius + 10, 0, 2 * Math.PI)
    ctx.strokeStyle = '#1f2937'
    ctx.lineWidth = 3
    ctx.stroke()
    
    // Draw inner white background
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
    
    // Draw percentage markings (0-100)
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 16px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    for (let i = 0; i <= 100; i += 10) {
      const angle = (i / 100) * 1.5 * Math.PI + 0.75 * Math.PI // Start from left, go clockwise
      const markRadius = radius - 25
      const x = centerX + markRadius * Math.cos(angle)
      const y = centerY + markRadius * Math.sin(angle)
      
      if (i % 20 === 0) {
        ctx.fillText(i.toString(), x, y)
      }
      
      // Draw tick marks
      const tickStart = radius - 15
      const tickEnd = i % 10 === 0 ? radius - 10 : radius - 8
      const x1 = centerX + tickStart * Math.cos(angle)
      const y1 = centerY + tickStart * Math.sin(angle)
      const x2 = centerX + tickEnd * Math.cos(angle)
      const y2 = centerY + tickEnd * Math.sin(angle)
      
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 2
      ctx.stroke()
    }
    
    // Draw red "DO NOT USE FOR FILLING" zone (0-20%)
    const redZoneStart = 0.75 * Math.PI
    const redZoneEnd = (20 / 100) * 1.5 * Math.PI + 0.75 * Math.PI
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius - 35, redZoneStart, redZoneEnd)
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 10
    ctx.stroke()
    
    // Draw fill level indicator zone (85% or 88%)
    const fillLevel = tankType === 'aboveground' ? 85 : 88
    const fillAngle = (fillLevel / 100) * 1.5 * Math.PI + 0.75 * Math.PI
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius - 50, fillAngle - 0.05, fillAngle + 0.05)
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 3
    ctx.stroke()
    
    // Draw needle
    const needleAngle = (percentage / 100) * 1.5 * Math.PI + 0.75 * Math.PI
    const needleLength = radius - 20
    
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(
      centerX + needleLength * Math.cos(needleAngle),
      centerY + needleLength * Math.sin(needleAngle)
    )
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 4
    ctx.stroke()
    
    // Draw center circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI)
    ctx.fillStyle = '#1f2937'
    ctx.fill()
    
    // Draw labels
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 14px Arial'
    ctx.textAlign = 'center'
    
    // Top labels with more spacing
    ctx.fillText(`ABOVE GROUND TANKS PERCENT FULL`, centerX, 40)
    ctx.fillText(`DO NOT USE FOR FILLING`, centerX, 65)
    
    // Bottom label
    ctx.font = '16px Arial'
    ctx.fillText(`LIQUID TEMP`, centerX, canvas.height - 40)
    
  }, [percentage, tankType])
  
  return (
    <div className="flex flex-col items-center p-6">
      <canvas 
        ref={canvasRef} 
        width={450} 
        height={450}
        className="border-2 border-gray-700 rounded-lg bg-white"
      />
      <div className="mt-6 text-center space-y-2">
        <p className="text-2xl font-bold text-primary">
          Tank {tankNumber}
        </p>
        <p className="text-xl">
          <span className="text-accent font-bold">{percentage.toFixed(1)}%</span>
          <span className="text-gray-400 ml-2">({currentVolume.toFixed(0)}L / {capacity}L)</span>
        </p>
        <p className="text-sm text-gray-500">
          Tank Type: {tankType === 'aboveground' ? 'Above Ground (85% fill)' : 'Underground (88% fill)'}
        </p>
      </div>
    </div>
  )
}
