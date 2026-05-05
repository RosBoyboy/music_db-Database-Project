import React from 'react';
import { Play } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function PlaylistItem({ playlist }) {
  return (
    <div 
      onClick={() => router.visit(`/playlist/${playlist.id}`)}
      className="group cursor-pointer rounded-xl p-4 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.05] transition-all flex items-center gap-4"
    >
      <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${playlist.gradient || 'from-gray-700 to-gray-900'} shadow-lg relative flex-shrink-0`}>
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center backdrop-blur-[2px]">
          <Play size={20} fill="white" className="text-white ml-0.5" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-bold text-base truncate mb-1">{playlist.name}</h3>
        <p className="text-gray-400 text-sm truncate">By {playlist.owner || 'SoundWave'}</p>
      </div>
    </div>
  );
}
