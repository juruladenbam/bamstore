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
            $table->foreignId('coupon_id')->nullable()->constrained()->onDelete('set null');
            $table->string('coupon_code')->nullable();
            $table->decimal('discount_amount', 15, 2)->default(0);
            // total_amount currently exists, we might need grand_total or just keep total_amount as "after discount"
            // According to proposal: grand_total is net (total_amount - discount_amount)
            $table->decimal('grand_total', 15, 2)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['coupon_id']);
            $table->dropColumn(['coupon_id', 'coupon_code', 'discount_amount', 'grand_total']);
        });
    }
};
