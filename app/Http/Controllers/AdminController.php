<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Track;
use App\Models\Playlist;
use App\Models\Artist;

class AdminController extends Controller
{
    public function dashboard()
    {
        $stats = [
            'totalUsers' => User::count(),
            'totalTracks' => Track::count(),
            'totalPlaylists' => Playlist::count(),
            'totalArtists' => Artist::count(),
            'recentUsers' => User::latest()->take(5)->get(['id', 'name', 'email', 'avatar_url', 'created_at']),
        ];

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats
        ]);
    }

    public function users(Request $request)
    {
        $query = User::query()->with('roles');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
        }

        $users = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/Users', [
            'users' => $users,
            'filters' => $request->only('search')
        ]);
    }

    public function tracks(Request $request)
    {
        $query = Track::query()->with(['uploader', 'artist']);

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%");
        }

        $tracks = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Admin/Tracks', [
            'tracks' => $tracks,
            'filters' => $request->only('search')
        ]);
    }

    public function deleteTrack(Request $request, $id)
    {
        $track = Track::findOrFail($id);
        
        // Delete physical file if it's a local upload
        if ($track->source === 'local' && $track->file_path) {
            $path = str_replace('/storage/', '', $track->file_path);
            \Illuminate\Support\Facades\Storage::disk('public')->delete($path);
        }

        $track->delete();

        return redirect()->back()->with('status', 'Track deleted successfully.');
    }
}
