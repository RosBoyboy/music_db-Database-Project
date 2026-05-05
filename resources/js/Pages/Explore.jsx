import React from 'react';
import { Head, router, Link } from '@inertiajs/react';
import MainLayout from '../Layouts/MainLayout';
import { ChevronRight } from 'lucide-react';

export default function Explore({ artists, albums, playlists }) {
  // Gradients for artists without images
  const gradients = [
    'from-purple-500 to-indigo-500',
    'from-pink-500 to-rose-500',
    'from-amber-400 to-orange-500',
    'from-emerald-400 to-teal-500',
    'from-blue-400 to-cyan-500',
    'from-fuchsia-500 to-purple-600'
  ];

  return (
    <>
      <Head title="Explore" />
      <div className="text-white pb-24">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 py-6 space-y-12">
          
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Explore</h1>
            <p className="text-sm text-gray-400">Discover new music, artists, and playlists</p>
          </div>

          {/* Genre Chips - YouTube Music style */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">Browse categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { name: 'Electronic', gradient: 'from-purple-600 to-indigo-700' },
                { name: 'Pop', gradient: 'from-pink-500 to-violet-600' },
                { name: 'Hip-Hop', gradient: 'from-emerald-600 to-teal-500' },
                { name: 'Indie', gradient: 'from-rose-500 to-orange-500' },
                { name: 'Synthwave', gradient: 'from-cyan-500 to-blue-600' },
                { name: 'Folk', gradient: 'from-amber-500 to-orange-600' },
                { name: 'Jazz', gradient: 'from-yellow-500 to-amber-600' },
                { name: 'Lo-Fi', gradient: 'from-teal-500 to-emerald-600' },
              ].map(genre => (
                <button
                  key={genre.name}
                  className={`relative rounded-xl bg-gradient-to-br ${genre.gradient} p-5 h-28 flex items-end overflow-hidden group hover:shadow-lg hover:shadow-white/5 hover:scale-[1.02] transition-all duration-300`}
                >
                  <div className="absolute top-2 right-2 w-20 h-20 rounded-full border border-white/10 group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute -bottom-2 -right-2 w-24 h-24 rounded-full bg-white/10 group-hover:scale-110 transition-transform duration-500" />
                  <span className="relative text-white font-bold text-lg tracking-wide shadow-black/50 drop-shadow-md">{genre.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Top Artists */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-white tracking-tight">Popular artists</h2>
              <Link href="/artists" className="flex items-center gap-1 text-sm text-gray-400 hover:text-white font-semibold transition-colors">
                MORE <ChevronRight size={18} />
              </Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-4">
              {artists.map((artist, index) => {
                const gradientClass = gradients[index % gradients.length];
                return (
                  <button
                    key={artist.id}
                    onClick={() => router.visit(`/artist/${artist.id}`)}
                    className="group text-left"
                  >
                    <div className={`aspect-square rounded-full bg-gradient-to-br ${gradientClass} relative overflow-hidden group-hover:shadow-2xl group-hover:shadow-white/10 transition-all duration-300 hover:-translate-y-1`}>
                      {artist.image_url ? (
                        <img src={artist.image_url} alt={artist.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-2 rounded-full border-2 border-white/10" />
                      )}
                    </div>
                    <div className="pt-3 text-center">
                      <p className="text-sm font-bold text-white truncate group-hover:text-gray-300 transition-colors">{artist.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Artist</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* New Albums */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-white tracking-tight">New albums</h2>
              <Link href="/albums" className="flex items-center gap-1 text-sm text-gray-400 hover:text-white font-semibold transition-colors">
                MORE <ChevronRight size={18} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-5 gap-y-6">
              {albums.map((album, index) => {
                const gradientClass = gradients[(index + 2) % gradients.length];
                return (
                  <div key={album.id} className="group cursor-pointer">
                    <div className={`aspect-square rounded-xl bg-gradient-to-br ${gradientClass} relative overflow-hidden shadow-lg group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300`}>
                      {album.image_url ? (
                         <img src={album.image_url} alt={album.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 opacity-20">
                          <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full border-2 border-white/30" />
                        </div>
                      )}
                    </div>
                    <div className="pt-3">
                      <p className="text-sm font-bold text-white truncate">{album.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{album.artist ? album.artist.name : 'Unknown'} · {new Date(album.release_date).getFullYear()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Featured Playlists */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-white tracking-tight">Featured playlists</h2>
              <Link href="/playlists" className="flex items-center gap-1 text-sm text-gray-400 hover:text-white font-semibold transition-colors">
                MORE <ChevronRight size={18} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-5 gap-y-6">
              {playlists.map(pl => (
                <button
                  key={pl.id}
                  onClick={() => router.visit(`/playlist/${pl.id}`)}
                  className="group text-left"
                >
                  <div className={`aspect-square rounded-xl bg-gradient-to-br ${pl.gradient} relative overflow-hidden shadow-lg group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300`}>
                    <div className="absolute inset-0 opacity-20 bg-black/10">
                      <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full border-2 border-white/30" />
                    </div>
                  </div>
                  <div className="pt-3">
                    <p className="text-sm font-bold text-white truncate">{pl.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{pl.trackCount} songs</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
          
        </div>
      </div>
    </>
  );
}

Explore.layout = page => <MainLayout children={page} />;
