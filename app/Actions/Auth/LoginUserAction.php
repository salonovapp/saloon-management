<?php

namespace App\Actions\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpKernel\Exception\HttpException;

class LoginUserAction
{
    /**
     * @param array<string, mixed> $payload
     * @return array{user: User, token: string, should_onboard: bool}
     */
    public function execute(array $payload): array
    {
        $email = strtolower(trim((string) $payload['email']));
        $password = (string) $payload['password'];
        $deviceName = trim((string) ($payload['device_name'] ?? 'web'));

        $user = User::query()->where('email', $email)->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            throw new HttpException(422, 'Invalid email or password.');
        }

        $token = $user->createToken($deviceName !== '' ? $deviceName : 'web')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
            'should_onboard' => is_null($user->onboarding_completed_at),
        ];
    }
}
