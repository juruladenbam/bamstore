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
            [
                'name' => 'usia',
            ],
            [
                'name' => 'colors',
            ],
            [
                'name' => 'sizes',
            ],
            [
                'name' => 'arm types',
            ],
        ];

        foreach($datas as $data){
            Variant::create($data);
        }
    }
}
