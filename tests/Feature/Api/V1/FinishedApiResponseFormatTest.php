<?php

namespace Tests\Feature\Api\V1;

use App\Models\Role;
use App\Models\Saloon;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FinishedApiResponseFormatTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_response_format_remains_unchanged(): void
    {
        $response = $this->postJson('/api/v1/public/register', [
            'salon_name' => 'Downtown Studio',
            'name' => 'Owner Name',
            'email' => 'register.user@gmail.com',
            'phone' => '+91 9876543210',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
            'terms' => true,
        ]);

        $response->assertCreated();
        $response->assertJsonPath('message', 'Registration completed successfully.');

        $this->assertSame(['message', 'data'], array_keys($response->json()));
        $this->assertSame(['user', 'saloon'], array_keys($response->json('data')));
        $this->assertSame(
            ['id', 'name', 'email', 'phone', 'saloon_id'],
            array_keys($response->json('data.user')),
        );
        $this->assertSame(['id', 'name'], array_keys($response->json('data.saloon')));
    }

    public function test_login_response_format_remains_unchanged(): void
    {
        $this->seed(PermissionSeeder::class);

        $user = $this->createOwner(email: 'login.user@gmail.com');

        $response = $this->postJson('/api/v1/public/login', [
            'login' => $user->email,
            'password' => 'Password123',
            'device_name' => 'iphone',
        ]);

        $response->assertOk();
        $response->assertJsonPath('message', 'Login successful.');
        $response->assertJsonPath('data.should_onboard', true);
        $response->assertJsonPath('data.is_system_admin', false);

        $this->assertSame(['message', 'data'], array_keys($response->json()));
        $this->assertSame(
            ['token', 'should_onboard', 'user', 'tenant', 'is_system_admin', 'role', 'permissions'],
            array_keys($response->json('data')),
        );
        $this->assertSame(
            ['id', 'name', 'email', 'phone', 'photo', 'is_system_admin', 'role_id', 'saloon_id'],
            array_keys($response->json('data.user')),
        );
        $this->assertSame(['id', 'name', 'plan'], array_keys($response->json('data.tenant')));
        $this->assertSame(['name', 'slug'], array_keys($response->json('data.tenant.plan')));
        $this->assertIsArray($response->json('data.permissions'));
        $this->assertNotEmpty($response->json('data.permissions'));
    }

    public function test_profile_response_formats_remain_unchanged(): void
    {
        Storage::fake('public');

        $user = $this->createOwner(email: 'profile.user@gmail.com');

        Sanctum::actingAs($user);

        $profileResponse = $this->putJson('/api/v1/profile', [
            'name' => 'Updated Owner',
            'phone' => '+91 9123456789',
        ]);

        $profileResponse->assertOk();
        $profileResponse->assertJsonPath('message', 'Profile updated successfully.');

        $this->assertSame(['message', 'data'], array_keys($profileResponse->json()));
        $this->assertSame(['user'], array_keys($profileResponse->json('data')));
        $this->assertSame(
            ['id', 'name', 'email', 'phone', 'photo', 'is_system_admin', 'role_id', 'saloon_id'],
            array_keys($profileResponse->json('data.user')),
        );

        $passwordResponse = $this->putJson('/api/v1/password', [
            'current_password' => 'Password123',
            'new_password' => 'Updated123',
            'new_password_confirmation' => 'Updated123',
        ]);

        $passwordResponse->assertOk();
        $passwordResponse->assertExactJson([
            'message' => 'Password changed successfully.',
        ]);
    }

    public function test_me_response_format_remains_unchanged(): void
    {
        $this->seed(PermissionSeeder::class);

        $user = $this->createOwner(email: 'me.user@gmail.com');

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/me');

        $response->assertOk();

        $this->assertSame(['data'], array_keys($response->json()));
        $this->assertSame(
            ['user', 'tenant', 'is_system_admin', 'role', 'permissions'],
            array_keys($response->json('data')),
        );
        $this->assertSame(
            ['id', 'name', 'email', 'phone', 'photo', 'is_system_admin', 'role_id', 'saloon_id'],
            array_keys($response->json('data.user')),
        );
        $this->assertSame(['id', 'name', 'plan'], array_keys($response->json('data.tenant')));
        $this->assertSame(['name', 'slug'], array_keys($response->json('data.tenant.plan')));
        $this->assertIsArray($response->json('data.permissions'));
    }

    public function test_onboarding_response_messages_remain_unchanged(): void
    {
        $user = $this->createOwner(email: 'onboarding.user@gmail.com');

        $this->postJson('/api/v1/onboarding/account', [
            'email' => $user->email,
            'name' => 'Updated Onboarding Name',
        ])->assertExactJson([
            'message' => 'Account step saved.',
        ]);

        $this->postJson('/api/v1/onboarding/branch', [
            'email' => $user->email,
            'branchName' => 'Main Branch',
            'address' => '42 Market Street',
            'city' => 'Mumbai',
            'state' => 'Maharashtra',
            'phone' => '+91 9988776655',
            'whatsapp' => '+91 9988776655',
            'gstNumber' => '27ABCDE1234F1Z5',
            'hours' => [
                'monday' => ['open' => '09:00', 'close' => '18:00'],
            ],
        ])->assertExactJson([
            'message' => 'Branch step saved.',
        ]);

        $this->postJson('/api/v1/onboarding/complete', [
            'email' => $user->email,
        ])->assertExactJson([
            'message' => 'Onboarding completed.',
        ]);
    }

    private function createOwner(string $email): User
    {
        $saloon = Saloon::query()->create([
            'name' => 'Contract Test Saloon',
        ]);

        $ownerRole = Role::query()->where('name', 'Owner')->firstOrFail();

        return User::factory()->create([
            'name' => 'Owner Name',
            'email' => $email,
            'phone' => '+91 9876543210',
            'password' => 'Password123',
            'role_id' => $ownerRole->id,
            'saloon_id' => $saloon->id,
        ]);
    }
}
