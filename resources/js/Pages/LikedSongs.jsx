import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import MainLayout from '../Layouts/MainLayout';
import { usePlayer } from '../Context/PlayerContext';
import { Play, Pause, Shuffle, Heart, Clock, Music } from 'lucide-react';
import axios from 'axios';

export default function LikedSongs({ likedTracks }) {
  const { play, playQueue, currentTrack, isPlaying, togglePlayPause } = usePlayer();
  const { auth } = usePage().props;

  const handlePlayAll = () => {
    if (!likedTracks || likedTracks.length === 0) return;
    playQueue(likedTracks, 0);
  };

  const handlePlayTrack = (track, index) => {
    if (currentTrack?.id === track.id) {
      togglePlayPause();
      return;
    }
    playQueue(likedTracks, index);
  };

  const handleUnlike = (track) => {
    axios.post('/api/like-track', {
      track_id: String(track.id),
      source: track.source || 'local',
      metadata: {
        name: track.name,
        artist_name: track.artist?.name || 'Unknown',
        album_name: track.album?.name || '',
        image_url: track.album?.image_url || null,
        preview_url: track.preview_url || null,
      }
    }).then(() => {
      // Reload to get updated list
      window.location.reload();
    }).catch(() => {});
  };

  const totalTracks = likedTracks?.length || 0;

  return (
    <MainLayout>
      <Head title="Liked Songs | SoundWave" />

      <div className="max-w-7xl mx-auto text-white">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-10 items-end">
          {/* Gradient Cover */}
          <div className="w-48 h-48 md:w-56 md:h-56 flex-shrink-0 shadow-2xl rounded-xl bg-gradient-to-br from-purple-700 via-indigo-600 to-blue-500 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <Heart size={72} className="text-white/30 drop-shadow-2xl" fill="white" fillOpacity={0.15} />
            </div>
            {/* Grid of tiny album arts */}
            {likedTracks && likedTracks.length > 0 && (
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-30">
                {likedTracks.slice(0, 4).map((t, i) => (
                  t.album?.image_url ? (
                    <img key={i} src={t.album.image_url} className="w-full h-full object-cover" alt="" />
                  ) : <div key={i} />
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 flex-1 pb-2">
            <span className="text-sm font-bold uppercase tracking-wider text-white/60">Playlist</span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter leading-none mb-2">
              Liked Songs
            </h1>
            <p className="text-gray-400 text-sm">
              {auth?.user?.name || 'You'} • {totalTracks} {totalTracks === 1 ? 'song' : 'songs'}
            </p>
          </div>
        </div>

        {/* ── Action Controls ── */}
        <div className="flex items-center gap-5 mb-8">
          <button
            onClick={handlePlayAll}
            disabled={totalTracks === 0}
            className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-xl disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Play size={24} fill="black" className="ml-1" />
          </button>
          <button className="text-gray-400 hover:text-white transition-colors" title="Shuffle">
            <Shuffle size={26} />
          </button>
        </div>

        {/* ── Track List ── */}
        {totalTracks === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <Heart size={36} className="text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Songs you like will appear here</h3>
            <p className="text-gray-500 text-sm max-w-sm">
              Save songs by tapping the thumbs up icon on the player bar.
            </p>
          </div>
        ) : (
          <div>
            {/* Table Header */}
            <div className="flex items-center gap-4 px-4 py-2 border-b border-white/10 text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
              <div className="w-8 text-center">#</div>
              <div className="flex-1 min-w-0">Title</div>
              <div className="w-1/4 hidden md:block">Album</div>
              <div className="w-28 hidden md:block text-right">Date added</div>
              <div className="w-12 text-right flex justify-end"><Clock size={14} /></div>
            </div>

            <div className="space-y-0.5">
              {likedTracks.map((track, index) => {
                const isCurrentTrack = currentTrack?.id === track.id;
                const isThisPlaying = isCurrentTrack && isPlaying;

                return (
                  <div
                    key={`${track.id}-${index}`}
                    onClick={() => handlePlayTrack(track, index)}
                    className="group flex items-center gap-4 px-4 py-2.5 rounded-md hover:bg-white/[0.07] transition-colors cursor-pointer"
                  >
                    {/* Number / Play indicator */}
                    <div className="w-8 text-center">
                      {isThisPlaying ? (
                        <div className="flex items-center justify-center gap-[2px]">
                          <span className="w-[3px] h-3 bg-purple-400 rounded-full animate-pulse" />
                          <span className="w-[3px] h-4 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '75ms' }} />
                          <span className="w-[3px] h-2.5 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                        </div>
                      ) : (
                        <>
                          <span className="text-gray-500 text-sm group-hover:hidden">{index + 1}</span>
                          <Play size={14} fill="white" className="text-white hidden group-hover:block mx-auto" />
                        </>
                      )}
                    </div>

                    {/* Track info */}
                    <div className="flex-1 min-w-0 flex items-center gap-3">
                      <div className="w-10 h-10 rounded flex-shrink-0 overflow-hidden bg-white/5">
                        {track.album?.image_url ? (
                          <img src={track.album.image_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                            <Music size={14} className="text-white/40" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${isCurrentTrack ? 'text-purple-400' : 'text-white'}`}>
                          {track.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {track.source === 'spotify' && (
                            <span className="inline-block w-3 h-3 mr-1 align-middle">
                              <svg viewBox="0 0 24 24" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                            </span>
                          )}
                          {track.artist?.name || 'Unknown Artist'}
                        </p>
                      </div>
                    </div>

                    {/* Album */}
                    <div className="w-1/4 hidden md:block truncate text-xs text-gray-500 hover:text-white/70 transition-colors">
                      {track.album?.name || ''}
                    </div>

                    {/* Date added */}
                    <div className="w-28 hidden md:block text-right text-xs text-gray-600">
                      {track.liked_at ? new Date(track.liked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                    </div>

                    {/* Actions */}
                    <div className="w-12 flex justify-end items-center gap-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUnlike(track); }}
                        className="text-purple-400 hover:text-purple-300 transition-colors"
                        title="Remove from Liked Songs"
                      >
                        <Heart size={14} fill="currentColor" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
