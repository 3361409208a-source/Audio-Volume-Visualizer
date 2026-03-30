import { Sliders, Monitor, Upload } from 'lucide-react';
import { PRESET_BGS } from '../../constants/presets';

interface BackgroundTabProps {
  bgOpacity: number;
  bgBlur: number;
  bgPulse: number;
  setBgOpacity: (v: number) => void;
  setBgBlur: (v: number) => void;
  setBgPulse: (v: number) => void;
  bgImage: string | null;
  setBgImage: (url: string) => void;
}

export default function BackgroundTab({ 
  bgOpacity, bgBlur, bgPulse, setBgOpacity, setBgBlur, setBgPulse, bgImage, setBgImage 
}: BackgroundTabProps) {
  return (
    <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
      <div>
        <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6 flex items-center gap-2"><Sliders size={12} /> 渲染层级设置</h5>
        <div className="space-y-6">
          <div className="space-y-3">
             <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase"><span>透明度</span><span>{Math.round(bgOpacity * 100)}%</span></div>
             <input type="range" min="0" max="1" step="0.01" value={bgOpacity} onChange={(e) => setBgOpacity(parseFloat(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" />
          </div>
          <div className="space-y-3">
             <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase"><span>模糊度</span><span>{bgBlur}px</span></div>
             <input type="range" min="0" max="20" step="1" value={bgBlur} onChange={(e) => setBgBlur(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" />
          </div>
          <div className="space-y-3">
             <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase"><span>震动强度</span><span>{Math.round(bgPulse * 1000)}</span></div>
             <input type="range" min="0" max="0.2" step="0.01" value={bgPulse} onChange={(e) => setBgPulse(parseFloat(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" />
          </div>
        </div>
      </div>
      <div>
        <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6 flex items-center gap-2"><Monitor size={12} /> 背景预设库</h5>
        <div className="grid grid-cols-2 gap-3 pb-4">
           <div className="relative group cursor-pointer h-20 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center bg-white/5">
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => setBgImage(URL.createObjectURL(e.target.files![0]))} />
              <Upload size={20} className="text-slate-500 group-hover:text-white transition-all" />
              <div className="absolute bottom-2 text-[8px] font-black uppercase text-slate-500">上传图片</div>
           </div>
           {PRESET_BGS.map(bg => (
             <button key={bg.name} onClick={() => setBgImage(bg.url)} className={`relative group h-20 rounded-xl overflow-hidden border transition-all ${bgImage === bg.url ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-white/10'}`}>
                <img src={bg.url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                   <span className="text-[9px] font-black uppercase text-white tracking-widest">{bg.name}</span>
                </div>
             </button>
           ))}
        </div>
      </div>
    </div>
  );
}
