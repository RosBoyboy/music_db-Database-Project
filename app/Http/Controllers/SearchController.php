<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Models\Track;
use App\Models\Artist;
use App\Models\Album;
use App\Services\SpotifyService;

class SearchController extends Controller
{
    public function __construct(protected SpotifyService $spotify) {}

    // ── Inertia Page ────────────────────────────────────────────────
    public function page(Request $request)
    {
        $query = trim($request->get('q', ''));

        if (!$query || strlen($query) < 2) {
            return Inertia::render('Search', [
                'query'          => $query,
                'localTracks'    => [],
                'localArtists'   => [],
                'localAlbums'    => [],
                'spotifyTracks'  => [],
                'spotifyArtists' => [],
            ]);
        }

        [$local, $spotify] = $this->runHybridSearch($query);

        return Inertia::render('Search', array_merge(
            ['query' => $query],
            $local,
            $spotify
        ));
    }

    // ── JSON API Endpoint (for debounced AJAX calls) ─────────────────
    public function api(Request $request)
    {
        $query = trim($request->get('q', ''));

        if (!$query || strlen($query) < 2) {
            return response()->json([
                'local_tracks'    => [],
                'local_artists'   => [],
                'local_albums'    => [],
                'spotify_tracks'  => [],
                'spotify_artists' => [],
            ]);
        }

        [$local, $spotify] = $this->runHybridSearch($query);

        return response()->json([
            'local_tracks'    => $local['localTracks'],
            'local_artists'   => $local['localArtists'],
            'local_albums'    => $local['localAlbums'],
            'spotify_tracks'  => $spotify['spotifyTracks'],
            'spotify_artists' => $spotify['spotifyArtists'],
        ]);
    }

    // ── Core Hybrid Search Logic ─────────────────────────────────────
    private function runHybridSearch(string $query): array
    {
        // ── 1. LOCAL DB — Smart multi-term search ───────────────────
        $terms = array_filter(explode(' ', $query));
        $fullQuery = $query;

        // Build track query with cross-referencing artist name
        $localTracks = Track::query()
            ->with('artist:id,name,image_url', 'album:id,name,image_url')
            ->where(function ($q) use ($terms, $fullQuery) {
                // Exact name match (highest priority)
                $q->where('name', 'like', "%{$fullQuery}%");

                // Multi-term: match track name AND artist name across terms
                if (count($terms) > 1) {
                    foreach ($terms as $term) {
                        $q->orWhere(function ($sub) use ($term) {
                            $sub->where('name', 'like', "%{$term}%")
                                ->orWhereHas('artist', fn($a) => $a->where('name', 'like', "%{$term}%"));
                        });
                    }
                }

                // Fuzzy match via SOUNDEX for misspelled queries
                $q->orWhereRaw('SOUNDEX(name) = SOUNDEX(?)', [$fullQuery]);
            })
            // Boost exact matches to top via ordering
            ->orderByRaw("CASE WHEN name LIKE ? THEN 0 WHEN name LIKE ? THEN 1 ELSE 2 END", [
                $fullQuery,
                "%{$fullQuery}%"
            ])
            ->orderByDesc('play_count')
            ->limit(12)
            ->get();

        // Artist search
        $localArtists = Artist::where(function ($q) use ($terms, $fullQuery) {
                $q->where('name', 'like', "%{$fullQuery}%");
                foreach ($terms as $term) {
                    $q->orWhere('name', 'like', "%{$term}%");
                }
                $q->orWhereRaw('SOUNDEX(name) = SOUNDEX(?)', [$fullQuery]);
            })
            ->limit(6)
            ->get(['id', 'name', 'image_url']);

        // Album search
        $localAlbums = Album::where(function ($q) use ($terms, $fullQuery) {
                $q->where('name', 'like', "%{$fullQuery}%");
                foreach ($terms as $term) {
                    $q->orWhere('name', 'like', "%{$term}%");
                }
            })
            ->with('artist:id,name')
            ->limit(6)
            ->get(['id', 'name', 'artist_id', 'image_url', 'release_date']);

        // ── 2. SPOTIFY API (cached 10 min) ───────────────────────────
        $spotifyTracks  = [];
        $spotifyArtists = [];

        try {
            $cacheKey    = 'spotify_search_v3_' . md5(strtolower($fullQuery));
            $spotifyData = Cache::remember($cacheKey, now()->addMinutes(10), function () use ($fullQuery) {
                // Single API call for both tracks and artists
                $result = $this->spotify->search($fullQuery, 'track,artist', 10);

                // If Spotify returned null (auth failure, rate limit) — don't cache
                if (!$result || (!isset($result['tracks']) && !isset($result['artists']))) {
                    throw new \RuntimeException('Spotify API returned no data');
                }

                return [
                    'tracks'  => $result['tracks']['items']   ?? [],
                    'artists' => $result['artists']['items']  ?? [],
                ];
            });

            // Map Spotify tracks to a clean structure
            $spotifyTracks = collect($spotifyData['tracks'])->map(fn($t) => [
                'id'          => $t['id'],
                'name'        => $t['name'],
                'artist'      => $t['artists'][0]['name'] ?? 'Unknown',
                'album'       => $t['album']['name'] ?? '',
                'image_url'   => $t['album']['images'][0]['url'] ?? null,
                'preview_url' => $t['preview_url'] ?? null,
                'source'      => 'spotify',
            ])->values()->toArray();

            // Map Spotify artists to a clean structure
            $spotifyArtists = collect($spotifyData['artists'])->map(fn($a) => [
                'id'         => $a['id'],
                'name'       => $a['name'],
                'image_url'  => $a['images'][0]['url'] ?? null,
                'followers'  => $a['followers']['total'] ?? 0,
                'genres'     => array_slice($a['genres'] ?? [], 0, 2),
                'source'     => 'spotify',
            ])->values()->toArray();

        } catch (\Exception $e) {
            Log::error('Spotify search failed: ' . $e->getMessage());
            // Graceful fallback — local results still returned
        }

        $local = [
            'localTracks'  => $localTracks,
            'localArtists' => $localArtists,
            'localAlbums'  => $localAlbums,
        ];
        $spotify = [
            'spotifyTracks'  => $spotifyTracks,
            'spotifyArtists' => $spotifyArtists,
        ];

        return [$local, $spotify];
    }

