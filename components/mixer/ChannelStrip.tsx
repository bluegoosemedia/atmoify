"use client"

import { HorizontalFader } from "./HorizontalFader"
import { RotaryKnob } from "@/components/ui/RotaryKnob"
import { VolumeX, Volume2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ChannelStripProps {
  name: string
  volume: number
  onVolumeChange: (value: number) => void
  playbackSpeed?: number
  onPlaybackSpeedChange?: (value: number) => void
  pan?: number
  onPanChange?: (value: number) => void
  onMuteToggle: () => void
  onRemove: () => void
  isMuted: boolean
  type?: "audio" | "effect"
}

export function ChannelStrip({
  name,
  volume,
  onVolumeChange,
  playbackSpeed,
  onPlaybackSpeedChange,
  pan,
  onPanChange,
  onMuteToggle,
  onRemove,
  isMuted,
  type = "audio"
}: ChannelStripProps) {
  return (
    <div className="flex items-center gap-3 bg-card border border-border rounded-lg p-3 shadow-lg w-full">
      {/* Channel name and type */}
      <div className="flex flex-col min-w-[100px] max-w-[120px]">
        <h3 className="text-xs font-bold text-foreground truncate">{name}</h3>
        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
          {type === "audio" ? "Track" : "FX"}
        </div>
      </div>

      {/* Control knobs - fixed width container for consistent strip sizing */}
      <div className="flex gap-2 w-[140px] h-[90px] items-center justify-center">
        {playbackSpeed !== undefined && onPlaybackSpeedChange && (
          <RotaryKnob
            value={playbackSpeed}
            onChange={onPlaybackSpeedChange}
            label="Speed"
            min={0.5}
            max={2}
            step={0.1}
            className="scale-75"
          />
        )}
        {pan !== undefined && onPanChange && (
          <RotaryKnob
            value={pan}
            onChange={onPanChange}
            label="Pan"
            min={-1}
            max={1}
            step={0.1}
            unit=""
            className="scale-75"
          />
        )}
      </div>

      {/* Horizontal volume fader */}
      <div className="flex-1 min-w-[200px]">
        <HorizontalFader
          value={volume}
          onChange={onVolumeChange}
          label="Gain"
          min={0}
          max={100}
        />
      </div>

      {/* Mute button */}
      <button
        onClick={onMuteToggle}
        className={cn(
          "px-3 py-2 rounded font-semibold text-xs transition-all duration-200 border-2 whitespace-nowrap",
          "shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]",
          isMuted
            ? "bg-destructive border-destructive/50 text-destructive-foreground shadow-[0_0_12px_hsl(var(--destructive)/0.4)]"
            : "bg-[hsl(var(--mixer-button-off))] border-border text-muted-foreground hover:border-border/80"
        )}
      >
        <div className="flex items-center gap-1.5">
          {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          <span>{isMuted ? "MUTED" : "MUTE"}</span>
        </div>
      </button>

      {/* Remove button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="h-8 w-8 hover:bg-destructive/20 hover:text-destructive flex-shrink-0"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
