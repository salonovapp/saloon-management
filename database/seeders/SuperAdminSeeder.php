<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'admin@salonos.com'],
            [
                'name' => 'Super Admin',
                'phone' => '+919999999999',
                'password' => Hash::make('Admin@123'),
                'is_system_admin' => true,
                'role_id' => null,
                'saloon_id' => null,
                'onboarding_completed_at' => now(),
                'email_verified_at' => now(),
            ],
        );
    }
}
