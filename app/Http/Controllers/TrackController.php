<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Track;

use App\Services\SpotifyService;

class TrackController extends Controller
{
    private function getDummyPlaylists()
    {
        return [
            ['id' => 1, 'name' => 'Late Night Vibes', 'gradient' => 'from-indigo-500 to-purple-600', 'owner' => 'SoundWave', 'trackCount' => 24, 'description' => 'The perfect soundtrack for late night coding and studying.'],
            ['id' => 2, 'name' => 'Workout Mix', 'gradient' => 'from-orange-400 to-rose-500', 'owner' => 'SoundWave', 'trackCount' => 45, 'description' => 'High-energy beats to keep you moving.'],
            ['id' => 3, 'name' => 'Focus Flow', 'gradient' => 'from-cyan-400 to-blue-500', 'owner' => 'SoundWave', 'trackCount' => 18, 'description' => 'Deep focus electronic music for maximum productivity.'],
            ['id' => 4, 'name' => 'Weekend Chill', 'gradient' => 'from-emerald-400 to-teal-500', 'owner' => 'SoundWave', 'trackCount' => 32, 'description' => 'Relax and unwind with these laid-back tracks.'],
            ['id' => 5, 'name' => 'Acoustic Morning', 'gradient' => 'from-yellow-400 to-orange-500', 'owner' => 'SoundWave', 'trackCount' => 15, 'description' => 'Start your day right with smooth acoustic melodies.'],
            ['id' => 6, 'name' => 'Deep House', 'gradient' => 'from-blue-600 to-indigo-800', 'owner' => 'SoundWave', 'trackCount' => 50, 'description' => 'Get lost in the rhythm of deep house.'],
        ];
    }
    public function index()
    {
        $tracks = Track::with('artist', 'album')->paginate(20);
        
        return Inertia::render('Tracks/Index', [
            'tracks' => $tracks
        ]);
    }

    public function home(\App\Services\SpotifyService $spotifyService)
    {
        $mapSpotifyTracks = function($items) {
            return collect($items)->filter(function($t) {
                return isset($t['id']); // Filter out malformed tracks
            })->map(function($t) {
                return [
                    'id' => 'spotify-'.$t['id'],
                    'name' => $t['name'],
                    'artist' => ['name' => $t['artists'][0]['name'] ?? 'Unknown Artist'],
                    'album' => [
                        'name' => $t['album']['name'] ?? 'Unknown Album',
                        'image_url' => $t['album']['images'][0]['url'] ?? null
                    ],
                    'preview_url' => $t['preview_url'] ?? null,
                    'source' => 'spotify'
                ];
            });
        };

        // 1. Recommended
        $recommendedLocal = \App\Models\Track::with('artist', 'album')->inRandomOrder()->take(6)->get()->map(function($t) { $t->source = 'local'; return $t; });
        $recommendedSpotify = collect([]);
        if ($recommendedLocal->count() < 6) {
            $spotifyRes = $spotifyService->search('genre:pop', 'track', 6 - $recommendedLocal->count());
            $recommendedSpotify = $mapSpotifyTracks($spotifyRes['tracks']['items'] ?? []);
        }
        $recommendedTracks = $recommendedLocal->concat($recommendedSpotify);

        // 2. New Releases (latest tracks from local first)
        $newLocal = \App\Models\Track::with('artist', 'album')->latest('id')->take(6)->get()->map(function($t) { $t->source = 'local'; return $t; });
        $newSpotify = collect([]);
        if ($newLocal->count() < 6) {
            $spotifyRes = $spotifyService->search('tag:new', 'track', 6 - $newLocal->count());
            $newSpotify = $mapSpotifyTracks($spotifyRes['tracks']['items'] ?? []);
        }
        $newReleases = $newLocal->concat($newSpotify);

        // 3. Recently Played
        $recentLocal = \App\Models\Track::with('artist', 'album')->orderBy('play_count', 'desc')->take(6)->get()->map(function($t) { $t->source = 'local'; return $t; });
        $recentSpotify = collect([]);
        if ($recentLocal->count() < 6) {
            $spotifyRes = $spotifyService->search('year:2023', 'track', 6 - $recentLocal->count());
            $recentSpotify = $mapSpotifyTracks($spotifyRes['tracks']['items'] ?? []);
        }
        $recentTracks = $recentLocal->concat($recentSpotify);

        // 4. Dummy Playlists since we don't have a table yet
        $dummyPlaylists = array_slice($this->getDummyPlaylists(), 0, 4);

        $featuredPlaylist = [
            'id' => 101,
            'title' => 'Top 50 Global',
            'subtitle' => 'The most played tracks right now.',
            'gradient' => 'from-[#667eea] to-[#764ba2]'
        ];

        return Inertia::render('Home', [
            'recommendedTracks' => $recommendedTracks,
            'newReleases' => $newReleases,
            'recentTracks' => $recentTracks,
            'userPlaylists' => $dummyPlaylists,
            'featuredPlaylist' => $featuredPlaylist
        ]);
    }

