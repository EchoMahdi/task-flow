
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SavedViewController;
Route::prefix('saved-views')->middleware(['auth:sanctum'])->group(function () {
    // GET /api/saved-views - List user's saved views
    Route::get('/', [SavedViewController::class, 'index']);
    // POST /api/saved-views - Create new saved view
    Route::post('/', [SavedViewController::class, 'store']);
    // PATCH /api/saved-views/{id} - Update saved view
    Route::patch('/{saved_view}', [SavedViewController::class, 'update']);
    // DELETE /api/saved-views/{id} - Delete saved view
    Route::delete('/{saved_view}', [SavedViewController::class, 'destroy']);
});
