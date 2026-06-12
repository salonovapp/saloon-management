<?php

namespace App\Http\Controllers\Api\V1\Permission;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\Permission\PermissionResource;
use App\Models\Permission;
use Illuminate\Http\JsonResponse;

class PermissionController extends Controller
{
    public function index(): JsonResponse
    {
        $permissions = Permission::query()
            ->orderBy('module')
            ->orderBy('name')
            ->get();

        return response()->json([
            'message' => 'Permissions fetched successfully.',
            'data' => [
                'permissions' => PermissionResource::collection($permissions)->resolve(),
            ],
        ]);
    }
}
