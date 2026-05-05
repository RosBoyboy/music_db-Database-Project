<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$s = app(\App\Services\SpotifyService::class);
$r = $s->search('chill beats', 'track', 3);

if ($r && isset($r['tracks']['items'])) {
    echo "SUCCESS! Spotify returned " . count($r['tracks']['items']) . " tracks\n";
    foreach ($r['tracks']['items'] as $t) {
        echo "  - " . $t['name'] . " by " . ($t['artists'][0]['name'] ?? '?') . "\n";
    }
} else {
    echo "Spotify returned null — but page will NOT crash (graceful degradation)\n";
}
