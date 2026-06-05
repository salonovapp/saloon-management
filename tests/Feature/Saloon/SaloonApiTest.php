<?php

namespace Tests\Feature\Saloon;

use App\Models\Saloon;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SaloonApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_search_and_paginate_saloons(): void
    {
        Saloon::query()->create([
            'name' => 'Downtown Studio',
            'referral_code' => 'REF001',
            'transaction_id' => 'TXN-100',
            'is_active' => true,
        ]);

        Saloon::query()->create([
            'name' => 'Uptown Salon',
            'referral_code' => 'REF002',
            'transaction_id' => 'TXN-200',
            'is_active' => false,
        ]);

        $admin = User::factory()->create([
            'phone' => '+917888888888',
            'is_system_admin' => true,
            'saloon_id' => null,
        ]);

        Sanctum::actingAs($admin);

        $this->getJson('/api/v1/saloons?search=Downtown')
            ->assertOk()
            ->assertJsonCount(1, 'data.saloons')
            ->assertJsonPath('data.saloons.0.business_name', 'Downtown Studio')
            ->assertJsonPath('data.meta.total', 1);

        $this->getJson('/api/v1/saloons?search=TXN-200')
            ->assertOk()
            ->assertJsonCount(1, 'data.saloons')
            ->assertJsonPath('data.saloons.0.business_name', 'Uptown Salon');

        $this->getJson('/api/v1/saloons?is_active=1')
            ->assertOk()
            ->assertJsonCount(1, 'data.saloons')
            ->assertJsonPath('data.saloons.0.is_active', true);

        $this->getJson('/api/v1/saloons?per_page=1&page=2')
            ->assertOk()
            ->assertJsonCount(1, 'data.saloons')
            ->assertJsonPath('data.meta.current_page', 2)
            ->assertJsonPath('data.meta.per_page', 1)
            ->assertJsonPath('data.meta.total', 2)
            ->assertJsonPath('data.meta.last_page', 2);
    }

    public function test_non_system_admin_cannot_list_saloons(): void
    {
        $user = User::factory()->create([
            'phone' => '+917999999999',
            'is_system_admin' => false,
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/v1/saloons')
            ->assertForbidden()
            ->assertJsonPath('message', 'Forbidden. Super admin access required.');
    }
}
