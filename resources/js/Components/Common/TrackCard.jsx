import React from 'react';
import { Play, Pause } from 'lucide-react';
import { usePlayer } from '@/Context/PlayerContext';

export default function TrackCard({ track, allTracks }) {
  const { play, playQueue, currentTrack, isPlaying, togglePlayPause } = usePlayer();
  
  const [fallbackUrl, setFallbackUrl] = React.useState(null);
  
  React.useEffect(() => {
    if (track.source === 'spotify' && !track.preview_url) {
      const query = encodeURIComponent(`${track.title || track.name} ${track.artist?.name || track.artist}`);
      fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1`)
        .then(res => res.json())
        .then(data => {
          if (data.results && data.results.length > 0 && data.results[0].previewUrl) {
            setFallbackUrl(data.results[0].previewUrl);
          }
        })
        .catch(err => console.error('Failed to fetch iTunes fallback:', err));
    }
  }, [track]);

  const actualPreviewUrl = track.preview_url || fallbackUrl;
  
  // List of gradients for fallback
  const gradients = [
    'from-purple-500 to-indigo-500',
    'from-pink-500 to-rose-500',
    'from-amber-400 to-orange-500',
    'from-emerald-400 to-teal-500',
    'from-blue-400 to-cyan-500',
    'from-fuchsia-500 to-purple-600'
  ];
  
  // Use a deterministic gradient based on track ID or name
  const gradientIndex = track.id ? (typeof track.id === 'number' ? track.id % gradients.length : track.id.charCodeAt(0) % gradients.length) : 0;
  const gradientClass = gradients[gradientIndex];

  const isCurrentTrack = currentTrack?.id === track.id;
  const hasAudio = !!(actualPreviewUrl || track.url || track.file_path);

  const handlePlay = (e) => {
    e.stopPropagation();

    if (isCurrentTrack) {
      togglePlayPause();
      return;
    }

    const trackToPlay = {
      ...track,
      preview_url: actualPreviewUrl
    };

    // If we have a list of all tracks, build a queue for skip support
    if (allTracks && allTracks.length > 0) {
      const queue = allTracks.map(t => t.id === track.id ? trackToPlay : t);
      const idx = queue.findIndex(t => t.id === track.id);
      playQueue(queue, idx >= 0 ? idx : 0);
    } else {
      play(trackToPlay);
    }
  };

  return (
    <div className="group cursor-pointer rounded-xl p-3 hover:bg-white/[0.05] transition-all duration-300">
      <div className={`relative aspect-square w-full overflow-hidden rounded-lg mb-3 shadow-lg ${!track.album?.image_url ? `bg-gradient-to-br ${gradientClass}` : 'bg-[#1f1f1f]'}`}>
        {track.album?.image_url && (
          <img 
            src={track.album.image_url} 
            alt={track.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
          />
        )}
        {/* If no image, show a music note icon or just the gradient */}
        {!track.album?.image_url && (
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          </div>
        )}
        
        {/* Source Badge */}
        {track.source === 'local' && (
          <div className="absolute top-2 left-2 bg-purple-600/90 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded backdrop-blur-md">
            Uploaded Track
          </div>
        )}

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
          {track.source === 'local' && !track.file_path ? (
            <div className="bg-red-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              No Audio File
            </div>
          ) : (
            <button 
              onClick={handlePlay}
              className={`w-12 h-12 rounded-full shadow-xl hover:scale-105 flex items-center justify-center transition-transform ${
                isCurrentTrack && isPlaying ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white' : 'bg-white text-black'
              }`}
            >
              {isCurrentTrack && isPlaying ? (
                <Pause size={22} fill="currentColor" />
              ) : (
                <Play size={24} fill="currentColor" className="ml-1" />
              )}
            </button>
          )}
        </div>

        {/* Now-playing indicator */}
        {isCurrentTrack && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1">
            <span className={`w-1 h-3 rounded-full ${isPlaying ? 'bg-purple-400 animate-pulse' : 'bg-gray-400'}`}/>
            <span className={`w-1 h-4 rounded-full ${isPlaying ? 'bg-purple-400 animate-pulse' : 'bg-gray-400'}`} style={{ animationDelay: '75ms' }}/>
            <span className={`w-1 h-2.5 rounded-full ${isPlaying ? 'bg-purple-400 animate-pulse' : 'bg-gray-400'}`} style={{ animationDelay: '150ms' }}/>
          </div>
        )}

        {/* No audio badge */}
        {!hasAudio && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 text-[10px] text-gray-400 font-semibold">
            No Audio
          </div>
        )}
      </div>
      <h3 className={`font-bold text-sm truncate mt-2 ${isCurrentTrack ? 'text-purple-400' : 'text-white'}`}>{track.name}</h3>
      <p className="text-gray-400 text-xs truncate mt-1">
        {track.artist ? track.artist.name : 'Unknown Artist'}
      </p>
    </div>
  );
}
