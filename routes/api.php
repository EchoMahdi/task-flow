<?php

use App\Http\Controllers\Api\NavigationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| These routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group.
|
*/

require __DIR__.'/sanctum.php';
require __DIR__.'/api-notifications.php';
require __DIR__.'/api-social.php';
require __DIR__.'/api-teams.php';
require __DIR__.'/auth.php';
require __DIR__.'/api-tasks.php';
require __DIR__.'/api-projects.php';
require __DIR__.'/api-tags.php';
require __DIR__.'/api-user.php';
require __DIR__.'/api-user-theme.php';
require __DIR__.'/api-roles.php';