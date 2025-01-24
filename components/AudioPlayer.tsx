'use client'

import { useState, useRef, useEffect } from 'react'
import YouTube, { YouTubeEvent, YouTubePlayer } from 'react-youtube'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, X, Plus, Pause, Play } from 'lucide-react'
import { useAtom } from 'jotai'
import { audioTracksAtom } from '@/lib/atoms'
import { Label } from '@/components/ui/label'

interface AudioPlayerProps {
  isVisible: boolean;
}

export default function AudioPlayer({ isVisible }: AudioPlayerProps) {
  const [audioTracks, setAudioTracks] = useAtom(audioTracksAtom)
  const playerRefs = useRef<{ [key: number]: YouTubePlayer }>({})

  const addAudioTrack = () => {
    const newTrackNumber = audioTracks.length + 1
    const newTrack = { 
      id: Date.now(), 
      name: `Audio Track ${newTrackNumber}`, 
      url: '', 
      volume: 50, 
      isPlaying: false 
    }
    setAudioTracks(prev => [...prev, newTrack])
  }

  const removeAudioTrack = (id: number) => {
    if (playerRefs.current[id]) {
      playerRefs.current[id].destroy()
      delete playerRefs.current[id]
    }
    setAudioTracks(prev => prev.filter(track => track.id !== id))
  }

  useEffect(() => {
    const handleAudioTrackRemoved = (event: CustomEvent) => {
      const { id } = event.detail
      setAudioTracks(prev => prev.filter(track => track.id !== id))
    }

    const handleSleepTimerEnded = () => {
      setAudioTracks(prev => prev.map(track => ({ ...track, isPlaying: false })))
    }

    window.addEventListener('audioTrackRemoved', handleAudioTrackRemoved as EventListener)
    window.addEventListener('sleepTimerEnded', handleSleepTimerEnded as EventListener)

    return () => {
      window.removeEventListener('audioTrackRemoved', handleAudioTrackRemoved as EventListener)
      window.removeEventListener('sleepTimerEnded', handleSleepTimerEnded as EventListener)
      Object.values(playerRefs.current).forEach(player => player.destroy())
    }
  }, [setAudioTracks])

  return (
    <div className={`h-full overflow-y-auto p-4 pt-6 ${isVisible ? '' : 'hidden'}`}>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="bg-card p-6 rounded-lg shadow-md space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-lg font-semibold text-foreground">Audio Tracks</Label>
            <Button 
              onClick={addAudioTrack} 
              size="sm"
              className="rounded-md px-2 py-1 text-sm bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 ease-in-out"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Track
            </Button>
          </div>
          {audioTracks.length === 0 ? (
            <p className="text-center text-muted-foreground">No active audio tracks. Add a track to get started!</p>
          ) : (
            <div className="space-y-4">
              {audioTracks.map(track => (
                <AudioTrackItem 
                  key={track.id} 
                  track={track} 
                  onRemove={() => removeAudioTrack(track.id)} 
                  playerRef={player => playerRefs.current[track.id] = player}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface AudioTrackItemProps {
  track: { id: number; name: string; url: string; volume: number; isPlaying: boolean };
  onRemove: () => void;
  playerRef: (player: YouTubePlayer) => void;
}

function AudioTrackItem({ track, onRemove, playerRef }: AudioTrackItemProps) {
  const [audioTracks, setAudioTracks] = useAtom(audioTracksAtom)
  const [isVideoVisible, setIsVideoVisible] = useState<boolean>(true)
  const youtubePlayerRef = useRef<YouTubePlayer | null>(null)

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setAudioTracks(prev => prev.map(t => t.id === track.id ? { ...t, name: newName } : t))
  }

  const handleSourceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAudioTracks(prev => prev.map(t => t.id === track.id ? { ...t, url: value } : t))
  }

  const toggleVideoVisibility = () => {
    setIsVideoVisible(!isVideoVisible)
  }

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  const handleVideoReady = (event: YouTubeEvent) => {
    youtubePlayerRef.current = event.target
    playerRef(event.target)
    event.target.setVolume(track.volume)
    if (track.isPlaying) {
      event.target.playVideo()
    }
  }

  const handleVideoStateChange = (event: YouTubeEvent) => {
    const newState = event.data
    setAudioTracks(prev => prev.map(t => 
      t.id === track.id ? { ...t, isPlaying: newState === YouTube.PlayerState.PLAYING } : t
    ))
  }

  const togglePlayPause = () => {
    if (youtubePlayerRef.current) {
      if (track.isPlaying) {
        youtubePlayerRef.current.pauseVideo()
      } else {
        youtubePlayerRef.current.playVideo()
      }
    }
  }

  useEffect(() => {
    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.setVolume(track.volume)
    }
  }, [track.volume])

  useEffect(() => {
    if (youtubePlayerRef.current) {
      if (track.isPlaying) {
        youtubePlayerRef.current.playVideo()
      } else {
        youtubePlayerRef.current.pauseVideo()
      }
    }
  }, [track.isPlaying])

  return (
    <div className="bg-card p-4 rounded-lg">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Track name"
            value={track.name}
            onChange={handleNameChange}
            className="flex-grow bg-input text-foreground border-input focus:ring-primary rounded-md"
          />
          <Button 
            onClick={onRemove} 
            variant="ghost" 
            size="sm"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="YouTube URL"
            value={track.url}
            onChange={handleSourceChange}
            className="flex-grow bg-input text-foreground border-input focus:ring-primary rounded-md"
          />
          <Button 
            onClick={toggleVideoVisibility} 
            variant="ghost" 
            size="sm"
          >
            {isVideoVisible ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button
            onClick={togglePlayPause}
            variant="ghost"
            size="sm"
          >
            {track.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        </div>
        {track.url && (
          <div className={`mt-2 overflow-hidden transition-all duration-300 ${isVideoVisible ? 'h-auto opacity-100' : 'h-0 opacity-0'}`}>
            <div className="aspect-video rounded-lg overflow-hidden">
              <YouTube
                videoId={getYouTubeId(track.url) || ''}
                opts={{
                  width: '100%',
                  height: '100%',
                  playerVars: {
                    autoplay: 0,
                    controls: 1,
                    modestbranding: 1,
                  },
                }}
                onReady={handleVideoReady}
                onStateChange={handleVideoStateChange}
                className="w-full h-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

