<?php

namespace App\Actions\Auth;

use App\Models\Saloon;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RegisterSalonOwnerAction
{
    /**
     * @param array<string, mixed> $payload
     * @return array{user: User, saloon: Saloon}
     */
    public function execute(array $payload): array
    {
        return DB::transaction(function () use ($payload): array {
            $saloon = Saloon::query()->create([
                'name' => trim((string) $payload['salon_name']),
            ]);

            $user = User::query()->create([
                'name' => trim((string) $payload['name']),
                'email' => strtolower(trim((string) $payload['email'])),
                'phone' => trim((string) $payload['phone']),
                'password' => (string) $payload['password'],
                'saloon_id' => $saloon->id,
            ]);

            return [
                'user' => $user,
                'saloon' => $saloon,
            ];
        });
    }
}
