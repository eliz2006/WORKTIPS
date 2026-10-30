<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('knowledge_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('knowledge_item_id')->constrained()->cascadeOnDelete();
            $table->string('path');
            $table->string('kind', 20)->default('photo')->comment('photo, video');
            $table->string('original_name')->nullable();
            $table->string('mime_type', 120)->nullable();
            $table->unsignedBigInteger('size_bytes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('knowledge_media');
    }
};
