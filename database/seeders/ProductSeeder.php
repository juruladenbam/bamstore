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
                'bg' => 'default',
                'slug' => 'kaos-festival-bam',
                'cost' => '55000',
                'profit' => '10000',
            ],
            [#2
                'name' => 'Sarung Batik BAM',
                'description' => '-',
                'bg' => 'secondary',
                'slug' => 'sarung-batik-bam',
                'cost' => '65000',
                'profit' => '15000',
            ],
        ];

        foreach($datas as $data){
            Product::create($data);
        }
    }
}
