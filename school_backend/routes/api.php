<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\SectionController;
use App\Http\Controllers\Api\V1\ClassController;
use App\Http\Controllers\Api\V1\StudentController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\SessionController;
use App\Http\Controllers\Api\V1\FeeGroupController;
use App\Http\Controllers\Api\V1\FeeTypeController;
use App\Http\Controllers\Api\V1\FeeMasterController;
use App\Http\Controllers\Api\V1\StudentFeeController;
use App\Http\Controllers\Api\V1\FeeTransactionController;

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

// Public routes (no authentication required)
Route::prefix('v1')->group(function () {
    // Authentication routes
    Route::post('/login', [AuthController::class, 'login']);
});

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->prefix('v1')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
    
    // Session management
    Route::get('/sessions', [SessionController::class, 'index']);
    Route::get('/sessions/active', [SessionController::class, 'getActiveSession']);
    Route::get('/sessions/{id}', [SessionController::class, 'show']);
    Route::get('/sessions/{id}/stats', [SessionController::class, 'getStats']);
    
    // Classes and Sections (read-only for authenticated users)
    Route::get('/classes', [ClassController::class, 'index']);
    Route::get('/sections', [SectionController::class, 'index']);
    
    // Student management (read-only for teachers, full access for admin/superadmin)
    Route::get('/students/classes-sections', [StudentController::class, 'getClassesAndSections']);
    Route::get('/students', [StudentController::class, 'index']);
    Route::get('/students/{id}', [StudentController::class, 'show']);

    // Fees Management (read-only for authenticated users)
    Route::get('/fee-groups', [FeeGroupController::class, 'index']);
    Route::get('/fee-types', [FeeTypeController::class, 'index']);
    Route::get('/student-fees', [StudentFeeController::class, 'index']);
    Route::get('/student-fees/student/{studentId}/summary', [StudentFeeController::class, 'getStudentFeeSummary']);
    Route::get('/fee-transactions', [FeeTransactionController::class, 'index']);
    Route::get('/fee-transactions/{id}', [FeeTransactionController::class, 'show']);
    Route::get('/fee-transactions/receipt/{receiptNo}', [FeeTransactionController::class, 'getByReceipt']);
    
    // Admin-only routes
    Route::middleware('role:superadmin,admin')->group(function () {
        // User management
        Route::apiResource('users', UserController::class);
        
        // Student management (full access)
        Route::post('/students', [StudentController::class, 'store']);
        Route::put('/students/{id}', [StudentController::class, 'update']);
        Route::delete('/students/{id}', [StudentController::class, 'destroy']);
        Route::post('/students/bulk-import', [StudentController::class, 'bulkImport']);
        
        // Session management (full access)
        Route::post('/sessions', [SessionController::class, 'store']);
        Route::put('/sessions/{id}', [SessionController::class, 'update']);
        Route::delete('/sessions/{id}', [SessionController::class, 'destroy']);
        Route::post('/sessions/switch', [SessionController::class, 'switchSession']);
        
        // Classes and Sections management
        Route::post('/classes', [ClassController::class, 'store']);
        Route::put('/classes/{id}', [ClassController::class, 'update']);
        Route::delete('/classes/{id}', [ClassController::class, 'destroy']);
        
        Route::post('/sections', [SectionController::class, 'store']);
        Route::put('/sections/{id}', [SectionController::class, 'update']);
        Route::delete('/sections/{id}', [SectionController::class, 'destroy']);

        // Fees Management (Admin/Accountant only)
        Route::apiResource('fee-groups', FeeGroupController::class);
        Route::get('/fee-groups/session/{sessionId}', [FeeGroupController::class, 'getBySession']);
        
        Route::apiResource('fee-types', FeeTypeController::class);
        Route::get('/fee-types/fee-group/{feeGroupId}', [FeeTypeController::class, 'getByFeeGroup']);
        
        // Fee Master Management
        Route::apiResource('fee-master', FeeMasterController::class);
        Route::post('/fee-master/assign-fees', [FeeMasterController::class, 'assignFees']);
        Route::get('/fee-master/class-summary', [FeeMasterController::class, 'getClassSummary']);
        
        Route::get('/student-fees', [StudentFeeController::class, 'index']);
        Route::post('/student-fees/assign', [StudentFeeController::class, 'assignFees']);
        Route::post('/student-fees/collect-payment', [StudentFeeController::class, 'collectPayment']);
        Route::get('/student-fees/student/{studentId}/summary', [StudentFeeController::class, 'getStudentFeeSummary']);
        Route::get('/student-fees/reports', [StudentFeeController::class, 'getFeeReports']);
        Route::delete('/student-fees/{id}', [StudentFeeController::class, 'removeFeeAssignment']);
        
        Route::get('/fee-transactions', [FeeTransactionController::class, 'index']);
        Route::get('/fee-transactions/{id}', [FeeTransactionController::class, 'show']);
        Route::get('/fee-transactions/receipt/{receiptNo}', [FeeTransactionController::class, 'getByReceipt']);
        Route::get('/fee-transactions/summary', [FeeTransactionController::class, 'getTransactionSummary']);
        Route::get('/fee-transactions/today', [FeeTransactionController::class, 'getTodayCollection']);
        Route::get('/fee-transactions/monthly', [FeeTransactionController::class, 'getMonthlyCollection']);
        Route::get('/fee-transactions/{id}/receipt', [FeeTransactionController::class, 'generateReceipt']);
        Route::put('/fee-transactions/{id}/notes', [FeeTransactionController::class, 'updateNotes']);
        
        // Advanced Fee Collection APIs
        Route::post('/collect-fee', [FeeTransactionController::class, 'collectFee']);
        Route::post('/generate-invoice/{studentId}', [FeeTransactionController::class, 'generateInvoice']);
        Route::get('/fee-split/{studentId}', [FeeTransactionController::class, 'getFeeSplit']);
    });
});

// Fallback route
Route::fallback(function () {
    return response()->json([
        'success' => false,
        'message' => 'API endpoint not found.',
        'status' => 404
    ], 404);
});
