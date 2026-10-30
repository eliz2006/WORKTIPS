<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ink_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('color');
            $table->string('brand');
            $table->string('formula', 40)->default('dye')->comment('dye, pigment, sublimation, uv, solvent');
            $table->string('unit', 10)->default('ml');
            $table->decimal('low_stock_threshold', 10, 2)->default(500);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['name', 'color', 'brand']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ink_types');
    }
};
