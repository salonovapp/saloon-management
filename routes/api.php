<?php

use App\Http\Controllers\Api\V1\Auth\RegisterController;
use App\Http\Controllers\Api\V1\Auth\LoginController;
use App\Http\Controllers\Api\V1\Onboarding\OnboardingController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::post('/public/register', RegisterController::class);
    Route::post('/public/login', LoginController::class);
    Route::post('/onboarding/account', [OnboardingController::class, 'account']);
    Route::post('/onboarding/branch', [OnboardingController::class, 'branch']);
    Route::post('/onboarding/services', [OnboardingController::class, 'services']);
    Route::post('/onboarding/complete', [OnboardingController::class, 'complete']);
});
