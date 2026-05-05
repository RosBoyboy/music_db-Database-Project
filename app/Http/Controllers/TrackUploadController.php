<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Track;
use App\Models\Artist;
use App\Models\Role;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class TrackUploadController extends Controller
{
    /**
     * Attach 'artist' role to the authenticated user and create an Artist profile.
     */
    public function becomeArtist()
    {
        $user = Auth::user();
        $artistRole = Role::where('name', 'artist')->firstOrFail();

        if (!$user->hasRole('artist')) {
            $user->roles()->attach($artistRole->id);

            // Create an Artist profile linked to this user if one doesn't exist
            $artist = Artist::firstOrCreate(
                ['name' => $user->name],
                ['image_url' => null]
            );
        }

        return redirect()->route('upload.index')->with('success', 'You are now an artist!');
    }

    /**
     * Return tracks uploaded by the authenticated user (for the dashboard).
     */
    public function index()
    {
        $tracks = Track::with('artist', 'album')
            ->where('uploaded_by', Auth::id())
            ->orderByDesc('created_at')
            ->get();

        return response()->json($tracks);
    }

    /**
     * Handle track upload.
     */
    public function upload(Request $request)
    {
        // Only artists can upload
        if (!Auth::user()->hasRole('artist')) {
            abort(403, 'You must be an artist to upload tracks.');
        }

        $request->validate([
            'title' => 'required|string|max:255',
            // Increased max size to 50MB and broadened allowed mime types for audio
            'audio_file' => 'required|file|mimes:mp3,wav,ogg,m4a,flac,aac,mp4|max:51200',
            // Removed max size restriction for cover image to allow any size
            'cover_image' => 'nullable|file|mimes:jpg,jpeg,png,webp,gif',
        ]);

        $audioPath = $request->file('audio_file')->store('tracks', 'public');
        
        $coverPath = null;
        if ($request->hasFile('cover_image')) {
            $coverPath = $request->file('cover_image')->store('covers', 'public');
        }

        // Find or create an Artist record matching the user
        $artist = Artist::firstOrCreate(
            ['name' => Auth::user()->name],
            ['image_url' => null]
        );

        // Create an album to hold the cover image if provided
        $album = null;
        if ($coverPath) {
            $album = \App\Models\Album::create([
                'name' => $request->title . ' - Single',
                'artist_id' => $artist->id,
                'release_date' => now(),
                'image_url' => '/storage/' . $coverPath,
            ]);
        }

        $track = Track::create([
            'name' => $request->title,
            'source' => 'local',
            'file_path' => $audioPath,
            'artist_id' => $artist->id,
            'album_id' => $album ? $album->id : null,
            'preview_url' => null,
            'uploaded_by' => Auth::id(),
        ]);

        // Inertia's useForm.post() expects a redirect response
        return redirect()->back()->with('success', 'Track uploaded successfully!');
    }

    /**
     * Stream a local track.
     */
    public function stream($id)
    {
        $track = Track::findOrFail($id);

        if ($track->source !== 'local' || !$track->file_path) {
            abort(404, 'Track not found or is not a local file.');
        }

        $path = storage_path('app/public/' . $track->file_path);

        if (!file_exists($path)) {
            abort(404, 'Audio file not found on disk.');
        }

        return response()->file($path);
    }

    /**
     * Delete an uploaded track.
     */
    public function destroy($id)
    {
        $track = Track::findOrFail($id);

        // Strict ownership validation
        if ($track->uploaded_by !== Auth::id()) {
            abort(403, 'Unauthorized action. You do not own this track.');
        }

        // Delete physical files
        if ($track->file_path) {
            Storage::disk('public')->delete($track->file_path);
        }

        $track->delete();

        return response()->json(['message' => 'Track deleted successfully.']);
    }
}
