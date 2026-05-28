<?php

namespace App\Http\Resources\Api\V1\Shared;

use App\Http\Resources\Api\V1\Role\RoleResource;
use App\Models\User;
use App\Support\UserPermissions;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuthenticatedContextResource extends JsonResource
{
    public static $wrap = null;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var User $user */
        $user = $this->resource['user'];
        $saloon = $user->saloon;

        return [
            'user' => new UserResource($user),
            'tenant' => $saloon ? new TenantResource($saloon) : null,
            'is_system_admin' => (bool) $user->is_system_admin,
            'role' => $user->role ? new RoleResource($user->role) : null,
            'permissions' => new PermissionsCollection(UserPermissions::codesFor($user)),
        ];
    }
}
