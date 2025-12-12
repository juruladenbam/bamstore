<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Vendor;
use App\Models\Category;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RolesAndPermissionsSeeder::class);

        // 1. Create Admin User
        $admin = User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
        ]);
        $admin->assignRole('admin');

        // 2. Create Vendors
        $vendors = Vendor::factory(5)->create();

        // Create Member Data Pool
        \App\Models\MemberDataPool::factory(50)->create();

        // 3. Create Categories
        $categories = Category::factory(5)->create();

        // 4. Create Products with Variants
        $products = Product::factory(20)
            ->recycle($categories)
            ->recycle($vendors)
            ->create()
            ->each(function ($product) {
            // Create Product Images
            // Map product name keywords to English for LoremFlickr
            $keyword = 'fashion';
            if (str_contains(strtolower($product->name), 'kemeja')) $keyword = 'shirt';
            elseif (str_contains(strtolower($product->name), 'kaos')) $keyword = 'tshirt';
            elseif (str_contains(strtolower($product->name), 'celana')) $keyword = 'pants';
            elseif (str_contains(strtolower($product->name), 'gamis')) $keyword = 'dress';
            elseif (str_contains(strtolower($product->name), 'tunik')) $keyword = 'tunic';
            elseif (str_contains(strtolower($product->name), 'jaket')) $keyword = 'jacket';
            elseif (str_contains(strtolower($product->name), 'sweater')) $keyword = 'sweater';
            elseif (str_contains(strtolower($product->name), 'rok')) $keyword = 'skirt';

            \App\Models\ProductImage::factory()->create([
                'product_id' => $product->id,
                'image_path' => "https://placehold.co/600x400?text=$keyword",
                'is_primary' => true,
                'sort_order' => 1,
            ]);

            // Add 1-2 secondary images
            // for ($i = 0; $i < rand(1, 2); $i++) {
            //     \App\Models\ProductImage::factory()->create([
            //         'product_id' => $product->id,
            //         'image_path' => "https://placehold.co/600x400?text=$keyword" . ($product->id + 100 + $i),
            //         'is_primary' => false,
            //         'sort_order' => $i + 2,
            //     ]);
            // }

            // Create Size Variants
            $sizes = ['S', 'M', 'L', 'XL', 'XXL'];
            $sizeVariants = [];
            foreach ($sizes as $size) {
                $sizeVariants[] = \App\Models\ProductVariant::factory()->create([
                    'product_id' => $product->id,
                    'name' => $size,
                    'type' => 'size',
                    'price_adjustment' => $size === 'XXL' ? 10000 : 0,
                ]);
            }

            // Create Color Variants
            $colors = ['Hitam', 'Putih', 'Navy', 'Maroon', 'Abu-abu'];
            // Pick random 3 colors for each product
            $productColors = collect($colors)->random(3);
            $colorVariants = [];
            foreach ($productColors as $color) {
                $colorVariants[] = \App\Models\ProductVariant::factory()->create([
                    'product_id' => $product->id,
                    'name' => $color,
                    'type' => 'color',
                    'price_adjustment' => 0,
                ]);
            }

            // Create Product SKUs (Combinations)
            foreach ($sizeVariants as $sizeVar) {
                foreach ($colorVariants as $colorVar) {
                    \App\Models\ProductSku::create([
                        'product_id' => $product->id,
                        'sku' => strtoupper($product->slug . '-' . $sizeVar->name . '-' . $colorVar->name),
                        'price' => $product->base_price + $sizeVar->price_adjustment + $colorVar->price_adjustment,
                        'stock' => rand(0, 100),
                        'variant_ids' => [$sizeVar->id, $colorVar->id]
                    ]);
                }
            }
        });

        // 5. Create Orders
        Order::factory(30)->create()->each(function ($order) use ($products) {
            $numItems = rand(1, 5);
            $orderTotal = 0;

            for ($i = 0; $i < $numItems; $i++) {
                $product = $products->random();
                // Get a random SKU for this product
                $sku = $product->skus()->inRandomOrder()->first();

                if (!$sku) continue;

                $quantity = rand(1, 3);
                $price = $sku->price;

                $orderItem = $order->items()->create([
                    'product_id' => $product->id,
                    'sku' => $sku->sku,
                    'recipient_name' => $order->checkout_name,
                    'unit_price_at_order' => $price,
                    'quantity' => $quantity,
                ]);

                // Attach variants from SKU to Order Item
                if ($sku->variant_ids) {
                    $variantIds = is_string($sku->variant_ids) ? json_decode($sku->variant_ids, true) : $sku->variant_ids;
                    foreach ($variantIds as $variantId) {
                        $variant = \App\Models\ProductVariant::find($variantId);
                        if ($variant) {
                            $orderItem->variants()->attach($variantId, [
                                'price_at_order' => $variant->price_adjustment
                            ]);
                        }
                    }
                }

                $orderTotal += $price * $quantity;
            }

            $order->update(['total_amount' => $orderTotal]);
        });

        // 6. Create Product Costs
        $products->each(function ($product) {
            \App\Models\ProductCost::create([
                'product_id' => $product->id,
                'cost' => $product->base_price * 0.7, // Assume 70% of base price is cost
            ]);
        });

        // 7. Create Vendor Payments
        $vendors->each(function ($vendor) {
            \App\Models\VendorPayment::create([
                'vendor_id' => $vendor->id,
                'amount' => rand(100000, 1000000),
                'type' => 'dp',
                'payment_date' => now()->subDays(rand(1, 30)),
                'notes' => 'Initial Down Payment',
            ]);
        });

        // 8. Create Default Settings
        \App\Models\Setting::create(['key' => 'site_name', 'value' => 'BAM Store', 'type' => 'string', 'group' => 'general']);
        \App\Models\Setting::create(['key' => 'site_description', 'value' => 'Your favorite fashion store', 'type' => 'text', 'group' => 'general']);
        \App\Models\Setting::create(['key' => 'contact_email', 'value' => 'support@bamstore.com', 'type' => 'string', 'group' => 'contact']);
    }
}
