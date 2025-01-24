import { atom } from 'jotai'
import { SoundEffect, initialSoundEffects } from './soundEffects'

type TimerState = {
  type: 'focus' | 'sleep' | null
  endTime: number | null
}

export const timerAtom = atom<TimerState>({
  type: null,
  endTime: null
})

export const soundEffectsAtom = atom<SoundEffect[]>(initialSoundEffects)

export const setSoundEffectsAtom = atom(
  null,
  (get, set, update: (prev: SoundEffect[]) => SoundEffect[]) => {
    set(soundEffectsAtom, update(get(soundEffectsAtom)))
  }
)

interface AudioTrack {
  id: number
  name: string
  url: string
  volume: number
  isPlaying: boolean
}

export const audioTracksAtom = atom<AudioTrack[]>([])

export const masterVolumeAtom = atom<number>(100)

