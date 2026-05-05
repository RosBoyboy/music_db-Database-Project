<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

use App\Http\Controllers\TrackUploadController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/tracks/my', [TrackUploadController::class, 'index']);
    
    // Artist-only routes
    Route::middleware('role:artist')->group(function () {
        Route::post('/tracks/upload', [TrackUploadController::class, 'upload']);
        Route::delete('/tracks/{id}', [TrackUploadController::class, 'destroy']);
    });
});

// Stream route doesn't need auth (publicly accessible if known)
Route::get('/tracks/{id}/stream', [TrackUploadController::class, 'stream']);
