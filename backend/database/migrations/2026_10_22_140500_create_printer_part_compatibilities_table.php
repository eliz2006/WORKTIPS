<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('printer_part_compatibilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('printer_part_id')->constrained()->cascadeOnDelete();
            $table->foreignId('printer_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['printer_part_id', 'printer_id'], 'part_printer_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('printer_part_compatibilities');
    }
};
