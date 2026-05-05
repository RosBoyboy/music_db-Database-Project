import React from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Users as UsersIcon, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Users({ users, filters }) {
    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/users', { search: e.target.search.value }, { preserveState: true });
    };

    return (
        <>
            <Head title="Manage Users" />

            <div className="w-full py-8 px-4 sm:px-6 lg:px-10 xl:px-12 space-y-6">
                
                {/* Header & Search */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <UsersIcon className="w-8 h-8 text-blue-500" />
                            Manage Users
                        </h1>
                        <p className="text-gray-400 mt-1">View and manage platform users.</p>
                    </div>
                    <form onSubmit={handleSearch} className="relative w-full md:w-80">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input 
                            type="text" 
                            name="search" 
                            defaultValue={filters.search} 
                            placeholder="Search by name or email..." 
                            className="w-full bg-gray-800/60 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </form>
                </div>

                {/* Table */}
                <div className="bg-gray-800/60 rounded-2xl border border-gray-700/50 overflow-hidden overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-900/50 border-b border-gray-700/50">
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Roles</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Joined Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                            {users.data.map(user => (
                                <tr key={user.id} className="hover:bg-gray-700/20 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center text-white font-bold">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    user.name.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{user.name}</p>
                                                <p className="text-sm text-gray-400">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            {user.roles.length > 0 ? user.roles.map(r => (
                                                <span key={r.id} className="px-2 py-1 text-xs rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider font-semibold">
                                                    {r.name}
                                                </span>
                                            )) : (
                                                <span className="text-gray-500 text-sm">Listener</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-gray-400 hover:text-white transition text-sm font-medium">Edit</button>
                                    </td>
                                </tr>
                            ))}
                            {users.data.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {users.links.length > 3 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                        {users.links.map((link, i) => (
                            <Link 
                                key={i} 
                                href={link.url}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${link.active ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'} ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}

            </div>
        </>
    );
}

Users.layout = page => <MainLayout children={page} />;
