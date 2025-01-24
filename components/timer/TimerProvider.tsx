"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { useAtom } from "jotai"
import { soundEffectsAtom, audioTracksAtom } from "@/lib/atoms"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface TimerContextType {
  timer: {
    type: "focus" | "sleep" | null
    endTime: number | null
  }
  startTimer: (type: "focus" | "sleep", duration: number) => void
  stopTimer: () => void
  pauseTimer: () => void
  resumeTimer: () => void
  getRemainingTime: () => number | null
  duration: number
  isCustom: boolean
  customDuration: number
  setDuration: (duration: number) => void
  setIsCustom: (isCustom: boolean) => void
  setCustomDuration: (duration: number) => void
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [timer, setTimer] = useState<{
    type: "focus" | "sleep" | null
    endTime: number | null
    pausedTimeLeft: number | null
  }>({
    type: null,
    endTime: null,
    pausedTimeLeft: null,
  })
  const [showCompletionDialog, setShowCompletionDialog] = useState(false)
  const [, setSoundEffects] = useAtom(soundEffectsAtom)
  const [, setAudioTracks] = useAtom(audioTracksAtom)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const playCountRef = useRef(0)
  const timerStartTimeRef = useRef<number | null>(null)
  const [duration, setDuration] = useState<number>(15)
  const [isCustom, setIsCustom] = useState<boolean>(false)
  const [customDuration, setCustomDuration] = useState<number>(15)
  const [completedTimerType, setCompletedTimerType] = useState<"focus" | "sleep" | null>(null)

  const startTimer = useCallback((type: "focus" | "sleep", duration: number) => {
    const startTime = Date.now()
    const endTime = startTime + duration * 60 * 1000
    setTimer({ type, endTime, pausedTimeLeft: null })
    timerStartTimeRef.current = startTime
  }, [])

  const stopTimer = useCallback(() => {
    setTimer({ type: null, endTime: null, pausedTimeLeft: null })
    timerStartTimeRef.current = null
  }, [])

  const pauseTimer = useCallback(() => {
    if (timer.endTime) {
      const remainingTime = timer.endTime - Date.now()
      setTimer((prev) => ({ ...prev, pausedTimeLeft: remainingTime, endTime: null }))
    }
  }, [timer.endTime])

  const resumeTimer = useCallback(() => {
    if (timer.pausedTimeLeft !== null) {
      const newEndTime = Date.now() + timer.pausedTimeLeft
      setTimer((prev) => ({ ...prev, endTime: newEndTime, pausedTimeLeft: null }))
    }
  }, [timer.pausedTimeLeft])

  const getRemainingTime = useCallback(() => {
    if (timer.endTime === null) return timer.pausedTimeLeft
    const remaining = timer.endTime - Date.now()
    return remaining > 0 ? remaining : 0
  }, [timer.endTime, timer.pausedTimeLeft])

  const playAlarm = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/alarm.mp3")
      audioRef.current.addEventListener("ended", () => {
        playCountRef.current += 1
        if (playCountRef.current < 2) {
          audioRef.current?.play().catch((error) => console.error("Error playing alarm:", error))
        }
      })
    }

    playCountRef.current = 0
    audioRef.current.play().catch((error) => console.error("Error playing alarm:", error))
  }, [])

  const handleTimerCompletion = useCallback(() => {
    setCompletedTimerType(timer.type)
    if (timer.type === "sleep") {
      // Pause YouTube videos
      const youtubeIframes = document.querySelectorAll('iframe[src*="youtube.com"]') as NodeListOf<HTMLIFrameElement>
      youtubeIframes.forEach((iframe) => {
        iframe.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', "*")
      })

      // Mute sound effects
      setSoundEffects((prev) => prev.map((effect) => ({ ...effect, volume: 0 })))

      // Update audio tracks to paused state
      setAudioTracks((prev) => prev.map((track) => ({ ...track, isPlaying: false })))

      // Dispatch custom event to update UI
      window.dispatchEvent(new CustomEvent("sleepTimerEnded"))
    } else if (timer.type === "focus") {
      playAlarm()
    }

    setShowCompletionDialog(true)
    stopTimer()
  }, [timer.type, setSoundEffects, setAudioTracks, playAlarm, stopTimer])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null

    const checkTimer = () => {
      if (timer.endTime !== null) {
        const remaining = getRemainingTime()
        if (remaining !== null && remaining <= 0) {
          handleTimerCompletion()
        } else {
          timeoutId = setTimeout(checkTimer, 1000)
        }
      }
    }

    checkTimer()

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [timer.endTime, getRemainingTime, handleTimerCompletion])

  const handleCompletionDialogClose = () => {
    setShowCompletionDialog(false)
    setCompletedTimerType(null)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  return (
    <TimerContext.Provider
      value={{
        timer,
        startTimer,
        stopTimer,
        pauseTimer,
        resumeTimer,
        getRemainingTime,
        duration,
        isCustom,
        customDuration,
        setDuration,
        setIsCustom,
        setCustomDuration,
      }}
    >
      {children}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent className="sm:max-w-[425px] bg-card border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-center">
              {completedTimerType === "focus" ? "Focus Time Complete!" : "Sleep Timer Finished"}
            </DialogTitle>
          </DialogHeader>
          <AnimatePresence>
            {showCompletionDialog && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="py-6 flex flex-col items-center space-y-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 10 }}
                  className="rounded-full bg-primary/20 p-3"
                >
                  {completedTimerType === "focus" ? (
                    <Sun className="h-12 w-12 text-primary" />
                  ) : (
                    <Moon className="h-12 w-12 text-primary" />
                  )}
                </motion.div>
                <p className="text-center text-muted-foreground">
                  {completedTimerType === "focus"
                    ? "Great job! Take a moment to stretch and relax."
                    : "Your sleep timer has ended. All audio has been paused."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          <DialogFooter>
            <Button onClick={handleCompletionDialogClose} className="w-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TimerContext.Provider>
  )
}

export function useTimer() {
  const context = useContext(TimerContext)
  if (context === undefined) {
    throw new Error("useTimer must be used within a TimerProvider")
  }
  return context
}

