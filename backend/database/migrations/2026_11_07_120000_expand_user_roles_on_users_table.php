<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // PostgreSQL syntax
        DB::statement("ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(20)");
        DB::statement("ALTER TABLE users ALTER COLUMN role SET NOT NULL");
        DB::statement("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'employee'");
    }

    public function down(): void
    {
        // Revert to a shorter string (PostgreSQL has no ENUM like MySQL)
        DB::statement("ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(20)");
        DB::statement("ALTER TABLE users ALTER COLUMN role SET NOT NULL");
        DB::statement("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'employee'");
    }
};