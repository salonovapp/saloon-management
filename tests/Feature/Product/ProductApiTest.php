<?php

namespace Tests\Feature\Product;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_manage_products(): void
    {
        $user = User::factory()->create([
            'phone' => '+917777777778',
        ]);

        Sanctum::actingAs($user);

        $createResponse = $this->postJson('/api/v1/products', [
            'name' => 'Shampoo',
            'is_active' => true,
        ]);

        $createResponse
            ->assertCreated()
            ->assertJsonPath('data.product.name', 'Shampoo')
            ->assertJsonPath('data.product.is_active', true);

        $productId = (int) $createResponse->json('data.product.id');

        $this->getJson('/api/v1/products?page=1&per_page=10')
            ->assertOk()
            ->assertJsonCount(1, 'data.products');

        $this->getJson("/api/v1/products/{$productId}")
            ->assertOk()
            ->assertJsonPath('data.product.name', 'Shampoo');

        $this->putJson("/api/v1/products/{$productId}", [
            'name' => 'Conditioner',
            'is_active' => false,
        ])->assertOk()
            ->assertJsonPath('data.product.name', 'Conditioner')
            ->assertJsonPath('data.product.is_active', false);

        $this->deleteJson("/api/v1/products/{$productId}")
            ->assertOk()
            ->assertJsonPath('message', 'Product deleted successfully.');

        $this->assertDatabaseMissing('products', [
            'id' => $productId,
        ]);
    }

    public function test_product_name_must_be_unique(): void
    {
        $user = User::factory()->create([
            'phone' => '+917777777779',
        ]);

        Product::query()->create([
            'name' => 'Hair Color',
            'is_active' => true,
        ]);

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/products', [
            'name' => 'Hair Color',
            'is_active' => true,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    }

    public function test_authenticated_user_can_search_and_paginate_products(): void
    {
        $user = User::factory()->create([
            'phone' => '+917444444444',
        ]);

        Product::query()->create([
            'name' => 'Shampoo',
            'is_active' => true,
        ]);

        Product::query()->create([
            'name' => 'Conditioner',
            'is_active' => false,
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/v1/products?search=Shampoo')
            ->assertOk()
            ->assertJsonCount(1, 'data.products')
            ->assertJsonPath('data.products.0.name', 'Shampoo')
            ->assertJsonPath('data.meta.total', 1);

        $this->getJson('/api/v1/products?is_active=0')
            ->assertOk()
            ->assertJsonCount(1, 'data.products')
            ->assertJsonPath('data.products.0.name', 'Conditioner');

        $this->getJson('/api/v1/products?per_page=1&page=2')
            ->assertOk()
            ->assertJsonCount(1, 'data.products')
            ->assertJsonPath('data.meta.current_page', 2)
            ->assertJsonPath('data.meta.per_page', 1)
            ->assertJsonPath('data.meta.total', 2)
            ->assertJsonPath('data.meta.last_page', 2);
    }
}
