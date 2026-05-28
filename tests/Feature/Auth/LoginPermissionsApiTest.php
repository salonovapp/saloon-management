<?php

namespace Tests\Feature\Auth;

use App\Models\Permission;
use App\Models\Role;
use App\Models\Saloon;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginPermissionsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_returns_role_permissions_and_system_admin_flag(): void
    {
        $this->seed(PermissionSeeder::class);

        $saloon = Saloon::query()->create([
            'name' => 'Glow Studio',
        ]);

        $role = Role::query()->where('name', 'Owner')->firstOrFail();
        $role->permissions()->sync(
            Permission::query()->where('code', 'roles.read')->pluck('id'),
        );

        $user = User::factory()->create([
            'email' => 'owner-permissions@example.com',
            'phone' => '+917444444444',
            'password' => 'Pass@1234',
            'saloon_id' => $saloon->id,
            'role_id' => $role->id,
        ]);

        $this->postJson('/api/v1/public/login', [
            'login' => $user->email,
            'password' => 'Pass@1234',
        ])
            ->assertOk()
            ->assertJsonPath('data.is_system_admin', false)
            ->assertJsonPath('data.user.role_id', $role->id)
            ->assertJsonPath('data.user.is_system_admin', false)
            ->assertJsonPath('data.role.name', 'Owner')
            ->assertJsonPath('data.permissions', ['roles.read']);
    }

    public function test_system_admin_login_returns_all_permissions(): void
    {
        $this->seed(PermissionSeeder::class);

        $user = User::factory()->create([
            'email' => 'system-admin@example.com',
            'phone' => '+917555555555',
            'password' => 'Pass@1234',
            'is_system_admin' => true,
            'role_id' => null,
            'saloon_id' => null,
        ]);

        $response = $this->postJson('/api/v1/public/login', [
            'login' => $user->email,
            'password' => 'Pass@1234',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.is_system_admin', true)
            ->assertJsonPath('data.role', null)
            ->assertJsonCount(12, 'data.permissions');
    }
}
