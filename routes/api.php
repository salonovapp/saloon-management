<?php

use App\Http\Controllers\Api\V1\Auth\LoginController;
use App\Http\Controllers\Api\V1\Auth\RegisterController;
use App\Http\Controllers\Api\V1\Onboarding\OnboardingController;
use App\Http\Controllers\Api\V1\Profile\ChangePasswordController;
use App\Http\Controllers\Api\V1\Profile\UpdateProfileController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::post('/public/register', RegisterController::class);
    Route::post('/public/login', LoginController::class);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::put('/profile', UpdateProfileController::class);
        Route::put('/password', ChangePasswordController::class);
        Route::get('/me', function (\Illuminate\Http\Request $request) {
            $user = $request->user();
            $saloon = $user->saloon;
            
            return response()->json([
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'phone' => $user->phone,
                        'photo' => $user->photo_url,
                        'role' => $user->role,
                        'saloon_id' => $user->saloon_id,
                    ],
                    'tenant' => $saloon ? [
                        'id' => $saloon->id,
                        'name' => $saloon->name,
                        'plan' => [
                            'name' => 'Free Trial',
                            'slug' => 'free',
                        ],
                    ] : null,
                    'permissions' => [
                        'appointments.view',
                        'staff.view',
                        'inventory.view',
                        'customers.view',
                        'billing.view',
                        'analytics.view',
                        'settings.view',
                    ],
                ]
            ]);
        });
    });

    Route::post('/onboarding/account', [OnboardingController::class, 'account']);
    Route::post('/onboarding/branch', [OnboardingController::class, 'branch']);
    Route::post('/onboarding/services', [OnboardingController::class, 'services']);
    Route::post('/onboarding/complete', [OnboardingController::class, 'complete']);
});
