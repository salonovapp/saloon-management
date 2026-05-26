<?php

namespace App\Repositories\Contracts;

interface SaloonServiceRepositoryInterface
{
    /**
     * @param array<int, array<string, mixed>> $services
     */
    public function replaceForSaloon(int $saloonId, array $services): void;
}
