export interface SoundEffect {
  name: string;
  file: string;
  category: string;
  isPlaying: boolean;
  volume: number;
  playbackSpeed: number;
  loopSpeed: number;
}

export const initialSoundEffects: SoundEffect[] = [
  { name: 'Bar Ambience', file: '/sounds/bar ambience.mp3', category: 'Ambience', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Birds', file: '/sounds/birds.mp3', category: 'Nature', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Campfire', file: '/sounds/campfire.mp3', category: 'Ambience', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Heavy Wind', file: '/sounds/heavy wind.mp3', category: 'Weather', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Howling Wind', file: '/sounds/howling wind.mp3', category: 'Weather', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Nighttime Insects', file: '/sounds/insects at night.mp3', category: 'Nature', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Rain', file: '/sounds/moderate rain.mp3', category: 'Weather', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Rain In Car', file: '/sounds/rain in car.mp3', category: 'Weather', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Rain On Umbrella', file: '/sounds/rain on umbrella.mp3', category: 'Weather', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'River', file: '/sounds/river.mp3', category: 'Nature', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Seagulls', file: '/sounds/seagulls.mp3', category: 'Nature', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Stream', file: '/sounds/stream.mp3', category: 'Nature', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Thunderstorm', file: '/sounds/thunderstorm.mp3', category: 'Weather', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Urban Ambience', file: '/sounds/urban ambience.mp3', category: 'Ambience', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Waterfall', file: '/sounds/waterfall.mp3', category: 'Nature', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Waves on Rocks', file: '/sounds/waves in rocks.mp3', category: 'Nature', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Waves', file: '/sounds/waves.mp3', category: 'Nature', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Wind Chimes', file: '/sounds/wind chimes.mp3', category: 'Ambience', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Wind In Trees', file: '/sounds/wind in trees.mp3', category: 'Ambience', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
];

