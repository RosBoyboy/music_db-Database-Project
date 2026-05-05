import React from 'react';
import { Head, router, Link } from '@inertiajs/react';
import MainLayout from '../Layouts/MainLayout';
import TrackCard from '../Components/TrackCard';
import PlaylistItem from '../Components/PlaylistItem';
import { ChevronRight, Play, Home as HomeIcon } from 'lucide-react';

export default function Home({ recommendedTracks, newReleases, recentTracks, userPlaylists, featuredPlaylist }) {
  // Temporary mock function until the real PlayerContext is implemented
  const playQueue = (tracks) => {
    console.log("Playing tracks:", tracks);
    alert(`Started playing ${tracks.length} tracks! (Player UI coming soon)`);
  };

  return (
    <MainLayout>
      <Head title="Dashboard" />
      <div className="text-white pb-24">
        {/* Breadcrumbs Navigation */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8" aria-label="Breadcrumb">
        <Link href="/home" className="hover:text-white transition-colors flex items-center gap-1">
          <HomeIcon size={16} />
        </Link>
        <ChevronRight size={14} />
        <span className="text-white font-medium">Dashboard</span>
      </nav>

      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Featured Banner - YouTube Music style */}
        <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-r ${featuredPlaylist.gradient} min-h-[200px] lg:min-h-[260px] flex items-center shadow-2xl shadow-[#667eea]/20`}>
          <div className="absolute inset-0">
            <div className="absolute top-10 right-10 w-64 h-64 rounded-full border border-white/10" />
            <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-white/5" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-white/5" />
          </div>
          <div className="relative z-10 p-8 lg:p-10 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white/90 text-xs font-medium mb-3 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#43e97b] animate-pulse" />
              Featured
            </div>
            <h1 className="text-3xl lg:text-5xl font-bold text-white mb-3 leading-tight tracking-tight">
              {featuredPlaylist.title}
            </h1>
            <p className="text-white/80 text-base mb-6 font-medium">{featuredPlaylist.subtitle}</p>
            <button
              onClick={() => playQueue(recommendedTracks)}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#0f0f0f] font-bold text-sm shadow-xl hover:scale-105 transition-all duration-300"
            >
              <Play size={18} fill="#0f0f0f" className="ml-0.5" />
              Play Now
            </button>
          </div>

          {/* Sound wave decoration */}
          <div className="absolute right-8 lg:right-16 top-1/2 -translate-y-1/2 flex items-end gap-1.5 opacity-20 hidden sm:flex">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="w-1.5 bg-white rounded-full animate-pulse"
                style={{ 
                  height: `${20 + Math.sin(i * 0.5) * 40 + Math.random() * 20}px`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '1.5s'
                }}
              />
            ))}
          </div>
        </div>

        {/* Quick Access - YouTube Music chip style */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-white tracking-tight">Quick picks</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {userPlaylists.map(pl => (
              <button
                key={pl.id}
                onClick={() => router.visit(`/playlist/${pl.id}`)}
                className="flex items-center gap-3 p-2 pr-4 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] hover:border-white/10 transition-all duration-300 group shadow-lg"
              >
                <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${pl.gradient} flex-shrink-0 relative shadow-inner`}>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-lg backdrop-blur-[2px]">
                    <Play size={20} fill="white" className="text-white ml-1" />
                  </div>
                </div>
                <span className="text-sm font-semibold text-white truncate">{pl.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Recommended */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-white tracking-tight">Recommended for you</h2>
            <Link href="/tracks" className="flex items-center gap-1 text-sm text-gray-400 hover:text-white font-semibold transition-colors">
              MORE <ChevronRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-6">
            {recommendedTracks.map((track) => (
              <TrackCard key={`rec-${track.id}`} track={track} allTracks={recommendedTracks} />
            ))}
          </div>
        </section>

        {/* New Releases */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-white tracking-tight">New releases</h2>
            <Link href="/tracks" className="flex items-center gap-1 text-sm text-gray-400 hover:text-white font-semibold transition-colors">
              MORE <ChevronRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-6">
            {newReleases.map((track) => (
              <TrackCard key={`new-${track.id}`} track={track} allTracks={newReleases} />
            ))}
          </div>
        </section>

        {/* Recently Played */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-white tracking-tight">Listen again</h2>
            <Link href="/tracks" className="flex items-center gap-1 text-sm text-gray-400 hover:text-white font-semibold transition-colors">
              MORE <ChevronRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-6">
            {recentTracks.map((track) => (
              <TrackCard key={`rec-${track.id}`} track={track} allTracks={recentTracks} />
            ))}
          </div>
        </section>

        {/* Your Playlists */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-white tracking-tight">Your playlists</h2>
            <Link href="/tracks" className="flex items-center gap-1 text-sm text-gray-400 hover:text-white font-semibold transition-colors">
              MORE <ChevronRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {userPlaylists.map(pl => (
              <PlaylistItem key={pl.id} playlist={pl} />
            ))}
          </div>
        </section>

      </div>
      </div>
    </MainLayout>
  );
}
