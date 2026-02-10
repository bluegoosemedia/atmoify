"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { InstructionDialog } from "@/components/InstructionDialog"
import AudioPlayer from "@/components/audio-player"
import SoundEffects from "@/components/sound-effects/SoundEffects"
import Mixer from "@/components/mixer"
import BottomMenu from "@/components/BottomMenu"

type TabType = "audio-tracks" | "mixer" | "sound-effects"

export default function Home() {
  const [currentTab, setCurrentTab] = useState<TabType>("audio-tracks")

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-grow overflow-hidden relative bg-background">
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-300",
            currentTab === "audio-tracks" ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none",
          )}
        >
          <AudioPlayer isVisible={currentTab === "audio-tracks"} />
        </div>
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-300",
            currentTab === "mixer" ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none",
          )}
        >
          <Mixer isVisible={currentTab === "mixer"} />
        </div>
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-300",
            currentTab === "sound-effects" ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none",
          )}
        >
          <SoundEffects isVisible={currentTab === "sound-effects"} />
        </div>
      </div>
      <BottomMenu currentTab={currentTab} setCurrentTab={setCurrentTab} />
      <InstructionDialog />
    </div>
  )
}

