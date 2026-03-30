export type VisualMode = 'waveform' | 'bars' | 'circular' | 'particles';
export type Theme = 'cyberpunk' | 'ocean' | 'fire';

export interface Track {
  id: string;
  file: File;
  url: string;
  name: string;
}

export interface AudioStats {
  volume: number;
  bass: number;
  mids: number;
  treble: number;
  rms: number;
  fps: number;
}
