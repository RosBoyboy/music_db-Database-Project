<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlaylistTrack extends Model
{
    protected $fillable = ['playlist_id', 'track_id', 'source', 'metadata', 'position'];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function playlist()
    {
        return $this->belongsTo(Playlist::class);
    }
}
