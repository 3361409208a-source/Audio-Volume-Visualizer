import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { Upload, Play, Pause, Music, Volume2, Activity, BarChart3, Disc, Sparkles, Palette, Settings2, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type VisualMode = 'waveform' | 'bars' | 'circular' | 'particles';
type Theme = 'cyberpunk' | 'ocean' | 'fire';

const THEMES = {
  cyberpunk: {
    primary: '#ec4899',
    secondary: '#06b6d4',
    bgGlow1: 'bg-pink-500/10',
    bgGlow2: 'bg-cyan-500/10',
    textGradient: 'from-pink-400 via-purple-400 to-cyan-400',
    hueBase: 300,
    hueRange: 60,
    name: '赛博朋克'
  },
  ocean: {
    primary: '#3b82f6',
    secondary: '#14b8a6',
    bgGlow1: 'bg-blue-500/10',
    bgGlow2: 'bg-teal-500/10',
    textGradient: 'from-blue-400 via-sky-400 to-teal-400',
    hueBase: 200,
    hueRange: 40,
    name: '深邃海洋'
  },
  fire: {
    primary: '#ef4444',
    secondary: '#f97316',
    bgGlow1: 'bg-red-500/10',
    bgGlow2: 'bg-orange-500/10',
    textGradient: 'from-red-400 via-orange-400 to-yellow-400',
    hueBase: 15,
    hueRange: 40,
    name: '极乐烈焰'
  }
};

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);
  const [bass, setBass] = useState(0);
  const [visualMode, setVisualMode] = useState<VisualMode>('circular');
  const [theme, setTheme] = useState<Theme>('ocean');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const miniCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);
  
  const particles = useRef<{ x: number; y: number; vx: number; vy: number; size: number; color: string }[]>([]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setFile(selectedFile);
      setAudioUrl(URL.createObjectURL(selectedFile));
      setIsPlaying(false);
      particles.current = Array.from({ length: 120 }, () => ({
        x: Math.random() * 1000,
        y: Math.random() * 500,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        size: Math.random() * 2 + 1,
        color: `hsla(${Math.random() * 360}, 70%, 70%, 0.6)`
      }));
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 512;
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
      }
      if (audioContextRef.current.state === 'suspended') audioContextRef.current.resume();
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (!analyserRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyserRef.current!.getByteFrequencyData(dataArray);

      let sum = 0;
      let bassSum = 0;
      const bassRange = Math.floor(bufferLength * 0.1); 
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
        if (i < bassRange) bassSum += dataArray[i];
      }
      setVolume(sum / bufferLength);
      setBass(bassSum / bassRange);

      const currentTheme = THEMES[theme];

      if (miniCanvasRef.current) {
        const miniCtx = miniCanvasRef.current.getContext('2d');
        if (miniCtx) {
          const mWidth = miniCanvasRef.current.width;
          const mHeight = miniCanvasRef.current.height;
          miniCtx.clearRect(0, 0, mWidth, mHeight);
          const barWidth = mWidth / bufferLength;
          miniCtx.fillStyle = `${currentTheme.primary}40`;
          for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * mHeight;
            miniCtx.fillRect(i * barWidth, mHeight - barHeight, barWidth - 1, barHeight);
          }
        }
      }

      ctx.fillStyle = 'rgba(2, 6, 23, 0.15)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      if (visualMode === 'bars') {
        const barWidth = (canvas.width / bufferLength) * 1.5;
        for (let i = 0; i < bufferLength; i++) {
          const val = dataArray[i] / 255;
          const h = val * canvas.height * 0.45;
          const hue = currentTheme.hueBase + (i / bufferLength) * currentTheme.hueRange;
          ctx.fillStyle = `hsla(${hue}, 80%, 65%, 0.9)`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = `hsla(${hue}, 80%, 65%, 0.4)`;
          ctx.fillRect(i * barWidth * 1.8, centerY - h, barWidth, h * 2);
        }
      } else if (visualMode === 'circular') {
        const rotation = Date.now() / 5000;
        const radius = 120 + (bass / 255) * 50;
        
        ctx.beginPath();
        for (let i = 0; i <= bufferLength; i++) {
          const angle = (i / bufferLength) * Math.PI * 2 + rotation;
          const v = dataArray[i % bufferLength] / 255;
          const r = radius + v * 60;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = currentTheme.primary;
        ctx.lineWidth = 4;
        ctx.stroke();

        // Outer Glow
        const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.8, centerX, centerY, radius * 2);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(1, `${currentTheme.primary}10`);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Pulsing dots
        for (let i = 0; i < 48; i++) {
          const angle = (i / 48) * Math.PI * 2 - rotation * 1.5;
          const v = dataArray[(i * 4) % bufferLength] / 255;
          const r = radius + 80 + v * 40;
          ctx.beginPath();
          ctx.arc(centerX + Math.cos(angle) * r, centerY + Math.sin(angle) * r, 1.5 + v * 3, 0, Math.PI * 2);
          ctx.fillStyle = v > 0.5 ? '#fff' : `${currentTheme.secondary}aa`;
          ctx.fill();
        }
      } else if (visualMode === 'particles') {
        particles.current.forEach((p, i) => {
          const v = dataArray[i % bufferLength] / 255;
          p.x += p.vx * (1 + v * 4);
          p.y += p.vy * (1 + v * 4);
          if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
          
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 + v * 2.5), 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${currentTheme.hueBase + (i % 40)}, 80%, 70%, ${0.3 + v * 0.7})`;
          ctx.fill();
        });
      } else {
        analyserRef.current!.getByteTimeDomainData(dataArray);
        ctx.beginPath();
        const sliceWidth = canvas.width / bufferLength;
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = v * canvas.height / 2;
          if (i === 0) ctx.moveTo(i * sliceWidth, y); else ctx.lineTo(i * sliceWidth, y);
        }
        ctx.strokeStyle = currentTheme.secondary;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    };
    draw();
    return () => animationRef.current ? cancelAnimationFrame(animationRef.current) : undefined;
  }, [visualMode, theme]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-blue-500/30 overflow-x-hidden antialiased">
      {/* Background Ambient Layers */}
      <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute -top-[20%] -left-[10%] w-[60%] h-[60%] ${THEMES[theme].bgGlow1} blur-[140px] rounded-full transition-all duration-1000`} />
        <div className={`absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] ${THEMES[theme].bgGlow2} blur-[140px] rounded-full transition-all duration-1000`} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-8 py-10">
        {/* Navigation / Header */}
        <header className="mb-14 flex items-center justify-between">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
            <div className={`p-2.5 rounded-2xl bg-gradient-to-br ${THEMES[theme].textGradient} opacity-20`} />
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400">
                声影律动 <span className="text-sm font-medium tracking-[0.2em] text-slate-500 ml-2">SONIC VIZ</span>
              </h1>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 mt-0.5">次世代音频可视化引擎</p>
            </div>
          </motion.div>

          <div className="flex items-center gap-3">
             <div className="hidden md:flex items-center gap-1.5 p-1 bg-white/5 backdrop-blur-3xl rounded-xl border border-white/10">
                {(Object.keys(THEMES) as Theme[]).map((t) => (
                  <button key={t} onClick={() => setTheme(t)} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${theme === t ? 'bg-white/10 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>
                    {THEMES[t].name}
                  </button>
                ))}
             </div>
             <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors">
               <Settings2 size={18} />
             </button>
          </div>
        </header>

        {/* Workspace */}
        <main className="grid lg:grid-cols-[1fr_320px] gap-10 items-start">
          <div className="space-y-8">
            {/* Stage */}
            <div className="relative aspect-[16/9] bg-black/40 backdrop-blur-2xl rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl group">
              <div className="absolute top-8 left-8 z-20 flex items-center gap-3 px-4 py-2 bg-black/20 backdrop-blur-xl border border-white/5 rounded-full">
                <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`} />
                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  {isPlaying ? '波形同步中' : '系统待命'}
                </span>
              </div>

              <canvas ref={canvasRef} width={1200} height={675} className="w-full h-full cursor-none" />
              
              {/* Overlay Controls */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                <div className="flex items-center gap-6 px-8 py-5 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl">
                    <button onClick={togglePlay} className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl">
                      {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} className="ml-1" fill="currentColor" />}
                    </button>
                    <div className="h-12 w-px bg-white/10" />
                    <div className="flex items-center gap-2">
                       {[
                        { id: 'waveform', icon: Activity, label: '波形' },
                        { id: 'bars', icon: BarChart3, label: '频谱' },
                        { id: 'circular', icon: Disc, label: '环绕' },
                        { id: 'particles', icon: Sparkles, label: '星尘' }
                      ].map((m) => (
                        <button key={m.id} onClick={() => setVisualMode(m.id as VisualMode)} className={`p-3 rounded-2xl transition-all ${visualMode === m.id ? 'bg-white text-black' : 'text-slate-400 hover:bg-white/5'}`}>
                          <m.icon size={20} />
                        </button>
                      ))}
                    </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: Upload & Info */}
            {!file ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] hover:border-white/10 hover:bg-white/[0.02] transition-all cursor-pointer relative overflow-hidden group">
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="audio/*" onChange={handleFileChange} />
                <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Upload className="text-slate-500 group-hover:text-white" size={32} />
                </div>
                <h3 className="text-xl font-bold">载入音频流</h3>
                <p className="text-slate-500 text-sm mt-2">支持本地高保真音频文件解析</p>
              </motion.div>
            ) : (
              <div className="flex items-center justify-between p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem]">
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-[1.5rem] bg-gradient-to-br ${THEMES[theme].textGradient} flex items-center justify-center shadow-lg`}>
                    <Music className="text-white" size={28} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold truncate max-w-[200px] md:max-w-md">{file.name}</h4>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • 系统已识别
                    </p>
                  </div>
                </div>
                <button onClick={() => { setFile(null); setAudioUrl(null); setIsPlaying(false); }} className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-slate-400 font-bold text-xs uppercase tracking-tighter transition-all">
                  移除文件
                </button>
              </div>
            )}
          </div>

          <aside className="space-y-8">
            {/* Status Panel */}
            <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] space-y-10">
              <div className="flex items-center justify-between">
                <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">实时遥测数据</h5>
                <Share2 size={14} className="text-slate-600" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest pl-1">动态峰值</span>
                  <div className="text-3xl font-black tabular-nums">{Math.round(volume)}</div>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest pl-1">低音能级</span>
                  <div className={`text-3xl font-black tabular-nums transition-colors ${bass > 180 ? 'text-white' : 'text-slate-400'}`}>{Math.round(bass)}</div>
                </div>
              </div>

              {/* Advanced Indicators */}
              <div className="space-y-6">
                <div className="space-y-2.5">
                   <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                     <span>频谱响应</span>
                     <span>AUTO</span>
                   </div>
                   <canvas ref={miniCanvasRef} width={200} height={50} className="w-full h-12 rounded-xl opacity-60" />
                </div>

                <div className="space-y-4">
                  {[
                    { label: '采样位深', value: '24-Bit' },
                    { label: '响应延迟', value: '0.2ms' },
                    { label: '相位修正', value: 'Active' }
                  ].map((stat) => (
                    <div key={stat.label} className="flex justify-between items-center py-0.5">
                      <span className="text-xs font-medium text-slate-500">{stat.label}</span>
                      <span className="text-xs font-bold tracking-tight">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 mb-6">
                  <Volume2 size={14} className="text-slate-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">相位能量分布</span>
                </div>
                <div className="flex items-end gap-1.5 h-12">
                   {[...Array(10)].map((_, i) => (
                     <motion.div key={i} className="flex-1 rounded-full bg-white/10" animate={{ height: isPlaying ? [8, Math.random() * 40 + 8, 8] : 8, backgroundColor: isPlaying ? (i > 7 ? THEMES[theme].secondary : THEMES[theme].primary) + '88' : 'rgba(255,255,255,0.05)' }} transition={{ repeat: Infinity, duration: 0.5 + Math.random() * 0.5, delay: i * 0.1 }} />
                   ))}
                </div>
              </div>
            </div>
            
            <p className="text-center text-[9px] text-slate-600 font-medium tracking-widest uppercase">
              Powered by Web Audio API v2
            </p>
          </aside>
        </main>
      </div>

      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
      )}
    </div>
  );
}
