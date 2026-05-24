<?php

namespace App\Actions\Profile;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class ChangeUserPasswordAction
{
    /**
     * @param array<string, mixed> $payload
     */
    public function execute(User $user, array $payload): void
    {
        $user->update([
            'password' => Hash::make((string) $payload['new_password']),
        ]);
    }
}
