"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"

type TimerDuration = 15 | 30 | 60 | "custom"

interface TimerOptionProps {
  value: TimerDuration
  label: string
  selected: boolean
  onClick: () => void
}

interface FocusTimerProps {
  onStart: (duration: number) => void
}

const TimerOption = ({ value, label, selected, onClick }: TimerOptionProps) => (
  <motion.div
    className={`flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer transition-all border-2 hover:border-primary ${
      selected ? "bg-primary text-primary-foreground border-primary" : "bg-card text-card-foreground border-border"
    }`}
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <span className="text-2xl font-bold">{typeof value === "number" ? value : "Custom"}</span>
    <span className="text-sm">{label}</span>
  </motion.div>
)

export function FocusTimer({ onStart }: FocusTimerProps) {
  const [duration, setDuration] = useState<TimerDuration>(15)
  const [customDuration, setCustomDuration] = useState<number>(15)
  const [isCustom, setIsCustom] = useState(false)

  const handleDurationChange = (value: TimerDuration) => {
    setDuration(value)
    setIsCustom(value === "custom")
  }

  const handleStartTimer = useCallback(() => {
    const finalDuration = isCustom ? customDuration : (duration as number)
    onStart(finalDuration)
  }, [isCustom, customDuration, duration, onStart])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <TimerOption
          value={15}
          label="minutes"
          selected={duration === 15 && !isCustom}
          onClick={() => handleDurationChange(15)}
        />
        <TimerOption
          value={30}
          label="minutes"
          selected={duration === 30 && !isCustom}
          onClick={() => handleDurationChange(30)}
        />
        <TimerOption
          value={60}
          label="minutes"
          selected={duration === 60 && !isCustom}
          onClick={() => handleDurationChange(60)}
        />
      </div>
      <div className="text-center">
        <Button
          variant="ghost"
          className="text-sm text-muted-foreground"
          onClick={() => handleDurationChange("custom")}
        >
          Set custom duration
        </Button>
      </div>
      <AnimatePresence>
        {isCustom && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center space-y-2"
          >
            <Label htmlFor="custom-duration" className="text-center">
              Custom duration (minutes):
            </Label>
            <div className="flex items-center space-x-2">
              <Input
                id="custom-duration"
                type="number"
                min="1"
                value={customDuration}
                onChange={(e) => setCustomDuration(Math.max(1, Number.parseInt(e.target.value) || 1))}
                className="w-20 text-center"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Button onClick={handleStartTimer} className="w-full">
        Start Focus Timer
      </Button>
    </div>
  )
}

