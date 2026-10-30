<?php

use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\InkConsumptionController;
use App\Http\Controllers\Api\IssueReportController;
use App\Http\Controllers\Api\KnowledgeItemController;
use App\Http\Controllers\Api\MaintenanceRecordController;
use App\Http\Controllers\Api\PrinterController;
use App\Http\Controllers\Api\PrinterPartController;
use App\Http\Controllers\Api\PrintingJobController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/ink-types', [InkConsumptionController::class, 'types']);
    Route::get('/printers/{printer}/solutions', [IssueReportController::class, 'suggestedSolutions']);

    Route::apiResource('knowledge', KnowledgeItemController::class)
        ->parameters(['knowledge' => 'knowledgeItem']);
    Route::post('/knowledge/{knowledgeItem}/comments', [KnowledgeItemController::class, 'comment']);
    Route::post('/knowledge/{knowledgeItem}/rate', [KnowledgeItemController::class, 'rate']);
    Route::post('/knowledge/{knowledgeItem}/save', [KnowledgeItemController::class, 'toggleSave']);
    Route::post('/knowledge/{knowledgeItem}/report', [KnowledgeItemController::class, 'report']);

    Route::get('/printers', [PrinterController::class, 'index']);
    Route::get('/printers/{printer}', [PrinterController::class, 'show']);
    Route::get('/parts', [PrinterPartController::class, 'index']);

    Route::apiResource('issues', IssueReportController::class)->only(['index', 'store', 'show']);

    Route::get('/jobs', [PrintingJobController::class, 'index']);
    Route::post('/jobs', [PrintingJobController::class, 'store']);
    Route::put('/jobs/{printingJob}', [PrintingJobController::class, 'update']);

    Route::get('/ink-consumptions', [InkConsumptionController::class, 'index']);
    Route::post('/ink-consumptions', [InkConsumptionController::class, 'store']);

    Route::middleware('role:admin')->group(function () {
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{category}', [CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

        Route::post('/printers', [PrinterController::class, 'store']);
        Route::put('/printers/{printer}', [PrinterController::class, 'update']);
        Route::delete('/printers/{printer}', [PrinterController::class, 'destroy']);

        Route::post('/parts', [PrinterPartController::class, 'store']);
        Route::put('/parts/{part}', [PrinterPartController::class, 'update']);
        Route::delete('/parts/{part}', [PrinterPartController::class, 'destroy']);

        Route::patch('/issues/{issue}', [IssueReportController::class, 'update']);

        Route::get('/maintenance', [MaintenanceRecordController::class, 'index']);
        Route::post('/maintenance', [MaintenanceRecordController::class, 'store']);

        Route::delete('/jobs/{printingJob}', [PrintingJobController::class, 'destroy']);
        Route::post('/ink-types', [InkConsumptionController::class, 'storeType']);

        Route::patch('/knowledge/{knowledgeItem}/moderate', [KnowledgeItemController::class, 'moderate']);
        Route::get('/content-reports', [KnowledgeItemController::class, 'reports']);
        Route::patch('/content-reports/{report}', [KnowledgeItemController::class, 'resolveReport']);

        Route::get('/analytics', [AnalyticsController::class, 'dashboard']);
    });
});
