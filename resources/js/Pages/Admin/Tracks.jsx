import React, { useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Music, Search, Trash2, Play, Pause, CheckCircle, XCircle } from 'lucide-react';
import { usePlayer } from '@/Context/PlayerContext';

export default function Tracks({ tracks, filters }) {
    const { play, currentTrack, isPlaying, pause } = usePlayer();
    const [deleting, setDeleting] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/tracks', { search: e.target.search.value }, { preserveState: true });
    };

    const handleDelete = (track) => {
        if (confirm(`Are you sure you want to delete "${track.name}"? This action cannot be undone.`)) {
            setDeleting(track.id);
            router.delete(`/admin/tracks/${track.id}`, {
                preserveScroll: true,
                onFinish: () => setDeleting(null),
            });
        }
    };

    const handleApprove = (track) => {
        router.post(`/admin/tracks/${track.id}/approve`, {}, { preserveScroll: true });
    };

    const handleReject = (track) => {
        if (confirm(`Are you sure you want to reject "${track.name}"?`)) {
            router.post(`/admin/tracks/${track.id}/reject`, {}, { preserveScroll: true });
        }
    };

    const togglePlay = (track) => {
        if (currentTrack?.id === track.id && isPlaying) {
            pause();
        } else {
            play(track);
        }
    };

    return (
        <>
            <Head title="Moderate Tracks" />

            <div className="w-full py-8 px-4 sm:px-6 lg:px-10 xl:px-12 space-y-6">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Music className="w-8 h-8 text-purple-500" />
                            Moderate Tracks
                        </h1>
                        <p className="text-gray-400 mt-1">Review and manage uploaded audio content.</p>
                    </div>
                    <form onSubmit={handleSearch} className="relative w-full md:w-80">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input 
                            type="text" 
                            name="search" 
                            defaultValue={filters.search} 
                            placeholder="Search track name..." 
                            className="w-full bg-gray-800/60 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </form>
                </div>

                <div className="bg-gray-800/60 rounded-2xl border border-gray-700/50 overflow-hidden overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-900/50 border-b border-gray-700/50">
                                <th className="px-6 py-4 w-12"></th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Track Info</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Source</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Uploaded By</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                            {tracks.data.map(track => {
                                const isCurrentlyPlaying = currentTrack?.id === track.id && isPlaying;
                                return (
                                    <tr key={track.id} className="hover:bg-gray-700/20 transition group">
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => togglePlay(track)}
                                                className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 hover:bg-purple-500 hover:text-white flex items-center justify-center transition"
                                            >
                                                {isCurrentlyPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-white font-medium">{track.name}</p>
                                            <p className="text-sm text-gray-400">{track.artist?.name || 'Unknown Artist'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-md uppercase tracking-wider font-semibold ${track.source === 'spotify' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
                                                {track.source}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-md uppercase tracking-wider font-semibold ${
                                                track.status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                                                track.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                                                'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                            }`}>
                                                {track.status || 'approved'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300">
                                            {track.uploader ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center text-xs text-white">
                                                        {track.uploader.avatar_url ? <img src={track.uploader.avatar_url} /> : track.uploader.name.charAt(0)}
                                                    </div>
                                                    <span>{track.uploader.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-500 italic">System</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">
                                            {new Date(track.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                            {track.status === 'pending' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleApprove(track)}
                                                        className="p-2 text-gray-500 hover:text-green-400 hover:bg-green-400/10 rounded-lg transition"
                                                        title="Approve Track"
                                                    >
                                                        <CheckCircle className="w-5 h-5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleReject(track)}
                                                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"
                                                        title="Reject Track"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                </>
                                            )}
                                            <button 
                                                onClick={() => handleDelete(track)}
                                                disabled={deleting === track.id}
                                                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition disabled:opacity-50"
                                                title="Delete Track"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {tracks.data.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No tracks found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {tracks.links.length > 3 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                        {tracks.links.map((link, i) => (
                            <Link 
                                key={i} 
                                href={link.url}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${link.active ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'} ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}

            </div>
        </>
    );
}

Tracks.layout = page => <MainLayout children={page} />;
