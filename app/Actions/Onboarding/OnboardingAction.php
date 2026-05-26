<?php

namespace App\Actions\Onboarding;

use App\Models\User;
use App\Repositories\Contracts\SaloonRepositoryInterface;
use App\Repositories\Contracts\SaloonServiceRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Facades\DB;

class OnboardingAction
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository,
        private readonly SaloonRepositoryInterface $saloonRepository,
        private readonly SaloonServiceRepositoryInterface $saloonServiceRepository,
    ) {
    }

    /**
     * @param array<string, mixed> $payload
     */
    public function saveAccount(array $payload): void
    {
        $user = $this->resolveUser((string) $payload['email']);

        $this->userRepository->update($user, [
            'name' => trim((string) $payload['name']),
        ]);
    }

    /**
     * @param array<string, mixed> $payload
     */
    public function saveBranch(array $payload): void
    {
        $user = $this->resolveUser((string) $payload['email'], ['saloon']);

        $this->saloonRepository->update($user->saloon, [
            'branch_name' => trim((string) $payload['branchName']),
            'address' => trim((string) $payload['address']),
            'city' => trim((string) $payload['city']),
            'state' => trim((string) $payload['state']),
            'phone' => trim((string) $payload['phone']),
            'whatsapp' => isset($payload['whatsapp']) ? trim((string) $payload['whatsapp']) : null,
            'gst_number' => isset($payload['gstNumber']) ? strtoupper(trim((string) $payload['gstNumber'])) : null,
            'working_hours' => $payload['hours'],
        ]);
    }

    /**
     * @param array<string, mixed> $payload
     */
    public function saveServices(array $payload): void
    {
        $user = $this->resolveUser((string) $payload['email'], ['saloon']);
        $saloonId = $user->saloon->id;

        DB::transaction(function () use ($payload, $saloonId): void {
            if ((bool) $payload['skipped']) {
                $this->saloonServiceRepository->replaceForSaloon($saloonId, []);

                return;
            }

            $rows = collect($payload['services'])->map(fn (array $service): array => [
                'saloon_id' => $saloonId,
                'name' => trim((string) $service['name']),
                'category' => trim((string) $service['category']),
                'duration' => (int) $service['duration'],
                'price' => (float) $service['price'],
                'buffer_time' => (int) $service['bufferTime'],
                'created_at' => now(),
                'updated_at' => now(),
            ])->all();

            $this->saloonServiceRepository->replaceForSaloon($saloonId, $rows);
        });
    }

    /**
     * @param array<string, mixed> $payload
     */
    public function complete(array $payload): void
    {
        $user = $this->resolveUser((string) $payload['email']);

        $this->userRepository->update($user, [
            'onboarding_completed_at' => now(),
        ]);
    }

    /**
     * @param array<int, string> $relations
     */
    private function resolveUser(string $email, array $relations = []): User
    {
        return $this->userRepository->findByEmailOrFail($email, $relations);
    }
}
