"use client"

import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface HorizontalFaderProps {
  value: number
  onChange: (value: number) => void
  label?: string
  min?: number
  max?: number
  className?: string
}

export function HorizontalFader({
  value,
  onChange,
  label = "Volume",
  min = 0,
  max = 100,
  className
}: HorizontalFaderProps) {
  const handleValueChange = (values: number[]) => {
    onChange(values[0])
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -1 : 1
    const newValue = Math.max(min, Math.min(max, value + delta))
    onChange(newValue)
  }

  return (
    <div className={cn("flex items-center gap-3 w-full", className)}>
      {/* Label */}
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap min-w-[40px]">
        {label}
      </div>

      {/* Slider */}
      <div className="flex-1 relative" onWheel={handleWheel}>
        <Slider
          value={[value]}
          onValueChange={handleValueChange}
          min={min}
          max={max}
          step={1}
          className="w-full"
        />
      </div>

      {/* Value display */}
      <div className="bg-secondary border border-border rounded px-2 py-1 min-w-[48px] text-center">
        <span className="text-xs font-mono font-bold text-foreground">
          {value}
        </span>
      </div>
    </div>
  )
}
