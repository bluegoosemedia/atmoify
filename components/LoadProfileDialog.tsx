"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSoundProfiles, deleteSoundProfile, isStorageAvailable, type SoundProfile } from "@/lib/cookieUtils"
import { useAtom } from "jotai"
import { soundEffectsAtom, audioTracksAtom } from "@/lib/atoms"
import { useToast } from "@/components/ui/use-toast"

interface LoadProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoadProfileDialog({ open, onOpenChange }: LoadProfileDialogProps) {
  const [profiles, setProfiles] = useState<SoundProfile[]>([])
  const [selectedProfile, setSelectedProfile] = useState("")
  const [soundEffects, setSoundEffects] = useAtom(soundEffectsAtom)
  const [audioTracks, setAudioTracks] = useAtom(audioTracksAtom)
  const { toast } = useToast()

  const loadProfiles = useCallback(() => {
    if (typeof window !== "undefined" && isStorageAvailable()) {
      try {
        const loadedProfiles = getSoundProfiles()
        console.log("Loaded profiles in LoadProfileDialog:", loadedProfiles)
        setProfiles(loadedProfiles)
      } catch (error) {
        console.error("Error loading profiles:", error)
        toast({
          title: "Error",
          description: "Failed to load profiles. Please try again.",
          variant: "destructive",
        })
      }
    } else {
      console.error("Storage is not available")
      toast({
        title: "Error",
        description: "Storage is not available. Please enable local storage to load profiles.",
        variant: "destructive",
      })
    }
  }, [toast])

  useEffect(() => {
    if (open) {
      loadProfiles()
    }
  }, [open, loadProfiles])

  const handleLoad = () => {
    const profile = profiles.find((p) => p.name === selectedProfile)
    if (profile) {
      try {
        // Stop all currently playing sound effects
        const updatedCurrentEffects = soundEffects.map((effect) => ({
          ...effect,
          isPlaying: false,
          volume: 0,
        }))
        setSoundEffects(updatedCurrentEffects)

        // Load new sound effects
        const newSoundEffects = profile.soundEffects.map((effect) => ({
          ...effect,
          isPlaying: effect.isPlaying,
          volume: effect.volume,
        }))
        setSoundEffects(newSoundEffects)

        // Update audio tracks
        setAudioTracks(profile.audioTracks)

        onOpenChange(false)
        toast({
          title: "Success",
          description: "Sound profile loaded successfully.",
        })

        // Dispatch custom event to notify SoundEffects component
        window.dispatchEvent(new CustomEvent("profileLoaded", { detail: { soundEffects: newSoundEffects } }))
      } catch (error) {
        console.error("Error loading sound profile:", error)
        toast({
          title: "Error",
          description: "Failed to load sound profile. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleDelete = () => {
    if (selectedProfile) {
      try {
        deleteSoundProfile(selectedProfile)
        loadProfiles() // Reload profiles after deletion
        setSelectedProfile("")
        toast({
          title: "Success",
          description: "Sound profile deleted successfully.",
        })
      } catch (error) {
        console.error("Error deleting sound profile:", error)
        toast({
          title: "Error",
          description: "Failed to delete sound profile. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Load Sound Profile</DialogTitle>
          <DialogDescription>Choose a profile to load or delete.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Select onValueChange={setSelectedProfile} value={selectedProfile}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a profile" />
            </SelectTrigger>
            <SelectContent>
              {profiles.length > 0 ? (
                profiles.map((profile) => (
                  <SelectItem key={profile.name} value={profile.name}>
                    {profile.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-profiles" disabled>
                  No profiles available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button onClick={handleDelete} variant="outline" disabled={!selectedProfile}>
            Delete
          </Button>
          <Button onClick={handleLoad} disabled={!selectedProfile}>
            Load Profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