    // ── Suggestions API (lightweight, for autocomplete dropdown) ──────
    public function suggestions(Request $request)
    {
        $query = trim($request->get('q', ''));

        if (!$query || strlen($query) < 1) {
            return response()->json([]);
        }

        $suggestions = collect();

        // ── 1. Local DB suggestions (instant) ──────────────────────────
        $localTrackNames = Track::where('name', 'like', "%{$query}%")
            ->orderByDesc('play_count')
            ->limit(5)
            ->pluck('name');

        $localArtistNames = Artist::where('name', 'like', "%{$query}%")
            ->limit(4)
            ->pluck('name');

        $localAlbumNames = Album::where('name', 'like', "%{$query}%")
            ->limit(3)
            ->pluck('name');

        $suggestions = $suggestions
            ->merge($localArtistNames->map(fn($n) => ['text' => $n, 'type' => 'artist']))
            ->merge($localTrackNames->map(fn($n) => ['text' => $n, 'type' => 'track']))
            ->merge($localAlbumNames->map(fn($n) => ['text' => $n, 'type' => 'album']));

        // ── 2. Spotify suggestions (cached) ────────────────────────────
        try {
            $cacheKey = 'spotify_suggest_' . md5(strtolower($query));
            $spotifyNames = Cache::remember($cacheKey, now()->addMinutes(10), function () use ($query) {
                $result = $this->spotify->search($query, 'track,artist', 6);
                $names = collect();

                if (isset($result['tracks']['items'])) {
                    foreach (array_slice($result['tracks']['items'], 0, 3) as $t) {
                        $names->push(['text' => $t['name'], 'type' => 'track']);
                    }
                }
                if (isset($result['artists']['items'])) {
                    foreach (array_slice($result['artists']['items'], 0, 3) as $a) {
                        $names->push(['text' => $a['name'], 'type' => 'artist']);
                    }
                }

                return $names->toArray();
            });

            $suggestions = $suggestions->merge($spotifyNames);
        } catch (\Exception $e) {
            // Spotify failed — local suggestions are still returned
        }

        // Deduplicate by lowercase text, keep first occurrence, limit to 8
        $seen = [];
        $unique = $suggestions->filter(function ($item) use (&$seen) {
            $key = strtolower($item['text']);
            if (in_array($key, $seen)) return false;
            $seen[] = $key;
            return true;
        })->take(8)->values();

        return response()->json($unique);
    }
}
