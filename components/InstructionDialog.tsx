"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import Cookies from "js-cookie"
import Image from "next/image"

export function InstructionDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [doNotShowAgain, setDoNotShowAgain] = useState(false)

  useEffect(() => {
    const hasSeenInstructions = Cookies.get("dismissedInstructions")
    if (!hasSeenInstructions) {
      setIsOpen(true)
    }
  }, [])

  const handleClose = () => {
    if (doNotShowAgain) {
      Cookies.set("dismissedInstructions", "true", { expires: 365 })
    }
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex justify-center mb-4">
          <Image src="/atmoify-logo.png" alt="Atmoify Logo" width={64} height={64} />
        </div>
        <DialogHeader>
          <DialogTitle>Welcome to Atmoify! 🎉</DialogTitle>
          <DialogDescription>Create your perfect atmosphere for working, sleeping, or studying. </DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="grid gap-4 pb-2">
          <div className="space-y-2">
            <h3 className="font-medium">🎵 Adding Audio Tracks</h3>
            <p className="text-sm text-muted-foreground">
              On the Audio Tracks tab, click "Add Track" and paste a link to a YouTube video.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">🔊 Using Sound Effects</h3>
            <p className="text-sm text-muted-foreground">
              On the Sound Effects tab, toggle on and off various ambient sounds.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">🎚️ Mixing Sounds</h3>
            <p className="text-sm text-muted-foreground">
              On the Mixer tab, adjust the volume of each audio track and sound effect.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">💾 Saving Profiles</h3>
            <p className="text-sm text-muted-foreground">
              In the menu, click "Save Profile" to store your current setup.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">⏲️ Using Timers</h3>
            <p className="text-sm text-muted-foreground">
              In the menu, set focus or sleep timers for your sessions.
            </p>
          </div>
        </div>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2 items-center">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <Checkbox
              id="doNotShowAgain"
              checked={doNotShowAgain}
              onCheckedChange={(checked) => setDoNotShowAgain(checked as boolean)}
            />
            <label
              htmlFor="doNotShowAgain"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Don't show this again
            </label>
          </div>
          <Button onClick={handleClose} className="w-full sm:w-auto">
            Got it, thanks!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

