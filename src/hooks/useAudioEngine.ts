import { useState, useRef, useEffect } from 'react';
import { Track, AudioStats } from '../types';

export function useAudioEngine(audioRef: React.RefObject<HTMLAudioElement | null>) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [stats, setStats] = useState<AudioStats>({ volume: 0, bass: 0, mids: 0, treble: 0, rms: 0, fps: 0 });
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const frameCount = useRef(0);
  const lastFpsUpdate = useRef(performance.now());
  const shake = useRef(0);

  const initAudio = () => {
    if (!audioRef.current || audioContextRef.current) return;
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 1024;
    sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
    sourceRef.current.connect(analyserRef.current);
    analyserRef.current.connect(audioContextRef.current.destination);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    initAudio();
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume();
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const updateStats = (dataArray: Uint8Array) => {
    const bufferLength = dataArray.length;
    let total = 0, b = 0, m = 0, t = 0;
    const bCount = Math.floor(bufferLength * 0.05);
    const mCount = Math.floor(bufferLength * 0.3);

    for (let i = 0; i < bufferLength; i++) {
        total += dataArray[i];
        if (i < bCount) b += dataArray[i];
        else if (i < bCount + mCount) m += dataArray[i];
        else t += dataArray[i];
    }
    const avgVol = total / bufferLength;
    const bassVal = b / bCount;
    
    // FPS tracking
    frameCount.current++;
    const now = performance.now();
    let currentFps = stats.fps;
    if (now - lastFpsUpdate.current > 1000) {
      currentFps = Math.round((frameCount.current * 1000) / (now - lastFpsUpdate.current));
      frameCount.current = 0;
      lastFpsUpdate.current = now;
    }

    if (bassVal > 210) shake.current = 15;

    setStats({
      volume: avgVol,
      bass: bassVal,
      mids: m / mCount,
      treble: t / (bufferLength - bCount - mCount),
      rms: Math.sqrt(avgVol / 255) * 100,
      fps: currentFps
    });
  };

  return {
    isPlaying,
    setIsPlaying,
    stats,
    togglePlay,
    analyser: analyserRef.current,
    shake,
    updateStats
  };
}
