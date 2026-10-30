<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('knowledge_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('printer_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->string('type', 40)->index()->comment('tutorial, documentation, troubleshooting, procedure, tip');
            $table->string('status', 20)->default('pending')->index();
            $table->longText('body');
            $table->string('video_path')->nullable();
            $table->unsignedInteger('views')->default(0);
            $table->text('rejection_reason')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->fullText(['title', 'body']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('knowledge_items');
    }
};
