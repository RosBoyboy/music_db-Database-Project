<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserHistory extends Model
{
    protected $table = 'user_history';

    protected $fillable = ['user_id', 'track_id', 'source', 'metadata', 'played_at'];

    protected $casts = [
        'metadata' => 'array',
        'played_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
