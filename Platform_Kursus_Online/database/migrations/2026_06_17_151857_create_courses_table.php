<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('courses', function (Blueprint $table) {
        $table->id();
        $table->foreignId('instructor_id')->constrained('users')->onDelete('cascade');
        $table->string('title');
        $table->text('description')->nullable();
        $table->string('category', 50)->nullable();
        $table->decimal('duration_hours', 5, 1)->nullable();
        $table->decimal('price', 10, 2)->default(0);
        $table->enum('level', ['Pemula', 'Menengah', 'Mahir'])->default('Pemula');
        $table->string('thumbnail')->nullable();
        $table->boolean('is_published')->default(false);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};