<?php

namespace Database\Seeders;

use App\Models\ProductVariant;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductVariantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        #sku (produk variant nourut)
        $datas = [
            [#usia dewasa
                'product_id' => 1,
                'variant_item_id' => 1,
                'sku' => null,
                'stock' => 0,
                'price' => 75000,
            ],
            [#usia anak
                'product_id' => 1,
                'variant_item_id' => 2,
                'sku' => null,
                'stock' => 0,
                'price' => 65000,
            ],

            [#warna dewasa
                'product_id' => 1,
                'variant_item_id' => 3,
                'sku' => null,
                'stock' => 0,
                'price' => 75000,
            ],
            [#warna dewasa
                'product_id' => 1,
                'variant_item_id' => 4,
                'sku' => null,
                'stock' => 0,
                'price' => 75000,
            ],

            [#warna anak
                'product_id' => 1,
                'variant_item_id' => 3,
                'sku' => null,
                'stock' => 0,
                'price' => 65000,
            ],
            [#warna anak
                'product_id' => 1,
                'variant_item_id' => 4,
                'sku' => null,
                'stock' => 0,
                'price' => 65000,
            ],

            [#xs dewasa
                'product_id' => 1,
                'variant_item_id' => 5,
                'sku' => null,
                'stock' => 0,
                'price' => 75000,
            ],
            [#s dewasa
                'product_id' => 1,
                'variant_item_id' => 6,
                'sku' => null,
                'stock' => 0,
                'price' => 75000,
            ],
            [#m dewasa
                'product_id' => 1,
                'variant_item_id' => 7,
                'sku' => null,
                'stock' => 0,
                'price' => 75000,
            ],
            [#l dewasa
                'product_id' => 1,
                'variant_item_id' => 8,
                'sku' => null,
                'stock' => 0,
                'price' => 75000,
            ],
            [#xl dewasa
                'product_id' => 1,
                'variant_item_id' => 9,
                'sku' => null,
                'stock' => 0,
                'price' => 75000,
            ],
            [#xxl dewasa
                'product_id' => 1,
                'variant_item_id' => 10,
                'sku' => null,
                'stock' => 0,
                'price' => 80000,
            ],
            [#xxxl dewasa
                'product_id' => 1,
                'variant_item_id' => 11,
                'sku' => null,
                'stock' => 0,
                'price' => 80000,
            ],

            [#xs anak
                'product_id' => 1,
                'variant_item_id' => 5,
                'sku' => null,
                'stock' => 0,
                'price' => 65000,
            ],
            [#s anak
                'product_id' => 1,
                'variant_item_id' => 6,
                'sku' => null,
                'stock' => 0,
                'price' => 65000,
            ],
            [#m anak
                'product_id' => 1,
                'variant_item_id' => 7,
                'sku' => null,
                'stock' => 0,
                'price' => 65000,
            ],
            [#l anak
                'product_id' => 1,
                'variant_item_id' => 8,
                'sku' => null,
                'stock' => 0,
                'price' => 65000,
            ],
            [#xl anak
                'product_id' => 1,
                'variant_item_id' => 9,
                'sku' => null,
                'stock' => 0,
                'price' => 65000,
            ],
            [#xxl anak
                'product_id' => 1,
                'variant_item_id' => 10,
                'sku' => null,
                'stock' => 0,
                'price' => 75000,
            ],
            [#xxxl anak
                'product_id' => 1,
                'variant_item_id' => 11,
                'sku' => null,
                'stock' => 0,
                'price' => 75000,
            ],

            [#lengan dewasa
                'product_id' => 1,
                'variant_item_id' => 12,
                'sku' => null,
                'stock' => 0,
                'price' => 75000,
            ],
            [#lengan dewasa
                'product_id' => 1,
                'variant_item_id' => 13,
                'sku' => null,
                'stock' => 0,
                'price' => 80000,
            ],
            [#lengan anak
                'product_id' => 1,
                'variant_item_id' => 12,
                'sku' => null,
                'stock' => 0,
                'price' => 65000,
            ],
            [#lengan anak
                'product_id' => 1,
                'variant_item_id' => 13,
                'sku' => null,
                'stock' => 0,
                'price' => 75000,
            ],

            #sarung
            [#usia dewasa
                'product_id' => 2,
                'variant_item_id' => 14,
                'sku' => null,
                'stock' => 0,
                'price' => 100000,
            ],
            [#usia anak
                'product_id' => 2,
                'variant_item_id' => 15,
                'sku' => null,
                'stock' => 0,
                'price' => 85000,
            ],
        ];

        foreach($datas as $data){
            ProductVariant::create($data);
        }
    }
}
