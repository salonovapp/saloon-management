<?php

namespace App\Repositories\Eloquent;

use App\Models\SaloonService;
use App\Repositories\Contracts\SaloonServiceRepositoryInterface;

class SaloonServiceRepository implements SaloonServiceRepositoryInterface
{
    public function replaceForSaloon(int $saloonId, array $services): void
    {
        SaloonService::query()
            ->where('saloon_id', $saloonId)
            ->delete();

        if ($services === []) {
            return;
        }

        SaloonService::query()->insert($services);
    }
}
