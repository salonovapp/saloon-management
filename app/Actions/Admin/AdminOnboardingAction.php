<?php

namespace App\Actions\Admin;

use App\Mail\SalonWelcomeMail;
use App\Models\Role;
use App\Models\SalonServiceProduct;
use App\Models\Saloon;
use App\Models\SaloonBranch;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use RuntimeException;

class AdminOnboardingAction
{
    /**
     * @param array<string, mixed> $payload
     * @return array{saloon: Saloon, branch: SaloonBranch, user: User, service_products: array<int, SalonServiceProduct>}
     */
    public function execute(array $payload): array
    {
        $result = DB::transaction(function () use ($payload): array {
            $saloonOwnerRole = Role::query()
                ->where('name', 'saloon_owner')
                ->whereNull('saloon_id')
                ->where('is_active', true)
                ->first();

            if (! $saloonOwnerRole) {
                throw new RuntimeException('Saloon owner role not found.');
            }

            $saloonData = $payload['saloon'];

            $saloon = Saloon::query()->create([
                'name' => trim((string) $saloonData['business_name']),
                'payment_type' => $saloonData['payment_type'],
                'payment_amount' => $saloonData['payment_amount'],
                'transaction_id' => $saloonData['transaction_id'] ?? null,
                'is_active' => (bool) $saloonData['is_active'],
                'referral_code' => isset($saloonData['referral_code'])
                    ? strtoupper(trim((string) $saloonData['referral_code']))
                    : null,
            ]);

            $branchData = $payload['branch'];

            $branch = SaloonBranch::query()->create([
                'saloon_id' => $saloon->id,
                'branch_name' => trim((string) $branchData['branch_name']),
                'business_address_1' => trim((string) $branchData['business_address_1']),
                'business_address_2' => isset($branchData['business_address_2'])
                    ? trim((string) $branchData['business_address_2'])
                    : null,
                'city' => trim((string) $branchData['city']),
                'state' => trim((string) $branchData['state']),
                'area_pincode' => trim((string) $branchData['area_pincode']),
                'country' => trim((string) ($branchData['country'] ?? 'India')),
                'is_active' => (bool) $branchData['is_active'],
            ]);

            $userData = $payload['user'];
            $firstname = trim((string) $userData['firstname']);
            $lastname = trim((string) $userData['lastname']);

            $userAttributes = [
                'name' => trim("{$firstname} {$lastname}"),
                'firstname' => $firstname,
                'lastname' => $lastname,
                'email' => strtolower(trim((string) $userData['email'])),
                'phone' => trim((string) $userData['phone']),
                'saloon_id' => $saloon->id,
                'branch_id' => $branch->id,
                'role_id' => $saloonOwnerRole->id,
                'is_active' => (bool) $userData['is_active'],
                'onboarding_completed_at' => now(),
            ];

            if (! empty($userData['password'])) {
                $userAttributes['password'] = (string) $userData['password'];
            }

            $user = User::query()->create($userAttributes);

            $serviceProducts = [];

            foreach ($payload['service_products'] ?? [] as $serviceProductData) {
                $serviceProducts[] = SalonServiceProduct::query()->create([
                    'saloon_id' => $saloon->id,
                    'service_id' => (int) $serviceProductData['service_id'],
                    'product_id' => (int) $serviceProductData['product_id'],
                    'price' => $serviceProductData['price'],
                    'duration_minutes' => (int) $serviceProductData['duration_minutes'],
                    'is_active' => (bool) $serviceProductData['is_active'],
                ]);
            }

            return [
                'saloon' => $saloon,
                'branch' => $branch,
                'user' => $user->load('role'),
                'service_products' => $serviceProducts,
            ];
        });

        Mail::to($result['user']->email)->send(
            new SalonWelcomeMail($result['user'], $result['saloon']),
        );

        return $result;
    }
}
