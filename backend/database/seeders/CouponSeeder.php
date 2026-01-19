<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Coupon;
use Carbon\Carbon;

class CouponSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Coupon::updateOrCreate(
            ['code' => 'JURULADENBAM2026'],
            [
                'description' => 'Diskon 50% Khusus Event 2026',
                'type' => 'percent',
                'value' => 50.00,
                'max_discount_amount' => null,
                'min_purchase' => 0,
                'start_date' => Carbon::now(),
                'end_date' => Carbon::now()->addYear(),
                'usage_limit' => 12,
                'usage_limit_per_user' => 1,
                'is_active' => true,
            ]
        );

        Coupon::updateOrCreate(
            ['code' => 'SDRNPL'],
            [
                'description' => 'Diskon 50% Khusus SDRNPL',
                'type' => 'percent',
                'value' => 50.00,
                'max_discount_amount' => null,
                'min_purchase' => 0,
                'start_date' => Carbon::now(),
                'end_date' => Carbon::now()->addYear(),
                'usage_limit' => 2,
                'usage_limit_per_user' => 1,
                'is_active' => true,
            ]
        );
    }
}
