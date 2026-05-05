import React, { useState, useEffect } from 'react';
import { usePlayer } from '@/Context/PlayerContext';
import { usePage, router } from '@inertiajs/react';
import axios from 'axios';

export default function MusicPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlayPause,
    playNext,
    playPrevious,
    seek,
    setVolume,
  } = usePlayer();

  const { auth } = usePage().props;
  const user = auth?.user;

  const [isLiked, setIsLiked] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(1);

  // Check like status when track changes
  useEffect(() => {
    if (!currentTrack || !user) {
      setIsLiked(false);
      return;
    }
    axios.get('/api/check-like', {
      params: {
        track_id: String(currentTrack.id),
        source: currentTrack.source || 'local',
      }
    })
    .then(res => setIsLiked(res.data.liked))
    .catch(() => setIsLiked(false));
  }, [currentTrack?.id, user]);

  // Record history when a new track starts playing
  useEffect(() => {
    if (!currentTrack || !user || !isPlaying) return;

    const timeout = setTimeout(() => {
      axios.post('/api/record-history', {
        track_id: String(currentTrack.id),
        source: currentTrack.source || 'local',
        metadata: {
          name: currentTrack.name,
          artist_name: currentTrack.artist?.name || currentTrack.artist || 'Unknown',
          album_name: currentTrack.album?.name || '',
          image_url: currentTrack.album?.image_url || null,
          preview_url: currentTrack.preview_url || null,
        }
      }).catch(() => {});
    }, 3000); // Record after 3 seconds of listening

    return () => clearTimeout(timeout);
  }, [currentTrack?.id, isPlaying]);

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  const handleLike = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!currentTrack) return;

    axios.post('/api/like-track', {
      track_id: String(currentTrack.id),
      source: currentTrack.source || 'local',
      metadata: {
        name: currentTrack.name,
        artist_name: currentTrack.artist?.name || currentTrack.artist || 'Unknown',
        album_name: currentTrack.album?.name || '',
        image_url: currentTrack.album?.image_url || null,
        preview_url: currentTrack.preview_url || null,
      }
    })
    .then(res => setIsLiked(res.data.liked))
    .catch(() => {});
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seek(percent * duration);
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(prevVolume);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  // ── Auth Prompt Modal ──────────────────────────────────────────────
  const AuthModal = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowAuthModal(false)}>
      <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl transform animate-in" onClick={e => e.stopPropagation()}>
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white" stroke="none">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </div>

        <h3 className="text-xl font-bold text-white text-center mb-2">
          Save to your library
        </h3>
        <p className="text-gray-400 text-sm text-center mb-6 leading-relaxed">
          Log in or sign up to like songs, build your library, and keep your listening history.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => { setShowAuthModal(false); router.visit('/login'); }}
            className="w-full py-3 rounded-full bg-white text-black font-bold text-sm hover:bg-gray-100 transition-colors"
          >
            Log in
          </button>
          <button
            onClick={() => { setShowAuthModal(false); router.visit('/login'); }}
            className="w-full py-3 rounded-full border border-white/20 text-white font-bold text-sm hover:bg-white/10 transition-colors"
          >
            Sign up
          </button>
          <button
            onClick={() => setShowAuthModal(false)}
            className="text-gray-500 text-sm hover:text-white transition-colors mt-1"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );

  // ── Empty state (no track selected) ────────────────────────────────
  if (!currentTrack) {
    return (
      <div className="fixed bottom-0 left-64 right-0 z-50">
        <div className="h-[72px] bg-[#030308]/95 backdrop-blur-xl border-t border-white/[0.06] flex items-center px-4">
          {/* Left: Controls (disabled) */}
          <div className="flex items-center gap-1">
            <button disabled className="text-gray-600 p-2"><SkipPrevIcon /></button>
            <button disabled className="text-gray-600 p-2"><PauseIcon /></button>
            <button disabled className="text-gray-600 p-2"><SkipNextIcon /></button>
            <span className="text-gray-600 text-xs ml-3 font-mono">0:00 / 0:00</span>
          </div>

          {/* Center: empty hint */}
          <div className="flex-1 flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded bg-white/[0.05] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-600"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
            </div>
            <div className="min-w-0">
              <p className="text-gray-500 text-sm font-medium truncate">Select a track to start listening</p>
            </div>
          </div>

          {/* Right: Volume (disabled) */}
          <div className="flex items-center gap-2">
            <button disabled className="text-gray-600 p-2"><VolumeIcon level={1} /></button>
          </div>
        </div>
      </div>
    );
  }

  // ── Active state ───────────────────────────────────────────────────
  return (
    <>
      {showAuthModal && <AuthModal />}

      <div className="fixed bottom-0 left-64 right-0 z-50 flex flex-col">
        {/* ─── Progress Bar (top edge, YouTube Music style) ─── */}
        <div
          className="w-full h-[3px] bg-white/[0.08] cursor-pointer group relative"
          onClick={handleSeek}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
        >
          <div
            className="h-full bg-white transition-all duration-100 relative"
            style={{ width: `${progressPercent}%` }}
          >
            {/* Scrubber dot (shows on hover) */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md" />
          </div>
        </div>

        {/* ─── Player Bar ─── */}
        <div className="h-[68px] bg-[#030308]/95 backdrop-blur-xl border-t border-white/[0.04] flex items-center px-4 gap-2">

          {/* ── Left: Transport Controls + Time ── */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={playPrevious}
              className="text-white/70 hover:text-white p-2 transition-colors"
              title="Previous"
            >
              <SkipPrevIcon />
            </button>

            <button
              onClick={togglePlayPause}
              className="text-white hover:text-white p-2 transition-colors"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>

            <button
              onClick={playNext}
              className="text-white/70 hover:text-white p-2 transition-colors"
              title="Next"
            >
              <SkipNextIcon />
            </button>

            <span className="text-white/50 text-xs ml-3 font-mono tabular-nums whitespace-nowrap">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* ── Center: Track Info ── */}
          <div className="flex-1 flex items-center justify-center gap-3 min-w-0 px-4">
            {/* Album Art */}
            <div className="relative flex-shrink-0">
              {currentTrack.album?.image_url ? (
                <img
                  src={currentTrack.album.image_url}
                  alt={currentTrack.name}
                  className="w-10 h-10 rounded object-cover shadow-lg"
                />
              ) : (
                <div className="w-10 h-10 rounded bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                </div>
              )}
              {/* Source badge */}
              {currentTrack.source === 'spotify' && (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#1DB954] border-[1.5px] border-[#030308] flex items-center justify-center">
                  <svg width="7" height="7" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                </div>
              )}
            </div>

            {/* Track title & artist */}
            <div className="min-w-0 max-w-[280px]">
              <p className="text-white text-sm font-medium truncate leading-tight">{currentTrack.name}</p>
              <p className="text-white/50 text-xs truncate leading-tight mt-0.5">
                {currentTrack.artist?.name || currentTrack.artist || 'Unknown Artist'}
                {currentTrack.album?.name && <span> • {currentTrack.album.name}</span>}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
              {/* Thumbs Down (dislike) */}
              <button className="text-white/40 hover:text-white p-2 transition-colors" title="Dislike">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z"/>
                </svg>
              </button>

              {/* Thumbs Up (like) */}
              <button
                onClick={handleLike}
                className={`p-2 transition-colors ${isLiked ? 'text-blue-400' : 'text-white/40 hover:text-white'}`}
                title={isLiked ? 'Unlike' : 'Like'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 10V22"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>
                </svg>
              </button>

              {/* More options */}
              <button className="text-white/40 hover:text-white p-2 transition-colors" title="More">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
                </svg>
              </button>
            </div>
          </div>

          {/* ── Right: Volume ── */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={toggleMute}
              className="text-white/60 hover:text-white p-2 transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              <VolumeIcon level={isMuted ? 0 : volume} />
            </button>
            <div className="relative w-[90px] h-5 flex items-center group">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setVolume(v);
                  if (v > 0) setIsMuted(false);
                }}
                className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
                  [&::-webkit-slider-thumb]:opacity-0 [&::-webkit-slider-thumb]:group-hover:opacity-100
                  [&::-webkit-slider-thumb]:transition-opacity [&::-webkit-slider-thumb]:cursor-pointer"
                style={{
                  background: `linear-gradient(to right, rgba(255,255,255,0.85) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.15) ${(isMuted ? 0 : volume) * 100}%)`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Inline SVG Icon Components ───────────────────────────────────────

function SkipPrevIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 6h2v12H6V6zm3.5 6 8.5 6V6l-8.5 6z"/>
    </svg>
  );
}

function SkipNextIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 6h2v12h-2V6zM4 18l8.5-6L4 6v12z"/>
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z"/>
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
    </svg>
  );
}

function VolumeIcon({ level }) {
  if (level === 0) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <line x1="23" y1="9" x2="17" y2="15"/>
        <line x1="17" y1="9" x2="23" y2="15"/>
      </svg>
    );
  }
  if (level < 0.5) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    </svg>
  );
}
