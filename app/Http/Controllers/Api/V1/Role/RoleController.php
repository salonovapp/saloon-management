<?php

namespace App\Http\Controllers\Api\V1\Role;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Role\AssignRolePermissionsRequest;
use App\Http\Requests\Api\V1\Role\StoreRoleRequest;
use App\Http\Requests\Api\V1\Role\UpdateRoleRequest;
use App\Http\Resources\Api\V1\Common\MessageResponseResource;
use App\Http\Resources\Api\V1\Role\RoleResource;
use App\Models\Role;
use App\Models\User;
use App\Support\Api\ListQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = ListQuery::validate($request, [
            'saloon_id' => ['sometimes', 'nullable', 'integer', 'exists:saloons,id'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        /** @var User $user */
        $user = $request->user();

        $query = Role::query()
            ->with('permissions')
            ->latest('id');

        if (! $user->is_system_admin && array_key_exists('saloon_id', $validated)) {
            $query->where('saloon_id', $validated['saloon_id']);
        }

        if (array_key_exists('is_active', $validated)) {
            $query->where('is_active', (bool) $validated['is_active']);
        }

        ListQuery::applySearch($query, $validated['search'] ?? null);

        $paginator = ListQuery::paginate($query, $validated);

        return response()->json(ListQuery::responsePayload(
            'Roles fetched successfully.',
            'roles',
            $paginator,
            RoleResource::class,
        ));
    }

    public function store(StoreRoleRequest $request): JsonResponse
    {
        $role = Role::query()->create([
            'name' => trim((string) $request->validated('name')),
            'is_active' => (bool) $request->validated('is_active'),
            'saloon_id' => $request->validated('saloon_id'),
        ]);

        return response()->json([
            'message' => 'Role created successfully.',
            'data' => [
                'role' => (new RoleResource($role))->resolve(),
            ],
        ], 201);
    }

    public function show(Role $role): JsonResponse
    {
        $role->load('permissions');

        return response()->json([
            'message' => 'Role fetched successfully.',
            'data' => [
                'role' => (new RoleResource($role))->resolve(),
            ],
        ]);
    }

    public function update(UpdateRoleRequest $request, Role $role): JsonResponse
    {
        $role->update([
            'name' => trim((string) $request->validated('name')),
            'is_active' => (bool) $request->validated('is_active'),
            'saloon_id' => $request->validated('saloon_id'),
        ]);

        return response()->json([
            'message' => 'Role updated successfully.',
            'data' => [
                'role' => (new RoleResource($role->fresh()))->resolve(),
            ],
        ]);
    }

    public function destroy(Role $role): JsonResponse
    {
        $role->delete();

        return (new MessageResponseResource([
            'message' => 'Role deleted successfully.',
        ]))->response();
    }

    public function assignPermissions(AssignRolePermissionsRequest $request, Role $role): JsonResponse
    {
        $role->permissions()->sync($request->validated('permission_ids'));
        $role->load('permissions');

        return response()->json([
            'message' => 'Role permissions assigned successfully.',
            'data' => [
                'role' => (new RoleResource($role))->resolve(),
            ],
        ]);
    }
}
