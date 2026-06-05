<?php

namespace Tests\Feature\Admin;

use App\Mail\SalonWelcomeMail;
use App\Models\Product;
use App\Models\Role;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminOnboardingApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_onboard_salon(): void
    {
        Mail::fake();

        $superAdmin = User::factory()->create([
            'email' => 'admin@salonos.com',
            'is_system_admin' => true,
            'saloon_id' => null,
            'role_id' => null,
        ]);

        $service = Service::query()->create([
            'name' => 'Haircut',
            'default_price' => 500,
            'duration_minutes' => 45,
        ]);
        $product = Product::query()->create([
            'name' => 'Shampoo',
            'is_active' => true,
        ]);

        Sanctum::actingAs($superAdmin);

        $response = $this->postJson('/api/v1/admin/onboarding', [
            'saloon' => [
                'business_name' => 'Glow Studio',
                'payment_type' => 'online',
                'payment_amount' => 999.00,
                'transaction_id' => 'TXN-001',
                'is_active' => true,
                'referral_code' => 'GLOW2026',
            ],
            'branch' => [
                'branch_name' => 'Main Branch',
                'business_address_1' => '42 Market Street',
                'business_address_2' => 'Near City Mall',
                'city' => 'Mumbai',
                'state' => 'Maharashtra',
                'area_pincode' => '400001',
                'country' => 'India',
                'is_active' => true,
            ],
            'user' => [
                'firstname' => 'Ravi',
                'lastname' => 'Owner',
                'email' => 'owner@glowstudio.com',
                'phone' => '+91 9876543210',
                'password' => 'Password@123',
                'password_confirmation' => 'Password@123',
                'is_active' => true,
            ],
            'service_products' => [
                [
                    'service_id' => $service->id,
                    'product_id' => $product->id,
                    'price' => 550.00,
                    'duration_minutes' => 45,
                    'is_active' => true,
                ],
            ],
        ]);

        $saloonOwnerRole = Role::query()->where('name', 'saloon_owner')->firstOrFail();

        $response->assertCreated();
        $response->assertJsonPath('message', 'Salon onboarded successfully.');
        $response->assertJsonPath('data.saloon.business_name', 'Glow Studio');
        $response->assertJsonPath('data.branch.branch_name', 'Main Branch');
        $response->assertJsonPath('data.user.firstname', 'Ravi');
        $response->assertJsonPath('data.user.role_id', $saloonOwnerRole->id);
        $response->assertJsonPath('data.service_products.0.price', '550.00');

        $this->assertDatabaseHas('saloons', [
            'name' => 'Glow Studio',
            'referral_code' => 'GLOW2026',
        ]);
        $this->assertDatabaseHas('saloon_branches', [
            'branch_name' => 'Main Branch',
            'area_pincode' => '400001',
        ]);
        $this->assertDatabaseHas('users', [
            'email' => 'owner@glowstudio.com',
            'firstname' => 'Ravi',
            'lastname' => 'Owner',
            'role_id' => $saloonOwnerRole->id,
        ]);
        $this->assertDatabaseHas('salon_service_products', [
            'service_id' => $service->id,
            'product_id' => $product->id,
        ]);

        Mail::assertSent(SalonWelcomeMail::class, function (SalonWelcomeMail $mail): bool {
            return $mail->hasTo('owner@glowstudio.com');
        });
    }

    public function test_non_super_admin_cannot_access_admin_onboarding(): void
    {
        $ownerRole = Role::query()->where('name', 'Owner')->firstOrFail();

        $user = User::factory()->create([
            'is_system_admin' => false,
            'role_id' => $ownerRole->id,
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/admin/onboarding', [
            'saloon' => [
                'business_name' => 'Glow Studio',
                'payment_type' => 'online',
                'payment_amount' => 999.00,
                'is_active' => true,
            ],
            'branch' => [
                'branch_name' => 'Main Branch',
                'business_address_1' => '42 Market Street',
                'city' => 'Mumbai',
                'state' => 'Maharashtra',
                'area_pincode' => '400001',
                'is_active' => true,
            ],
            'user' => [
                'firstname' => 'Ravi',
                'lastname' => 'Owner',
                'email' => 'owner@glowstudio.com',
                'phone' => '+91 9876543210',
                'is_active' => true,
            ],
        ]);

        $response->assertForbidden();
        $response->assertJsonPath('message', 'Forbidden. Super admin access required.');
    }
}
