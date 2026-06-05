<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Actions\Admin\AdminOnboardingAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\StoreAdminOnboardingRequest;
use App\Http\Resources\Api\V1\Admin\AdminOnboardingResponseResource;
use Illuminate\Http\JsonResponse;

class AdminOnboardingController extends Controller
{
    public function __construct(
        private readonly AdminOnboardingAction $adminOnboardingAction,
    ) {
    }

    public function store(StoreAdminOnboardingRequest $request): JsonResponse
    {
        $result = $this->adminOnboardingAction->execute($request->validated());

        return response()->json([
            'message' => 'Salon onboarded successfully.',
            'data' => (new AdminOnboardingResponseResource($result))->resolve(),
        ], 201);
    }
}
