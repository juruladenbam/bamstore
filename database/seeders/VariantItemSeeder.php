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
                'variant_id' => 1,
                'value' => 'dewasa',
                'additional_price' => 10000
            ],
            [#2
                'variant_id' => 1,
                'value' => 'anak',
                'additional_price' => 0
            ],
            [#3
                'variant_id' => 2,
                'value' => 'hitam',
                'additional_price' => 0
            ],
            [#4
                'variant_id' => 2,
                'value' => 'coklat',
                'additional_price' => 0
            ],
            [#5
                'variant_id' => 3,
                'value' => 'xs',
                'additional_price' => 0
            ],
            [#6
                'variant_id' => 3,
                'value' => 's',
                'additional_price' => 0
            ],
            [#7
                'variant_id' => 3,
                'value' => 'm',
                'additional_price' => 0
            ],
            [#8
                'variant_id' => 3,
                'value' => 'l',
                'additional_price' => 0
            ],
            [#9
                'variant_id' => 3,
                'value' => 'xl',
                'additional_price' => 0
            ],
            [#10
                'variant_id' => 3,
                'value' => 'xxl',
                'additional_price' => 5000
            ],
            [#11
                'variant_id' => 3,
                'value' => 'xxxl',
                'additional_price' => 5000
            ],
            [#12
                'variant_id' => 4,
                'value' => 'pendek',
                'additional_price' => 0
            ],
            [#13
                'variant_id' => 4,
                'value' => 'panjang',
                'additional_price' => 5000
            ],
            [#14
                'variant_id' => 5,
                'value' => 'dewasa',
                'additional_price' => 20000
            ],
            [#15
                'variant_id' => 5,
                'value' => 'anak',
                'additional_price' => 0
            ],
        ];

        foreach($datas as $data){
            VariantItem::create($data);
        }
    }
}
