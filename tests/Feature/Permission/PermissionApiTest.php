<?php

namespace Tests\Feature\Permission;

use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PermissionApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_list_permissions(): void
    {
        $this->seed(PermissionSeeder::class);

        $user = User::factory()->create([
            'phone' => '+917333333333',
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/v1/permissions')
            ->assertOk()
            ->assertJsonPath('message', 'Permissions fetched successfully.')
            ->assertJsonCount(12, 'data.permissions')
            ->assertJsonFragment([
                'name' => 'Display Roles',
                'code' => 'roles.read',
                'module' => 'roles',
            ]);
    }
}
