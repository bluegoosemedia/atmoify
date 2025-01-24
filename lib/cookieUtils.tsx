import Cookies from "js-cookie"
import type { SoundEffect } from "@/lib/soundEffects"

interface AudioTrack {
  id: number
  name: string
  url: string
  volume: number
  isPlaying: boolean
}

export interface SoundProfile {
  name: string
  soundEffects: SoundEffect[]
  audioTracks: AudioTrack[]
}

const STORAGE_KEY = "atmoify_sound_profiles"

export function saveSoundProfile(profile: SoundProfile): void {
  if (typeof window === "undefined") return

  const existingProfiles = getSoundProfiles()
  const updatedProfiles = [...existingProfiles, profile]

  const dataToSave = JSON.stringify(updatedProfiles)

  // Save in both cookies and local storage
  try {
    Cookies.set(STORAGE_KEY, dataToSave, { expires: 365 })
    localStorage.setItem(STORAGE_KEY, dataToSave)
    console.log("Profile saved successfully:", profile.name)
  } catch (error) {
    console.error("Error saving profile:", error)
  }
}

export function getSoundProfiles(): SoundProfile[] {
  if (typeof window === "undefined") return []

  let profiles: SoundProfile[] = []

  // Try to get from local storage first
  try {
    const storageData = localStorage.getItem(STORAGE_KEY)
    console.log("Raw local storage data:", storageData)
    if (storageData) {
      profiles = JSON.parse(storageData)
      console.log("Profiles retrieved from local storage:", profiles)
      return profiles
    }
  } catch (error) {
    console.error("Error reading from local storage:", error)
  }

  // If not in local storage, try cookies
  try {
    const cookieData = Cookies.get(STORAGE_KEY)
    console.log("Raw cookie data:", cookieData)
    if (cookieData) {
      profiles = JSON.parse(cookieData)
      console.log("Profiles retrieved from cookies:", profiles)
    }
  } catch (error) {
    console.error("Error reading from cookies:", error)
  }

  console.log("Final profiles returned:", profiles)
  return profiles
}

export function deleteSoundProfile(profileName: string): void {
  if (typeof window === "undefined") return

  const existingProfiles = getSoundProfiles()
  const updatedProfiles = existingProfiles.filter((profile) => profile.name !== profileName)

  const dataToSave = JSON.stringify(updatedProfiles)

  // Update in both cookies and local storage
  try {
    Cookies.set(STORAGE_KEY, dataToSave, { expires: 365 })
    localStorage.setItem(STORAGE_KEY, dataToSave)
    console.log("Profile deleted successfully:", profileName)
  } catch (error) {
    console.error("Error deleting profile:", error)
  }
}

export function isStorageAvailable(): boolean {
  if (typeof window === "undefined") return false

  try {
    const testKey = "__storage_test__"
    localStorage.setItem(testKey, testKey)
    localStorage.removeItem(testKey)
    return true
  } catch (e) {
    return false
  }
}

