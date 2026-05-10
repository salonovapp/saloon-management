<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Actions\Auth\RegisterSalonOwnerAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\RegisterRequest;
use Illuminate\Http\JsonResponse;

class RegisterController extends Controller
{
    public function __construct(
        private readonly RegisterSalonOwnerAction $registerSalonOwnerAction,
    ) {
    }

    public function __invoke(RegisterRequest $request): JsonResponse
    {
        $result = $this->registerSalonOwnerAction->execute($request->validated());

        return response()->json([
            'message' => 'Registration completed successfully.',
            'data' => [
                'user' => [
                    'id' => $result['user']->id,
                    'name' => $result['user']->name,
                    'email' => $result['user']->email,
                    'phone' => $result['user']->phone,
                    'saloon_id' => $result['user']->saloon_id,
                ],
                'saloon' => [
                    'id' => $result['saloon']->id,
                    'name' => $result['saloon']->name,
                ],
            ],
        ], 201);
    }
}
