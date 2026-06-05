<?php

namespace App\Http\Controllers\Api\V1\Product;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Product\StoreProductRequest;
use App\Http\Requests\Api\V1\Product\UpdateProductRequest;
use App\Http\Resources\Api\V1\Common\MessageResponseResource;
use App\Http\Resources\Api\V1\Product\ProductResource;
use App\Models\Product;
use App\Support\Api\ListQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = ListQuery::validate($request, [
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $query = Product::query()->latest('id');

        if (array_key_exists('is_active', $validated)) {
            $query->where('is_active', (bool) $validated['is_active']);
        }

        ListQuery::applySearch($query, $validated['search'] ?? null);

        $paginator = ListQuery::paginate($query, $validated);

        return response()->json(ListQuery::responsePayload(
            'Products fetched successfully.',
            'products',
            $paginator,
            ProductResource::class,
        ));
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = Product::query()->create([
            'name' => trim((string) $request->validated('name')),
            'is_active' => (bool) $request->validated('is_active'),
        ]);

        return response()->json([
            'message' => 'Product created successfully.',
            'data' => [
                'product' => (new ProductResource($product))->resolve(),
            ],
        ], 201);
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json([
            'message' => 'Product fetched successfully.',
            'data' => [
                'product' => (new ProductResource($product))->resolve(),
            ],
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $product->update([
            'name' => trim((string) $request->validated('name')),
            'is_active' => (bool) $request->validated('is_active'),
        ]);

        return response()->json([
            'message' => 'Product updated successfully.',
            'data' => [
                'product' => (new ProductResource($product->fresh()))->resolve(),
            ],
        ]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return (new MessageResponseResource([
            'message' => 'Product deleted successfully.',
        ]))->response();
    }
}
