<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Jeton de facture PayDunya : identifie la transaction pour la confirmation et le webhook.
            $table->string('payment_token', 80)->nullable()->after('payment_status');
            $table->string('payment_url', 500)->nullable()->after('payment_token');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['payment_token', 'payment_url']);
        });
    }
};
