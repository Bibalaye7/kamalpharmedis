<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 30)->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // pending | confirmed | processing | shipped | delivered | cancelled
            $table->string('status', 20)->default('pending');
            $table->string('payment_method', 30)->default('cash_on_delivery');
            // unpaid | paid | refunded
            $table->string('payment_status', 20)->default('unpaid');
            $table->unsignedInteger('subtotal');
            $table->unsignedInteger('shipping_fee')->default(0);
            $table->unsignedInteger('total');
            // Adresse de livraison figée au moment de la commande
            $table->string('shipping_name');
            $table->string('shipping_phone', 30);
            $table->string('shipping_address');
            $table->string('shipping_city', 80);
            $table->text('notes')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
