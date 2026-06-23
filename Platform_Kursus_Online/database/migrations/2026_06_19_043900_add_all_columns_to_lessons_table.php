<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            // Tambahkan semua kolom yang hilang
            if (!Schema::hasColumn('lessons', 'module_id')) {
                $table->foreignId('module_id')->constrained()->onDelete('cascade');
            }
            if (!Schema::hasColumn('lessons', 'title')) {
                $table->string('title');
            }
            if (!Schema::hasColumn('lessons', 'content_type')) {
                $table->enum('content_type', ['video', 'text', 'file', 'quiz'])->default('text');
            }
            if (!Schema::hasColumn('lessons', 'video_url')) {
                $table->string('video_url')->nullable();
            }
            if (!Schema::hasColumn('lessons', 'content_text')) {
                $table->longText('content_text')->nullable();
            }
            if (!Schema::hasColumn('lessons', 'file_attachment')) {
                $table->string('file_attachment')->nullable();
            }
            if (!Schema::hasColumn('lessons', 'sort_order')) {
                $table->integer('sort_order')->default(0);
            }
            if (!Schema::hasColumn('lessons', 'is_free')) {
                $table->boolean('is_free')->default(false);
            }
        });
    }

    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->dropForeign(['module_id']);
            $table->dropColumn([
                'module_id', 'title', 'content_type', 'video_url',
                'content_text', 'file_attachment', 'sort_order', 'is_free'
            ]);
        });
    }
};
