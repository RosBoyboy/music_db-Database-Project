<?php
require_once 'vendor/autoload.php';
require_once 'bootstrap/app.php';

$spotify = app('App\Services\SpotifyService');
$result = $spotify->search('Blinding Lights The Weeknd', 'track', 5);

if($result && isset($result['tracks']['items'][0])) {
  foreach($result['tracks']['items'] as $i => $track) {
    echo "[$i] {$track['name']} - preview_url: " . ($track['preview_url'] ?? 'NULL') . "\n";
  }
}
