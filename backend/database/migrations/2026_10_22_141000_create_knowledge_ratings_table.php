<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('knowledge_ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('knowledge_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('score');
            $table->timestamps();

            $table->unique(['knowledge_item_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('knowledge_ratings');
    }
};
