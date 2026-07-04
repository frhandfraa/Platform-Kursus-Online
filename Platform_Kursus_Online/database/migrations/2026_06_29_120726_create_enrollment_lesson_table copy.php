<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('enrollment_lesson', function (Blueprint $table) {
        $table->id();
        $table->foreignId('enrollment_id')->constrained()->onDelete('cascade');
        $table->foreignId('lesson_id')->constrained()->onDelete('cascade');
        $table->boolean('is_completed')->default(false);
        $table->timestamps();
    });
}
};
