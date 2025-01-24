"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { saveSoundProfile, isStorageAvailable, getSoundProfiles } from "@/lib/cookieUtils"
import { useAtom } from "jotai"
import { soundEffectsAtom, audioTracksAtom } from "@/lib/atoms"
import { useToast } from "@/components/ui/use-toast"

interface SaveProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SaveProfileDialog({ open, onOpenChange }: SaveProfileDialogProps) {
  const [profileName, setProfileName] = useState("")
  const [soundEffects] = useAtom(soundEffectsAtom)
  const [audioTracks] = useAtom(audioTracksAtom)
  const { toast } = useToast()

  const handleSave = () => {
    if (profileName.trim()) {
      if (!isStorageAvailable()) {
        toast({
          title: "Error",
          description: "Storage is not available. Please enable local storage to save profiles.",
          variant: "destructive",
        })
        return
      }

      try {
        const existingProfiles = getSoundProfiles()
        if (existingProfiles.some((profile) => profile.name === profileName.trim())) {
          toast({
            title: "Error",
            description: "A profile with this name already exists. Please choose a different name.",
            variant: "destructive",
          })
          return
        }

        saveSoundProfile({
          name: profileName.trim(),
          soundEffects,
          audioTracks,
        })
        setProfileName("")
        onOpenChange(false)
        toast({
          title: "Success",
          description: "Sound profile saved successfully.",
        })
      } catch (error) {
        console.error("Error saving sound profile:", error)
        toast({
          title: "Error",
          description: "Failed to save sound profile. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Sound Profile</DialogTitle>
          <DialogDescription>Create a new profile with your current sound settings.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="profile-name" className="text-right">
              Name
            </Label>
            <Input
              id="profile-name"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save Profile</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

