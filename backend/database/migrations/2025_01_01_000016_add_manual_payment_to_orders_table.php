<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Paiement manuel (transfert Wave / Orange Money) : identifiant de transaction
            // déclaré par le client, vérifié ensuite par l'équipe avant de marquer « payé ».
            $table->string('payment_reference', 60)->nullable()->after('payment_url');
            $table->timestamp('payment_declared_at')->nullable()->after('payment_reference');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['payment_reference', 'payment_declared_at']);
        });
    }
};
