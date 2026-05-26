<?php

namespace App\Http\Resources\Api\V1\Shared;

use App\Models\Saloon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Saloon */
class TenantResource extends JsonResource
{
    public static $wrap = null;

    /**
     * @return array<string, int|string|array<string, string>>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'plan' => [
                'name' => 'Free Trial',
                'slug' => 'free',
            ],
        ];
    }
}
