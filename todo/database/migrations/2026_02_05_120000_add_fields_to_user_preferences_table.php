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
        Schema::table('user_preferences', function (Blueprint $table) {
            $table->boolean('task_reminders')->default(true)->after('push_notifications');
            $table->boolean('daily_digest')->default(false)->after('task_reminders');
            $table->boolean('weekly_report')->default(true)->after('daily_digest');
            $table->string('default_task_view')->default('list')->after('start_of_week');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_preferences', function (Blueprint $table) {
            $table->dropColumn(['task_reminders', 'daily_digest', 'weekly_report', 'default_task_view']);
        });
    }
};
