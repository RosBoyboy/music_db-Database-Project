import React from 'react';
import { Head, router } from '@inertiajs/react';
import MainLayout from '../Layouts/MainLayout';
import { Play, Shuffle, Plus, Heart, MoreHorizontal, ArrowLeft } from 'lucide-react';
import { usePlayer } from '../Context/PlayerContext';

export default function ArtistProfile({ artist }) {
  const { play, playQueue, currentTrack, isPlaying, togglePlay } = usePlayer();

  const isArtistPlaying = currentTrack?.artist?.name === artist.name && isPlaying;

  const handlePlayArtist = () => {
    if (!artist.tracks || artist.tracks.length === 0) return;
    
    const queue = artist.tracks.map(t => ({
      id: `${t.source === 'spotify' ? 'spotify' : 'local'}-${t.id}`,
      name: t.name,
      artist: { name: artist.name },
      album: t.album ? { name: t.album.name, image_url: t.album.image_url } : null,
      source: t.source || 'local',
      preview_url: t.preview_url || null
    }));

    playQueue(queue, 0);
  };

  const handlePlayTrack = (track) => {
    const queue = artist.tracks.map(t => ({
      id: `${t.source === 'spotify' ? 'spotify' : 'local'}-${t.id}`,
      name: t.name,
      artist: { name: artist.name },
      album: t.album ? { name: t.album.name, image_url: t.album.image_url } : null,
      source: t.source || 'local',
      preview_url: t.preview_url || null
    }));
    
    const trackId = `${track.source === 'spotify' ? 'spotify' : 'local'}-${track.id}`;
    const idx = queue.findIndex(t => t.id === trackId);
    playQueue(queue, idx >= 0 ? idx : 0);
  };

  return (
    <>
      <Head title={`${artist.name} | SoundWave`} />
      
      {/* Artist Hero Banner */}
      <div className="relative -mx-6 lg:-mx-8 -mt-6 lg:-mt-8 mb-8 h-[350px] lg:h-[400px]">
        {artist.image_url ? (
          <>
            <img src={artist.image_url} alt={artist.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/60 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-purple-800 to-[#0f0f0f]" />
        )}

        <div className="absolute bottom-0 left-0 w-full p-6 lg:p-8 flex items-end">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white/80 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Verified Artist
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold text-white tracking-tighter drop-shadow-lg">
              {artist.name}
            </h1>
            <p className="text-gray-300 font-medium">
              {artist.tracks?.length || 0} tracks • {artist.albums?.length || 0} albums
            </p>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 py-6 pb-24">
        {/* Action Buttons */}
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={handlePlayArtist}
            className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-xl"
          >
            {isArtistPlaying ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            )}
          </button>
          <button className="px-5 py-2 rounded-full border border-gray-500 text-white font-semibold hover:border-white transition-colors">
            Follow
          </button>
          <button className="w-10 h-10 rounded-full text-gray-400 hover:text-white flex items-center justify-center transition-colors">
            <MoreHorizontal size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Top Tracks */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">Popular</h2>
            <div className="space-y-1">
              {artist.tracks && artist.tracks.length > 0 ? (
                artist.tracks.slice(0, 10).map((track, index) => {
                  const trackId = `${track.source === 'spotify' ? 'spotify' : 'local'}-${track.id}`;
                  const isTrackPlaying = currentTrack?.id === trackId && isPlaying;
                  return (
                    <div 
                      key={trackId}
                      onClick={() => handlePlayTrack(track)}
                      className="group flex items-center gap-4 p-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <div className="w-8 text-center text-gray-400 font-medium text-sm group-hover:hidden">
                        {index + 1}
                      </div>
                      <div className="w-8 text-center text-white hidden group-hover:flex justify-center">
                        <Play size={16} fill="white" />
                      </div>
                      <div className="w-10 h-10 rounded bg-[#1a1a2e] flex-shrink-0 overflow-hidden">
                         {track.album?.image_url ? (
                            <img src={track.album.image_url} className="w-full h-full object-cover" />
                         ) : (
                            <div className="w-full h-full bg-white/10" />
                         )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-base font-medium truncate ${isTrackPlaying ? 'text-[#1DB954]' : 'text-white'}`}>
                          {track.name}
                        </p>
                      </div>
                      <div className="text-gray-400 text-sm hidden sm:block truncate max-w-[150px]">
                        {track.play_count || 0} plays
                      </div>
                      <button className="text-gray-400 opacity-0 group-hover:opacity-100 hover:text-white transition-all px-2">
                         <Heart size={18} />
                      </button>
                      <div className="text-gray-400 text-sm w-12 text-right">
                        3:45
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-400 italic py-4">No tracks uploaded yet.</p>
              )}
            </div>
          </div>

          {/* Albums */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">Discography</h2>
            <div className="flex flex-col gap-4">
              {artist.albums && artist.albums.length > 0 ? (
                artist.albums.map(album => (
                  <div key={album.id} className="flex gap-4 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors cursor-pointer border border-white/5">
                    <div className="w-20 h-20 rounded-md bg-[#1a1a2e] shadow-lg overflow-hidden flex-shrink-0">
                      {album.image_url ? (
                        <img src={album.image_url} alt={album.name} className="w-full h-full object-cover" />
                      ) : (
                         <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600" />
                      )}
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="text-white font-bold text-base leading-tight mb-1">{album.name}</p>
                      <p className="text-gray-400 text-sm">{new Date(album.release_date).getFullYear()} • Album</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 italic py-4">No albums released yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

ArtistProfile.layout = page => <MainLayout children={page} />;
