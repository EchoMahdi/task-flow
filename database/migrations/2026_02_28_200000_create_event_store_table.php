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
        Schema::create('event_store', function (Blueprint $table) {
            $table->id();
            $table->string('event_type', 255);
            $table->string('event_name', 100)->index();
            $table->json('payload');
            $table->unsignedBigInteger('aggregate_id')->nullable()->index();
            $table->string('aggregate_type', 255)->nullable();
            $table->integer('version')->default(0);
            $table->timestamp('occurred_at')->useCurrent()->index();
            $table->timestamps();

            $table->index(['event_name', 'occurred_at']);
            $table->index(['aggregate_type', 'aggregate_id', 'version'], 'aggregate_version_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_store');
    }
};
