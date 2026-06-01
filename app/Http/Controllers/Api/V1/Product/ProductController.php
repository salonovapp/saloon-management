<?php

namespace App\Http\Controllers\Api\V1\Product;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Product\StoreProductRequest;
use App\Http\Requests\Api\V1\Product\UpdateProductRequest;
use App\Http\Resources\Api\V1\Common\MessageResponseResource;
use App\Http\Resources\Api\V1\Product\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    public function index(): JsonResponse
    {
        $products = Product::query()
            ->latest('id')
            ->get();

        return response()->json([
            'message' => 'Products fetched successfully.',
            'data' => [
                'products' => ProductResource::collection($products)->resolve(),
            ],
        ]);
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
