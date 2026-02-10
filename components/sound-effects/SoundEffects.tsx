"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useAtom } from "jotai"
import { soundEffectsAtom, masterVolumeAtom } from "@/lib/atoms"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { AnimatedSoundwave } from "./AnimatedSoundwave"
import { IlluminatedToggle } from "../mixer/IlluminatedToggle"
import type { SoundEffect } from "@/lib/soundEffects"
import { useToast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"

interface SoundEffectsProps {
  isVisible: boolean
}

export default function SoundEffects({ isVisible }: SoundEffectsProps) {
  const [soundEffects, setSoundEffects] = useAtom(soundEffectsAtom)
  const [masterVolume] = useAtom(masterVolumeAtom)
  const audioContextRef = useRef<AudioContext | null>(null)
  const masterGainNodeRef = useRef<GainNode | null>(null)
  const sourceNodesRef = useRef<{ [key: string]: AudioBufferSourceNode }>({})
  const gainNodesRef = useRef<{ [key: string]: GainNode }>({})
  const panNodesRef = useRef<{ [key: string]: StereoPannerNode }>({})
  const audioBuffersRef = useRef<{ [key: string]: AudioBuffer }>({})
  const loopTimeoutsRef = useRef<{ [key: string]: NodeJS.Timeout }>({})
  const { toast } = useToast()
  const [previousVolumes, setPreviousVolumes] = useState<{ [key: string]: number }>({})

  const initAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        masterGainNodeRef.current = audioContextRef.current.createGain()
        masterGainNodeRef.current.connect(audioContextRef.current.destination)
        if (audioContextRef.current.state === "suspended") {
          await audioContextRef.current.resume()
        }
      } catch (error) {
        console.error("Failed to create or resume AudioContext:", error)
        toast({
          title: "Error",
          description: "Failed to initialize audio system. Please check your browser settings.",
          variant: "destructive",
        })
      }
    }
  }, [toast])

  useEffect(() => {
    console.log("Initializing audio context and loading sounds")
    initAudioContext()

    const loadSound = async (effect: SoundEffect) => {
      if (audioBuffersRef.current[effect.name]) return

      console.log(`Loading sound: ${effect.name}`)
      try {
        const response = await fetch(effect.file)
        if (!response.ok) {
          console.warn(`Could not fetch sound file: ${effect.name} (${response.status})`)
          return
        }
        const arrayBuffer = await response.arrayBuffer()
        if (!audioContextRef.current) {
          console.warn(`AudioContext not available for: ${effect.name}`)
          return
        }
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer)
        audioBuffersRef.current[effect.name] = audioBuffer
        console.log(`Successfully loaded sound: ${effect.name}`)
      } catch (error) {
        console.warn(`Could not load sound: ${effect.name}`, error)
      }
    }

    soundEffects.forEach(loadSound)
  }, [soundEffects, toast, initAudioContext])

  const createSourceNode = useCallback(
    (effect: SoundEffect) => {
      console.log(`Creating source node for: ${effect.name}`)
      if (!audioContextRef.current || !audioBuffersRef.current[effect.name] || !masterGainNodeRef.current) {
        console.error(
          `Unable to create source node for ${effect.name}: AudioContext, AudioBuffer, or MasterGainNode not available`,
        )
        return null
      }

      const source = audioContextRef.current.createBufferSource()
      source.buffer = audioBuffersRef.current[effect.name]
      source.playbackRate.value = effect.playbackSpeed

      const gainNode = audioContextRef.current.createGain()
      gainNode.gain.value = (effect.volume / 100) * (masterVolume / 100)

      // Create pan node
      const panNode = audioContextRef.current.createStereoPanner()
      panNode.pan.value = effect.pan

      // Audio chain: source -> pan -> gain -> master
      source.connect(panNode)
      panNode.connect(gainNode)
      gainNode.connect(masterGainNodeRef.current)

      sourceNodesRef.current[effect.name] = source
      gainNodesRef.current[effect.name] = gainNode
      panNodesRef.current[effect.name] = panNode

      return source
    },
    [masterVolume],
  )

  const stopSoundEffect = useCallback((name: string) => {
    console.log(`Stopping sound effect: ${name}`)
    if (sourceNodesRef.current[name]) {
      sourceNodesRef.current[name].stop()
      delete sourceNodesRef.current[name]
    }
    if (gainNodesRef.current[name]) {
      gainNodesRef.current[name].disconnect()
      delete gainNodesRef.current[name]
    }
    if (panNodesRef.current[name]) {
      panNodesRef.current[name].disconnect()
      delete panNodesRef.current[name]
    }
    if (loopTimeoutsRef.current[name]) {
      clearTimeout(loopTimeoutsRef.current[name])
      delete loopTimeoutsRef.current[name]
    }
  }, [])

  const playWithCrossfade = useCallback(
    async (effect: SoundEffect, fadeInDuration = 0.1, fadeOutDuration = 0.1) => {
      console.log(`Attempting to play sound: ${effect.name}`)
      await initAudioContext()
      if (!audioContextRef.current || !audioBuffersRef.current[effect.name] || !masterGainNodeRef.current) {
        console.error(
          `Unable to play sound: ${effect.name}. AudioContext, AudioBuffer, or MasterGainNode not available.`,
        )
        toast({
          title: "Error",
          description: `Unable to play sound: ${effect.name}. Please try again later.`,
          variant: "destructive",
        })
        return
      }

      const playSound = () => {
        stopSoundEffect(effect.name)

        const currentTime = audioContextRef.current!.currentTime
        const source = createSourceNode(effect)
        if (!source) {
          console.error(`Failed to create source node for ${effect.name}`)
          return
        }

        const gainNode = gainNodesRef.current[effect.name]
        gainNode.gain.setValueAtTime(0, currentTime)
        gainNode.gain.linearRampToValueAtTime(
          (effect.volume / 100) * (masterVolume / 100),
          currentTime + fadeInDuration,
        )

        source.playbackRate.setValueAtTime(effect.playbackSpeed, currentTime)
        source.start(0)
        console.log(`Started playing sound: ${effect.name}`)

        const soundDuration = source.buffer!.duration / effect.playbackSpeed

        const scheduleNextLoop = () => {
          // if (effect.loopSpeed > 0) {
          //   loopTimeoutsRef.current[effect.name] = setTimeout(() => {
          //     if (effect.isPlaying) {
          //       console.log(`Looping sound: ${effect.name}`)
          //       playSound()
          //     }
          //   }, effect.loopSpeed * 1000)
          // }
        }

        // if (effect.loopSpeed > 0) {
        //   source.onended = scheduleNextLoop
        // } else {
        source.loop = true
        // }
      }

      playSound()
    },
    [createSourceNode, stopSoundEffect, toast, initAudioContext, masterVolume],
  )

  const toggleSoundEffect = useCallback(
    (name: string) => {
      console.log(`Toggling sound effect: ${name}`)
      setSoundEffects((prev) =>
        prev.map((effect) => {
          if (effect.name === name) {
            const newIsPlaying = !effect.isPlaying
            if (newIsPlaying) {
              playWithCrossfade(effect)
            } else {
              stopSoundEffect(name)
              if (loopTimeoutsRef.current[name]) {
                clearTimeout(loopTimeoutsRef.current[name])
                delete loopTimeoutsRef.current[name]
              }
            }
            return { ...effect, isPlaying: newIsPlaying }
          }
          return effect
        }),
      )
    },
    [playWithCrossfade, setSoundEffects, stopSoundEffect],
  )

  const toggleEffectMute = useCallback(
    (effectName: string) => {
      setSoundEffects((prev) =>
        prev.map((effect) => {
          if (effect.name === effectName) {
            const newVolume = effect.volume === 0 ? previousVolumes[`effect-${effectName}`] || 50 : 0
            if (gainNodesRef.current[effectName]) {
              gainNodesRef.current[effectName].gain.setValueAtTime(
                newVolume / 100,
                audioContextRef.current!.currentTime,
              )
            }
            if (newVolume === 0) {
              setPreviousVolumes((prev) => ({ ...prev, [`effect-${effectName}`]: effect.volume }))
            }
            return { ...effect, volume: newVolume }
          }
          return effect
        }),
      )
    },
    [setSoundEffects, previousVolumes],
  )

  const updateEffectSettings = useCallback(
    (effectName: string, settings: Partial<SoundEffect>) => {
      setSoundEffects((prev) =>
        prev.map((effect) => {
          if (effect.name === effectName) {
            const updatedEffect = { ...effect, ...settings }
            if (effect.isPlaying) {
              stopSoundEffect(effectName)
              playWithCrossfade(updatedEffect)
            }
            return updatedEffect
          }
          return effect
        }),
      )
    },
    [setSoundEffects, stopSoundEffect, playWithCrossfade],
  )

  const updatePan = useCallback(
    (effectName: string, pan: number) => {
      setSoundEffects((prev) =>
        prev.map((effect) => {
          if (effect.name === effectName) {
            // Update the pan node if the effect is playing
            if (panNodesRef.current[effectName]) {
              panNodesRef.current[effectName].pan.value = pan
            }
            return { ...effect, pan }
          }
          return effect
        }),
      )
    },
    [setSoundEffects],
  )

  const categories = Array.from(new Set(soundEffects.map((effect) => effect.category)))

  // Listen for pan changes from mixer
  useEffect(() => {
    const handleEffectPanChanged = (event: CustomEvent) => {
      const { name, pan } = event.detail
      if (panNodesRef.current[name]) {
        panNodesRef.current[name].pan.value = pan
      }
    }

    window.addEventListener("effectPanChanged", handleEffectPanChanged as EventListener)
    return () => {
      window.removeEventListener("effectPanChanged", handleEffectPanChanged as EventListener)
    }
  }, [])

  useEffect(() => {
    soundEffects.forEach((effect) => {
      if (effect.isPlaying) {
        if (sourceNodesRef.current[effect.name]) {
          sourceNodesRef.current[effect.name].playbackRate.setValueAtTime(
            effect.playbackSpeed,
            audioContextRef.current!.currentTime,
          )
        }
        if (gainNodesRef.current[effect.name] && audioContextRef.current) {
          gainNodesRef.current[effect.name].gain.setValueAtTime(
            (effect.volume / 100) * (masterVolume / 100),
            audioContextRef.current.currentTime,
          )
        }
      }
    })
  }, [soundEffects, playWithCrossfade, masterVolume])

  useEffect(() => {
    const handleSoundEffectRemoved = (event: CustomEvent) => {
      const { name } = event.detail
      stopSoundEffect(name)
      setSoundEffects((prev) => prev.map((effect) => (effect.name === name ? { ...effect, isPlaying: false } : effect)))
    }

    const handleProfileLoaded = (event: CustomEvent) => {
      const { soundEffects: newSoundEffects } = event.detail

      // Stop all currently playing sound effects
      soundEffects.forEach((effect) => {
        if (effect.isPlaying) {
          stopSoundEffect(effect.name)
        }
      })

      // Start playing new sound effects
      newSoundEffects.forEach((effect: SoundEffect) => {
        if (effect.isPlaying) {
          playWithCrossfade(effect)
        }
      })

      setSoundEffects(newSoundEffects)
    }

    window.addEventListener("soundEffectRemoved", handleSoundEffectRemoved as EventListener)
    window.addEventListener("profileLoaded", handleProfileLoaded as EventListener)

    return () => {
      window.removeEventListener("soundEffectRemoved", handleSoundEffectRemoved as EventListener)
      window.removeEventListener("profileLoaded", handleProfileLoaded as EventListener)
    }
  }, [stopSoundEffect, setSoundEffects, playWithCrossfade, soundEffects])

  useEffect(() => {
    const handleSleepTimerEnded = () => {
      setSoundEffects((prev) =>
        prev.map((effect) => {
          if (effect.isPlaying) {
            setPreviousVolumes((prevVolumes) => ({ ...prevVolumes, [`effect-${effect.name}`]: effect.volume }))
            if (gainNodesRef.current[effect.name]) {
              gainNodesRef.current[effect.name].gain.setValueAtTime(0, audioContextRef.current!.currentTime)
            }
            return { ...effect, volume: 0 }
          }
          return effect
        }),
      )
    }

    window.addEventListener("sleepTimerEnded", handleSleepTimerEnded)

    return () => {
      window.removeEventListener("sleepTimerEnded", handleSleepTimerEnded)
    }
  }, [setSoundEffects])

  return (
    <div className={`h-full overflow-y-auto bg-background ${isVisible ? "" : "hidden"}`}>
      <div className="min-h-full p-6 max-w-7xl mx-auto">
        <Label className="text-2xl font-bold text-foreground uppercase tracking-wide block mb-6">Sound Effects</Label>
        <div className="bg-card/30 p-6 rounded-lg border border-border shadow-lg">
          <Accordion type="single" collapsible className="w-full">
            {categories.map((category) => {
              const isPlaying = soundEffects.some((effect) => effect.category === category && effect.isPlaying)
              return (
                <AccordionItem key={category} value={category} className="border-b border-border last:border-b-0">
                  <div className="flex items-center justify-between">
                    <AccordionTrigger className="flex-1 text-base font-bold text-foreground hover:no-underline py-5 uppercase tracking-wide">
                      {category}
                    </AccordionTrigger>
                    {isPlaying && (
                      <div className="mr-4 text-primary">
                        <AnimatedSoundwave />
                      </div>
                    )}
                  </div>
                  <AccordionContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-2 pb-4">
                      {soundEffects
                        .filter((effect) => effect.category === category)
                        .map((effect) => (
                          <IlluminatedToggle
                            key={effect.name}
                            active={effect.isPlaying}
                            onToggle={() => toggleSoundEffect(effect.name)}
                            label={effect.name}
                          />
                        ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </div>
      </div>
    </div>
  )
}

