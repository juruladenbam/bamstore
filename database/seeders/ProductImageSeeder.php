<?php

namespace Database\Seeders;

use App\Models\ProductImage;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class ProductImageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $datas = [
            [
                'product_id' => '1',
                'image' => 'bamstore size chart kaos.jpg',
            ],
            [
                'product_id' => '1',
                'image' => 'bamstore desain kaos.jpg',
            ],
            [
                'product_id' => '1',
                'image' => 'bamstore kaos.jpg',
            ],
            [
                'product_id' => '2',
                'image' => 'bamstore sarung.jpg',
            ],

        ];

        foreach($datas as $data){
            ProductImage::create($data);
        }
    }
}
