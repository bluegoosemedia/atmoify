"use client"

import { cn } from "@/lib/utils"

interface IlluminatedToggleProps {
  active: boolean
  onToggle: () => void
  label: string
  className?: string
}

export function IlluminatedToggle({ active, onToggle, label, className }: IlluminatedToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative px-4 py-3 rounded-md font-semibold text-sm transition-all duration-200 border-2 select-none",
        "shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]",
        active
          ? "bg-[hsl(var(--mixer-button-on))] border-primary/50 text-primary-foreground shadow-[0_0_8px_hsl(var(--primary)/0.9),0_0_16px_hsl(var(--primary)/0.5),0_0_24px_hsl(var(--primary)/0.2),inset_0_2px_4px_rgba(0,0,0,0.3)]"
          : "bg-[hsl(var(--mixer-button-off))] border-border text-muted-foreground hover:border-border/80 hover:text-foreground",
        className
      )}
    >
      {/* Glow effect when active */}
      {active && (
        <>
          <div className="absolute inset-0 rounded-md bg-gradient-to-b from-primary/20 to-transparent pointer-events-none" />
          <div className="absolute top-1 left-1 right-1 h-1 bg-primary/40 rounded-full blur-sm" />
        </>
      )}
      
      {/* LED indicator */}
      <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full">
        <div
          className={cn(
            "w-full h-full rounded-full transition-all duration-200",
            active
              ? "bg-primary shadow-[0_0_4px_hsl(var(--primary)),0_0_8px_hsl(var(--primary)/0.8),0_0_12px_hsl(var(--primary)/0.4)]"
              : "bg-muted/30 shadow-inner"
          )}
        />
      </div>
      
      <span className="relative z-10">{label}</span>
    </button>
  )
}
