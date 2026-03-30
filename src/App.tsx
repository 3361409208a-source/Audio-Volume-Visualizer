import { useState, useRef, ChangeEvent } from 'react';
import { Play, Pause, Activity, BarChart3, Disc, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Components
import Header from './components/Header';
import Visualizer from './components/Visualizer';
import PlaylistTab from './components/Sidebar/PlaylistTab';
import TelemetryTab from './components/Sidebar/TelemetryTab';
import BackgroundTab from './components/Sidebar/BackgroundTab';

// Hooks & Utils
import { useAudioEngine } from './hooks/useAudioEngine';
import { VisualMode, Theme, Track } from './types';
import { PRESET_BGS } from './constants/presets';
import { THEMES } from './constants/themes';

export default function App() {
  // State: Playlist
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [sidebarTab, setSidebarTab] = useState<'telemetry' | 'playlist' | 'background'>('playlist');
  
  // State: Visuals
  const [visualMode, setVisualMode] = useState<VisualMode>('circular');
  const [theme, setTheme] = useState<Theme>('ocean');
  const [bgImage, setBgImage] = useState<string | null>(PRESET_BGS[0].url);
  const [bgOpacity, setBgOpacity] = useState(0.4);
  const [bgBlur, setBgBlur] = useState(0);
  const [bgPulse, setBgPulse] = useState(0.05);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { isPlaying, stats, togglePlay, analyser, updateStats, setIsPlaying } = useAudioEngine(audioRef);

  const handleBatchUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newTracks: Track[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }));
    setPlaylist(prev => [...prev, ...newTracks]);
    if (currentIndex === -1) setCurrentIndex(playlist.length);
  };

  const playTrack = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  const removeTrack = (id: string, index: number) => {
    URL.revokeObjectURL(playlist[index].url);
    const newPlaylist = playlist.filter(t => t.id !== id);
    setPlaylist(newPlaylist);
    if (index === currentIndex) {
      setIsPlaying(false);
      setCurrentIndex(newPlaylist.length > 0 ? 0 : -1);
    } else if (index < currentIndex) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const playNext = () => {
    if (currentIndex < playlist.length - 1) playTrack(currentIndex + 1);
    else setIsPlaying(false);
  };

  return (
    <div className="h-screen bg-[#020617] text-slate-100 font-sans overflow-hidden flex flex-col selection:bg-blue-500/30">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className={`absolute -top-[10%] -left-[5%] w-[40%] h-[40%] ${THEMES[theme].bgGlow1} blur-[120px] rounded-full transition-all duration-1000 opacity-50`} />
        <div className={`absolute -bottom-[10%] -right-[5%] w-[40%] h-[40%] ${THEMES[theme].bgGlow2} blur-[120px] rounded-full transition-all duration-1000 opacity-50`} />
      </div>

      <Header 
        theme={theme} 
        setTheme={setTheme} 
        onBgTab={() => setSidebarTab('background')} 
        onBatchUpload={handleBatchUpload}
      />

      <main className="flex-1 relative z-10 p-4 flex gap-4 overflow-hidden">
        <div className="flex-1 flex flex-col gap-4 h-full">
           <div className="flex-1 relative bg-black rounded-[2.5rem] border border-white/5 overflow-hidden group shadow-[0_0_100px_-20px_rgba(0,0,0,1)]">
              <Visualizer 
                analyser={analyser} 
                visualMode={visualMode} 
                theme={theme} 
                isPlaying={isPlaying}
                bgImage={bgImage}
                bgOpacity={bgOpacity}
                bgBlur={bgBlur}
                bgPulse={bgPulse}
                onUpdateStats={updateStats}
                currentTrackName={currentIndex !== -1 ? playlist[currentIndex].name : ''}
              />
              
              <div className="absolute top-8 left-8 z-30 flex flex-col gap-1 pointer-events-none drop-shadow-2xl">
                 <div className="text-[14px] font-black tracking-tight text-white/90 uppercase">{currentIndex !== -1 ? playlist[currentIndex].name : '等待解析音频流...'}</div>
                 <div className="text-[8px] font-bold text-blue-500 tracking-widest uppercase italic">{isPlaying ? 'Signal Status: Linked' : 'System: Connected'}</div>
              </div>

              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
                <div className="flex items-center gap-5 px-6 py-4 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl">
                    <button onClick={togglePlay} className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl">
                      {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} className="ml-1" fill="currentColor" />}
                    </button>
                    <div className="h-10 w-px bg-white/10" />
                    <div className="flex items-center gap-1">
                       {[ { id: 'waveform', icon: Activity }, { id: 'bars', icon: BarChart3 }, { id: 'circular', icon: Disc }, { id: 'particles', icon: Sparkles } ].map((m) => (
                        <button key={m.id} onClick={() => setVisualMode(m.id as VisualMode)} className={`p-3.5 rounded-2xl transition-all ${visualMode === m.id ? 'bg-white text-black shadow-lg shadow-black/20' : 'text-slate-500 hover:bg-white/5'}`}>
                          <m.icon size={20} />
                        </button>
                       ))}
                    </div>
                </div>
              </div>
           </div>

           <div className="h-20 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] px-8 flex items-center justify-between shadow-lg">
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 shadow-inner">
                <button onClick={() => setSidebarTab('playlist')} className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${sidebarTab === 'playlist' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500'}`}>媒体队列</button>
                <button onClick={() => setSidebarTab('telemetry')} className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${sidebarTab === 'telemetry' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500'}`}>分析引擎</button>
                <button onClick={() => setSidebarTab('background')} className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${sidebarTab === 'background' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500'}`}>渲染设置</button>
              </div>

              <div className="flex items-center gap-8">
                 <div className="text-right">
                    <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Spectral Power</div>
                    <div className="flex gap-1 h-3 items-end">
                       {[...Array(15)].map((_, i) => (
                         <div key={i} className={`w-1.5 rounded-full ${i > 12 ? 'bg-red-500' : 'bg-blue-500'} opacity-50`} style={{ height: isPlaying ? `${Math.random() * 100}%` : '2px' }} />
                       ))}
                    </div>
                 </div>
                 <div className="h-10 w-px bg-white/10" />
                 <div className="text-center group">
                    <div className="text-[8px] font-black text-slate-600 uppercase mb-1">Signal Peak</div>
                    <div className="text-2xl font-black tabular-nums tracking-tighter text-blue-400">{Math.round(stats.volume)}</div>
                 </div>
              </div>
           </div>
        </div>

        <aside className="w-80 h-full flex flex-col gap-4 overflow-hidden">
           <div className="flex-1 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 flex flex-col gap-6 shadow-[0_0_80px_-20px_rgba(0,0,0,1)] overflow-hidden">
             <AnimatePresence mode="wait">
               {sidebarTab === 'playlist' && (
                 <PlaylistTab key="playlist" playlist={playlist} currentIndex={currentIndex} isPlaying={isPlaying} onPlayTrack={playTrack} onRemoveTrack={removeTrack} onBatchUpload={handleBatchUpload} />
               )}
               {sidebarTab === 'telemetry' && (
                 <TelemetryTab key="telemetry" stats={stats} theme={theme} analyser={analyser} />
               )}
               {sidebarTab === 'background' && (
                 <BackgroundTab key="background" bgOpacity={bgOpacity} bgBlur={bgBlur} bgPulse={bgPulse} setBgOpacity={setBgOpacity} setBgBlur={setBgBlur} setBgPulse={setBgPulse} bgImage={bgImage} setBgImage={setBgImage} />
               )}
             </AnimatePresence>
           </div>
        </aside>
      </main>

      {currentIndex !== -1 && (
        <audio ref={audioRef} src={playlist[currentIndex].url} onEnded={playNext} className="hidden" autoPlay={isPlaying} />
      )}
    </div>
  );
}
