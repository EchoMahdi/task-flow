<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TagController;
// Tag Routes
Route::prefix('tags')->middleware(['auth:sanctum'])->group(function () {
    // GET /api/tags - List user's tags
    Route::get('/', [TagController::class, 'index']);
    // POST /api/tags - Create new tag
    Route::post('/', [TagController::class, 'store']);
    // DELETE /api/tags/{id} - Delete tag
    Route::delete('/{tag}', [TagController::class, 'destroy']);
});
