import { useRef, useEffect } from 'react';
import { VisualMode, Theme, Track } from '../types';
import { THEMES } from '../constants/themes';

interface VisualizerProps {
  analyser: AnalyserNode | null;
  visualMode: VisualMode;
  theme: Theme;
  isPlaying: boolean;
  bgImage: string | null;
  bgOpacity: number;
  bgBlur: number;
  bgPulse: number;
  onUpdateStats: (data: Uint8Array) => void;
  currentTrackName: string;
}

export default function Visualizer({ 
  analyser, visualMode, theme, isPlaying, bgImage, bgOpacity, bgBlur, bgPulse, onUpdateStats, currentTrackName 
}: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bgImgRef = useRef<HTMLImageElement | null>(null);
  const particles = useRef<{ x: number; y: number; vx: number; vy: number; size: number; color: string; life: number }[]>([]);
  const shake = useRef(0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (bgImage) {
      const img = new Image();
      img.src = bgImage;
      img.crossOrigin = "anonymous";
      img.onload = () => { bgImgRef.current = img; };
    } else {
      bgImgRef.current = null;
    }
  }, [bgImage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    if (particles.current.length === 0) {
      particles.current = Array.from({ length: 150 }, (_, i) => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 2 + 0.5,
        color: `hsla(${Math.random() * 360}, 70%, 75%, 0.5)`,
        life: Math.random()
      }));
    }

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      const bufferLength = analyser ? analyser.frequencyBinCount : 512;
      const dataArray = new Uint8Array(bufferLength);
      
      let bassVal = 0;
      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(dataArray);
        onUpdateStats(dataArray);
        const bCount = Math.floor(bufferLength * 0.05);
        let bSum = 0;
        for (let i = 0; i < bCount; i++) bSum += dataArray[i];
        bassVal = bSum / bCount;
        if (bassVal > 210) shake.current = 15;
      }

      const currentTheme = THEMES[theme];
      const bassIntensity = (bassVal / 255);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      ctx.save();
      if (shake.current > 0) {
        ctx.translate((Math.random() - 0.5) * shake.current, (Math.random() - 0.5) * shake.current);
        shake.current *= 0.9;
      }

      ctx.fillStyle = `rgba(2, 6, 23, ${visualMode === 'particles' ? 0.08 : 0.15})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (bgImgRef.current) {
        ctx.save();
        ctx.globalAlpha = bgOpacity;
        if (bgBlur > 0) ctx.filter = `blur(${bgBlur}px)`;
        const zoom = 1 + bassIntensity * bgPulse;
        ctx.drawImage(bgImgRef.current, (canvas.width - canvas.width * zoom)/2, (canvas.height - canvas.height * zoom)/2, canvas.width * zoom, canvas.height * zoom);
        ctx.restore();
      }

      if (analyser && isPlaying) {
        if (visualMode === 'bars') {
          const count = 128;
          for (let i = 0; i < count; i++) {
            const val = dataArray[i] / 255;
            const h = val * canvas.height * 0.4;
            const hue = currentTheme.hueBase + (i / count) * currentTheme.hueRange;
            ctx.fillStyle = `hsla(${hue}, 90%, 60%, ${0.4 + val * 0.6})`;
            ctx.shadowBlur = val * 20;
            ctx.shadowColor = `hsla(${hue}, 90%, 60%, 0.4)`;
            ctx.fillRect(i * (canvas.width / count), centerY - h, (canvas.width / count) * 0.8, h * 2);
          }
        } else if (visualMode === 'circular') {
          const rotation = Date.now() / 3000;
          const r = 180 + bassIntensity * 120;
          ctx.beginPath();
          for (let i = 0; i < bufferLength; i++) {
            const angle = (i / bufferLength) * Math.PI * 2 + rotation;
            const v = dataArray[i] / 255;
            const x = centerX + Math.cos(angle) * (r + v * 120);
            const y = centerY + Math.sin(angle) * (r + v * 120);
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.strokeStyle = `hsla(${currentTheme.hueBase}, 100%, 70%, 0.5)`;
          ctx.lineWidth = 3;
          ctx.stroke();
        } else if (visualMode === 'particles') {
          particles.current.forEach((p, i) => {
            const v = dataArray[i % bufferLength] / 255;
            p.x += p.vx * (1 + v * 5);
            p.y += p.vy * (1 + v * 5);
            if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * (1 + v * 4), 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${currentTheme.hueBase + (i % 60)}, 100%, 75%, ${0.2 + v * 0.8})`;
            ctx.fill();
          });
        }
      }
      ctx.restore();
    };

    draw();
    return () => animationRef.current ? cancelAnimationFrame(animationRef.current) : undefined;
  }, [analyser, visualMode, theme, isPlaying, bgOpacity, bgBlur, bgPulse]);

  return <canvas ref={canvasRef} width={1600} height={900} className="w-full h-full object-contain" />;
}
