<?php

namespace App\Http\Resources\Api\V1\Shared;

use App\Models\User;
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
            'permissions' => new PermissionsCollection(collect(self::permissions())),
        ];
    }

    /**
     * @return list<string>
     */
    public static function permissions(): array
    {
        return [
            'appointments.view',
            'staff.view',
            'inventory.view',
            'customers.view',
            'billing.view',
            'analytics.view',
            'settings.view',
        ];
    }
}
