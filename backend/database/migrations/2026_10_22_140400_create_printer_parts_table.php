<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('printer_parts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('sku')->unique();
            $table->string('part_type', 50)->index()->comment('printhead, ink_tank, cartridge, pump, maintenance_box, capping_station, wiper_blade, rollers, dampers, encoder_strip, waste_ink_system, other');
            $table->unsignedInteger('quantity_on_hand')->default(0);
            $table->string('condition', 40)->default('good');
            $table->decimal('unit_cost', 12, 2)->nullable();
            $table->unsignedInteger('reorder_level')->default(1);
            $table->text('description')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('printer_parts');
    }
};
