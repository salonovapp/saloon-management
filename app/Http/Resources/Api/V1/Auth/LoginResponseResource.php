<?php

namespace App\Http\Resources\Api\V1\Auth;

use App\Http\Resources\Api\V1\Shared\AuthenticatedContextResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LoginResponseResource extends JsonResource
{
    public static $wrap = null;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $context = (new AuthenticatedContextResource([
            'user' => $this->resource['user'],
        ]))->resolve($request);

        return [
            'message' => 'Login successful.',
            'data' => array_merge([
                'token' => (string) $this->resource['token'],
                'should_onboard' => (bool) $this->resource['should_onboard'],
            ], $context),
        ];
    }
}
