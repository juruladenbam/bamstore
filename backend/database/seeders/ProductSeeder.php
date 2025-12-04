<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductSku;
use App\Models\ProductImage;

class ProductSeeder extends Seeder
{
    public function run()
    {
        // 1. Create Category
        $category = Category::firstOrCreate(
            ['slug' => 'kaos'],
            ['name' => 'kaos']
        );

        // 2. Create Product
        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Kaos Festival BAM 2026',
            'slug' => 'kaos-festival-bam-2026',
            'description' => 'Kaos Festival BAM 2026 keren',
            'status' => 'ready',
            'base_price' => 75000,
        ]);

        // 3. Create Variants
        // User requested "age" (interpreted as "arm") to be first.
        // Original order: Colour, Size, Arm.
        // New order: Arm, Colour, Size.

        $variantsData = [
            'age' => [
                ['name' => 'adult', 'price_adjustment' => 0],
                ['name' => 'children', 'price_adjustment' => -10000],
            ],
            'arm' => [
                ['name' => 'short', 'price_adjustment' => 0],
                ['name' => 'long', 'price_adjustment' => 5000],
            ],
            'colour' => [
                ['name' => 'Black', 'price_adjustment' => 0],
                ['name' => 'Blue', 'price_adjustment' => 0],
            ],
            'size' => [
                ['name' => 's', 'price_adjustment' => 0],
                ['name' => 'm', 'price_adjustment' => 0],
                ['name' => 'l', 'price_adjustment' => 0],
                ['name' => 'xl', 'price_adjustment' => 0],
                ['name' => 'xxl', 'price_adjustment' => 5000],
                ['name' => 'xxxl', 'price_adjustment' => 5000],
                ['name' => 'xxxxl', 'price_adjustment' => 5000],
            ],
        ];

        $createdVariants = [];

        foreach ($variantsData as $type => $items) {
            $createdVariants[$type] = [];
            foreach ($items as $item) {
                $variant = ProductVariant::create([
                    'product_id' => $product->id,
                    'type' => $type,
                    'name' => $item['name'],
                    'price_adjustment' => $item['price_adjustment'],
                ]);
                $createdVariants[$type][] = $variant;
            }
        }

        // 4. Generate SKUs (Cartesian Product)
        // Order: Age -> Arm -> Colour -> Size
        foreach ($createdVariants['age'] as $age) {
            foreach ($createdVariants['arm'] as $arm) {
                foreach ($createdVariants['colour'] as $colour) {
                    foreach ($createdVariants['size'] as $size) {
                        $variantIds = [$age->id, $arm->id, $colour->id, $size->id];
                        // Generate SKU code: PRODUCT_ID-AGE_ID-ARM_ID-COLOUR_ID-SIZE_ID
                        // Or keep the format consistent with existing: PRODUCT_ID-VAR1-VAR2-VAR3-VAR4
                        $skuCode = $product->id . '-' . implode('-', $variantIds);

                        // Calculate Price (Base + Adjustments)
                        // Note: The dump shows SKU price as "0.00".
                        // The frontend logic seems to calculate it dynamically or use the SKU price if set.
                        // In the dump, SKU price is 0, but variants have adjustments.
                        // I will set SKU price to 0 to match the dump, or calculate it?
                        // The dump has "price": "0.00". I'll stick to 0.

                        ProductSku::create([
                            'product_id' => $product->id,
                            'sku' => $skuCode,
                            'price' => 0,
                            'stock' => 50, // Resetting stock to 50
                            'variant_ids' => $variantIds,
                        ]);
                    }
                }
            }
        }

        // 5. Create Images
        $images = [
            [
                'image_path' => 'products/TDlw1zoZkXP7zkZS8d8jw5Vt3dLSBgqBZqzUUPs6.jpg',
                'is_primary' => 1,
                'sort_order' => 0,
            ],
            [
                'image_path' => 'products/Q71UAXi6XP53JfEicDkyONuajB9UcOVJqBUvsmqS.webp',
                'is_primary' => 0,
                'sort_order' => 1,
            ],
            [
                'image_path' => 'products/R37ip51DqZKmjffz8Z2qh0EGiupB2dPdzyxcg8Ay.webp',
                'is_primary' => 0,
                'sort_order' => 2,
            ],
        ];

        foreach ($images as $img) {
            ProductImage::create([
                'product_id' => $product->id,
                'image_path' => $img['image_path'],
                'is_primary' => $img['is_primary'],
                'sort_order' => $img['sort_order'],
            ]);
        }
    }
}
