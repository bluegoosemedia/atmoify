"use client"

import React, { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { useTimer } from "@/components/timer/TimerProvider"
import { Button } from "@/components/ui/button"
import { Pause, Play, Square, GripVertical } from "lucide-react"

export function DraggableTimerDisplay() {
  const { timer, stopTimer, getRemainingTime, pauseTimer, resumeTimer } = useTimer()
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [constraints, setConstraints] = useState({ top: 0, left: 0, right: 0, bottom: 0 })

  const updateConstraints = useCallback(() => {
    const width = 256 // Width of the timer display
    const height = 200 // Approximate height of the timer display

    setConstraints({
      top: 0,
      left: 0,
      right: window.innerWidth - width,
      bottom: window.innerHeight - height,
    })
  }, [])

  useEffect(() => {
    updateConstraints()
    window.addEventListener("resize", updateConstraints)
    return () => window.removeEventListener("resize", updateConstraints)
  }, [updateConstraints])

  useEffect(() => {
    if (timer.endTime !== null && !isPaused) {
      const updateTimer = () => {
        const remaining = getRemainingTime()
        if (remaining !== null) {
          setTimeLeft(Math.floor(remaining / 1000))
        } else {
          setTimeLeft(null)
          stopTimer()
        }
      }

      updateTimer()
      const interval = setInterval(updateTimer, 1000)

      return () => clearInterval(interval)
    }
  }, [timer.endTime, getRemainingTime, stopTimer, isPaused])

  if (timeLeft === null || timer.type === null) return null

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  const togglePause = () => {
    if (isPaused) {
      resumeTimer()
    } else {
      pauseTimer()
    }
    setIsPaused(!isPaused)
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.1}
      dragConstraints={constraints}
      className="fixed z-50 bg-card border border-border rounded-lg shadow-lg p-4 w-64 pointer-events-auto"
      initial={{ top: 70, left: 70 }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{timer.type.charAt(0).toUpperCase() + timer.type.slice(1)} Timer</h3>
        <div className="cursor-move">
          <GripVertical size={20} />
        </div>
      </div>
      <div className="text-3xl font-mono mb-4 text-center">
        {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
      </div>
      <div className="flex justify-center space-x-2">
        <Button onClick={togglePause} size="sm">
          {isPaused ? <Play size={16} /> : <Pause size={16} />}
        </Button>
        <Button onClick={stopTimer} size="sm" variant="destructive">
          <Square size={16} />
        </Button>
      </div>
    </motion.div>
  )
}

