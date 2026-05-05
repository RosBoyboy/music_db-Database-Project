<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Track;
use App\Services\SpotifyService;
use Illuminate\Support\Facades\Log;

class FetchSpotifyPreviewUrls extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fetch-spotify-preview-urls';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch and populate Spotify preview URLs for all local tracks';

    /**
     * Execute the console command.
     */
    public function handle(SpotifyService $spotify)
    {
        $tracks = Track::whereNull('preview_url')
            ->orWhere('preview_url', '=', '')
            ->orWhere('preview_url', 'like', '%mp3-preview/sample%')
            ->with('artist')
            ->get();

        $this->info("Processing " . $tracks->count() . " tracks...\n");

        $updated = 0;
        $fallback = 0;

        // Sample public domain audio URL for fallback (SoundHelix - royalty free)
        $fallbackUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

        foreach ($tracks as $track) {
            try {
                $query = $track->name . ' ' . $track->artist->name;
                
                $result = $spotify->search($query, 'track', 1);
                
                if ($result && isset($result['tracks']['items']) && count($result['tracks']['items']) > 0) {
                    $spotifyTrack = $result['tracks']['items'][0];
                    
                    if (!empty($spotifyTrack['preview_url'])) {
                        $track->update(['preview_url' => $spotifyTrack['preview_url']]);
                        $this->line("✓ {$track->name} - {$track->artist->name}");
                        $updated++;
                    } else {
                        // Use fallback URL when Spotify doesn't have preview
                        $track->update(['preview_url' => $fallbackUrl]);
                        $this->info("⚡ {$track->name} - (using sample audio)");
                        $fallback++;
                    }
                } else {
                    // Use fallback when track not found on Spotify
                    $track->update(['preview_url' => $fallbackUrl]);
                    $this->info("⚡ {$track->name} - (fallback)");
                    $fallback++;
                }
                
                // Rate limiting - wait 50ms between requests
                usleep(50000);
                
            } catch (\Exception $e) {
                // Use fallback on error
                $track->update(['preview_url' => $fallbackUrl]);
                $this->info("⚡ {$track->name} - (error fallback)");
                $fallback++;
            }
        }

        $this->newLine();
        $this->info("✓ Updated with Spotify URLs: $updated");
        $this->info("⚡ Updated with sample audio: $fallback");
        $this->info("\nAll tracks now have playable audio! 🎵");
    }
}
