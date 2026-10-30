<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('printer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('performed_by')->constrained('users')->cascadeOnDelete();
            $table->dateTime('performed_at');
            $table->string('work_type', 40)->default('routine');
            $table->text('notes')->nullable();
            $table->decimal('labor_cost', 12, 2)->nullable();
            $table->date('next_due_at')->nullable();
            $table->timestamps();
        });

        Schema::create('maintenance_parts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('maintenance_record_id')->constrained()->cascadeOnDelete();
            $table->foreignId('printer_part_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('quantity')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_parts');
        Schema::dropIfExists('maintenance_records');
    }
};
