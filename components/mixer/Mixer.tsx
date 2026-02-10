"use client"

import { useState, useRef, useCallback } from "react"
import { Label } from "@/components/ui/label"
import { useAtom } from "jotai"
import { soundEffectsAtom, audioTracksAtom } from "@/lib/atoms"
import type { SoundEffect } from "@/lib/soundEffects"
import { ChannelStrip } from "./ChannelStrip"

interface MixerProps {
  isVisible: boolean
}

export default function Mixer({ isVisible }: MixerProps) {
  const [soundEffects, setSoundEffects] = useAtom(soundEffectsAtom)
  const [audioTracks, setAudioTracks] = useAtom(audioTracksAtom)
  const [previousVolumes, setPreviousVolumes] = useState<{ [key: string]: number }>({})
  const playerRefs = useRef<{ [key: number]: any }>({})
  const sourceNodesRef = useRef<{ [key: string]: AudioBufferSourceNode }>({})
  const gainNodesRef = useRef<{ [key: string]: GainNode }>({})
  const loopTimeoutsRef = useRef<{ [key: string]: NodeJS.Timeout }>({})

  const handleAudioTrackVolumeChange = (id: number, value: number) => {
    setAudioTracks((prev) => prev.map((track) => (track.id === id ? { ...track, volume: value } : track)))
    const player = playerRefs.current[id]
    if (player) {
      player.setVolume(value)
    }
  }

  const toggleAudioTrackMute = (id: number) => {
    setAudioTracks((prev) =>
      prev.map((track) => {
        if (track.id === id) {
          const newVolume = track.volume === 0 ? previousVolumes[`track-${id}`] || 50 : 0
          const player = playerRefs.current[id]
          if (player) {
            player.setVolume(newVolume)
          }
          if (newVolume === 0) {
            setPreviousVolumes((prev) => ({ ...prev, [`track-${id}`]: track.volume }))
          }
          return { ...track, volume: newVolume }
        }
        return track
      }),
    )
  }

  const handleEffectVolumeChange = (effectName: string, value: number) => {
    setSoundEffects((prev) =>
      prev.map((effect) => (effect.name === effectName ? { ...effect, volume: value } : effect)),
    )
    if (value === 0) {
      setPreviousVolumes((prev) => ({
        ...prev,
        [`effect-${effectName}`]: soundEffects.find((e) => e.name === effectName)?.volume || 50,
      }))
    }
  }

  const toggleEffectMute = (effectName: string) => {
    const effect = soundEffects.find((e) => e.name === effectName)
    if (effect) {
      const newVolume = effect.volume === 0 ? previousVolumes[`effect-${effectName}`] || 50 : 0
      handleEffectVolumeChange(effectName, newVolume)
    }
  }

  const updateEffectSettings = (effectName: string, settings: Partial<SoundEffect>) => {
    setSoundEffects((prev) => prev.map((effect) => (effect.name === effectName ? { ...effect, ...settings } : effect)))
    
    // Dispatch event for real-time pan updates
    if (settings.pan !== undefined && window) {
      window.dispatchEvent(new CustomEvent("effectPanChanged", { detail: { name: effectName, pan: settings.pan } }))
    }
  }

  const removeSoundEffect = useCallback(
    (effectName: string) => {
      if (sourceNodesRef.current[effectName]) {
        sourceNodesRef.current[effectName].stop()
        delete sourceNodesRef.current[effectName]
      }
      if (gainNodesRef.current[effectName]) {
        gainNodesRef.current[effectName].disconnect()
        delete gainNodesRef.current[effectName]
      }
      if (loopTimeoutsRef.current[effectName]) {
        clearTimeout(loopTimeoutsRef.current[effectName])
        delete loopTimeoutsRef.current[effectName]
      }

      setSoundEffects((prev) =>
        prev.map((effect) => (effect.name === effectName ? { ...effect, isPlaying: false } : effect)),
      )

      if (window) {
        window.dispatchEvent(new CustomEvent("soundEffectRemoved", { detail: { name: effectName } }))
      }
    },
    [setSoundEffects],
  )

  const removeAudioTrack = (id: number) => {
    if (playerRefs.current[id]) {
      playerRefs.current[id].destroy()
      delete playerRefs.current[id]
    }
    setAudioTracks((prev) => prev.filter((track) => track.id !== id))

    if (window) {
      window.dispatchEvent(new CustomEvent("audioTrackRemoved", { detail: { id } }))
    }
  }

  const activeSoundEffects = soundEffects.filter((effect) => effect.isPlaying)
  const hasAudioTracks = audioTracks.length > 0
  const hasEffects = activeSoundEffects.length > 0

  return (
    <div className={`h-full overflow-y-auto overflow-x-hidden bg-background ${isVisible ? "" : "hidden"}`}>
      <div className="min-h-full p-6 max-w-7xl mx-auto">
        <Label className="text-2xl font-bold text-foreground uppercase tracking-wide block mb-6">Mixer</Label>
        {!hasAudioTracks && !hasEffects ? (
          <div className="text-center py-8 px-8 text-muted-foreground bg-card/50 rounded-lg border border-border">
            <div className="text-sm">No active tracks or effects.</div>
            <div className="text-sm mt-1">Add some to get started!</div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">{/* Audio Tracks Section */}
              {/* Audio Tracks Section */}
              {hasAudioTracks && (
                <div className="flex flex-col gap-3">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                    Audio Tracks
                  </div>
                  {audioTracks.map((track) => (
                    <ChannelStrip
                      key={track.id}
                      name={track.name}
                      volume={track.volume}
                      onVolumeChange={(value) => handleAudioTrackVolumeChange(track.id, value)}
                      onMuteToggle={() => toggleAudioTrackMute(track.id)}
                      onRemove={() => removeAudioTrack(track.id)}
                      isMuted={track.volume === 0}
                      type="audio"
                    />
                  ))}
                </div>
              )}

              {/* Sound Effects Section */}
              {hasEffects && (
                <div className="flex flex-col gap-3">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                    Sound Effects
                  </div>
                  {activeSoundEffects.map((effect) => (
                    <ChannelStrip
                      key={effect.name}
                      name={effect.name}
                      volume={effect.volume}
                      onVolumeChange={(value) => handleEffectVolumeChange(effect.name, value)}
                      playbackSpeed={effect.playbackSpeed}
                      onPlaybackSpeedChange={(value) => updateEffectSettings(effect.name, { playbackSpeed: value })}
                      pan={effect.pan}
                      onPanChange={(value) => updateEffectSettings(effect.name, { pan: value })}
                      onMuteToggle={() => toggleEffectMute(effect.name)}
                      onRemove={() => removeSoundEffect(effect.name)}
                      isMuted={effect.volume === 0}
                      type="effect"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
  )
}
