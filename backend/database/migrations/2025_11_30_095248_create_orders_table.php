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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('checkout_name');
            $table->string('phone_number');
            $table->string('qobilah');
            $table->enum('payment_method', ['transfer', 'cash']);
            $table->enum('status', ['new', 'paid', 'processed', 'ready_pickup', 'completed', 'cancelled'])->default('new');
            $table->decimal('total_amount', 10, 2);
            $table->string('proof_image')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
