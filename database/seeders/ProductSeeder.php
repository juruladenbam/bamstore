<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $datas = [
            [#1
                'name' => 'Kaos Festival BAM',
                'description' => '-',
                'photo' => '-',
                'cost' => '55000',
                'profit' => '10000',
            ],
            [#2
                'name' => 'Sarung Batik BAM',
                'description' => '-',
                'photo' => '-',
                'cost' => '85000',
                'profit' => '15000',
            ],
        ];

        foreach($datas as $data){
            Product::create($data);
        }
    }
}
