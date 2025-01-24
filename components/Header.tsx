"use client"

import { useState } from "react"
import { Menu, GitlabIcon as GitHub, Coffee, Clock, Save, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { TimerSelector } from "./timer/TimerSelector"
import { SaveProfileDialog } from "@/components/SaveProfileDialog"
import { LoadProfileDialog } from "@/components/LoadProfileDialog"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"

type TabType = "audio-tracks" | "mixer" | "sound-effects"

const Tab = ({
  children,
  isActive,
  onClick,
}: { children: React.ReactNode; isActive: boolean; onClick: () => void }) => (
  <button
    className={cn(
      "px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-200",
      "border-b-2",
      isActive
        ? "border-primary text-primary"
        : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground",
    )}
    onClick={onClick}
  >
    {children}
  </button>
)

export default function Header({
  currentTab,
  setCurrentTab,
}: { currentTab: TabType; setCurrentTab: (tab: TabType) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isTimerDialogOpen, setIsTimerDialogOpen] = useState(false)
  const [isSaveProfileDialogOpen, setIsSaveProfileDialogOpen] = useState(false)
  const [isLoadProfileDialogOpen, setIsLoadProfileDialogOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40 w-full border-b border-border/40">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 flex-shrink-0">
            <a className="flex items-center space-x-2" href="/">
              <Image src="/atmoify-logo.png" alt="Atmoify Logo" width={32} height={32} />
              <span className="font-bold hidden sm:inline">Atmoify</span>
            </a>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="flex space-x-1 sm:space-x-2 overflow-x-auto">
            <Tab isActive={currentTab === "audio-tracks"} onClick={() => setCurrentTab("audio-tracks")}>
              <span className="sm:hidden">Tracks</span>
              <span className="hidden sm:inline">Audio Tracks</span>
            </Tab>
            <Tab isActive={currentTab === "mixer"} onClick={() => setCurrentTab("mixer")}>
              Mixer
            </Tab>
            <Tab isActive={currentTab === "sound-effects"} onClick={() => setCurrentTab("sound-effects")}>
              <span className="sm:hidden">Sounds</span>
              <span className="hidden sm:inline">Sound Effects</span>
            </Tab>
          </div>
        </div>
        <div className="flex items-center justify-end">
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" onClick={toggleMenu}>
                <motion.div
                  animate={isOpen ? "open" : "closed"}
                  variants={{
                    open: { rotate: 180 },
                    closed: { rotate: 0 },
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-6 w-6" />
                </motion.div>
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onSelect={() => setIsTimerDialogOpen(true)}>
                <Clock className="mr-2 h-4 w-4" />
                <span>Timer</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setIsSaveProfileDialogOpen(true)}>
                <Save className="mr-2 h-4 w-4" />
                <span>Save Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setIsLoadProfileDialogOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                <span>Load Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="https://github.com/bluegoosemedia/atmoify"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center px-2 py-2 text-sm"
                >
                  <GitHub className="mr-2 h-4 w-4" />
                  <span>GitHub</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="https://www.buymeacoffee.com/alexmccormick"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center px-2 py-2 text-sm"
                >
                  <Coffee className="mr-2 h-4 w-4" />
                  <span>Support Me</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <TimerSelector open={isTimerDialogOpen} onOpenChange={setIsTimerDialogOpen} />
          <SaveProfileDialog open={isSaveProfileDialogOpen} onOpenChange={setIsSaveProfileDialogOpen} />
          <LoadProfileDialog open={isLoadProfileDialogOpen} onOpenChange={setIsLoadProfileDialogOpen} />
        </div>
      </div>
    </header>
  )
}

