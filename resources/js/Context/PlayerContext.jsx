import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

const PlayerContext = createContext();

// Single persistent Audio instance — survives Inertia page navigations
let globalAudio = null;
function getAudio() {
  if (!globalAudio) {
    globalAudio = new Audio();
  }
  return globalAudio;
}

export function PlayerProvider({ children }) {
  const audioRef = useRef(getAudio());
  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  // Keep refs in sync for use inside callbacks
  const queueRef = useRef(queue);
  const queueIndexRef = useRef(queueIndex);
  const currentTrackRef = useRef(currentTrack);

  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { queueIndexRef.current = queueIndex; }, [queueIndex]);
  useEffect(() => { currentTrackRef.current = currentTrack; }, [currentTrack]);

  // ── Sync audio state on mount (handles Inertia re-renders) ─────────
  useEffect(() => {
    const audio = audioRef.current;
    if (audio.src && !audio.paused) {
      setIsPlaying(true);
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
    }
  }, []);

  // ── Auto-next handler ──────────────────────────────────────────────
  const handleEnded = useCallback(() => {
    const q = queueRef.current;
    const idx = queueIndexRef.current;
    if (q.length === 0) return;

    const nextIdx = idx + 1;
    if (nextIdx < q.length) {
      playTrackInternal(q[nextIdx], q, nextIdx);
    } else {
      // Loop back to start
      playTrackInternal(q[0], q, 0);
    }
  }, []);

  // ── Time update handler ────────────────────────────────────────────
  const handleTimeUpdate = useCallback(() => {
    setCurrentTime(audioRef.current.currentTime);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    setDuration(audioRef.current.duration);
  }, []);

  // ── Attach persistent event listeners ──────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', () => setIsPlaying(false));
    audio.addEventListener('play', () => setIsPlaying(true));

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', () => setIsPlaying(false));
      audio.removeEventListener('play', () => setIsPlaying(true));
    };
  }, [handleEnded, handleTimeUpdate, handleLoadedMetadata]);

  // ── Core play function (internal) ──────────────────────────────────
  const playTrackInternal = async (track, newQueue, newIndex) => {
    const audio = audioRef.current;

    // Determine the audio source
    let audioUrl = null;

    if (track.source === 'local') {
      // Strip 'local-' prefix if present for the API call
      const rawId = String(track.id).replace(/^local-/, '');
      audioUrl = `/api/tracks/stream/${rawId}`;
    } else {
      audioUrl = track.preview_url || track.fallback_url || null;
    }

    // Dynamic iTunes fallback for Spotify tracks without preview
    if (!audioUrl && track.source === 'spotify') {
      try {
        const query = encodeURIComponent(`${track.name || track.title} ${track.artist?.name || track.artist || ''}`);
        const res = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1`);
        const data = await res.json();
        if (data.results?.[0]?.previewUrl) {
          audioUrl = data.results[0].previewUrl;
          track.preview_url = audioUrl; // Cache it
        }
      } catch (e) {
        console.error('iTunes fallback failed:', e);
      }
    }

    if (!audioUrl) {
      console.warn('No audio URL for track:', track.name, '— skipping to next');
      // Auto-skip to next if no audio available
      if (newQueue && newIndex + 1 < newQueue.length) {
        playTrackInternal(newQueue[newIndex + 1], newQueue, newIndex + 1);
      }
      return;
    }

    // Only change src if it's different (avoids restart on same track)
    if (audio.src !== audioUrl && !audio.src.endsWith(audioUrl)) {
      audio.src = audioUrl;
    }
    audio.volume = volume;

    setCurrentTrack(track);
    if (newQueue) setQueue(newQueue);
    if (newIndex !== undefined) setQueueIndex(newIndex);

    try {
      await audio.play();
      setIsPlaying(true);
    } catch (e) {
      console.error('Playback failed:', e);
    }
  };

  // ── Public API ─────────────────────────────────────────────────────
  const play = async (track) => {
    if (currentTrackRef.current?.id === track.id && isPlaying) {
      return; // Already playing this track
    }
    await playTrackInternal(track, queueRef.current, queueRef.current.findIndex(t => t.id === track.id));
  };

  const pause = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const resume = () => {
    if (currentTrack) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) pause();
    else resume();
  };

  const playQueue = (tracks, startIndex = 0) => {
    if (!tracks || tracks.length === 0) return;
    playTrackInternal(tracks[startIndex], tracks, startIndex);
  };

  const playNext = () => {
    const q = queueRef.current;
    const idx = queueIndexRef.current;
    if (q.length === 0) return;
    const nextIdx = (idx + 1) % q.length;
    playTrackInternal(q[nextIdx], q, nextIdx);
  };

  const playPrevious = () => {
    const q = queueRef.current;
    const idx = queueIndexRef.current;
    if (q.length === 0) return;

    // If more than 3s into track, restart it
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    const prevIdx = idx === 0 ? q.length - 1 : idx - 1;
    playTrackInternal(q[prevIdx], q, prevIdx);
  };

  const seek = (time) => {
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const setPlayerVolume = (newVolume) => {
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
  };

  const clearPlayer = () => {
    audioRef.current.pause();
    audioRef.current.src = '';
    setCurrentTrack(null);
    setQueue([]);
    setQueueIndex(-1);
    setIsPlaying(false);
  };

  const value = {
    currentTrack,
    queue,
    isPlaying,
    currentTime,
    duration,
    volume,
    play,
    pause,
    resume,
    togglePlayPause,
    playQueue,
    playNext,
    playPrevious,
    seek,
    setVolume: setPlayerVolume,
    clearPlayer,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
}
