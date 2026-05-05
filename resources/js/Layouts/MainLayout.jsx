import React, { useState, useEffect, useRef, useCallback } from 'react';
import { router, usePage, Link } from '@inertiajs/react';
import MusicPlayer from '@/Components/Common/MusicPlayer';
import axios from 'axios';
import { usePlayer } from '@/Context/PlayerContext';

// ── Recent Searches helpers (localStorage) ─────────────────────────────
const RECENT_KEY = 'musicstream_recent_searches';
const MAX_RECENT = 8;

function getRecentSearches() {
    try {
        return JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
    } catch { return []; }
}

function saveRecentSearch(query) {
    if (!query || query.length < 2) return;
    const recent = getRecentSearches().filter(q => q.toLowerCase() !== query.toLowerCase());
    recent.unshift(query);
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

function clearRecentSearches() {
    localStorage.removeItem(RECENT_KEY);
}

// ── Type icons ─────────────────────────────────────────────────────────
function TypeIcon({ type }) {
    if (type === 'artist') return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400 flex-shrink-0"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    );
    if (type === 'album') return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-400 flex-shrink-0"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
    );
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400 flex-shrink-0"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
    );
}

export default function MainLayout({ children }) {
    const { url } = usePage();
    const { clearPlayer } = usePlayer();
    const searchParams = new URLSearchParams(url.includes('?') ? url.split('?')[1] : '');
    const query = searchParams.get('q') || '';

    // ── Autocomplete state ────────────────────────────────────────────
    const [inputValue, setInputValue]       = useState(query);
    const [suggestions, setSuggestions]     = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [showDropdown, setShowDropdown]   = useState(false);
    const [highlightIdx, setHighlightIdx]   = useState(-1);
    const [isLoadingSugg, setIsLoadingSugg] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [userPlaylists, setUserPlaylists] = useState([]);
    const inputRef     = useRef(null);
    const dropdownRef  = useRef(null);
    const debounceRef  = useRef(null);

    // Fetch user playlists for sidebar
    useEffect(() => {
        axios.get('/api/user-playlists')
            .then(res => setUserPlaylists(res.data.playlists || []))
            .catch(() => {});
    }, [url]);

    // Load recent searches on mount
    useEffect(() => {
        setRecentSearches(getRecentSearches());
    }, []);

    // Sync input with URL query param when navigating
    useEffect(() => {
        setInputValue(query);
    }, [query]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
                inputRef.current && !inputRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── Fetch suggestions ─────────────────────────────────────────────
    const fetchSuggestions = useCallback((q) => {
        if (!q || q.length < 1) {
            setSuggestions([]);
            setIsLoadingSugg(false);
            return;
        }
        setIsLoadingSugg(true);
        axios.get('/api/search/suggestions', { params: { q } })
            .then(res => {
                setSuggestions(res.data || []);
                setHighlightIdx(-1);
            })
            .catch(() => setSuggestions([]))
            .finally(() => setIsLoadingSugg(false));
    }, []);

    // ── Commit search ─────────────────────────────────────────────────
    const commitSearch = (term) => {
        if (!term || term.length < 2) return;
        saveRecentSearch(term);
        setRecentSearches(getRecentSearches());
        setShowDropdown(false);
        setSuggestions([]);
        router.get('/search', { q: term }, { preserveState: false });
    };

    // ── Input handlers ────────────────────────────────────────────────
    const handleInputChange = (e) => {
        const val = e.target.value;
        setInputValue(val);
        setShowDropdown(true);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
    };

    const handleInputFocus = () => {
        setRecentSearches(getRecentSearches());
        setShowDropdown(true);
        if (inputValue) fetchSuggestions(inputValue);
    };

    const handleKeyDown = (e) => {
        const items = inputValue ? suggestions : recentSearches.map(r => ({ text: r, type: 'recent' }));
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightIdx(prev => Math.min(prev + 1, items.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightIdx(prev => Math.max(prev - 1, -1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (highlightIdx >= 0 && items[highlightIdx]) {
                commitSearch(items[highlightIdx].text);
                setInputValue(items[highlightIdx].text);
            } else {
                commitSearch(inputValue);
            }
        } else if (e.key === 'Escape') {
            setShowDropdown(false);
            inputRef.current?.blur();
        }
    };

    const handleClearRecent = (e) => {
        e.stopPropagation();
        clearRecentSearches();
        setRecentSearches([]);
    };

    const handleRemoveRecent = (e, term) => {
        e.stopPropagation();
        const updated = recentSearches.filter(r => r !== term);
        localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
        setRecentSearches(updated);
    };

    // ── Dropdown content logic ────────────────────────────────────────
    const showSuggestions = inputValue && suggestions.length > 0;
    const showRecent = !inputValue && recentSearches.length > 0;
    const dropdownVisible = showDropdown && (showSuggestions || showRecent || isLoadingSugg);

    // ── Nav helper ────────────────────────────────────────────────────
    const navLink = (href, label, icon) => {
        const isActive = url.startsWith(href);
        return (
            <Link href={href} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition font-medium ${isActive ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                {icon}
                {label}
            </Link>
        );
    };

    return (
        <div className="flex h-screen bg-gray-900 text-white">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 flex flex-col border-r border-gray-800 bg-[#0f0f15]">
                <div className="p-6">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent cursor-pointer" onClick={() => router.visit('/home')}>MusicStream</h1>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <nav className="px-4 space-y-1">
                        {navLink('/home', 'Home', <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>)}
                        {navLink('/explore', 'Explore', <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>)}
                        {navLink('/search', 'Search', <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>)}
                    </nav>

                    <div className="mt-8 px-4">
                        <h3 className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Library</h3>
                        <nav className="space-y-1">
                            {navLink('/liked', 'Liked Songs', <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>)}
                            {navLink('/history', 'History', <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>)}
                            {usePage().props.auth.user?.is_artist && (
                                <Link href="/upload" className="flex items-center gap-3 px-4 py-2.5 text-purple-400 hover:text-purple-300 hover:bg-purple-400/10 rounded-lg transition font-medium">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                    Artist Dashboard
                                </Link>
                            )}
                        </nav>
                    </div>

                    <div className="mt-8 px-4 pb-6">
                        <div className="flex items-center justify-between px-4 mb-2">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Playlists</h3>
                            <button onClick={() => router.visit('/my-playlists/create')} className="text-gray-400 hover:text-white transition-colors" title="New Playlist"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
                        </div>
                        <nav className="space-y-0.5">
                            {userPlaylists.length > 0 ? userPlaylists.map(pl => {
                                const isActive = url === `/my-playlist/${pl.id}`;
                                return (
                                    <Link key={pl.id} href={`/my-playlist/${pl.id}`}
                                       className={`flex items-center gap-2.5 px-4 py-2 text-sm rounded-lg transition truncate ${
                                         isActive ? 'text-white bg-white/10 font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'
                                       }`}>
                                        <div className={`w-6 h-6 rounded bg-gradient-to-br ${pl.cover_gradient} flex items-center justify-center flex-shrink-0`}>
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="white" opacity="0.6"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                                        </div>
                                        <span className="truncate">{pl.name}</span>
                                        {pl.tracks_count > 0 && <span className="text-gray-600 text-xs ml-auto flex-shrink-0">{pl.tracks_count}</span>}
                                    </Link>
                                );
                            }) : (
                                <button onClick={() => router.visit('/my-playlists/create')} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition w-full">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                    New Playlist
                                </button>
                            )}
                        </nav>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header with Autocomplete */}
                <header className="h-16 bg-[#07070f] flex items-center justify-between px-6 border-b border-white/[0.05] relative z-50">
                    <div className="flex-1 max-w-xl relative">
                        <div className="relative">
                            {/* Search icon */}
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>

                            {/* Loading spinner */}
                            {isLoadingSugg && (
                                <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                            )}

                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search songs, albums, artists..."
                                value={inputValue}
                                onChange={handleInputChange}
                                onFocus={handleInputFocus}
                                onKeyDown={handleKeyDown}
                                autoComplete="off"
                                className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-10 py-2 text-sm text-white focus:outline-none focus:border-white/25 focus:bg-white/10 transition-all placeholder-gray-500"
                            />
                        </div>

                        {/* ── Dropdown ─────────────────────────────────────── */}
                        {dropdownVisible && (
                            <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-2 bg-[#161622] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden backdrop-blur-xl" style={{ maxHeight: '380px' }}>

                                {/* Recent searches (when input is empty) */}
                                {showRecent && (
                                    <div className="p-3">
                                        <div className="flex items-center justify-between px-2 mb-2">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recent Searches</span>
                                            <button onClick={handleClearRecent} className="text-xs text-gray-500 hover:text-white transition">Clear all</button>
                                        </div>
                                        {recentSearches.map((term, i) => (
                                            <button
                                                key={term}
                                                onClick={() => { setInputValue(term); commitSearch(term); }}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-xl transition-all group ${highlightIdx === i ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-gray-300'}`}
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 flex-shrink-0"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                                <span className="flex-1 text-sm truncate">{term}</span>
                                                <span
                                                    onClick={(e) => handleRemoveRecent(e, term)}
                                                    className="text-gray-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                                >
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Suggestions (when typing) */}
                                {showSuggestions && (
                                    <div className="p-3">
                                        <span className="px-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Suggestions</span>
                                        {suggestions.map((item, i) => (
                                            <button
                                                key={`${item.text}-${i}`}
                                                onClick={() => { setInputValue(item.text); commitSearch(item.text); }}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-xl transition-all ${highlightIdx === i ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-gray-300'}`}
                                            >
                                                <TypeIcon type={item.type} />
                                                <span className="flex-1 text-sm truncate">{item.text}</span>
                                                <span className="text-[10px] text-gray-600 uppercase font-semibold tracking-wider">{item.type}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Loading state */}
                                {isLoadingSugg && inputValue && suggestions.length === 0 && (
                                    <div className="p-6 text-center text-gray-500 text-sm">
                                        <svg className="mx-auto mb-2 animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                                        Searching...
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 relative">
                        {usePage().props.auth.user ? (
                            <div className="relative">
                                <button 
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-sm shadow-md hover:ring-2 hover:ring-white/50 transition overflow-hidden"
                                >
                                    {usePage().props.auth.user.avatar_url ? (
                                        <img src={usePage().props.auth.user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        usePage().props.auth.user.name.charAt(0).toUpperCase()
                                    )}
                                </button>
                                
                                {showProfileMenu && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
                                        <div className="absolute right-0 top-full mt-2 w-72 bg-[#282828] rounded-xl shadow-2xl z-50 border border-white/10 overflow-hidden text-sm">
                                            <div className="p-4 border-b border-white/10 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white flex items-center justify-center font-bold flex-shrink-0 text-lg overflow-hidden">
                                                    {usePage().props.auth.user.avatar_url ? (
                                                        <img src={usePage().props.auth.user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                                    ) : (
                                                        usePage().props.auth.user.name.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div className="flex-col flex overflow-hidden">
                                                    <span className="text-white font-semibold truncate">{usePage().props.auth.user.name}</span>
                                                    <span className="text-gray-400 text-xs truncate">@{usePage().props.auth.user.name.toLowerCase().replace(/\s+/g, '')}</span>
                                                    <button className="text-[#3ea6ff] text-xs font-medium text-left mt-1 hover:underline">Manage your Account</button>
                                                </div>
                                            </div>
                                            <div className="py-2">
                                                {usePage().props.auth.user.is_artist && (
                                                    <button onClick={() => { setShowProfileMenu(false); router.visit('/upload'); }} className="w-full flex items-center gap-4 px-4 py-2 hover:bg-white/10 text-gray-200 transition">
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l2-9 5 18 2-9h5"/></svg>
                                                        Your Channel
                                                    </button>
                                                )}
                                                <button className="w-full flex items-center gap-4 px-4 py-2 hover:bg-white/10 text-gray-200 transition">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m16 12-4-4-4 4"/><path d="M12 16V8"/></svg>
                                                    Get Music Premium
                                                </button>
                                                <button className="w-full flex items-center gap-4 px-4 py-2 hover:bg-white/10 text-gray-200 transition">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                                    Switch account
                                                </button>
                                                <button onClick={() => { setShowProfileMenu(false); router.visit('/settings'); }} className="w-full flex items-center gap-4 px-4 py-2 hover:bg-white/10 text-gray-200 transition">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                                                    Settings
                                                </button>
                                                {usePage().props.auth.user.is_admin && (
                                                    <button onClick={() => { setShowProfileMenu(false); router.visit('/admin'); }} className="w-full flex items-center gap-4 px-4 py-2 hover:bg-white/10 text-gray-200 transition text-red-400">
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                                        Admin Panel
                                                    </button>
                                                )}
                                                <button onClick={() => { setShowProfileMenu(false); clearPlayer(); router.post('/logout'); }} className="w-full flex items-center gap-4 px-4 py-2 hover:bg-white/10 text-gray-200 transition">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                                                    Sign out
                                                </button>
                                            </div>
                                            <div className="py-2 border-t border-white/10">
                                                <button onClick={() => { setShowProfileMenu(false); router.visit('/upload'); }} className="w-full flex items-center gap-4 px-4 py-2 hover:bg-white/10 text-gray-200 transition">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                                    Upload music
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <button onClick={() => router.visit('/login')} className="bg-white hover:bg-gray-100 text-black px-5 py-2 rounded-full text-sm font-bold transition transform hover:scale-105 active:scale-95 shadow-lg">
                                Log in
                            </button>
                        )}
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 pb-24">
                    {children}
                </main>
            </div>

            {/* Persistent Music Player (Fixed at bottom) */}
            <MusicPlayer />
        </div>
    );
}
