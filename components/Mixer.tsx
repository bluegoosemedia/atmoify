"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { useAtom } from "jotai"
import { soundEffectsAtom, audioTracksAtom } from "@/lib/atoms"
import { Volume2, VolumeX, X } from "lucide-react"
import type { SoundEffect } from "@/lib/soundEffects"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface MixerProps {
  isVisible: boolean
}

export default function Mixer({ isVisible }: MixerProps) {
  const [soundEffects, setSoundEffects] = useAtom(soundEffectsAtom)
  const [audioTracks, setAudioTracks] = useAtom(audioTracksAtom)
  const [previousVolumes, setPreviousVolumes] = useState<{ [key: string]: number }>({})
  const { toast } = useToast()
  const playerRefs = useRef<{ [key: number]: any }>({})
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceNodesRef = useRef<{ [key: string]: AudioBufferSourceNode }>({})
  const gainNodesRef = useRef<{ [key: string]: GainNode }>({})
  const loopTimeoutsRef = useRef<{ [key: string]: NodeJS.Timeout }>({})

  const handleAudioTrackVolumeChange = (id: number, value: number[]) => {
    const newVolume = value[0]
    setAudioTracks((prev) => prev.map((track) => (track.id === id ? { ...track, volume: newVolume } : track)))
    const player = playerRefs.current[id]
    if (player) {
      player.setVolume(newVolume)
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

  const handleEffectVolumeChange = (effectName: string, value: number[]) => {
    const newVolume = value[0]
    setSoundEffects((prev) =>
      prev.map((effect) => (effect.name === effectName ? { ...effect, volume: newVolume } : effect)),
    )
    if (newVolume === 0) {
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
      handleEffectVolumeChange(effectName, [newVolume])
    }
  }

  const updateEffectSettings = (effectName: string, settings: Partial<SoundEffect>) => {
    setSoundEffects((prev) => prev.map((effect) => (effect.name === effectName ? { ...effect, ...settings } : effect)))
  }

  const removeSoundEffect = useCallback(
    (effectName: string) => {
      // Stop the audio playback
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

      // Update the sound effects state
      setSoundEffects((prev) =>
        prev.map((effect) => (effect.name === effectName ? { ...effect, isPlaying: false } : effect)),
      )

      // Notify SoundEffects component to update its state
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

    // Dispatch custom event
    if (window) {
      window.dispatchEvent(new CustomEvent("audioTrackRemoved", { detail: { id } }))
    }
  }

  const activeSoundEffects = soundEffects.filter((effect) => effect.isPlaying)

  return (
    <div className={`h-full overflow-y-auto p-4 pt-6 ${isVisible ? "" : "hidden"}`}>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow-md space-y-4">
          <Label className="text-lg font-semibold">Audio Tracks</Label>
          {audioTracks.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No active audio tracks. Add some from the Audio Tracks tab!
            </p>
          ) : (
            audioTracks.map((track) => (
              <div key={track.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`audio-track-${track.id}`} className="text-sm font-medium">
                    {track.name}
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => removeAudioTrack(track.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => toggleAudioTrackMute(track.id)}>
                    {track.volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Slider
                    id={`audio-track-${track.id}`}
                    max={100}
                    step={1}
                    value={[track.volume]}
                    onValueChange={(value) => handleAudioTrackVolumeChange(track.id, value)}
                    className="flex-grow"
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-card p-4 sm:p-6 rounded-lg shadow-md space-y-4">
          <Label className="text-lg font-semibold">Sound Effects</Label>
          {activeSoundEffects.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No active sound effects. Add some from the Sound Effects tab!
            </p>
          ) : (
            activeSoundEffects.map((effect) => (
              <div key={effect.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">{effect.name}</Label>
                  <div className="flex items-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>{effect.name} Settings</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Playback Speed</label>
                            <Slider
                              value={[effect.playbackSpeed]}
                              onValueChange={(value) => {
                                updateEffectSettings(effect.name, { playbackSpeed: value[0] })
                              }}
                              min={0.5}
                              max={2}
                              step={0.1}
                              className="w-full"
                            />
                            <div className="text-xs text-right">{effect.playbackSpeed.toFixed(1)}x</div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="ghost" size="sm" onClick={() => removeSoundEffect(effect.name)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => toggleEffectMute(effect.name)}>
                    {effect.volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Slider
                    id={`${effect.name}-volume`}
                    max={100}
                    step={1}
                    value={[effect.volume]}
                    onValueChange={(value) => handleEffectVolumeChange(effect.name, value)}
                    className="flex-grow"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

