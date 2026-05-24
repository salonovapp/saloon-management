<?php

namespace App\Http\Controllers\Api\V1\Profile;

use App\Actions\Profile\UpdateUserProfileAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Profile\UpdateProfileRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class UpdateProfileController extends Controller
{
    public function __construct(
        private readonly UpdateUserProfileAction $updateUserProfileAction,
    ) {
    }

    public function __invoke(UpdateProfileRequest $request): JsonResponse
    {
        $user = $this->updateUserProfileAction->execute(
            $request->user(),
            $request->validated(),
        );

        return response()->json([
            'message' => 'Profile updated successfully.',
            'data' => [
                'user' => $this->formatUser($user),
            ],
        ]);
    }

    private function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'photo' => $user->photo_url,
            'role' => $user->role,
            'saloon_id' => $user->saloon_id,
        ];
    }
}
