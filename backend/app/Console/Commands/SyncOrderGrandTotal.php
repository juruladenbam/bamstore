<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Order;
use Illuminate\Support\Facades\DB;

class SyncOrderGrandTotal extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:sync-grand-total';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sinkronisasi kolom grand_total dengan total_amount untuk pesanan lama';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Memulai sinkronisasi data pesanan...');

        $updatedCount = Order::whereNull('grand_total')
            ->update([
                'grand_total' => DB::raw('total_amount'),
                'discount_amount' => 0
            ]);

        $this->success("Berhasil memperbarui {$updatedCount} pesanan.");
        
        return Command::SUCCESS;
    }
}
