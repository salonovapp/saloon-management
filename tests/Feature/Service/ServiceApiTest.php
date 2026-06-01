<?php

namespace Tests\Feature\Service;

use App\Models\Product;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ServiceApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_manage_services_with_products(): void
    {
        $user = User::factory()->create([
            'phone' => '+917777777780',
        ]);

        $productA = Product::query()->create([
            'name' => 'Shampoo',
            'is_active' => true,
        ]);

        $productB = Product::query()->create([
            'name' => 'Conditioner',
            'is_active' => true,
        ]);

        Sanctum::actingAs($user);

        $createResponse = $this->postJson('/api/v1/services', [
            'name' => 'Hair Wash',
            'default_price' => 299.50,
            'duration_minutes' => 30,
            'products' => [
                [
                    'product_id' => $productA->id,
                    'default_price' => 50,
                ],
                [
                    'product_id' => $productB->id,
                    'default_price' => 40,
                ],
            ],
        ]);

        $createResponse
            ->assertCreated()
            ->assertJsonPath('data.service.name', 'Hair Wash')
            ->assertJsonPath('data.service.default_price', 299.5)
            ->assertJsonPath('data.service.duration_minutes', 30)
            ->assertJsonCount(2, 'data.service.products');

        $serviceId = (int) $createResponse->json('data.service.id');

        $this->getJson('/api/v1/services')
            ->assertOk()
            ->assertJsonCount(1, 'data.services');

        $this->getJson("/api/v1/services/{$serviceId}")
            ->assertOk()
            ->assertJsonPath('data.service.name', 'Hair Wash')
            ->assertJsonCount(2, 'data.service.products');

        $this->putJson("/api/v1/services/{$serviceId}", [
            'name' => 'Premium Hair Wash',
            'default_price' => 499,
            'duration_minutes' => 45,
            'products' => [
                [
                    'product_id' => $productA->id,
                    'default_price' => 75,
                ],
            ],
        ])->assertOk()
            ->assertJsonPath('data.service.name', 'Premium Hair Wash')
            ->assertJsonCount(1, 'data.service.products');

        $this->deleteJson("/api/v1/services/{$serviceId}")
            ->assertOk()
            ->assertJsonPath('message', 'Service deleted successfully.');

        $this->assertDatabaseMissing('services', [
            'id' => $serviceId,
        ]);

        $this->assertDatabaseMissing('service_products', [
            'service_id' => $serviceId,
        ]);
    }

    public function test_service_products_cannot_duplicate_product_ids(): void
    {
        $user = User::factory()->create([
            'phone' => '+917777777781',
        ]);

        $product = Product::query()->create([
            'name' => 'Oil',
            'is_active' => true,
        ]);

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/services', [
            'name' => 'Oil Massage',
            'default_price' => 500,
            'duration_minutes' => 60,
            'products' => [
                [
                    'product_id' => $product->id,
                    'default_price' => 100,
                ],
                [
                    'product_id' => $product->id,
                    'default_price' => 120,
                ],
            ],
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['products.1.product_id']);
    }

    public function test_deleting_service_removes_pivot_rows(): void
    {
        $product = Product::query()->create([
            'name' => 'Gel',
            'is_active' => true,
        ]);

        $service = Service::query()->create([
            'name' => 'Styling',
            'default_price' => 350,
            'duration_minutes' => 40,
        ]);

        $service->serviceProducts()->create([
            'product_id' => $product->id,
            'default_price' => 25,
        ]);

        $user = User::factory()->create([
            'phone' => '+917777777782',
        ]);

        Sanctum::actingAs($user);

        $this->deleteJson("/api/v1/services/{$service->id}")->assertOk();

        $this->assertDatabaseCount('service_products', 0);
    }
}
