"use client"

import { useState } from "react"
import AudioPlayer from "../components/AudioPlayer"
import SoundEffects from "../components/SoundEffects"
import Mixer from "@/components/Mixer"
import Header from "@/components/Header"
import { InstructionDialog } from "@/components/InstructionDialog"
import { SaveProfileDialog } from "@/components/SaveProfileDialog"
import { LoadProfileDialog } from "@/components/LoadProfileDialog"
import { cn } from "@/lib/utils"

type TabType = "audio-tracks" | "mixer" | "sound-effects"

export default function Home() {
  const [currentTab, setCurrentTab] = useState<TabType>("audio-tracks")

  return (
    <div className="flex flex-col h-screen">
      <Header currentTab={currentTab} setCurrentTab={setCurrentTab} />
      <div className="flex-grow overflow-hidden relative bg-background">
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-300",
            currentTab === "audio-tracks" ? "opacity-100 z-10" : "opacity-0 z-0",
          )}
        >
          <AudioPlayer isVisible={currentTab === "audio-tracks"} />
        </div>
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-300",
            currentTab === "mixer" ? "opacity-100 z-10" : "opacity-0 z-0",
          )}
        >
          <Mixer isVisible={currentTab === "mixer"} />
        </div>
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-300",
            currentTab === "sound-effects" ? "opacity-100 z-10" : "opacity-0 z-0",
          )}
        >
          <SoundEffects isVisible={currentTab === "sound-effects"} />
        </div>
      </div>
      <InstructionDialog />
    </div>
  )
}

