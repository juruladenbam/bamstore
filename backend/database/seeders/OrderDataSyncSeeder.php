<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Order;
use Illuminate\Support\Facades\DB;

class OrderDataSyncSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Memperbaiki data order lama dengan menyalin total_amount ke grand_total
     * dan mengatur discount_amount ke 0 jika masih NULL.
     */
    public function run(): void
    {
        $updatedCount = Order::whereNull('grand_total')
            ->update([
                'grand_total' => DB::raw('total_amount'),
                'discount_amount' => 0
            ]);

        $this->command->info("Data Sync Berhasil: {$updatedCount} order telah diperbarui.");
    }
}
