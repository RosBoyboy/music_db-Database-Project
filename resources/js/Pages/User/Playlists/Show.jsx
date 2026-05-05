import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { usePlayer } from '@/Context/PlayerContext';
import { Play, Pause, Shuffle, Trash2, Plus, Music, Clock, Search, X, ChevronLeft, MoreHorizontal } from 'lucide-react';
import axios from 'axios';

export default function Show({ playlist, tracks: initialTracks, isOwner }) {
  const { playQueue, currentTrack, isPlaying, togglePlayPause } = usePlayer();
  const [tracks, setTracks] = useState(initialTracks || []);
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [addingTrackId, setAddingTrackId] = useState(null);

  const handlePlayAll = () => {
    if (tracks.length === 0) return;
    playQueue(tracks, 0);
  };

  const handlePlayTrack = (track, index) => {
    if (currentTrack?.id === track.id) { togglePlayPause(); return; }
    playQueue(tracks, index);
  };

  const handleRemoveTrack = (track) => {
    axios.post(`/api/playlist/${playlist.id}/remove-track`, {
      track_id: String(track.id),
      source: track.source || 'local',
    }).then(() => {
      setTracks(prev => prev.filter(t => !(t.id === track.id && t.source === track.source)));
    }).catch(() => {});
  };

  const handleDeletePlaylist = () => {
    router.delete(`/my-playlist/${playlist.id}`);
  };

  // Search for songs to add
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(() => {
      setSearching(true);
      axios.get('/api/search', { params: { q: searchQuery } })
        .then(res => {
          const all = [
            ...(res.data.tracks || []).map(t => ({ ...t, id: t.id || `local-${t.id}`, source: 'local' })),
            ...(res.data.spotify_tracks || []).map(t => ({ ...t, source: 'spotify' })),
          ];
          setSearchResults(all.slice(0, 20));
        })
        .catch(() => setSearchResults([]))
        .finally(() => setSearching(false));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAddTrack = (track) => {
    setAddingTrackId(track.id);
    axios.post(`/api/playlist/${playlist.id}/add-track`, {
      track_id: String(track.id),
      source: track.source || 'local',
      metadata: {
        name: track.name || track.title,
        artist_name: track.artist?.name || track.artist || 'Unknown',
        album_name: track.album?.name || '',
        image_url: track.album?.image_url || track.image_url || null,
        preview_url: track.preview_url || null,
      }
    }).then(res => {
      if (res.data.added) {
        const meta = {
          id: String(track.id), name: track.name || track.title,
          artist: { name: track.artist?.name || track.artist || 'Unknown' },
          album: { name: track.album?.name || '', image_url: track.album?.image_url || track.image_url || null },
          preview_url: track.preview_url || null, source: track.source || 'local',
          position: tracks.length, added_at: new Date().toISOString(),
        };
        setTracks(prev => [...prev, meta]);
      }
    }).catch(() => {}).finally(() => setAddingTrackId(null));
  };

  const isTrackInPlaylist = (track) => tracks.some(t => String(t.id) === String(track.id) && t.source === track.source);

  return (
    <>
      <Head title={`${playlist.name} | SoundWave`} />

      <div className="max-w-5xl mx-auto text-white">
        {/* Back */}
        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium mb-6 transition-colors">
          <ChevronLeft size={18} /> Back
        </button>

        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-10 items-end">
          <div className={`w-48 h-48 md:w-56 md:h-56 flex-shrink-0 shadow-2xl rounded-xl bg-gradient-to-br ${playlist.cover_gradient} relative overflow-hidden`}>
            {tracks.length > 0 ? (
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-30">
                {tracks.slice(0, 4).map((t, i) => (
                  t.album?.image_url ? <img key={i} src={t.album.image_url} className="w-full h-full object-cover" alt="" /> : <div key={i} />
                ))}
              </div>
            ) : null}
            <div className="absolute inset-0 flex items-center justify-center">
              <Music size={60} className="text-white/20" />
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-1 pb-2">
            <span className="text-sm font-bold uppercase tracking-wider text-white/60">Playlist</span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter leading-none mb-1">{playlist.name}</h1>
            {playlist.description && <p className="text-gray-400 text-sm max-w-lg">{playlist.description}</p>}
            <p className="text-gray-500 text-sm">{tracks.length} {tracks.length === 1 ? 'song' : 'songs'}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={handlePlayAll} disabled={tracks.length === 0} className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-xl disabled:opacity-40 disabled:cursor-not-allowed">
            <Play size={24} fill="black" className="ml-1" />
          </button>
          <button className="text-gray-400 hover:text-white transition-colors" title="Shuffle"><Shuffle size={24} /></button>
          {isOwner && (
            <>
              <button onClick={() => setShowAddDrawer(true)} className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-sm font-medium text-gray-300 hover:text-white hover:border-white/20 transition-colors">
                <Plus size={16} /> Add songs
              </button>
              <button onClick={() => setShowDeleteConfirm(true)} className="text-gray-500 hover:text-red-400 transition-colors ml-auto" title="Delete playlist">
                <Trash2 size={20} />
              </button>
            </>
          )}
        </div>

        {/* Track List */}
        {tracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-5">
              <Music size={32} className="text-gray-600" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">This playlist is empty</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-xs">Add songs from search, liked songs, or your history.</p>
            {isOwner && (
              <button onClick={() => setShowAddDrawer(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-bold text-sm hover:bg-gray-100 transition">
                <Plus size={16} /> Find songs
              </button>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-4 px-4 py-2 border-b border-white/10 text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
              <div className="w-8 text-center">#</div>
              <div className="flex-1 min-w-0">Title</div>
              <div className="w-1/4 hidden md:block">Album</div>
              <div className="w-12 text-right flex justify-end"><Clock size={14} /></div>
            </div>
            <div className="space-y-0.5">
              {tracks.map((track, index) => {
                const isCurrent = currentTrack?.id === track.id;
                const isThisPlaying = isCurrent && isPlaying;
                return (
                  <div key={`${track.id}-${index}`} onClick={() => handlePlayTrack(track, index)} className="group flex items-center gap-4 px-4 py-2.5 rounded-md hover:bg-white/[0.07] transition-colors cursor-pointer">
                    <div className="w-8 text-center">
                      {isThisPlaying ? (
                        <div className="flex items-center justify-center gap-[2px]">
                          <span className="w-[3px] h-3 bg-purple-400 rounded-full animate-pulse" />
                          <span className="w-[3px] h-4 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '75ms' }} />
                          <span className="w-[3px] h-2.5 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                        </div>
                      ) : (
                        <><span className="text-gray-500 text-sm group-hover:hidden">{index + 1}</span><Play size={14} fill="white" className="text-white hidden group-hover:block mx-auto" /></>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex items-center gap-3">
                      <div className="w-10 h-10 rounded flex-shrink-0 overflow-hidden bg-white/5">
                        {track.album?.image_url ? <img src={track.album.image_url} className="w-full h-full object-cover" alt="" /> : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center"><Music size={14} className="text-white/40" /></div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${isCurrent ? 'text-purple-400' : 'text-white'}`}>{track.name}</p>
                        <p className="text-xs text-gray-500 truncate">{track.artist?.name || 'Unknown Artist'}</p>
                      </div>
                    </div>
                    <div className="w-1/4 hidden md:block truncate text-xs text-gray-500">{track.album?.name || ''}</div>
                    <div className="w-12 flex justify-end items-center">
                      {isOwner && (
                        <button onClick={(e) => { e.stopPropagation(); handleRemoveTrack(track); }} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all" title="Remove">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add Songs Drawer */}
      {showAddDrawer && (
        <div className="fixed inset-0 z-[90] flex justify-end" onClick={() => setShowAddDrawer(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-[#12121a] border-l border-white/[0.06] h-full flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <h2 className="text-lg font-bold text-white">Add songs</h2>
              <button onClick={() => setShowAddDrawer(false)} className="text-gray-400 hover:text-white p-1"><X size={20} /></button>
            </div>
            <div className="px-5 py-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search for songs..." className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 text-sm" autoFocus />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-2 pb-24">
              {searching && <p className="text-gray-500 text-sm text-center py-8">Searching...</p>}
              {!searching && searchQuery && searchResults.length === 0 && <p className="text-gray-500 text-sm text-center py-8">No results found</p>}
              {!searching && !searchQuery && <p className="text-gray-500 text-sm text-center py-8">Search for songs to add to your playlist</p>}
              {searchResults.map((track, i) => {
                const alreadyAdded = isTrackInPlaylist(track);
                const isAdding = addingTrackId === track.id;
                return (
                  <div key={`${track.id}-${i}`} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.05] transition-colors">
                    <div className="w-10 h-10 rounded flex-shrink-0 overflow-hidden bg-white/5">
                      {(track.album?.image_url || track.image_url) ? <img src={track.album?.image_url || track.image_url} className="w-full h-full object-cover" alt="" /> : (
                        <div className="w-full h-full bg-white/10 flex items-center justify-center"><Music size={14} className="text-gray-600" /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{track.name || track.title}</p>
                      <p className="text-xs text-gray-500 truncate">{track.artist?.name || track.artist || 'Unknown'}</p>
                    </div>
                    <button
                      onClick={() => !alreadyAdded && !isAdding && handleAddTrack(track)}
                      disabled={alreadyAdded || isAdding}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                        alreadyAdded ? 'bg-white/5 text-gray-500 cursor-default' : isAdding ? 'bg-white/10 text-gray-400' : 'bg-white text-black hover:bg-gray-100'
                      }`}
                    >
                      {alreadyAdded ? 'Added' : isAdding ? '...' : 'Add'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-2">Delete playlist?</h3>
            <p className="text-gray-400 text-sm mb-6">This will permanently delete <strong>{playlist.name}</strong> and remove all songs from it. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2.5 rounded-full border border-white/10 text-gray-400 font-medium text-sm hover:text-white transition">Cancel</button>
              <button onClick={handleDeletePlaylist} className="flex-1 py-2.5 rounded-full bg-red-500 text-white font-bold text-sm hover:bg-red-400 transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

Show.layout = page => <MainLayout children={page} />;
