import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import MainLayout from '../Layouts/MainLayout';
import TrackCard from '../Components/TrackCard';
import { usePlayer } from '../Context/PlayerContext';
import { Search as SearchIcon, Loader2, Music, Mic2 } from 'lucide-react';

const TABS = [
  { id: 'all',     label: 'All' },
  { id: 'tracks',  label: 'Songs' },
  { id: 'artists', label: 'Artists' },
  { id: 'albums',  label: 'Albums' },
];

const GRADIENTS = [
  'from-purple-500 to-indigo-500',
  'from-pink-500 to-rose-500',
  'from-amber-400 to-orange-500',
  'from-emerald-400 to-teal-500',
  'from-blue-400 to-cyan-500',
  'from-fuchsia-500 to-purple-600',
];

// ── Sub-components ──────────────────────────────────────────────────────────

function SectionLabel({ children, variant = 'local' }) {
  return (
    <span className={`text-xs font-bold tracking-widest uppercase ${variant === 'spotify' ? 'text-[#1DB954]' : 'text-gray-500'}`}>
      {children}
    </span>
  );
}

function SpotifyTrackCard({ track, allSpotifyTracks }) {
  const { play, playQueue, currentTrack, isPlaying } = usePlayer();
  const isCurrentTrack = currentTrack?.id === `spotify-${track.id}`;
  const [fallbackUrl, setFallbackUrl] = React.useState(null);

  React.useEffect(() => {
    if (!track.preview_url) {
      const query = encodeURIComponent(`${track.title || track.name} ${track.artist}`);
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

  const handlePlay = () => {
    const queue = (allSpotifyTracks || []).map(t => ({
      id: `spotify-${t.id}`,
      name: t.name,
      artist: { name: t.artist },
      album: { name: t.album, image_url: t.image_url },
      preview_url: t.preview_url, // Keep raw preview_url, it will be resolved on play if needed
      source: 'spotify',
    }));

    const playerTrack = {
      id: `spotify-${track.id}`,
      name: track.name,
      artist: { name: track.artist },
      album: { name: track.album, image_url: track.image_url },
      preview_url: actualPreviewUrl,
      source: 'spotify',
    };

    if (queue.length > 0) {
      const idx = queue.findIndex(t => t.id === playerTrack.id);
      // We mutate the target track in queue to ensure it has the resolved URL
      if (idx >= 0) queue[idx].preview_url = actualPreviewUrl;
      playQueue(queue, idx >= 0 ? idx : 0);
    } else {
      play(playerTrack);
    }
  };

  return (
    <div className="group cursor-pointer rounded-xl p-3 hover:bg-white/[0.05] transition-all duration-300">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg mb-3 shadow-lg bg-[#1a1a2e]">
        {track.image_url ? (
          <img src={track.image_url} alt={track.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <Music size={40} className="text-white" />
          </div>
        )}
        {/* Source Badge */}
        {actualPreviewUrl ? (
          <div className="absolute top-2 left-2 bg-[#1DB954]/90 text-black text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded backdrop-blur-md">
            Spotify Preview
          </div>
        ) : (
          <div className="absolute top-2 left-2 bg-red-500/90 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded backdrop-blur-md">
            No Preview Available
          </div>
        )}

        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
          {actualPreviewUrl ? (
            <button
              onClick={handlePlay}
              className={`w-12 h-12 rounded-full shadow-xl hover:scale-110 flex items-center justify-center transition-transform ${isCurrentTrack && isPlaying ? 'bg-white text-black' : 'bg-[#1DB954] text-black'}`}
            >
              {isCurrentTrack && isPlaying
                ? <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                : <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              }
            </button>
          ) : (
            <span className="text-xs font-semibold text-white bg-black/70 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              No Audio File
            </span>
          )}
        </div>
        {/* Spotify badge */}
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#1DB954] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
        </div>
        {/* Now-playing indicator */}
        {isCurrentTrack && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1">
            <span className={`w-1 h-3 rounded-full ${isPlaying ? 'bg-[#1DB954] animate-pulse' : 'bg-gray-400'}`}/>
            <span className={`w-1 h-4 rounded-full ${isPlaying ? 'bg-[#1DB954] animate-pulse delay-75' : 'bg-gray-400'}`}/>
            <span className={`w-1 h-2.5 rounded-full ${isPlaying ? 'bg-[#1DB954] animate-pulse delay-150' : 'bg-gray-400'}`}/>
          </div>
        )}
      </div>
      <h3 className="text-white font-bold text-sm truncate mt-1">{track.name}</h3>
      <p className="text-gray-400 text-xs truncate mt-0.5">{track.artist}</p>
    </div>
  );
}

function ArtistCard({ artist, isSpotify = false, index = 0 }) {
  const grad = GRADIENTS[index % GRADIENTS.length];
  return (
    <button className="group text-center w-full" onClick={() => router.visit(`/artist/${artist.id}`)}>
      <div className={`aspect-square rounded-full relative overflow-hidden shadow-lg group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300 mb-3 ${!artist.image_url ? `bg-gradient-to-br ${grad}` : 'bg-[#1f1f1f]'}`}>
        {artist.image_url ? (
          <img src={artist.image_url} alt={artist.name} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-40">
            <Mic2 size={36} className="text-white" />
          </div>
        )}
        {isSpotify && (
          <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#1DB954] flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
          </div>
        )}
      </div>
      <p className="text-sm font-bold text-white truncate group-hover:text-gray-300 transition-colors">{artist.name}</p>
      {isSpotify && artist.genres?.length > 0 && (
        <p className="text-xs text-gray-500 truncate mt-0.5">{artist.genres.join(', ')}</p>
      )}
    </button>
  );
}

// ── Main Search Page ─────────────────────────────────────────────────────────
export default function Search({ query: initialQuery, localTracks, localArtists, localAlbums, spotifyTracks, spotifyArtists }) {
  const [inputValue, setInputValue]   = useState(initialQuery || '');
  const [activeTab, setActiveTab]     = useState('all');
  const [isLoading, setIsLoading]     = useState(false);
  const [results, setResults]         = useState({
    localTracks:    localTracks    || [],
    localArtists:   localArtists   || [],
    localAlbums:    localAlbums    || [],
    spotifyTracks:  spotifyTracks  || [],
    spotifyArtists: spotifyArtists || [],
  });
  const debounceRef = useRef(null);

  const hasLocalResults  = results.localTracks.length > 0 || results.localArtists.length > 0 || results.localAlbums.length > 0;
  const hasSpotify       = results.spotifyTracks.length > 0 || results.spotifyArtists.length > 0;
  const hasAnyResults    = hasLocalResults || hasSpotify;

  // ── Debounced search ────────────────────────────────────────────────
  const doSearch = useCallback((q) => {
    if (!q || q.length < 2) {
      setResults({ localTracks: [], localArtists: [], localAlbums: [], spotifyTracks: [], spotifyArtists: [] });
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    axios.get('/api/search', { params: { q } })
      .then(res => {
        setResults({
          localTracks:    res.data.local_tracks    || [],
          localArtists:   res.data.local_artists   || [],
          localAlbums:    res.data.local_albums    || [],
          spotifyTracks:  res.data.spotify_tracks  || [],
          spotifyArtists: res.data.spotify_artists || [],
        });
      })
      .catch(() => {
        // Keep whatever was last shown
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    setInputValue(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 400);
  };

  // Sync with server-side initial props
  useEffect(() => {
    setResults({
      localTracks:    localTracks    || [],
      localArtists:   localArtists   || [],
      localAlbums:    localAlbums    || [],
      spotifyTracks:  spotifyTracks  || [],
      spotifyArtists: spotifyArtists || [],
    });
  }, [localTracks, localArtists, localAlbums, spotifyTracks, spotifyArtists]);

  const showTab = (id) => activeTab === 'all' || activeTab === id;

  return (
    <MainLayout>
      <Head title={inputValue ? `Search: ${inputValue}` : 'Search'} />
      <div className="text-white pb-28">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* ── Header ────────────────────────────────────────────── */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Search</h1>
              <p className="text-sm text-gray-400 mt-1">Find music from your library and Spotify</p>
            </div>
            {isLoading && <Loader2 size={22} className="text-gray-400 animate-spin" />}
          </div>

          {/* ── Mobile Search Input ────────────────────────────────── */}
          <div className="relative sm:hidden">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search songs, albums, artists..."
              value={inputValue}
              onChange={handleInput}
              autoFocus
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/25 focus:bg-white/8 transition-all"
            />
          </div>

          {/* ── Empty State ────────────────────────────────────────── */}
          {!inputValue && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center mb-6">
                <SearchIcon size={36} className="text-gray-400" />
              </div>
              <p className="text-white font-bold text-2xl mb-2">Search for music</p>
              <p className="text-sm text-gray-400 max-w-sm">Find your favorite songs, artists, and albums from your library and Spotify simultaneously.</p>

              {/* Recent Searches */}
              {(() => {
                let recent = [];
                try { recent = JSON.parse(localStorage.getItem('musicstream_recent_searches')) || []; } catch {}
                if (recent.length === 0) return null;
                return (
                  <div className="mt-10 w-full max-w-md">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Recent Searches</span>
                      <button
                        onClick={() => { localStorage.removeItem('musicstream_recent_searches'); window.location.reload(); }}
                        className="text-xs text-gray-600 hover:text-white transition"
                      >Clear all</button>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {recent.map(term => (
                        <button key={term} onClick={() => { setInputValue(term); doSearch(term); }}
                          className="px-4 py-2 rounded-full bg-white/[0.07] border border-white/10 text-sm text-gray-200 hover:text-white hover:bg-white/15 transition-all flex items-center gap-2">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Suggested Tags */}
              <div className="flex flex-wrap gap-2 mt-8 justify-center max-w-sm">
                {['Taylor Swift', 'Anti-Hero', 'Blinding Lights', 'Olivia Rodrigo', 'Future Nostalgia', 'Drake'].map(tag => (
                  <button key={tag} onClick={() => { setInputValue(tag); doSearch(tag); }}
                    className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all">
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── No Results ─────────────────────────────────────────── */}
          {inputValue && !isLoading && !hasAnyResults && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <SearchIcon size={24} className="text-gray-500" />
              </div>
              <p className="text-white font-semibold text-lg">No results for "{inputValue}"</p>
              <p className="text-sm text-gray-400 mt-1">Try different keywords or check the spelling</p>
            </div>
          )}

          {/* ── Results ────────────────────────────────────────────── */}
          {inputValue && hasAnyResults && (
            <>
              {/* Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {TABS.map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)}
                    className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                      activeTab === t.id ? 'bg-white text-black' : 'bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="space-y-12">

                {/* ────── SONGS ───────────────────────────────────── */}
                {showTab('tracks') && (results.localTracks.length > 0 || results.spotifyTracks.length > 0) && (
                  <section>
                    <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Songs</h2>

                    {results.localTracks.length > 0 && (
                      <div className="mb-8">
                        <SectionLabel>From Your Library</SectionLabel>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-6 mt-4">
                          {results.localTracks.map(track => <TrackCard key={`l-${track.id}`} track={track} />)}
                        </div>
                      </div>
                    )}

                    {results.spotifyTracks.length > 0 && (
                      <div>
                        <SectionLabel variant="spotify">From Spotify</SectionLabel>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-6 mt-4">
                          {results.spotifyTracks.map(track => <SpotifyTrackCard key={`s-${track.id}`} track={track} allSpotifyTracks={results.spotifyTracks} />)}
                        </div>
                      </div>
                    )}
                  </section>
                )}

                {/* ────── ARTISTS ─────────────────────────────────── */}
                {showTab('artists') && (results.localArtists.length > 0 || results.spotifyArtists.length > 0) && (
                  <section>
                    <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Artists</h2>

                    {results.localArtists.length > 0 && (
                      <div className="mb-8">
                        <SectionLabel>From Your Library</SectionLabel>
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-4 mt-4">
                          {results.localArtists.map((a, i) => <ArtistCard key={`la-${a.id}`} artist={a} index={i} />)}
                        </div>
                      </div>
                    )}

                    {results.spotifyArtists.length > 0 && (
                      <div>
                        <SectionLabel variant="spotify">From Spotify</SectionLabel>
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-4 mt-4">
                          {results.spotifyArtists.map((a, i) => <ArtistCard key={`sa-${a.id}`} artist={a} isSpotify index={i} />)}
                        </div>
                      </div>
                    )}
                  </section>
                )}

                {/* ────── ALBUMS ──────────────────────────────────── */}
                {showTab('albums') && results.localAlbums.length > 0 && (
                  <section>
                    <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Albums</h2>
                    <SectionLabel>From Your Library</SectionLabel>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-6 mt-4">
                      {results.localAlbums.map((album, i) => (
                        <div key={album.id} className="group cursor-pointer">
                          <div className={`aspect-square rounded-xl overflow-hidden shadow-lg group-hover:-translate-y-1 transition-all duration-300 ${!album.image_url ? `bg-gradient-to-br ${GRADIENTS[(i + 2) % GRADIENTS.length]}` : 'bg-[#1f1f1f]'}`}>
                            {album.image_url && <img src={album.image_url} alt={album.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />}
                          </div>
                          <p className="text-sm font-bold text-white truncate mt-3">{album.name}</p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">{album.artist?.name}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

              </div>
            </>
          )}

        </div>
      </div>
    </MainLayout>
  );
}
