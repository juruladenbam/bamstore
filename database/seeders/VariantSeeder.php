<?php

namespace Database\Seeders;

use App\Models\Variant;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class VariantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $datas = [
            [#1
                'name' => 'usia kaos',
            ],
            [#2
                'name' => 'colors',
            ],
            [#3
                'name' => 'sizes',
            ],
            [#4
                'name' => 'arm types',
            ],
            [#5
                'name' => 'usia sarung',
            ],
        ];

        foreach($datas as $data){
            Variant::create($data);
        }
    }
}