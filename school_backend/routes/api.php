<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\SectionController;
use App\Http\Controllers\Api\V1\ClassController;
use App\Http\Controllers\Api\V1\StudentController;
use App\Http\Controllers\Api\V1\DashboardController;

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

// Public routes
Route::prefix('v1')->group(function () {
    // Authentication routes
    Route::post('/login', [AuthController::class, 'login']);
    
    // Public data endpoints (no authentication required)
    Route::get('/students/classes-sections', [StudentController::class, 'getClassesAndSections']);
    Route::get('/classes', [ClassController::class, 'index']);
    Route::get('/sections', [SectionController::class, 'index']);
});

// Protected routes
Route::middleware('auth:sanctum')->prefix('v1')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // User management (Superadmin/Admin only)
    Route::apiResource('users', UserController::class);
    
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
    
    // Student management
    Route::apiResource('students', StudentController::class);
    Route::post('/students/bulk-import', [StudentController::class, 'bulkImport']);
});

// Public data endpoints (no authentication required)
Route::prefix('v1')->group(function () {
    Route::get('/classes', [ClassController::class, 'index']);
    Route::get('/sections', [SectionController::class, 'index']);
});

// Fallback route
Route::fallback(function () {
    return response()->json([
        'success' => false,
        'message' => 'API endpoint not found.',
        'status' => 404
    ], 404);
});
