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
  { name: 'Birds', file: '/sounds/birds.wav', category: 'Nature', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Cicadas', file: '/sounds/cicadas.wav', category: 'Nature', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Cold Wind', file: '/sounds/cold-wind.wav', category: 'Weather', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Crickets', file: '/sounds/crickets.wav', category: 'Nature', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Drum', file: '/sounds/drum.wav', category: 'Music', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 5 },
  { name: 'Frogs', file: '/sounds/frogs.wav', category: 'Nature', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Generic Ambience', file: '/sounds/generic-ambience.wav', category: 'Ambience', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Heavy Wind', file: '/sounds/heavy-wind.wav', category: 'Weather', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Light Wind', file: '/sounds/light-wind.wav', category: 'Weather', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Lute', file: '/sounds/lute.wav', category: 'Music', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 5 },
  { name: 'Rain Drizzle', file: '/sounds/rain-drizzle.wav', category: 'Weather', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Rain Heavy', file: '/sounds/rain-heavy.wav', category: 'Weather', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Rain Interior', file: '/sounds/rain-interior.wav', category: 'Weather', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Rain Light', file: '/sounds/rain-light.wav', category: 'Weather', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Rain Medium', file: '/sounds/rain-medium.wav', category: 'Weather', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Ship Bells', file: '/sounds/ship-bells.wav', category: 'Ambience', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Ship Creak', file: '/sounds/ship-creak.wav', category: 'Ambience', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Snow Heavy', file: '/sounds/snow-heavy.wav', category: 'Weather', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Snow Light', file: '/sounds/snow-light.wav', category: 'Weather', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Tavern Ambience', file: '/sounds/tavern-ambience.wav', category: 'Ambience', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Thunder Close', file: '/sounds/thunder-close.wav', category: 'Weather', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Thunder Distant', file: '/sounds/thunder-distant.wav', category: 'Weather', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Walking Gravel', file: '/sounds/walking-gravel.wav', category: 'Footsteps', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Walking Snow', file: '/sounds/walking-snow.wav', category: 'Footsteps', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Water Stream', file: '/sounds/water-stream.wav', category: 'Nature', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Water Waves', file: '/sounds/water-waves.wav', category: 'Nature', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Water Wheel', file: '/sounds/water-wheel.wav', category: 'Ambience', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Wind Coastal', file: '/sounds/wind-coastal.wav', category: 'Weather', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
  { name: 'Wind Forest', file: '/sounds/wind-forest.wav', category: 'Weather', isPlaying: false, volume: 50, playbackSpeed: 1, loopSpeed: 0 },
];

