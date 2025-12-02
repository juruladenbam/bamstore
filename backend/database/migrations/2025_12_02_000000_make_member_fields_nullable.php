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
        Schema::table('member_data_pools', function (Blueprint $table) {
            $table->string('phone_number')->nullable()->change();
            $table->string('qobilah')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('member_data_pools', function (Blueprint $table) {
            $table->string('phone_number')->nullable(false)->change();
            $table->string('qobilah')->nullable(false)->change();
        });
    }
};
