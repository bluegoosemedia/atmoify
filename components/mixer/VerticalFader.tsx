"use client"

import { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface VerticalFaderProps {
  value: number
  onChange: (value: number) => void
  label?: string
  min?: number
  max?: number
  className?: string
}

export function VerticalFader({ 
  value, 
  onChange, 
  label, 
  min = 0, 
  max = 100,
  className 
}: VerticalFaderProps) {
  const faderRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [localValue, setLocalValue] = useState(value)

  // Sync local value with prop value when not dragging
  useEffect(() => {
    if (!isDragging) {
      setLocalValue(value)
    }
  }, [value, isDragging])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    updateValue(e.clientY)
  }

  const updateValue = (clientY: number) => {
    if (!faderRef.current) return
    
    const rect = faderRef.current.getBoundingClientRect()
    const percentage = 1 - ((clientY - rect.top) / rect.height)
    const clampedPercentage = Math.max(0, Math.min(1, percentage))
    const newValue = Math.round(clampedPercentage * (max - min) + min)
    
    // Update local state immediately for instant feedback
    setLocalValue(newValue)
    // Also call onChange immediately for instant audio adjustment
    onChange(newValue)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -1 : 1
    const newValue = Math.max(min, Math.min(max, value + delta))
    setLocalValue(newValue)
    onChange(newValue)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        updateValue(e.clientY)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, onChange])

  const displayValue = isDragging ? localValue : value
  const percentage = ((displayValue - min) / (max - min)) * 100

  return (
    <div className={cn("flex flex-col items-center gap-2 h-full", className)}>
      {label && (
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
          {label}
        </div>
      )}
      
      {/* Value display */}
      <div className="bg-secondary border border-border rounded px-2 py-1 min-w-[48px] text-center">
        <span className="text-sm font-mono font-bold text-foreground">{displayValue}</span>
      </div>

      {/* Vertical fader track */}
      <div
        ref={faderRef}
        className="relative w-8 flex-1 min-h-[120px] bg-[hsl(var(--mixer-fader))] rounded-sm border border-border cursor-pointer select-none shadow-inner"
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
      >
        {/* Fill indicator */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/80 to-primary/40 rounded-sm pointer-events-none"
          style={{ height: `${percentage}%` }}
        />
        
        {/* Fader handle */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-10 h-6 bg-gradient-to-b from-secondary to-muted border-2 border-border rounded shadow-lg cursor-grab active:cursor-grabbing pointer-events-none"
          style={{ 
            bottom: `calc(${percentage}% - 12px)`,
            boxShadow: isDragging ? '0 0 6px hsl(var(--primary)), 0 0 12px hsl(var(--primary) / 0.7), 0 0 20px hsl(var(--primary) / 0.3)' : undefined
          }}
        >
          {/* Handle grip lines */}
          <div className="h-full flex items-center justify-center gap-0.5">
            <div className="w-0.5 h-3 bg-border rounded-full" />
            <div className="w-0.5 h-3 bg-border rounded-full" />
            <div className="w-0.5 h-3 bg-border rounded-full" />
          </div>
        </div>

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => (
          <div
            key={tick}
            className="absolute left-0 w-2 h-px bg-border/50 pointer-events-none"
            style={{ bottom: `${tick}%` }}
          />
        ))}
      </div>
    </div>
  )
}
