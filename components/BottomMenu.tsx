"use client"

import { useState } from "react"
import { Menu, GitlabIcon as GitHub, Coffee, Clock, Save, Upload, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from "@/components/ui/dropdown-menu"
import { TimerSelector } from "./timer/TimerSelector"
import { SaveProfileDialog } from "@/components/SaveProfileDialog"
import { LoadProfileDialog } from "@/components/LoadProfileDialog"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useTheme } from "@/hooks/useTheme"
import { themeKeys } from "@/lib/themes"
import { ThemedLogo } from "@/components/ThemedLogo"

type TabType = "audio-tracks" | "mixer" | "sound-effects"

const Tab = ({
  children,
  isActive,
  onClick,
}: { children: React.ReactNode; isActive: boolean; onClick: () => void }) => (
  <button
    className={cn(
      "px-6 py-4 text-sm font-semibold transition-all duration-200 rounded-t-md relative",
      "border-t-2 border-x-2 border-border",
      isActive
        ? "bg-card text-primary border-t-primary shadow-[0_-2px_10px_rgba(0,0,0,0.3)]"
        : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary",
    )}
    onClick={onClick}
  >
    {children}
    {isActive && (
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_4px_hsl(var(--primary)),0_0_8px_hsl(var(--primary)/0.8),0_0_16px_hsl(var(--primary)/0.3)]" />
    )}
  </button>
)

export default function BottomMenu({
  currentTab,
  setCurrentTab,
}: { currentTab: TabType; setCurrentTab: (tab: TabType) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isTimerDialogOpen, setIsTimerDialogOpen] = useState(false)
  const [isSaveProfileDialogOpen, setIsSaveProfileDialogOpen] = useState(false)
  const [isLoadProfileDialogOpen, setIsLoadProfileDialogOpen] = useState(false)
  const { currentTheme, setTheme, themes } = useTheme()

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <header className="bg-secondary/80 backdrop-blur-sm z-50 w-full border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.5)] relative">
      <div className="relative flex h-auto w-full items-end justify-center px-4 sm:px-6 mx-auto max-w-screen-2xl">
        {/* Tabs - Center */}
        <div className="flex items-end space-x-1">
          <Tab isActive={currentTab === "audio-tracks"} onClick={() => setCurrentTab("audio-tracks")}>
            Tracks
          </Tab>
          <Tab isActive={currentTab === "mixer"} onClick={() => setCurrentTab("mixer")}>
            Mixer
          </Tab>
          <Tab isActive={currentTab === "sound-effects"} onClick={() => setCurrentTab("sound-effects")}>
            Effects
          </Tab>
        </div>
      </div>
      
      {/* Logo - Bottom Left Corner */}
      <div className="fixed left-4 sm:left-6 bottom-2 z-[60]">
        <ThemedLogo />
      </div>
      
      {/* Menu - Bottom Right Corner */}
      <div className="fixed right-4 sm:right-6 bottom-2 z-[60]">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" onClick={toggleMenu} className="h-9 w-9">
                <motion.div
                  animate={isOpen ? "open" : "closed"}
                  variants={{
                    open: { rotate: 180 },
                    closed: { rotate: 0 },
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-5 w-5" />
                </motion.div>
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mb-2">
              <DropdownMenuItem onSelect={() => setIsTimerDialogOpen(true)}>
                <Clock className="mr-2 h-4 w-4" />
                <span>Timer</span>
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Palette className="mr-2 h-4 w-4" />
                  <span>Theme</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {themeKeys.map((themeKey) => (
                    <DropdownMenuItem
                      key={themeKey}
                      onSelect={() => setTheme(themeKey)}
                      className={cn(
                        currentTheme === themeKey && "bg-primary/10 text-primary"
                      )}
                    >
                      {themes[themeKey].name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
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
      </header>
    )
  }


