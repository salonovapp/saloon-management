<?php

use App\Http\Controllers\Api\V1\Auth\LoginController;
use App\Http\Controllers\Api\V1\Auth\MeController;
use App\Http\Controllers\Api\V1\Auth\RegisterController;
use App\Http\Controllers\Api\V1\Auth\RequestPasswordResetOtpController;
use App\Http\Controllers\Api\V1\Auth\ResetPasswordWithOtpController;
use App\Http\Controllers\Api\V1\Auth\VerifyPasswordResetOtpController;
use App\Http\Controllers\Api\V1\Category\CategoryController;
use App\Http\Controllers\Api\V1\Permission\PermissionController;
use App\Http\Controllers\Api\V1\Product\ProductController;
use App\Http\Controllers\Api\V1\Role\RoleController;
use App\Http\Controllers\Api\V1\Service\ServiceController;
use App\Http\Controllers\Api\V1\Onboarding\OnboardingController;
use App\Http\Controllers\Api\V1\Profile\ChangePasswordController;
use App\Http\Controllers\Api\V1\Profile\UpdateProfileController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::post('/public/register', RegisterController::class);
    Route::post('/public/login', LoginController::class);
    Route::post('/public/forgot-password/request-otp', RequestPasswordResetOtpController::class);
    Route::post('/public/forgot-password/verify-otp', VerifyPasswordResetOtpController::class);
    Route::post('/public/forgot-password/reset-password', ResetPasswordWithOtpController::class);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::put('/profile', UpdateProfileController::class);
        Route::put('/password', ChangePasswordController::class);
        Route::get('/me', MeController::class);
        Route::apiResource('categories', CategoryController::class);
        Route::apiResource('products', ProductController::class);
        Route::apiResource('services', ServiceController::class);
        Route::get('permissions', [PermissionController::class, 'index']);
        Route::put('roles/{role}/permissions', [RoleController::class, 'assignPermissions']);
        Route::apiResource('roles', RoleController::class);
    });

    Route::post('/onboarding/account', [OnboardingController::class, 'account']);
    Route::post('/onboarding/branch', [OnboardingController::class, 'branch']);
    Route::post('/onboarding/complete', [OnboardingController::class, 'complete']);
});
