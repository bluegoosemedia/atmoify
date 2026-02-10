'use client'

import { useState, useRef, useEffect } from 'react'
import YouTube, { YouTubeEvent, YouTubePlayer } from 'react-youtube'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, X, Plus, Pause, Play, Repeat, Repeat1 } from 'lucide-react'
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
      isPlaying: false,
      loopPlaylist: false,
      loopTrack: false
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
    <div className={`h-full overflow-y-auto bg-background ${isVisible ? '' : 'hidden'}`}>
      <div className="min-h-full p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Label className="text-2xl font-bold text-foreground uppercase tracking-wide">Audio Tracks</Label>
          <Button 
            onClick={addAudioTrack} 
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_20px_hsl(var(--primary)/0.5)] transition-all"
          >
            <Plus className="h-5 w-5 mr-2" /> Add Track
          </Button>
        </div>
        {audioTracks.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground bg-card/30 rounded-lg border border-border">
            No active audio tracks. Add a track to get started!
          </div>
        ) : (
          <div className="space-y-6">
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
  )
}

interface AudioTrackItemProps {
  track: { id: number; name: string; url: string; volume: number; isPlaying: boolean; loopPlaylist: boolean; loopTrack: boolean };
  onRemove: () => void;
  playerRef: (player: YouTubePlayer) => void;
}

