<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductSku;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    /**
     * @OA\Get(
     *     path="/admin/products",
     *     summary="Get list of products (Admin)",
     *     tags={"Admin Products"},
     *     security={{"sanctum": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation"
     *     )
     * )
     */
    public function index()
    {
        return response()->json(Product::with(['category', 'vendor', 'variants', 'skus', 'images'])->get());
    }

    /**
     * @OA\Post(
     *     path="/admin/products",
     *     summary="Create a new product",
     *     tags={"Admin Products"},
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"category_id", "name", "status", "base_price"},
     *                 @OA\Property(property="category_id", type="integer", example=1),
     *                 @OA\Property(property="vendor_id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="New Product"),
     *                 @OA\Property(property="description", type="string", example="Product description"),
     *                 @OA\Property(property="status", type="string", enum={"ready", "pre_order"}, example="ready"),
     *                 @OA\Property(property="base_price", type="number", format="float", example=10000),
     *                 @OA\Property(property="image_url", type="string"),
     *                 @OA\Property(property="payload", type="string", description="JSON string for complex nested data (variants, skus)"),
     *                 @OA\Property(
     *                     property="images[]",
     *                     type="array",
     *                     @OA\Items(type="string", format="binary")
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Product created successfully"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error"
     *     )
     * )
     */
    public function store(Request $request)
    {
        if ($request->has('payload')) {
            $request->merge(json_decode($request->input('payload'), true));
        }

        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'vendor_id' => 'nullable|exists:vendors,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:ready,pre_order',
            'base_price' => 'required|numeric|min:0',
            'image_url' => 'nullable|string',
            'variants' => 'array',
            'variants.*.name' => 'required|string',
            'variants.*.type' => 'nullable|string',
            'variants.*.price_adjustment' => 'required|numeric',
            'skus' => 'array',
            'skus.*.variant_indices' => 'array', // Indices from the variants array above
            'skus.*.price' => 'nullable|numeric',
            'skus.*.stock' => 'required|integer|min:0',
            'skus.*.sku' => 'nullable|string|max:255',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048'
        ]);

        try {
            DB::beginTransaction();

            $product = Product::create($validated);

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $index => $file) {
                    $path = $file->store('products', 'public');
                    $product->images()->create([
                        'image_path' => $path,
                        'sort_order' => $index,
                        'is_primary' => $index === 0
                    ]);
                }
            }

            $createdVariants = [];

            if (isset($validated['variants'])) {
                foreach ($validated['variants'] as $index => $variant) {
                    $createdVariants[$index] = $product->variants()->create([
                        ...$variant,
                        'type' => $variant['type'] ?? 'General'
                    ]);
                }
            }

            if (isset($validated['skus'])) {
                foreach ($validated['skus'] as $skuData) {
                    $variantIds = [];
                    if (isset($skuData['variant_indices'])) {
                        foreach ($skuData['variant_indices'] as $index) {
                            if (isset($createdVariants[$index])) {
                                $variantIds[] = $createdVariants[$index]->id;
                            }
                        }
                    }

                    // Generate a SKU code if not provided
                    $skuCode = (!empty($skuData['sku'])) ? $skuData['sku'] : ($product->id . (empty($variantIds) ? '-DEFAULT' : '-' . implode('-', $variantIds)));

                    $product->skus()->create([
                        'sku' => $skuCode,
                        'price' => $skuData['price'],
                        'stock' => $skuData['stock'],
                        'variant_ids' => $variantIds
                    ]);
                }
            }

            DB::commit();
            return response()->json($product->load(['variants', 'skus', 'images']), 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Product creation failed', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/admin/products/{id}",
     *     summary="Get product details (Admin)",
     *     tags={"Admin Products"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Product ID",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Product not found"
     *     )
     * )
     */
    public function show(string $id)
    {
        return response()->json(Product::with(['category', 'vendor', 'variants', 'skus', 'images'])->findOrFail($id));
    }

    /**
     * @OA\Post(
     *     path="/admin/products/{id}",
     *     summary="Update a product",
     *     description="Use POST with _method=PUT or just POST for multipart/form-data update",
     *     tags={"Admin Products"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Product ID",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="_method", type="string", example="PUT"),
     *                 @OA\Property(property="category_id", type="integer"),
     *                 @OA\Property(property="vendor_id", type="integer"),
     *                 @OA\Property(property="name", type="string"),
     *                 @OA\Property(property="description", type="string"),
     *                 @OA\Property(property="status", type="string", enum={"ready", "pre_order"}),
     *                 @OA\Property(property="base_price", type="number", format="float"),
     *                 @OA\Property(property="payload", type="string", description="JSON string for complex nested data"),
     *                 @OA\Property(
     *                     property="images[]",
     *                     type="array",
     *                     @OA\Items(type="string", format="binary")
     *                 ),
     *                 @OA\Property(
     *                     property="deleted_images[]",
     *                     type="array",
     *                     @OA\Items(type="integer")
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Product updated successfully"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Product not found"
     *     )
     * )
     */
    public function update(Request $request, string $id)
    {
        $product = Product::findOrFail($id);

        if ($request->has('payload')) {
            $request->merge(json_decode($request->input('payload'), true));
        }

        $validated = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'vendor_id' => 'nullable|exists:vendors,id',
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:ready,pre_order',
            'base_price' => 'sometimes|numeric|min:0',
            'image_url' => 'nullable|string',
            'variants' => 'array',
            'variants.*.id' => 'nullable|exists:product_variants,id',
            'variants.*.name' => 'required_with:variants|string',
            'variants.*.type' => 'nullable|string',
            'variants.*.price_adjustment' => 'required_with:variants|numeric',
            'skus' => 'array',
            'skus.*.id' => 'nullable|exists:product_skus,id',
            'skus.*.variant_ids' => 'array',
            'skus.*.variant_indices' => 'array', // Support indices for update too
            'skus.*.price' => 'nullable|numeric',
            'skus.*.stock' => 'required_with:skus|integer|min:0',
            'skus.*.sku' => 'nullable|string|max:255',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'deleted_images' => 'array',
            'deleted_images.*' => 'integer|exists:product_images,id'
        ]);

        try {
            DB::beginTransaction();

            $product->update($validated);

            if ($request->hasFile('images')) {
                $currentCount = $product->images()->count();
                foreach ($request->file('images') as $index => $file) {
                    $path = $file->store('products', 'public');
                    $product->images()->create([
                        'image_path' => $path,
                        'sort_order' => $currentCount + $index,
                        'is_primary' => ($currentCount + $index) === 0
                    ]);
                }
            }

            if ($request->has('deleted_images')) {
                $product->images()->whereIn('id', $request->input('deleted_images'))->delete();
            }

            $variantIndexToId = [];

            if (isset($validated['variants'])) {
                $currentVariantIds = $product->variants->pluck('id')->toArray();
                $updatedVariantIds = [];

                foreach ($validated['variants'] as $index => $variantData) {
                    $variantData['type'] = $variantData['type'] ?? 'General';

                    if (isset($variantData['id'])) {
                        $product->variants()->where('id', $variantData['id'])->update([
                            'name' => $variantData['name'],
                            'type' => $variantData['type'],
                            'price_adjustment' => $variantData['price_adjustment'],
                        ]);
                        $updatedVariantIds[] = $variantData['id'];
                        $variantIndexToId[$index] = $variantData['id'];
                    } else {
                        $newVariant = $product->variants()->create($variantData);
                        $updatedVariantIds[] = $newVariant->id;
                        $variantIndexToId[$index] = $newVariant->id;
                    }
                }

                $variantsToDelete = array_diff($currentVariantIds, $updatedVariantIds);
                ProductVariant::destroy($variantsToDelete);
            }

            if (isset($validated['skus'])) {
                $currentSkuIds = $product->skus->pluck('id')->toArray();
                $updatedSkuIds = [];

                foreach ($validated['skus'] as $skuData) {
                    $variantIds = [];

                    if (isset($skuData['variant_indices'])) {
                        foreach ($skuData['variant_indices'] as $idx) {
                            if (isset($variantIndexToId[$idx])) {
                                $variantIds[] = $variantIndexToId[$idx];
                            }
                        }
                    } elseif (isset($skuData['variant_ids'])) {
                        $variantIds = $skuData['variant_ids'];
                    }

                    sort($variantIds); // Ensure consistent ordering

                    // Use provided SKU or generate one
                    $skuCode = (!empty($skuData['sku'])) ? $skuData['sku'] : ($product->id . (empty($variantIds) ? '-DEFAULT' : '-' . implode('-', $variantIds)));

                    if (isset($skuData['id'])) {
                        $product->skus()->where('id', $skuData['id'])->update([
                            'sku' => $skuCode,
                            'price' => $skuData['price'],
                            'stock' => $skuData['stock'],
                            'variant_ids' => $variantIds
                        ]);
                        $updatedSkuIds[] = $skuData['id'];
                    } else {
                        $newSku = $product->skus()->create([
                            'sku' => $skuCode,
                            'price' => $skuData['price'],
                            'stock' => $skuData['stock'],
                            'variant_ids' => $variantIds
                        ]);
                        $updatedSkuIds[] = $newSku->id;
                    }
                }

                $skusToDelete = array_diff($currentSkuIds, $updatedSkuIds);
                ProductSku::destroy($skusToDelete);
            }

            DB::commit();
            return response()->json($product->load(['variants', 'skus', 'images']));

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Product update failed', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/admin/products/{id}",
     *     summary="Delete a product",
     *     tags={"Admin Products"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Product ID",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=204,
     *         description="Product deleted"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Product not found"
     *     )
     * )
     */
    public function destroy(string $id)
    {
        Product::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
