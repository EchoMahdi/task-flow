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
        // Create notification_rules table
        Schema::create('notification_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('task_id')->constrained()->onDelete('cascade');
            $table->string('channel')->default('email');
            $table->integer('reminder_offset')->default(30);
            $table->string('reminder_unit')->default('minutes');
            $table->boolean('is_enabled')->default(true);
            $table->timestamp('last_sent_at')->nullable();
            $table->timestamps();

            // Indexes for efficient querying
            $table->index(['user_id', 'task_id']);
            $table->index(['channel', 'is_enabled']);
            $table->index(['is_enabled', 'channel']);
        });

        // Create notification_logs table
        Schema::create('notification_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('notification_rule_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('task_id')->constrained()->onDelete('cascade');
            $table->string('channel');
            $table->string('status')->default('pending');
            $table->timestamp('sent_at')->nullable();
            $table->text('error_message')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            // Indexes for efficient querying
            $table->index(['user_id', 'status']);
            $table->index(['notification_rule_id', 'status']);
            $table->index(['created_at']);
        });

        // Create user_notification_settings table for global settings
        Schema::create('user_notification_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->boolean('email_notifications_enabled')->default(true);
            $table->boolean('in_app_notifications_enabled')->default(true);
            $table->string('timezone')->default('UTC');
            $table->integer('default_reminder_offset')->default(30);
            $table->string('default_reminder_unit')->default('minutes');
            $table->timestamps();

            // Ensure one settings record per user
            $table->unique('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_notification_settings');
        Schema::dropIfExists('notification_logs');
        Schema::dropIfExists('notification_rules');
    }
};
