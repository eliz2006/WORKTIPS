<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('printer_ink_type', function (Blueprint $table) {
            $table->id();
            $table->foreignId('printer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('ink_type_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['printer_id', 'ink_type_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('printer_ink_type');
    }
};
