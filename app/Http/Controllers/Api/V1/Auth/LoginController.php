<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Actions\Auth\LoginUserAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use Illuminate\Http\JsonResponse;

class LoginController extends Controller
{
    public function __construct(
        private readonly LoginUserAction $loginUserAction,
    ) {
    }

    public function __invoke(LoginRequest $request): JsonResponse
    {
        $result = $this->loginUserAction->execute($request->validated());
        $user = $result['user'];

        return response()->json([
            'message' => 'Login successful.',
            'data' => [
                'token' => null,
                'should_onboard' => $result['should_onboard'],
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'saloon_id' => $user->saloon_id,
                ],
            ],
        ]);
    }
}
