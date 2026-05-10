<?php

namespace App\Http\Controllers\Api\V1\Onboarding;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Onboarding\AccountStepRequest;
use App\Http\Requests\Api\V1\Onboarding\BranchStepRequest;
use App\Http\Requests\Api\V1\Onboarding\CompleteStepRequest;
use App\Http\Requests\Api\V1\Onboarding\ServicesStepRequest;
use App\Models\SaloonService;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class OnboardingController extends Controller
{
    public function account(AccountStepRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $this->resolveUser($data['email']);

        $user->update([
            'name' => trim((string) $data['name']),
        ]);

        return response()->json([
            'message' => 'Account step saved.',
        ]);
    }

    public function branch(BranchStepRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $this->resolveUser($data['email']);

        $user->saloon()->update([
            'branch_name' => trim((string) $data['branchName']),
            'address' => trim((string) $data['address']),
            'city' => trim((string) $data['city']),
            'state' => trim((string) $data['state']),
            'phone' => trim((string) $data['phone']),
            'whatsapp' => isset($data['whatsapp']) ? trim((string) $data['whatsapp']) : null,
            'gst_number' => isset($data['gstNumber']) ? strtoupper(trim((string) $data['gstNumber'])) : null,
            'working_hours' => $data['hours'],
        ]);

        return response()->json([
            'message' => 'Branch step saved.',
        ]);
    }

    public function services(ServicesStepRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $this->resolveUser($data['email']);

        DB::transaction(function () use ($user, $data): void {
            $user->saloon->services()->delete();

            if ((bool) $data['skipped']) {
                return;
            }

            $rows = collect($data['services'])->map(fn (array $service): array => [
                'saloon_id' => $user->saloon_id,
                'name' => trim((string) $service['name']),
                'category' => trim((string) $service['category']),
                'duration' => (int) $service['duration'],
                'price' => (float) $service['price'],
                'buffer_time' => (int) $service['bufferTime'],
                'created_at' => now(),
                'updated_at' => now(),
            ])->all();

            SaloonService::query()->insert($rows);
        });

        return response()->json([
            'message' => 'Services step saved.',
        ]);
    }

    public function complete(CompleteStepRequest $request): JsonResponse
    {
        $user = $this->resolveUser($request->validated()['email']);
        $user->update([
            'onboarding_completed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Onboarding completed.',
        ]);
    }

    private function resolveUser(string $email): User
    {
        return User::query()
            ->where('email', strtolower(trim($email)))
            ->with('saloon.services')
            ->firstOrFail();
    }
}
