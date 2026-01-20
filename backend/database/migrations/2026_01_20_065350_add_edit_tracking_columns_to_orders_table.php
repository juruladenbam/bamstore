<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('price_adjustment_status', ['none', 'overpaid', 'underpaid'])
                ->default('none')
                ->after('grand_total');
            $table->decimal('price_adjustment_amount', 12, 2)
                ->default(0)
                ->after('price_adjustment_status');
            $table->timestamp('last_edited_at')
                ->nullable()
                ->after('price_adjustment_amount');
            $table->foreignId('last_edited_by')
                ->nullable()
                ->constrained('users')
                ->onDelete('set null')
                ->after('last_edited_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['last_edited_by']);
            $table->dropColumn([
                'price_adjustment_status',
                'price_adjustment_amount',
                'last_edited_at',
                'last_edited_by'
            ]);
        });
    }
};
