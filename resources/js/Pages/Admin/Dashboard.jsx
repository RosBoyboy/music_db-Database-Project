import React from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Head, Link } from '@inertiajs/react';
import { Users, Music, ListMusic, Mic2, Activity } from 'lucide-react';

export default function Dashboard({ stats }) {
    return (
        <>
            <Head title="Admin Dashboard" />

            <div className="w-full py-8 px-4 sm:px-6 lg:px-10 xl:px-12 space-y-8">
                
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Activity className="w-8 h-8 text-red-500" />
                            Admin Dashboard
                        </h1>
                        <p className="text-gray-400 mt-1">Platform overview and content moderation.</p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/admin/users" className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition border border-gray-700">
                            Manage Users
                        </Link>
                        <Link href="/admin/tracks" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-lg shadow-red-500/20">
                            Moderate Tracks
                        </Link>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gray-800/60 p-6 rounded-2xl border border-gray-700/50 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 font-medium">Total Users</p>
                            <p className="text-2xl font-bold text-white">{stats.totalUsers.toLocaleString()}</p>
                        </div>
                    </div>
                    
                    <div className="bg-gray-800/60 p-6 rounded-2xl border border-gray-700/50 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                            <Music className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 font-medium">Total Tracks</p>
                            <p className="text-2xl font-bold text-white">{stats.totalTracks.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="bg-gray-800/60 p-6 rounded-2xl border border-gray-700/50 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center">
                            <ListMusic className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 font-medium">Total Playlists</p>
                            <p className="text-2xl font-bold text-white">{stats.totalPlaylists.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="bg-gray-800/60 p-6 rounded-2xl border border-gray-700/50 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                            <Mic2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 font-medium">Total Artists</p>
                            <p className="text-2xl font-bold text-white">{stats.totalArtists.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Recent Activity / Users */}
                <div className="bg-gray-800/60 rounded-2xl border border-gray-700/50 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-700/50 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-white">Recently Registered Users</h2>
                        <Link href="/admin/users" className="text-sm text-indigo-400 hover:text-indigo-300">View all</Link>
                    </div>
                    <div className="divide-y divide-gray-700/50">
                        {stats.recentUsers.map(user => (
                            <div key={user.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-700/20 transition">
                                <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center text-white font-bold">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        user.name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-medium">{user.name}</h3>
                                    <p className="text-sm text-gray-400">{user.email}</p>
                                </div>
                                <div className="text-sm text-gray-500">
                                    Joined {new Date(user.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </>
    );
}

Dashboard.layout = page => <MainLayout children={page} />;
