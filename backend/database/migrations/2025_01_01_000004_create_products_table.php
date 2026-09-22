<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories');
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('sku', 40)->unique();
            $table->string('short_description', 255)->nullable();
            $table->text('description')->nullable();
            $table->unsignedInteger('price');              // en FCFA
            $table->unsignedInteger('old_price')->nullable();
            $table->unsignedInteger('stock')->default(0);
            $table->json('images')->nullable();            // chemins storage ou URLs
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['is_active', 'is_featured']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
