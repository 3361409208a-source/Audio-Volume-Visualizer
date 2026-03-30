import { Activity, ImageIcon, Settings2, Plus } from 'lucide-react';
import { THEMES } from '../constants/themes';
import { Theme } from '../types';

interface HeaderProps {
  theme: Theme;
  setTheme: (t: Theme) => void;
  onBgTab: () => void;
  onBatchUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Header({ theme, setTheme, onBgTab, onBatchUpload }: HeaderProps) {
  return (
    <header className="relative z-20 px-8 py-4 flex items-center justify-between border-b border-white/5 bg-black/60 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Activity size={18} className="text-white" />
        </div>
        <h1 className="text-sm font-black tracking-tighter uppercase italic">Sonic Viz <span className="text-[8px] text-slate-500 font-bold ml-2 tracking-[0.4em]">Engine v4.0</span></h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 shadow-inner">
          {(Object.keys(THEMES) as Theme[]).map((t) => (
            <button key={t} onClick={() => setTheme(t)} className={`px-4 py-1.5 rounded-lg text-[9px] font-bold transition-all ${theme === t ? 'bg-white text-black shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>
              {THEMES[t].name}
            </button>
          ))}
        </div>
        <div className="h-6 w-px bg-white/10" />
        <div className="flex items-center gap-2">
          <div className="relative">
             <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer w-20 h-10 z-30" accept="audio/*" onChange={onBatchUpload} />
             <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20">
               <Plus size={14} /> 批量添加
             </button>
          </div>
          <button onClick={onBgTab} className="p-2.5 rounded-xl bg-white/5 text-slate-400 border border-white/10 hover:text-white transition-all"><ImageIcon size={16} /></button>
          <button className="p-2.5 rounded-xl bg-white/5 text-slate-400 border border-white/10 hover:text-white transition-all"><Settings2 size={16} /></button>
        </div>
      </div>
    </header>
  );
}
