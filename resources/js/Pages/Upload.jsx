import { useState, useEffect, useRef } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import MainLayout from '../Layouts/MainLayout';

export default function Upload() {
    const { auth } = usePage().props;
    const isArtist = auth.user?.is_artist;

    const [tracks, setTracks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const audioInputRef = useRef(null);
    const imageInputRef = useRef(null);

    const { data, setData, post, processing, errors, reset, progress } = useForm({
        title: '',
        audio_file: null,
        cover_image: null,
    });

    useEffect(() => {
        if (isArtist) {
            fetchTracks();
        }
    }, [isArtist]);

    const fetchTracks = () => {
        setIsLoading(true);
        fetch('/api/tracks/my', {
            headers: { 'Accept': 'application/json' }
        })
            .then(res => res.json())
            .then(data => setTracks(data))
            .catch(console.error)
            .finally(() => setIsLoading(false));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/api/tracks/upload', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                if (audioInputRef.current) audioInputRef.current.value = '';
                if (imageInputRef.current) imageInputRef.current.value = '';
                fetchTracks();
            },
        });
    };

    const handleDelete = (id) => {
        if (!confirm('Are you sure you want to delete this track?')) return;
        
        fetch(`/api/tracks/${id}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                'Accept': 'application/json'
            }
        }).then(() => {
            fetchTracks();
        });
    };

    const handleBecomeArtist = () => {
        router.post('/become-artist');
    };

    if (!isArtist) {
        return (
            <>
                <Head title="Become an Artist" />
                <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
                    <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mb-6">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                            <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">You need to become an Artist to upload music</h1>
                    <p className="text-gray-400 mb-8 max-w-md">
                        Join our community of creators. Upload your own tracks, manage your catalog, and share your sound with the world.
                    </p>
                    <button 
                        onClick={handleBecomeArtist}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105 active:scale-95"
                    >
                        Become an Artist
                    </button>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Artist Dashboard" />
            <div className="w-full p-8 lg:px-10 xl:px-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Artist Dashboard</h1>
                        <p className="text-gray-400 mt-1">Manage your uploaded tracks</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Upload Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-[#181820] rounded-xl p-6 border border-white/5">
                            <h2 className="text-xl font-bold text-white mb-6">Upload New Track</h2>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Track Title *</label>
                                    <input 
                                        type="text" 
                                        value={data.title}
                                        onChange={e => setData('title', e.target.value)}
                                        className="w-full bg-[#0f0f15] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition"
                                        placeholder="e.g. Midnight City"
                                        required
                                    />
                                    {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Audio File *</label>
                                    <input 
                                        type="file" 
                                        ref={audioInputRef}
                                        accept="audio/*"
                                        onChange={e => setData('audio_file', e.target.files[0])}
                                        className="w-full bg-[#0f0f15] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500/10 file:text-purple-400 hover:file:bg-purple-500/20"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1.5">Supported: MP3, WAV, OGG, M4A, FLAC, AAC (Max 50MB)</p>
                                    {errors.audio_file && <p className="text-red-400 text-sm mt-1">{errors.audio_file}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Cover Image (Optional)</label>
                                    <input 
                                        type="file" 
                                        ref={imageInputRef}
                                        accept="image/*"
                                        onChange={e => setData('cover_image', e.target.files[0])}
                                        className="w-full bg-[#0f0f15] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-gray-300 hover:file:bg-gray-600"
                                    />
                                    <p className="text-xs text-gray-500 mt-1.5">No size limit. Supported: JPG, PNG, WEBP, GIF</p>
                                    {errors.cover_image && <p className="text-red-400 text-sm mt-1">{errors.cover_image}</p>}
                                </div>

                                {progress && (
                                    <div className="w-full bg-gray-800 rounded-full h-2.5 mt-4">
                                        <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${progress.percentage}%` }}></div>
                                    </div>
                                )}

                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold transition mt-4"
                                >
                                    {processing ? 'Uploading...' : 'Upload Track'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Track List */}
                    <div className="lg:col-span-2">
                        <div className="bg-[#181820] rounded-xl p-6 border border-white/5 h-full">
                            <h2 className="text-xl font-bold text-white mb-6">My Uploads</h2>
                            
                            {isLoading ? (
                                <div className="text-gray-400 text-center py-10">Loading tracks...</div>
                            ) : tracks.length === 0 ? (
                                <div className="text-gray-500 text-center py-16 flex flex-col items-center">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                                    <p>You haven't uploaded any tracks yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {tracks.map(track => (
                                        <div key={track.id} className="flex items-center justify-between group bg-[#0f0f15] p-3 rounded-lg border border-white/5 hover:border-white/10 transition">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-800 rounded shadow-sm overflow-hidden flex-shrink-0">
                                                    {track.album?.image_url ? (
                                                        <img src={track.album.image_url} alt={track.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/40 to-black">
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-medium line-clamp-1">{track.name}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-gray-400">{new Date(track.created_at).toLocaleDateString()}</span>
                                                        <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-sm">Local</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleDelete(track.id)}
                                                className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-red-400 transition"
                                                title="Delete Track"
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Upload.layout = page => <MainLayout children={page} />;
