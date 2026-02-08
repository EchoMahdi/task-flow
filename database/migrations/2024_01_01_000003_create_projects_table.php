<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('color')->default('#3B82F6');
            $table->string('icon')->default('folder');
            $table->boolean('is_favorite')->default(false);
            $table->foreignId('parent_id')->nullable()->constrained('projects')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['user_id', 'name']);
            $table->index('is_favorite');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
