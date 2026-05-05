<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Playlist;
use App\Models\PlaylistTrack;
use Inertia\Inertia;

class PlaylistController extends Controller
{
    /**
     * List all user playlists (JSON for sidebar).
     */
    public function index()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['playlists' => []]);
        }

        $playlists = Playlist::where('user_id', $user->id)
            ->withCount('tracks')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['playlists' => $playlists]);
    }

    /**
     * Show create playlist page.
     */
    public function create()
    {
        return Inertia::render('Playlists/Create');
    }

    /**
     * Store a new playlist.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'unauthenticated'], 401);
        }

        $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'cover_gradient' => 'nullable|string|max:100',
        ]);

        $gradients = [
            'from-purple-600 to-indigo-600',
            'from-pink-500 to-rose-500',
            'from-amber-500 to-orange-600',
            'from-emerald-500 to-teal-600',
            'from-blue-500 to-cyan-600',
            'from-fuchsia-500 to-purple-600',
            'from-red-500 to-pink-600',
            'from-sky-500 to-indigo-600',
        ];

        $playlist = Playlist::create([
            'user_id' => $user->id,
            'name' => $request->name,
            'description' => $request->description,
            'cover_gradient' => $request->cover_gradient ?? $gradients[array_rand($gradients)],
        ]);

        return redirect("/my-playlist/{$playlist->id}");
    }

    /**
     * Show a user playlist.
     */
    public function show($id)
    {
        $user = Auth::user();
        $playlist = Playlist::withCount('tracks')->findOrFail($id);

        // Only owner can see non-public playlists
        if (!$playlist->is_public && (!$user || $user->id !== $playlist->user_id)) {
            abort(403);
        }

        $tracks = PlaylistTrack::where('playlist_id', $playlist->id)
            ->orderBy('position')
            ->get()
            ->map(function ($pt) {
                $meta = $pt->metadata ?? [];
                return [
                    'id'          => $pt->track_id,
                    'name'        => $meta['name'] ?? 'Unknown Track',
                    'artist'      => ['name' => $meta['artist_name'] ?? 'Unknown Artist'],
                    'album'       => [
                        'name'      => $meta['album_name'] ?? '',
                        'image_url' => $meta['image_url'] ?? null,
                    ],
                    'preview_url' => $meta['preview_url'] ?? null,
                    'source'      => $pt->source,
                    'position'    => $pt->position,
                    'added_at'    => $pt->created_at->toDateTimeString(),
                ];
            });

        return Inertia::render('Playlists/Show', [
            'playlist' => $playlist,
            'tracks'   => $tracks,
            'isOwner'  => $user && $user->id === $playlist->user_id,
        ]);
    }

    /**
     * Add a track to a playlist.
     */
    public function addTrack(Request $request, $id)
    {
        $user = Auth::user();
        if (!$user) return response()->json(['error' => 'unauthenticated'], 401);

        $playlist = Playlist::where('user_id', $user->id)->findOrFail($id);

        $request->validate([
            'track_id' => 'required|string',
            'source'   => 'required|in:local,spotify',
            'metadata' => 'nullable|array',
        ]);

        // Check if already in playlist
        $existing = PlaylistTrack::where('playlist_id', $playlist->id)
            ->where('track_id', $request->track_id)
            ->where('source', $request->source)
            ->first();

        if ($existing) {
            return response()->json(['error' => 'Track already in playlist', 'added' => false], 409);
        }

        $maxPos = PlaylistTrack::where('playlist_id', $playlist->id)->max('position') ?? -1;

        PlaylistTrack::create([
            'playlist_id' => $playlist->id,
            'track_id'    => $request->track_id,
            'source'      => $request->source,
            'metadata'    => $request->metadata,
            'position'    => $maxPos + 1,
        ]);

        return response()->json(['added' => true]);
    }

    /**
     * Remove a track from a playlist.
     */
    public function removeTrack(Request $request, $id)
    {
        $user = Auth::user();
        if (!$user) return response()->json(['error' => 'unauthenticated'], 401);

        $playlist = Playlist::where('user_id', $user->id)->findOrFail($id);

        PlaylistTrack::where('playlist_id', $playlist->id)
            ->where('track_id', $request->track_id)
            ->where('source', $request->source ?? 'local')
            ->delete();

        return response()->json(['removed' => true]);
    }

    /**
     * Delete an entire playlist.
     */
    public function destroy($id)
    {
        $user = Auth::user();
        if (!$user) return response()->json(['error' => 'unauthenticated'], 401);

        $playlist = Playlist::where('user_id', $user->id)->findOrFail($id);
        $playlist->delete();

        return redirect('/home');
    }

    /**
     * Update playlist details.
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        if (!$user) return response()->json(['error' => 'unauthenticated'], 401);

        $playlist = Playlist::where('user_id', $user->id)->findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|max:100',
            'description' => 'nullable|string|max:500',
        ]);

        if ($request->has('name')) $playlist->name = $request->name;
        if ($request->has('description')) $playlist->description = $request->description;
        $playlist->save();

        return response()->json(['ok' => true, 'playlist' => $playlist]);
    }
}