    public function explore()
    {
        $artists = \App\Models\Artist::withCount('tracks')->orderBy('tracks_count', 'desc')->take(6)->get();
        $albums = \App\Models\Album::with('artist')->latest('release_date')->take(6)->get();
        
        $dummyPlaylists = $this->getDummyPlaylists();

        return Inertia::render('Explore', [
            'artists' => $artists,
            'albums' => $albums,
            'playlists' => $dummyPlaylists
        ]);
    }

    public function search(Request $request, SpotifyService $spotifyService)
    {
        $query = $request->get('q', '');
        
        if (!$query || strlen($query) < 2) {
            return Inertia::render('Search', [
                'query' => $query,
                'localTracks' => [],
                'spotifyTracks' => null,
                'localArtists' => [],
                'spotifyArtists' => null,
                'localAlbums' => [],
                'localPlaylists' => []
            ]);
        }
        
        // QUERY 1: LOCAL DATABASE
        $localTracks = \App\Models\Track::where('name', 'like', "%$query%")
                            ->with('artist', 'album')
                            ->limit(20)
                            ->get();
        
        $localArtists = \App\Models\Artist::where('name', 'like', "%$query%")
                              ->limit(10)
                              ->get();
        
        $localAlbums = \App\Models\Album::where('name', 'like', "%$query%")
                            ->with('artist')
                            ->limit(10)
                            ->get();
        
        $localPlaylists = []; // No DB table yet for playlists
        
        // QUERY 2: SPOTIFY API
        $spotifyTracks = null;
        $spotifyArtists = null;
        
        try {
            $spotifyResults = $spotifyService->getTracks($query);
            $spotifyTracks = $spotifyResults['tracks']['items'] ?? null;
            
            $spotifyArtistResults = $spotifyService->getArtists($query);
            $spotifyArtists = $spotifyArtistResults['artists']['items'] ?? null;
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Spotify search failed: ' . $e->getMessage());
            // Gracefully fail - show only local results
        }
        
        return Inertia::render('Search', [
            'query' => $query,
            'localTracks' => $localTracks,
            'spotifyTracks' => $spotifyTracks,
            'localArtists' => $localArtists,
            'spotifyArtists' => $spotifyArtists,
            'localAlbums' => $localAlbums,
            'localPlaylists' => $localPlaylists,
        ]);
    }

