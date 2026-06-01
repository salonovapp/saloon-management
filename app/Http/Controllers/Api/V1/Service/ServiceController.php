<?php

namespace App\Http\Controllers\Api\V1\Service;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Service\StoreServiceRequest;
use App\Http\Requests\Api\V1\Service\UpdateServiceRequest;
use App\Http\Resources\Api\V1\Common\MessageResponseResource;
use App\Http\Resources\Api\V1\Service\ServiceResource;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ServiceController extends Controller
{
    public function index(): JsonResponse
    {
        $services = Service::query()
            ->with(['serviceProducts.product'])
            ->latest('id')
            ->get();

        return response()->json([
            'message' => 'Services fetched successfully.',
            'data' => [
                'services' => ServiceResource::collection($services)->resolve(),
            ],
        ]);
    }

    public function store(StoreServiceRequest $request): JsonResponse
    {
        $service = DB::transaction(function () use ($request): Service {
            $service = Service::query()->create([
                'name' => trim((string) $request->validated('name')),
                'default_price' => $request->validated('default_price'),
                'duration_minutes' => (int) $request->validated('duration_minutes'),
            ]);

            $this->syncProducts($service, $request->validated('products', []));

            return $service->load(['serviceProducts.product']);
        });

        return response()->json([
            'message' => 'Service created successfully.',
            'data' => [
                'service' => (new ServiceResource($service))->resolve(),
            ],
        ], 201);
    }

    public function show(Service $service): JsonResponse
    {
        $service->load(['serviceProducts.product']);

        return response()->json([
            'message' => 'Service fetched successfully.',
            'data' => [
                'service' => (new ServiceResource($service))->resolve(),
            ],
        ]);
    }

    public function update(UpdateServiceRequest $request, Service $service): JsonResponse
    {
        $service = DB::transaction(function () use ($request, $service): Service {
            $service->update([
                'name' => trim((string) $request->validated('name')),
                'default_price' => $request->validated('default_price'),
                'duration_minutes' => (int) $request->validated('duration_minutes'),
            ]);

            if ($request->has('products')) {
                $this->syncProducts($service, $request->validated('products', []));
            }

            return $service->fresh(['serviceProducts.product']);
        });

        return response()->json([
            'message' => 'Service updated successfully.',
            'data' => [
                'service' => (new ServiceResource($service))->resolve(),
            ],
        ]);
    }

    public function destroy(Service $service): JsonResponse
    {
        $service->delete();

        return (new MessageResponseResource([
            'message' => 'Service deleted successfully.',
        ]))->response();
    }

    /**
     * @param array<int, array<string, mixed>> $products
     */
    private function syncProducts(Service $service, array $products): void
    {
        $service->serviceProducts()->delete();

        foreach ($products as $product) {
            $service->serviceProducts()->create([
                'product_id' => (int) $product['product_id'],
                'default_price' => $product['default_price'],
            ]);
        }
    }
}
