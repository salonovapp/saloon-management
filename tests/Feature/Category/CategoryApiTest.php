<?php

namespace Tests\Feature\Category;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CategoryApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_manage_global_categories(): void
    {
        $user = User::factory()->create([
            'phone' => '+917777777777',
        ]);

        Sanctum::actingAs($user);

        $createResponse = $this->postJson('/api/v1/categories', [
            'name' => 'Hair Care',
            'is_active' => true,
        ]);

        $createResponse
            ->assertCreated()
            ->assertJsonPath('data.category.name', 'Hair Care')
            ->assertJsonPath('data.category.is_active', true);

        $categoryId = (int) $createResponse->json('data.category.id');

        $this->getJson('/api/v1/categories?page=1&per_page=10')
            ->assertOk()
            ->assertJsonCount(1, 'data.categories');

        $this->getJson("/api/v1/categories/{$categoryId}")
            ->assertOk()
            ->assertJsonPath('data.category.name', 'Hair Care');

        $this->putJson("/api/v1/categories/{$categoryId}", [
            'name' => 'Skin Care',
            'is_active' => false,
        ])->assertOk()
            ->assertJsonPath('data.category.name', 'Skin Care')
            ->assertJsonPath('data.category.is_active', false);

        $this->deleteJson("/api/v1/categories/{$categoryId}")
            ->assertOk()
            ->assertJsonPath('message', 'Category deleted successfully.');

        $this->assertSoftDeleted('categories', [
            'id' => $categoryId,
        ]);
    }

    public function test_soft_deleted_category_is_hidden_from_listing_and_show_route(): void
    {
        $user = User::factory()->create([
            'phone' => '+916666666666',
        ]);

        $category = Category::query()->create([
            'name' => 'Nail Care',
            'is_active' => true,
        ]);

        Sanctum::actingAs($user);

        $category->delete();

        $this->getJson('/api/v1/categories?page=1&per_page=10')
            ->assertOk()
            ->assertJsonCount(0, 'data.categories');

        $this->getJson("/api/v1/categories/{$category->id}")
            ->assertNotFound();
    }

    public function test_authenticated_user_can_search_and_paginate_categories(): void
    {
        $user = User::factory()->create([
            'phone' => '+915555555555',
        ]);

        Category::query()->create([
            'name' => 'Hair Care',
            'is_active' => true,
        ]);

        Category::query()->create([
            'name' => 'Skin Care',
            'is_active' => false,
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/v1/categories?page=1&per_page=10&search=Hair')
            ->assertOk()
            ->assertJsonCount(1, 'data.categories')
            ->assertJsonPath('data.categories.0.name', 'Hair Care')
            ->assertJsonPath('data.meta.total', 1);

        $this->getJson('/api/v1/categories?page=1&per_page=10&is_active=0')
            ->assertOk()
            ->assertJsonCount(1, 'data.categories')
            ->assertJsonPath('data.categories.0.name', 'Skin Care');

        $this->getJson('/api/v1/categories?page=2&per_page=1')
            ->assertOk()
            ->assertJsonCount(1, 'data.categories')
            ->assertJsonPath('data.meta.current_page', 2)
            ->assertJsonPath('data.meta.per_page', 1)
            ->assertJsonPath('data.meta.total', 2)
            ->assertJsonPath('data.meta.last_page', 2);
    }
}
