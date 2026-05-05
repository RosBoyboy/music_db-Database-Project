<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('track_id');       // supports both numeric local IDs and "spotify-xxx"
            $table->string('source')->default('local'); // 'local' or 'spotify'
            $table->json('metadata')->nullable();       // cache track info for spotify tracks
            $table->timestamps();

            $table->unique(['user_id', 'track_id', 'source']);
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_likes');
    }
};