function AudioTrackItem({ track, onRemove, playerRef }: AudioTrackItemProps) {
  const [audioTracks, setAudioTracks] = useAtom(audioTracksAtom)
  const [isVideoVisible, setIsVideoVisible] = useState<boolean>(true)
  const youtubePlayerRef = useRef<YouTubePlayer | null>(null)
  const shouldAutoPlayRef = useRef<boolean>(false)
  const currentVideoIdRef = useRef<string | null>(null)

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

  const toggleLoopPlaylist = () => {
    setAudioTracks(prev => prev.map(t => 
      t.id === track.id ? { ...t, loopPlaylist: !t.loopPlaylist } : t
    ))
  }

  const toggleLoopTrack = () => {
    setAudioTracks(prev => prev.map(t => 
      t.id === track.id ? { ...t, loopTrack: !t.loopTrack } : t
    ))
  }

  const getYouTubeId = (url: string) => {
    // Handle playlist URLs that also contain a video ID
    const playlistWithVideoMatch = url.match(/[?&]v=([^&]+)/)
    if (playlistWithVideoMatch && playlistWithVideoMatch[1].length === 11) {
      return playlistWithVideoMatch[1]
    }
    
    // Standard video URL patterns
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  const getPlaylistId = (url: string) => {
    const playlistMatch = url.match(/[?&]list=([^&]+)/)
    return playlistMatch ? playlistMatch[1] : null
  }

  const handleVideoReady = (event: YouTubeEvent) => {
    youtubePlayerRef.current = event.target
    playerRef(event.target)
    event.target.setVolume(track.volume)
    
    // Track current video ID for loop track functionality
    try {
      const videoData = event.target.getVideoData()
      if (videoData && videoData.video_id) {
        currentVideoIdRef.current = videoData.video_id
      }
    } catch (e) {
      // Ignore errors
    }
    
    // Set loop state via API
    const playlistId = getPlaylistId(track.url)
    if (playlistId) {
      event.target.setLoop(track.loopPlaylist)
    }
    
    if (track.isPlaying) {
      shouldAutoPlayRef.current = true
      event.target.playVideo()
    }
  }

  const handleVideoStateChange = (event: YouTubeEvent) => {
    const newState = event.data
    const playlistId = getPlaylistId(track.url)
    
    // Update current video ID when video changes
    if (newState === YouTube.PlayerState.PLAYING || newState === YouTube.PlayerState.CUED) {
      try {
        const videoData = event.target.getVideoData()
        if (videoData && videoData.video_id) {
          currentVideoIdRef.current = videoData.video_id
        }
      } catch (e) {
        // Ignore errors
      }
    }
    
    // For playlists: When next video is cued (ready), automatically play it if we should auto-play
    if (newState === YouTube.PlayerState.CUED && playlistId && shouldAutoPlayRef.current) {
      if (youtubePlayerRef.current) {
        youtubePlayerRef.current.playVideo()
      }
    }
    
    // Update shouldAutoPlayRef and isPlaying state based on player state
    if (newState === YouTube.PlayerState.PLAYING) {
      shouldAutoPlayRef.current = true
      setAudioTracks(prev => prev.map(t => 
        t.id === track.id ? { ...t, isPlaying: true } : t
      ))
    } else if (newState === YouTube.PlayerState.PAUSED) {
      // In playlists: ignore PAUSED events during navigation (when shouldAutoPlay is true)
      // Only process PAUSED if user explicitly paused or not in playlist context
      if (!playlistId || !shouldAutoPlayRef.current) {
        shouldAutoPlayRef.current = false
        setAudioTracks(prev => prev.map(t => 
          t.id === track.id ? { ...t, isPlaying: false } : t
        ))
      }
    }
  }

  const togglePlayPause = () => {
    if (youtubePlayerRef.current) {
      if (track.isPlaying) {
        shouldAutoPlayRef.current = false
        youtubePlayerRef.current.pauseVideo()
      } else {
        shouldAutoPlayRef.current = true
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

  useEffect(() => {
    if (youtubePlayerRef.current) {
      const playlistId = getPlaylistId(track.url)
      if (playlistId) {
        youtubePlayerRef.current.setLoop(track.loopPlaylist)
      }
    }
  }, [track.loopPlaylist, track.url])

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
      <div className="flex flex-col space-y-3">
        <div className="flex items-center justify-between gap-3">
          <Input
            type="text"
            placeholder="Track name"
            value={track.name}
            onChange={handleNameChange}
            className="flex-grow bg-input text-foreground border-border focus:ring-primary h-10 font-semibold"
          />
          <Button 
            onClick={togglePlayPause}
            variant="ghost"
            size="icon"
            className={`h-10 w-10 border-2 transition-all ${track.isPlaying ? 'border-primary bg-primary/10 text-primary' : 'border-border'}`}
          >
            {track.isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          {getPlaylistId(track.url) && (
            <Button 
              onClick={toggleLoopPlaylist}
              variant="ghost"
              size="icon"
              className={`h-10 w-10 border-2 transition-all ${track.loopPlaylist ? 'border-primary bg-primary/10 text-primary' : 'border-border'}`}
              title="Loop Playlist"
            >
              <Repeat className="h-5 w-5" />
            </Button>
          )}
          {!getPlaylistId(track.url) && (
            <Button 
              onClick={toggleLoopTrack}
              variant="ghost"
              size="icon"
              className={`h-10 w-10 border-2 transition-all ${track.loopTrack ? 'border-primary bg-primary/10 text-primary' : 'border-border'}`}
              title="Loop Track"
            >
              <Repeat1 className="h-5 w-5" />
            </Button>
          )}
          <Button 
            onClick={onRemove} 
            variant="ghost" 
            size="icon"
            className="h-10 w-10 hover:bg-destructive/20 hover:text-destructive"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Input
            type="text"
            placeholder="YouTube URL"
            value={track.url}
            onChange={handleSourceChange}
            className="flex-grow bg-input text-foreground border-border focus:ring-primary h-10"
          />
          <Button 
            onClick={toggleVideoVisibility} 
            variant="ghost" 
            size="icon"
            className="h-10 w-10 border-2 border-border"
          >
            {isVideoVisible ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Button>
        </div>
        {track.url && (
          <div className={`mt-2 overflow-hidden transition-all duration-300 ${isVideoVisible ? 'h-auto opacity-100' : 'h-0 opacity-0'}`}>
            <div className="aspect-video rounded-md overflow-hidden border-2 border-border/50">
              {(() => {
                const videoId = getYouTubeId(track.url)
                const playlistId = getPlaylistId(track.url)
                
                // For pure playlist URLs (no video ID), we need special handling
                if (!videoId && playlistId) {
                  return (
                    <YouTube
                      opts={{
                        width: '100%',
                        height: '100%',
                        playerVars: {
                          autoplay: 0,
                          controls: 1,
                          modestbranding: 1,
                          listType: 'playlist',
                          list: playlistId,
                        },
                      }}
                      onReady={handleVideoReady}
                      onStateChange={handleVideoStateChange}
                      className="w-full h-full"
                    />
                  )
                }
                
                // For video URLs (with or without playlist)
                return (
                  <YouTube
                    key={!playlistId && track.loopTrack ? 'loop' : 'normal'}
                    videoId={videoId || ''}
                    opts={{
                      width: '100%',
                      height: '100%',
                      playerVars: {
                        autoplay: 0,
                        controls: 1,
                        modestbranding: 1,
                        ...(playlistId && { list: playlistId }),
                        ...(!playlistId && track.loopTrack && { loop: 1, playlist: videoId || '' }),
                      },
                    }}
                    onReady={handleVideoReady}
                    onStateChange={handleVideoStateChange}
                    className="w-full h-full"
                  />
                )
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