    public function artist($id, \App\Services\SpotifyService $spotifyService)
    {
        if (is_numeric($id)) {
            $artist = \App\Models\Artist::with(['albums', 'tracks.album'])->findOrFail($id);
            // Add local source tag
            $artist->tracks = $artist->tracks->map(function($t) {
                $t->source = 'local';
                return $t;
            });
        } else {
            // Spotify Artist
            $spotifyArtist = $spotifyService->getArtist($id);
            if (!$spotifyArtist) abort(404);
            
            $topTracks = $spotifyService->getArtistTopTracks($id);
            $albums = $spotifyService->getArtistAlbums($id);
            
            $artistData = [
                'id' => $spotifyArtist['id'],
                'name' => $spotifyArtist['name'],
                'image_url' => $spotifyArtist['images'][0]['url'] ?? null,
                'is_spotify' => true,
                'tracks' => collect($topTracks['tracks'] ?? [])->map(function($t) {
                    return [
                        'id' => $t['id'],
                        'name' => $t['name'],
                        'preview_url' => $t['preview_url'] ?? null,
                        'play_count' => null,
                        'source' => 'spotify',
                        'album' => [
                            'name' => $t['album']['name'] ?? '',
                            'image_url' => $t['album']['images'][0]['url'] ?? null
                        ],
                        'artist' => ['name' => $t['artists'][0]['name'] ?? '']
                    ];
                }),
                'albums' => collect($albums['items'] ?? [])->map(function($a) {
                    return [
                        'id' => $a['id'],
                        'name' => $a['name'],
                        'release_date' => $a['release_date'] ?? '',
                        'image_url' => $a['images'][0]['url'] ?? null
                    ];
                })
            ];
            
            $artist = json_decode(json_encode($artistData));
        }
        
        return Inertia::render('ArtistProfile', [
            'artist' => $artist
        ]);
    }

    public function playlist($id, \App\Services\SpotifyService $spotifyService)
    {
        $playlists = collect($this->getDummyPlaylists());
        $playlist = $playlists->firstWhere('id', (int)$id);

        if (!$playlist) {
            abort(404);
        }

        // Genre-specific search terms for each Quick Pick playlist
        $searchTerms = [
            1 => ['lo-fi chill beats', 'late night jazz', 'ambient study'],
            2 => ['workout hits 2024', 'high energy gym', 'cardio beats'],
            3 => ['focus electronic', 'deep concentration', 'ambient work music'],
            4 => ['weekend chill acoustic', 'Sunday morning vibes', 'relax indie'],
            5 => ['acoustic morning coffee', 'gentle folk', 'calm guitar'],
            6 => ['deep house mix', 'house music 2024', 'tech house'],
        ];

        $terms = $searchTerms[$playlist['id']] ?? [$playlist['name']];

        $mapSpotifyTracks = function($items) {
            return collect($items)->filter(fn($t) => isset($t['id']))->map(fn($t) => [
                'id' => 'spotify-'.$t['id'],
                'name' => $t['name'],
                'artist' => ['name' => $t['artists'][0]['name'] ?? 'Unknown Artist'],
                'album' => [
                    'name' => $t['album']['name'] ?? 'Unknown Album',
                    'image_url' => $t['album']['images'][0]['url'] ?? null
                ],
                'preview_url' => $t['preview_url'] ?? null,
                'source' => 'spotify'
            ]);
        };

        // Get local tracks first — normalize to same structure as Spotify tracks
        $localTracks = \App\Models\Track::with('artist', 'album')
            ->inRandomOrder()
            ->take(8)
            ->get()
            ->map(function($t) {
                return [
                    'id' => $t->id,
                    'name' => $t->name ?? $t->title ?? 'Unknown',
                    'artist' => ['name' => $t->artist->name ?? 'Unknown Artist'],
                    'album' => [
                        'name' => $t->album->name ?? '',
                        'image_url' => $t->album->image_url ?? null,
                    ],
                    'preview_url' => null,
                    'source' => 'local',
                ];
            });

        // Always fetch Spotify tracks to fill the playlist
        $spotifyTracks = collect([]);
        $needed = max(15, 20 - $localTracks->count());

        foreach ($terms as $term) {
            if ($spotifyTracks->count() >= $needed) break;

            $spotifyRes = $spotifyService->search($term, 'track', 10);
            if ($spotifyRes && isset($spotifyRes['tracks']['items'])) {
                $mapped = $mapSpotifyTracks($spotifyRes['tracks']['items']);
                $spotifyTracks = $spotifyTracks->concat($mapped);
            }
        }

        // Deduplicate spotify tracks by ID
        $spotifyTracks = $spotifyTracks->unique('id')->take($needed)->values();

        $tracks = $localTracks->concat($spotifyTracks)->values();

        // Update track count to actual count
        $playlist['trackCount'] = $tracks->count();

        return Inertia::render('PlaylistView', [
            'playlist' => $playlist,
            'tracks' => $tracks
        ]);
    }
}
