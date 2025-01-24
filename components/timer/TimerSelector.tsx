"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { motion } from "framer-motion"
import { FocusTimer } from "./FocusTimer"
import { SleepTimer } from "./SleepTimer"
import { useTimer } from "@/components/timer/TimerProvider"

type TimerType = "focus" | "sleep"

interface TimerSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TimerSelector({ open, onOpenChange }: TimerSelectorProps) {
  const [timerType, setTimerType] = useState<TimerType>("focus")
  const { startTimer } = useTimer()

  const handleStartTimer = useCallback(
    (duration: number) => {
      startTimer(timerType, duration)
      onOpenChange(false)
    },
    [startTimer, timerType, onOpenChange],
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <DialogHeader>
            <DialogTitle>Create Timer</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="flex justify-center space-x-4">
              <Button
                variant={timerType === "focus" ? "default" : "outline"}
                className="w-full"
                onClick={() => setTimerType("focus")}
              >
                Focus
              </Button>
              <Button
                variant={timerType === "sleep" ? "default" : "outline"}
                className="w-full"
                onClick={() => setTimerType("sleep")}
              >
                Sleep
              </Button>
            </div>
            {timerType === "focus" ? (
              <FocusTimer onStart={handleStartTimer} />
            ) : (
              <SleepTimer onStart={handleStartTimer} />
            )}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

