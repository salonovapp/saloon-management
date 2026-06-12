<?php

namespace App\Support;

use App\Models\Permission;
use App\Models\User;
use Illuminate\Support\Collection;

class UserPermissions
{
    /**
     * @return Collection<int, string>
     */
    public static function codesFor(User $user): Collection
    {
        if ($user->is_system_admin) {
            return Permission::query()
                ->orderBy('module')
                ->orderBy('code')
                ->pluck('code');
        }

        if (! $user->relationLoaded('role')) {
            $user->load('role.permissions');
        } elseif ($user->role && ! $user->role->relationLoaded('permissions')) {
            $user->role->load('permissions');
        }

        return $user->role?->permissions
            ->pluck('code')
            ->values() ?? collect();
    }
}
