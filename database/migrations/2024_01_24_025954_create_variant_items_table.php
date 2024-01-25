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
        Schema::create('variant_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('varian_id');
            $table->string('value');
            $table->decimal('additional_price',8,2);
            $table->foreign('varian_id')->references('id')->on('variants')->onDelete('cascade')->onUpdate('cascade');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('variant_items');
    }
};
