<?php

namespace App\Http\Controllers\Api\V1\Category;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Category\StoreCategoryRequest;
use App\Http\Requests\Api\V1\Category\UpdateCategoryRequest;
use App\Http\Resources\Api\V1\Category\CategoryResource;
use App\Http\Resources\Api\V1\Common\MessageResponseResource;
use App\Models\Category;
use App\Support\Api\ListQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = ListQuery::validate($request, [
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $query = Category::query()->latest('id');

        if (array_key_exists('is_active', $validated)) {
            $query->where('is_active', (bool) $validated['is_active']);
        }

        ListQuery::applySearch($query, $validated['search'] ?? null);

        $paginator = ListQuery::paginate($query, $validated);

        return response()->json(ListQuery::responsePayload(
            'Categories fetched successfully.',
            'categories',
            $paginator,
            CategoryResource::class,
        ));
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = Category::query()->create([
            'name' => trim((string) $request->validated('name')),
            'is_active' => (bool) $request->validated('is_active'),
        ]);

        return response()->json([
            'message' => 'Category created successfully.',
            'data' => [
                'category' => (new CategoryResource($category))->resolve(),
            ],
        ], 201);
    }

    public function show(Category $category): JsonResponse
    {
        return response()->json([
            'message' => 'Category fetched successfully.',
            'data' => [
                'category' => (new CategoryResource($category))->resolve(),
            ],
        ]);
    }

    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        $category->update([
            'name' => trim((string) $request->validated('name')),
            'is_active' => (bool) $request->validated('is_active'),
        ]);

        return response()->json([
            'message' => 'Category updated successfully.',
            'data' => [
                'category' => (new CategoryResource($category->fresh()))->resolve(),
            ],
        ]);
    }

    public function destroy(Category $category): JsonResponse
    {
        $category->delete();

        return (new MessageResponseResource([
            'message' => 'Category deleted successfully.',
        ]))->response();
    }
}
