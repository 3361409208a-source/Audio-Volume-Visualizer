import { useEffect, useRef } from 'react';
import { Zap, Cpu, Gauge, Waves } from 'lucide-react';
import { AudioStats, Theme } from '../../types';
import { THEMES } from '../../constants/themes';

interface TelemetryTabProps {
  stats: AudioStats;
  theme: Theme;
  analyser: AnalyserNode | null;
}

export default function TelemetryTab({ stats, theme, analyser }: TelemetryTabProps) {
  const miniCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!miniCanvasRef.current || !analyser) return;
    const ctx = miniCanvasRef.current.getContext('2d');
    if (!ctx) return;

    let anim: number;
    const draw = () => {
        anim = requestAnimationFrame(draw);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        
        ctx.clearRect(0, 0, miniCanvasRef.current!.width, miniCanvasRef.current!.height);
        const barWidth = miniCanvasRef.current!.width / (dataArray.length / 4);
        ctx.fillStyle = `${THEMES[theme].primary}44`;
        for (let i = 0; i < dataArray.length / 4; i++) {
           const h = (dataArray[i] / 255) * miniCanvasRef.current!.height;
           ctx.fillRect(i * barWidth, miniCanvasRef.current!.height - h, barWidth - 1, h);
        }
    };
    draw();
    return () => cancelAnimationFrame(anim);
  }, [analyser, theme]);

  return (
    <div className="space-y-6 flex-1 flex flex-col">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Peak', value: Math.round(stats.volume), icon: Zap },
          { label: 'Bass', value: Math.round(stats.bass), icon: Waves },
          { label: 'RMS', value: stats.rms.toFixed(1), icon: Gauge },
          { label: 'FPS', value: stats.fps, icon: Cpu }
        ].map((s) => (
          <div key={s.label} className="bg-white/5 p-4 rounded-3xl border border-white/5 flex flex-col gap-1">
             <div className="flex items-center gap-2 opacity-30"><s.icon size={10} /><span className="text-[8px] font-black uppercase tracking-widest">{s.label}</span></div>
             <div className="text-xl font-black tabular-nums tracking-tighter">{s.value}</div>
          </div>
        ))}
      </div>
      <div className="flex-1 p-2 bg-black/50 rounded-2xl border border-white/10 shadow-inner overflow-hidden">
        <canvas ref={miniCanvasRef} width={300} height={200} className="w-full h-full opacity-60" />
      </div>
    </div>
  );
}
