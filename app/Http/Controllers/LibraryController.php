<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\UserLike;
use App\Models\UserHistory;
use Inertia\Inertia;

class LibraryController extends Controller
{
    /**
     * Toggle like on a track (like / unlike).
     */
    public function toggleLike(Request $request)
    {
        $request->validate([
            'track_id'  => 'required|string',
            'source'    => 'required|in:local,spotify',
            'metadata'  => 'nullable|array',
        ]);

        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'unauthenticated'], 401);
        }

        $existing = UserLike::where('user_id', $user->id)
            ->where('track_id', $request->track_id)
            ->where('source', $request->source)
            ->first();

        if ($existing) {
            $existing->delete();
            return response()->json(['liked' => false]);
        }

        UserLike::create([
            'user_id'  => $user->id,
            'track_id' => $request->track_id,
            'source'   => $request->source,
            'metadata' => $request->metadata,
        ]);

        return response()->json(['liked' => true]);
    }

    /**
     * Check if a track is liked by the current user.
     */
    public function checkLike(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['liked' => false]);
        }

        $liked = UserLike::where('user_id', $user->id)
            ->where('track_id', $request->track_id)
            ->where('source', $request->source ?? 'local')
            ->exists();

        return response()->json(['liked' => $liked]);
    }

    /**
     * Record a playback event in user history.
     */
    public function recordHistory(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['ok' => false], 401);
        }

        $request->validate([
            'track_id' => 'required|string',
            'source'   => 'required|in:local,spotify',
            'metadata' => 'nullable|array',
        ]);

        UserHistory::create([
            'user_id'   => $user->id,
            'track_id'  => $request->track_id,
            'source'    => $request->source,
            'metadata'  => $request->metadata,
            'played_at' => now(),
        ]);

        return response()->json(['ok' => true]);
    }

    /**
     * Liked Songs page.
     */
    public function likedSongs()
    {
        $user = Auth::user();
        $likes = [];

        if ($user) {
            $likes = UserLike::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($like) {
                    $meta = $like->metadata ?? [];
                    return [
                        'id'          => $like->track_id,
                        'name'        => $meta['name'] ?? 'Unknown Track',
                        'artist'      => ['name' => $meta['artist_name'] ?? 'Unknown Artist'],
                        'album'       => [
                            'name'      => $meta['album_name'] ?? '',
                            'image_url' => $meta['image_url'] ?? null,
                        ],
                        'preview_url' => $meta['preview_url'] ?? null,
                        'source'      => $like->source,
                        'liked_at'    => $like->created_at->toDateTimeString(),
                    ];
                });
        }

        return Inertia::render('LikedSongs', [
            'likedTracks' => $likes,
        ]);
    }

    /**
     * History page.
     */
    public function history()
    {
        $user = Auth::user();
        $history = [];

        if ($user) {
            $history = UserHistory::where('user_id', $user->id)
                ->orderBy('played_at', 'desc')
                ->take(100)
                ->get()
                ->map(function ($entry) {
                    $meta = $entry->metadata ?? [];
                    return [
                        'id'          => $entry->track_id,
                        'name'        => $meta['name'] ?? 'Unknown Track',
                        'artist'      => ['name' => $meta['artist_name'] ?? 'Unknown Artist'],
                        'album'       => [
                            'name'      => $meta['album_name'] ?? '',
                            'image_url' => $meta['image_url'] ?? null,
                        ],
                        'preview_url' => $meta['preview_url'] ?? null,
                        'source'      => $entry->source,
                        'played_at'   => $entry->played_at->toDateTimeString(),
                    ];
                });
        }

        return Inertia::render('History', [
            'historyTracks' => $history,
        ]);
    }

    /**
     * Get all liked track IDs for the current user (used by frontend for bulk checks).
     */
    public function likedIds()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['ids' => []]);
        }

        $ids = UserLike::where('user_id', $user->id)
            ->pluck('track_id')
            ->toArray();

        return response()->json(['ids' => $ids]);
    }
}
