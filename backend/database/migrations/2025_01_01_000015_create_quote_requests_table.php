<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quote_requests', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 30)->unique();
            // Rempli si la demande est faite depuis un compte connecté (suivi dans « Mes devis »).
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('company_name');
            // clinique | pharmacie | hopital | cabinet | laboratoire | ong | autre
            $table->string('company_type', 30);
            $table->string('ninea', 40)->nullable();
            $table->string('contact_name');
            $table->string('email');
            $table->string('phone', 30);
            $table->string('city', 80);
            $table->date('needed_by')->nullable();
            $table->text('message')->nullable();
            // new | in_progress | sent | accepted | rejected
            $table->string('status', 20)->default('new');
            $table->unsignedInteger('quoted_total')->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
        });

        Schema::create('quote_request_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quote_request_id')->constrained()->cascadeOnDelete();
            // Produit du catalogue, ou null pour un produit demandé hors catalogue.
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('product_name');
            $table->unsignedInteger('quantity');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quote_request_items');
        Schema::dropIfExists('quote_requests');
    }
};
