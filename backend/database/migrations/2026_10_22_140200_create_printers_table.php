<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('printers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('brand');
            $table->string('model');
            $table->string('type', 40)->index()->comment('inkjet, laser, sublimation, digital, eco_solvent, uv');
            $table->string('serial_number')->unique();
            $table->string('printing_category', 40)->index()->comment('tarpaulin, sticker, sublimation, digital, other');
            $table->string('condition', 40)->default('active')->index();
            $table->unsignedInteger('maintenance_interval_days')->default(30);
            $table->date('last_maintenance_at')->nullable();
            $table->date('next_maintenance_at')->nullable()->index();
            $table->string('location')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('printers');
    }
};
