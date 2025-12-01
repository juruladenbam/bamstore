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
    public function index()
    {
        return response()->json(Product::with(['category', 'vendor', 'variants', 'skus', 'images'])->get());
    }

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

    public function show(string $id)
    {
        return response()->json(Product::with(['category', 'vendor', 'variants', 'skus', 'images'])->findOrFail($id));
    }

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

    public function destroy(string $id)
    {
        Product::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
