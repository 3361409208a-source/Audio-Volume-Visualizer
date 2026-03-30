import { ListMusic, Music, Play, Trash2, Plus, Activity } from 'lucide-react';
import { Track } from '../../types';

interface PlaylistTabProps {
  playlist: Track[];
  currentIndex: number;
  isPlaying: boolean;
  onPlayTrack: (index: number) => void;
  onRemoveTrack: (id: string, index: number) => void;
  onBatchUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PlaylistTab({ 
  playlist, currentIndex, isPlaying, onPlayTrack, onRemoveTrack, onBatchUpload 
}: PlaylistTabProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2"><ListMusic size={12} /> Track Queue</h5>
        <div className="relative">
          <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" accept="audio/*" onChange={onBatchUpload} />
          <button className="flex items-center gap-2 p-2 bg-white/5 rounded-lg text-[9px] font-bold text-slate-400 hover:text-white transition-all"><Plus size={12} /> 添加</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
        {playlist.length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/5 rounded-3xl opacity-20">
              <Music size={32} className="mb-2" />
              <p className="text-[10px] font-bold uppercase">列表暂无内容</p>
           </div>
        ) : (
          playlist.map((track, i) => (
            <div key={track.id} className={`group p-3 rounded-2xl border transition-all flex items-center gap-3 ${currentIndex === i ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/5 border-transparent hover:border-white/10'}`}>
              <button onClick={() => onPlayTrack(i)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${currentIndex === i ? 'bg-blue-500 text-white' : 'bg-white/5 text-slate-400 group-hover:text-white'}`}>
                {currentIndex === i && isPlaying ? <Activity size={14} /> : <Play size={14} />}
              </button>
              <div className="flex-1 min-w-0" onClick={() => onPlayTrack(i)}>
                <div className={`text-[11px] font-bold truncate ${currentIndex === i ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>{track.name}</div>
                <div className="text-[8px] font-black text-slate-600 uppercase">{(track.file.size / 1024 / 1024).toFixed(1)}MB</div>
              </div>
              <button onClick={() => onRemoveTrack(track.id, i)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-red-400"><Trash2 size={14} /></button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
