<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TrackController;
use App\Http\Controllers\SearchController;
use Inertia\Inertia;

use App\Http\Controllers\AuthController;

// ── Public Pages ──────────────────────────────────────────────────────
Route::get('/', fn() => Inertia::render('Guest/Landing'));
Route::get('/login', fn() => Inertia::render('Auth/Login'))->name('login');

// ── Authentication ────────────────────────────────────────────────────
Route::middleware('throttle:6,1')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/demo-login', [AuthController::class, 'demoLogin']);
});
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// ── App Pages ─────────────────────────────────────────────────────────
Route::get('/home',    [TrackController::class, 'home']);
Route::get('/explore', [TrackController::class, 'explore']);
Route::get('/artist/{id}', [TrackController::class, 'artist'])->name('artist.profile');
Route::get('/playlist/{id}', [TrackController::class, 'playlist'])->name('playlist.view');
Route::get('/tracks',  [TrackController::class, 'index']);

// ── Search ────────────────────────────────────────────────────────────
// Inertia page (initial load / direct URL)
Route::get('/search', [SearchController::class, 'page']);
// JSON API (debounced AJAX from React)
Route::get('/api/search', [SearchController::class, 'api']);
// Autocomplete suggestions (lightweight, fast)
Route::get('/api/search/suggestions', [SearchController::class, 'suggestions']);

// ── Artist Uploads ────────────────────────────────────────────────────
use App\Http\Controllers\TrackUploadController;

Route::middleware('auth')->group(function () {
    // The Upload page handles the is_artist check internally (shows "Become Artist" button)
    Route::get('/upload', fn() => Inertia::render('Artist/Dashboard'))->name('upload.index');
    Route::post('/become-artist', [TrackUploadController::class, 'becomeArtist'])->name('become.artist');

    // API endpoints for track management (artist-only operations guarded in controller)
    Route::get('/api/tracks/my',       [TrackUploadController::class, 'index']);
    Route::post('/api/tracks/upload',  [TrackUploadController::class, 'upload']);
    Route::delete('/api/tracks/{id}',  [TrackUploadController::class, 'destroy']);

    // Profile & Settings
    Route::get('/settings', [\App\Http\Controllers\ProfileController::class, 'edit'])->name('settings');
    Route::put('/settings/profile', [\App\Http\Controllers\ProfileController::class, 'update'])->name('settings.profile');
    Route::put('/settings/password', [\App\Http\Controllers\ProfileController::class, 'updatePassword'])->name('settings.password');
    Route::post('/settings/avatar', [\App\Http\Controllers\ProfileController::class, 'updateAvatar'])->name('settings.avatar');

    // Admin Dashboard
    Route::middleware(['role:admin'])->prefix('admin')->group(function () {
        Route::get('/', [\App\Http\Controllers\AdminController::class, 'dashboard'])->name('admin.dashboard');
        Route::get('/users', [\App\Http\Controllers\AdminController::class, 'users'])->name('admin.users');
        Route::get('/tracks', [\App\Http\Controllers\AdminController::class, 'tracks'])->name('admin.tracks');
        Route::delete('/tracks/{id}', [\App\Http\Controllers\AdminController::class, 'deleteTrack'])->name('admin.tracks.delete');
        Route::post('/tracks/{id}/approve', [\App\Http\Controllers\AdminController::class, 'approveTrack'])->name('admin.tracks.approve');
        Route::post('/tracks/{id}/reject', [\App\Http\Controllers\AdminController::class, 'rejectTrack'])->name('admin.tracks.reject');
    });
});

// Stream a local track (public so the audio player can reach it)
Route::get('/api/tracks/stream/{id}', [TrackUploadController::class, 'stream'])->name('track.stream');

// ── Library (Likes & History) ─────────────────────────────────────────
use App\Http\Controllers\LibraryController;

Route::get('/liked',   [LibraryController::class, 'likedSongs'])->name('liked.songs');
Route::get('/history', [LibraryController::class, 'history'])->name('history');

// API endpoints for likes & history (AJAX from frontend)
Route::post('/api/like-track',      [LibraryController::class, 'toggleLike']);
Route::get('/api/check-like',       [LibraryController::class, 'checkLike']);
Route::get('/api/liked-ids',        [LibraryController::class, 'likedIds']);
Route::post('/api/record-history',  [LibraryController::class, 'recordHistory']);

// ── User Playlists ────────────────────────────────────────────────────
use App\Http\Controllers\PlaylistController;

Route::get('/my-playlists/create',   [PlaylistController::class, 'create'])->name('playlist.create');
Route::post('/my-playlists',         [PlaylistController::class, 'store'])->name('playlist.store');
Route::get('/my-playlist/{id}',      [PlaylistController::class, 'show'])->name('playlist.show');
Route::put('/my-playlist/{id}',      [PlaylistController::class, 'update'])->name('playlist.update');
Route::delete('/my-playlist/{id}',   [PlaylistController::class, 'destroy'])->name('playlist.destroy');

// API endpoints for playlist track management
Route::get('/api/user-playlists',           [PlaylistController::class, 'index']);
Route::post('/api/playlist/{id}/add-track',    [PlaylistController::class, 'addTrack']);
Route::post('/api/playlist/{id}/remove-track', [PlaylistController::class, 'removeTrack']);
