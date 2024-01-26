<?php

namespace Database\Seeders;

use App\Models\VariantItem;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class VariantItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $datas = [
            [#1
                'varian_id' => 1,
                'value' => 'dewasa',
                'additional_price' => 10000
            ],
            [#2
                'varian_id' => 1,
                'value' => 'anak',
                'additional_price' => 0
            ],
            [#3
                'varian_id' => 2,
                'value' => 'hitam',
                'additional_price' => 0
            ],
            [#4
                'varian_id' => 2,
                'value' => 'coklat',
                'additional_price' => 0
            ],
            [#5
                'varian_id' => 3,
                'value' => 'xs',
                'additional_price' => 0
            ],
            [#6
                'varian_id' => 3,
                'value' => 's',
                'additional_price' => 0
            ],
            [#7
                'varian_id' => 3,
                'value' => 'm',
                'additional_price' => 0
            ],
            [#8
                'varian_id' => 3,
                'value' => 'l',
                'additional_price' => 0
            ],
            [#9
                'varian_id' => 3,
                'value' => 'xl',
                'additional_price' => 0
            ],
            [#10
                'varian_id' => 3,
                'value' => 'xxl',
                'additional_price' => 5000
            ],
            [#11
                'varian_id' => 3,
                'value' => 'xxxl',
                'additional_price' => 5000
            ],
            [#12
                'varian_id' => 4,
                'value' => 'pendek',
                'additional_price' => 0
            ],
            [#13
                'varian_id' => 4,
                'value' => 'panjang',
                'additional_price' => 5000
            ],
        ];

        foreach($datas as $data){
            VariantItem::create($data);
        }
    }
}
