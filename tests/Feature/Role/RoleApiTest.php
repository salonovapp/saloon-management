<?php

namespace Tests\Feature\Role;

use App\Models\Permission;
use App\Models\Role;
use App\Models\Saloon;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RoleApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_manage_roles(): void
    {
        $user = User::factory()->create([
            'phone' => '+917111111111',
        ]);

        Sanctum::actingAs($user);

        $createResponse = $this->postJson('/api/v1/roles', [
            'name' => 'Manager',
            'is_active' => true,
            'saloon_id' => null,
        ]);

        $createResponse
            ->assertCreated()
            ->assertJsonPath('data.role.name', 'Manager')
            ->assertJsonPath('data.role.is_active', true)
            ->assertJsonPath('data.role.saloon_id', null);

        $roleId = (int) $createResponse->json('data.role.id');

        $this->getJson('/api/v1/roles')
            ->assertOk()
            ->assertJsonCount(2, 'data.roles');

        $this->getJson("/api/v1/roles/{$roleId}")
            ->assertOk()
            ->assertJsonPath('data.role.name', 'Manager');

        $this->putJson("/api/v1/roles/{$roleId}", [
            'name' => 'Branch Manager',
            'is_active' => false,
            'saloon_id' => null,
        ])->assertOk()
            ->assertJsonPath('data.role.name', 'Branch Manager')
            ->assertJsonPath('data.role.is_active', false);

        $this->deleteJson("/api/v1/roles/{$roleId}")
            ->assertOk()
            ->assertJsonPath('message', 'Role deleted successfully.');

        $this->assertDatabaseMissing('roles', [
            'id' => $roleId,
        ]);
    }

    public function test_user_can_assign_permissions_to_role(): void
    {
        $this->seed(\Database\Seeders\PermissionSeeder::class);

        $user = User::factory()->create([
            'phone' => '+917222222222',
        ]);

        $role = Role::query()->create([
            'name' => 'Receptionist',
            'is_active' => true,
            'saloon_id' => null,
        ]);

        $permissionIds = Permission::query()
            ->whereIn('code', ['roles.read', 'customers.view'])
            ->pluck('id')
            ->all();

        Sanctum::actingAs($user);

        $this->putJson("/api/v1/roles/{$role->id}/permissions", [
            'permission_ids' => $permissionIds,
        ])
            ->assertOk()
            ->assertJsonPath('message', 'Role permissions assigned successfully.')
            ->assertJsonCount(2, 'data.role.permissions');

        $this->assertDatabaseCount('permission_role', 2);
    }

    public function test_non_system_admin_can_filter_roles_by_saloon_id_query_param(): void
    {
        $saloon = Saloon::query()->create(['name' => 'Downtown']);
        $otherSaloon = Saloon::query()->create(['name' => 'Uptown']);

        Role::query()->create([
            'name' => 'Saloon A Manager',
            'is_active' => true,
            'saloon_id' => $saloon->id,
        ]);

        Role::query()->create([
            'name' => 'Saloon B Manager',
            'is_active' => true,
            'saloon_id' => $otherSaloon->id,
        ]);

        $user = User::factory()->create([
            'phone' => '+917666666666',
            'saloon_id' => $saloon->id,
            'is_system_admin' => false,
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/v1/roles?saloon_id='.$saloon->id)
            ->assertOk()
            ->assertJsonCount(1, 'data.roles')
            ->assertJsonPath('data.roles.0.name', 'Saloon A Manager')
            ->assertJsonPath('data.roles.0.saloon_id', $saloon->id);
    }

    public function test_system_admin_sees_all_roles_even_when_saloon_id_query_param_is_passed(): void
    {
        $saloon = Saloon::query()->create(['name' => 'Downtown']);

        Role::query()->create([
            'name' => 'Saloon Manager',
            'is_active' => true,
            'saloon_id' => $saloon->id,
        ]);

        $admin = User::factory()->create([
            'phone' => '+917777777777',
            'is_system_admin' => true,
            'saloon_id' => null,
        ]);

        Sanctum::actingAs($admin);

        $this->getJson('/api/v1/roles?saloon_id='.$saloon->id)
            ->assertOk()
            ->assertJsonCount(2, 'data.roles');
    }
}
