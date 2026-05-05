import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import MainLayout from '../Layouts/MainLayout';
import { usePlayer } from '../Context/PlayerContext';
import { Play, Pause, Clock, Music, Trash2 } from 'lucide-react';

export default function History({ historyTracks }) {
  const { play, playQueue, currentTrack, isPlaying, togglePlayPause } = usePlayer();
  const { auth } = usePage().props;

  const handlePlayTrack = (track, index) => {
    if (currentTrack?.id === track.id) {
      togglePlayPause();
      return;
    }
    playQueue(historyTracks, index);
  };

  // Group tracks by date
  const groupedByDate = {};
  if (historyTracks && historyTracks.length > 0) {
    historyTracks.forEach((track) => {
      const date = new Date(track.played_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let label;
      if (date.toDateString() === today.toDateString()) {
        label = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        label = 'Yesterday';
      } else {
        label = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      }

      if (!groupedByDate[label]) groupedByDate[label] = [];
      groupedByDate[label].push(track);
    });
  }

  const totalTracks = historyTracks?.length || 0;

  return (
    <MainLayout>
      <Head title="History | SoundWave" />

      <div className="max-w-5xl mx-auto text-white">

        {/* ── Page Header ── */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
              <Clock size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">History</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {totalTracks} {totalTracks === 1 ? 'track' : 'tracks'} listened to recently
              </p>
            </div>
          </div>
        </div>

        {/* ── Empty State ── */}
        {totalTracks === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <Clock size={36} className="text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Your listening history will appear here</h3>
            <p className="text-gray-500 text-sm max-w-sm">
              Start listening to music and your history will be automatically tracked.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedByDate).map(([dateLabel, tracks]) => (
              <div key={dateLabel}>
                {/* Date Header */}
                <h2 className="text-lg font-bold text-white mb-3 sticky top-0 bg-[#0a0a12]/95 backdrop-blur-sm py-2 z-10">
                  {dateLabel}
                </h2>

                <div className="space-y-0.5">
                  {tracks.map((track, index) => {
                    const isCurrentTrack = currentTrack?.id === track.id;
                    const isThisPlaying = isCurrentTrack && isPlaying;
                    const playedTime = new Date(track.played_at);
                    const timeStr = playedTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

                    return (
                      <div
                        key={`${track.id}-${track.played_at}-${index}`}
                        onClick={() => handlePlayTrack(track, historyTracks.indexOf(track))}
                        className="group flex items-center gap-4 px-4 py-2.5 rounded-md hover:bg-white/[0.07] transition-colors cursor-pointer"
                      >
                        {/* Play indicator */}
                        <div className="w-8 flex-shrink-0">
                          {isThisPlaying ? (
                            <div className="flex items-center justify-center gap-[2px]">
                              <span className="w-[3px] h-3 bg-amber-400 rounded-full animate-pulse" />
                              <span className="w-[3px] h-4 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: '75ms' }} />
                              <span className="w-[3px] h-2.5 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                            </div>
                          ) : (
                            <Play size={14} fill="white" className="text-white opacity-0 group-hover:opacity-100 transition-opacity mx-auto" />
                          )}
                        </div>

                        {/* Track info */}
                        <div className="flex-1 min-w-0 flex items-center gap-3">
                          <div className="w-10 h-10 rounded flex-shrink-0 overflow-hidden bg-white/5">
                            {track.album?.image_url ? (
                              <img src={track.album.image_url} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center">
                                <Music size={14} className="text-white/40" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className={`text-sm font-medium truncate ${isCurrentTrack ? 'text-amber-400' : 'text-white'}`}>
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
                        <div className="w-1/4 hidden lg:block truncate text-xs text-gray-500">
                          {track.album?.name || ''}
                        </div>

                        {/* Time played */}
                        <div className="w-20 text-right text-xs text-gray-600 flex-shrink-0">
                          {timeStr}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
