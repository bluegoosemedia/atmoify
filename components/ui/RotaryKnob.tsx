"use client"

import { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface RotaryKnobProps {
  value: number
  onChange: (value: number) => void
  label?: string
  min?: number
  max?: number
  step?: number
  unit?: string
  className?: string
}

export function RotaryKnob({
  value,
  onChange,
  label,
  min = 0,
  max = 2,
  step = 0.1,
  unit = "x",
  className
}: RotaryKnobProps) {
  const knobRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [startValue, setStartValue] = useState(0)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartY(e.clientY)
    setStartValue(value)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -step : step
    let newValue = value + delta
    newValue = Math.round(newValue / step) * step
    newValue = Math.max(min, Math.min(max, newValue))
    onChange(Number(newValue.toFixed(2)))
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaY = startY - e.clientY
        const range = max - min
        const sensitivity = 0.005
        const deltaValue = deltaY * range * sensitivity
        
        let newValue = startValue + deltaValue
        newValue = Math.round(newValue / step) * step
        newValue = Math.max(min, Math.min(max, newValue))
        
        onChange(Number(newValue.toFixed(2)))
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
  }, [isDragging, startY, startValue, min, max, step, onChange])

  // Calculate rotation based on value (270 degrees of rotation)
  const percentage = (value - min) / (max - min)
  const rotation = -135 + percentage * 270

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {label && (
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </div>
      )}

      {/* Knob */}
      <div
        ref={knobRef}
        className="relative w-16 h-16 cursor-pointer select-none"
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
      >
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-secondary to-muted border-2 border-border shadow-lg">
          {/* Tick marks around the knob */}
          {Array.from({ length: 11 }).map((_, i) => {
            const angle = -135 + (i * 27)
            const isActive = i <= percentage * 10
            return (
              <div
                key={i}
                className="absolute w-full h-full"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <div
                  className={cn(
                    "absolute top-1 left-1/2 -translate-x-1/2 w-0.5 h-2 rounded-full transition-colors",
                    isActive ? "bg-primary" : "bg-border/50"
                  )}
                />
              </div>
            )
          })}
        </div>

        {/* Knob body */}
        <div
          className="absolute inset-2 rounded-full bg-gradient-to-br from-muted via-secondary to-muted/80 border border-border shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] transition-transform"
          style={{
            transform: `rotate(${rotation}deg)`,
            boxShadow: isDragging
              ? "inset 0 2px 8px rgba(0,0,0,0.5), 0 0 12px hsl(var(--primary) / 0.4)"
              : "inset 0 2px 4px rgba(0,0,0,0.3)"
          }}
        >
          {/* Indicator line */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-4 bg-primary rounded-full shadow-[0_0_4px_hsl(var(--primary)/0.8)]" />
          
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-background border border-border" />
        </div>
      </div>

      {/* Value display */}
      <div className="bg-secondary border border-border rounded px-2 py-0.5 min-w-[48px] text-center">
        <span className="text-xs font-mono font-bold text-foreground">
          {value.toFixed(1)}
          {unit}
        </span>
      </div>
    </div>
  )
}
