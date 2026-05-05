<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SpotifyService
{
    private $clientId;
    private $clientSecret;

    public function __construct()
    {
        $this->clientId = env('SPOTIFY_CLIENT_ID');
        $this->clientSecret = env('SPOTIFY_CLIENT_SECRET');
    }

    /**
     * Build an HTTP client that works on XAMPP (disables SSL verify for local dev).
     */
    private function http()
    {
        return Http::withOptions([
            'verify' => false,
            'curl' => [
                CURLOPT_SSLVERSION => CURL_SSLVERSION_TLSv1_2,
                CURLOPT_SSL_CIPHER_LIST => 'DEFAULT@SECLEVEL=1',
                CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4,
            ],
            'timeout' => 15,
            'connect_timeout' => 10,
        ]);
    }

    private function getAccessToken()
    {
        if (!$this->clientId || !$this->clientSecret) {
            return null;
        }

        return Cache::remember('spotify_access_token', 3500, function () {
            try {
                $response = $this->http()
                    ->asForm()
                    ->withBasicAuth($this->clientId, $this->clientSecret)
                    ->post('https://accounts.spotify.com/api/token', [
                        'grant_type' => 'client_credentials',
                    ]);

                if ($response->successful()) {
                    return $response->json('access_token');
                }

                Log::warning('Spotify token request failed', ['status' => $response->status()]);
                return null;
            } catch (\Exception $e) {
                Log::warning('Spotify connection failed: ' . $e->getMessage());
                return null;
            }
        });
    }

    public function search($query, $type = 'track', $limit = 12)
    {
        try {
            $token = $this->getAccessToken();
            if (!$token) return null;

            $response = $this->http()->withToken($token)->get('https://api.spotify.com/v1/search', [
                'q' => $query,
                'type' => $type,
                'limit' => $limit,
            ]);

            return $response->successful() ? $response->json() : null;
        } catch (\Exception $e) {
            Log::warning('Spotify search failed: ' . $e->getMessage());
            return null;
        }
    }

    public function getArtist($id)
    {
        try {
            $token = $this->getAccessToken();
            if (!$token) return null;

            $response = $this->http()->withToken($token)->get("https://api.spotify.com/v1/artists/{$id}");
            return $response->successful() ? $response->json() : null;
        } catch (\Exception $e) {
            Log::warning('Spotify getArtist failed: ' . $e->getMessage());
            return null;
        }
    }

    public function getArtistTopTracks($id)
    {
        try {
            $token = $this->getAccessToken();
            if (!$token) return null;

            $response = $this->http()->withToken($token)->get("https://api.spotify.com/v1/artists/{$id}/top-tracks", [
                'market' => 'US'
            ]);
            return $response->successful() ? $response->json() : null;
        } catch (\Exception $e) {
            Log::warning('Spotify getArtistTopTracks failed: ' . $e->getMessage());
            return null;
        }
    }

    public function getArtistAlbums($id)
    {
        try {
            $token = $this->getAccessToken();
            if (!$token) return null;

            $response = $this->http()->withToken($token)->get("https://api.spotify.com/v1/artists/{$id}/albums", [
                'limit' => 10,
                'market' => 'US'
            ]);
            return $response->successful() ? $response->json() : null;
        } catch (\Exception $e) {
            Log::warning('Spotify getArtistAlbums failed: ' . $e->getMessage());
            return null;
        }
    }

    public function getTracks($query)
    {
        return $this->search($query, 'track', 20);
    }

    public function getArtists($query)
    {
        return $this->search($query, 'artist', 10);
    }
}
