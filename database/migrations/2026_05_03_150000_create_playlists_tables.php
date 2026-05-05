<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('playlists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('cover_gradient')->default('from-purple-600 to-indigo-600');
            $table->boolean('is_public')->default(false);
            $table->timestamps();

            $table->index('user_id');
        });

        Schema::create('playlist_tracks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('playlist_id')->constrained()->onDelete('cascade');
            $table->string('track_id');        // supports 'spotify-xxx' and numeric local IDs
            $table->string('source')->default('local');
            $table->json('metadata')->nullable(); // cache track info for external tracks
            $table->integer('position')->default(0);
            $table->timestamps();

            $table->unique(['playlist_id', 'track_id', 'source']);
            $table->index('playlist_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('playlist_tracks');
        Schema::dropIfExists('playlists');
    }
};
