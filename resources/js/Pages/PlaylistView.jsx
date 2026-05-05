import React from 'react';
import { Head, router } from '@inertiajs/react';
import MainLayout from '../Layouts/MainLayout';
import { Play, Shuffle, Plus, Heart, MoreHorizontal, Clock, Music } from 'lucide-react';
import { usePlayer } from '../Context/PlayerContext';

export default function PlaylistView({ playlist, tracks: rawTracks }) {
  const { play, playQueue, currentTrack, isPlaying } = usePlayer();

  // Ensure tracks is always an array (Laravel collections may serialize as objects)
  const tracks = Array.isArray(rawTracks) ? rawTracks : Object.values(rawTracks || {});

  // Build a normalized queue from mixed local/spotify tracks
  const buildQueue = () => tracks.map(t => ({
    id: String(t.id),
    name: t.name,
    artist: { name: t.artist?.name || 'Unknown' },
    album: t.album ? { name: t.album.name, image_url: t.album.image_url } : null,
    preview_url: t.preview_url || null,
    source: t.source || 'local',
  }));

  const handlePlayPlaylist = () => {
    if (!tracks || tracks.length === 0) return;
    playQueue(buildQueue(), 0);
  };

  const handlePlayTrack = (track) => {
    const q = buildQueue();
    const idx = q.findIndex(t => t.id === String(track.id));
    playQueue(q, idx >= 0 ? idx : 0);
  };

  return (
    <>
      <Head title={`${playlist.name} | SoundWave`} />
      
      <div className="max-w-7xl mx-auto pb-24 text-white">
        
        {/* Playlist Header */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-10 items-end">
          <div className={`w-48 h-48 md:w-60 md:h-60 flex-shrink-0 shadow-2xl rounded-xl bg-gradient-to-br ${playlist.gradient} relative overflow-hidden`}>
            <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-30">
               <Music size={80} className="text-white drop-shadow-xl" />
            </div>
          </div>
          <div className="flex flex-col gap-3 flex-1 pb-2">
            <span className="text-sm font-bold uppercase tracking-wider text-white/80">Playlist</span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter leading-none mb-2">
              {playlist.name}
            </h1>
            <p className="text-gray-300 text-sm md:text-base mb-2 max-w-2xl">
              {playlist.description || 'A collection of the finest tracks curated for you.'}
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
              <div className="w-6 h-6 rounded-full bg-[#1DB954] flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="black"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
              </div>
              <span className="text-white hover:underline cursor-pointer">{playlist.owner}</span>
              <span>•</span>
              <span>{playlist.trackCount || tracks?.length || 0} songs</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-6 mb-8 px-2">
          <button
            onClick={handlePlayPlaylist}
            className="w-14 h-14 rounded-full bg-[#1DB954] text-black flex items-center justify-center hover:scale-105 transition-transform shadow-xl hover:bg-[#1ed760]"
          >
             <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </button>
          <button className="text-gray-400 hover:text-white transition-colors">
            <Heart size={32} strokeWidth={1.5} />
          </button>
          <button className="text-gray-400 hover:text-white transition-colors">
            <MoreHorizontal size={32} strokeWidth={1.5} />
          </button>
        </div>

        {/* Tracks List */}
        <div className="px-2">
          {/* Header Row */}
          <div className="flex items-center gap-4 px-4 py-2 border-b border-white/10 text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4 sticky top-[64px] bg-[#0f0f0f] z-10">
            <div className="w-8 text-center">#</div>
            <div className="flex-1 min-w-0">Title</div>
            <div className="w-1/4 hidden md:block">Album</div>
            <div className="w-12 text-right flex justify-end">
              <Clock size={16} />
            </div>
          </div>

          <div className="space-y-1">
            {tracks && tracks.length > 0 ? (
              tracks.map((track, index) => {
                const isTrackPlaying = currentTrack?.id === String(track.id) && isPlaying;
                return (
                  <div 
                    key={track.id}
                    onClick={() => handlePlayTrack(track)}
                    className="group flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="w-8 text-center text-gray-400 font-medium text-sm group-hover:hidden">
                      {index + 1}
                    </div>
                    <div className="w-8 text-center text-white hidden group-hover:flex justify-center">
                      <Play size={16} fill="white" />
                    </div>
                    
                    <div className="flex-1 min-w-0 flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-[#1a1a2e] flex-shrink-0 overflow-hidden">
                          {track.album?.image_url ? (
                            <img src={track.album.image_url} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-white/10" />
                          )}
                      </div>
                      <div className="truncate">
                        <p className={`text-base font-medium truncate ${isTrackPlaying ? 'text-[#1DB954]' : 'text-white'}`}>
                          {track.name}
                        </p>
                        <p className="text-sm text-gray-400 truncate group-hover:text-white/80 transition-colors">
                          {track.artist?.name || 'Unknown Artist'}
                        </p>
                      </div>
                    </div>

                    <div className="w-1/4 hidden md:block truncate text-sm text-gray-400 group-hover:text-white/80 transition-colors">
                      {track.album?.name || ''}
                    </div>

                    <div className="w-12 flex justify-end items-center gap-4 text-gray-400 text-sm">
                      <button className="opacity-0 group-hover:opacity-100 hover:text-white transition-all">
                          <Heart size={16} />
                      </button>
                      <span className="w-8 text-right">3:45</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-400 italic py-8 text-center">No tracks available in this playlist.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

PlaylistView.layout = page => <MainLayout children={page} />;
