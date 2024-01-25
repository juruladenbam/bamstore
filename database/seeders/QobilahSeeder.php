<?php

namespace Database\Seeders;

use App\Models\Qobilah;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class QobilahSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $datas = [
            ['name' => 'MARIYAH'],
            ['name' => 'BUSYRI'],
            ['name' => 'MUZAMMAH'],
            ['name' => 'SULHAN'],
            ['name' => 'SHOLIHATUN'],
            ['name' => 'NURSIYAM'],
            ['name' => 'NIMAH'],
            ['name' => 'ABD. MAJID'],
            ['name' => 'SAIDAH'],
            ['name' => 'THOHIR AL ALY'],
            ['name' => 'NGAGLIK'],
        ];
        foreach($datas as $data){
            Qobilah::create($data);
        }
    }
}
