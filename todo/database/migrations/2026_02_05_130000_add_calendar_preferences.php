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
            // Add calendar-specific preferences only if they don't exist
            if (!Schema::hasColumn('user_preferences', 'calendar_type')) {
                $table->string('calendar_type', 20)->default('gregorian')->after('language');
            }
            if (!Schema::hasColumn('user_preferences', 'date_format')) {
                $table->string('date_format', 50)->default('YYYY/MM/DD')->after('calendar_type');
            }
            if (!Schema::hasColumn('user_preferences', 'time_format')) {
                $table->string('time_format', 20)->default('HH:mm')->after('date_format');
            }
            if (!Schema::hasColumn('user_preferences', 'first_day_of_week')) {
                $table->string('first_day_of_week', 10)->default('saturday')->after('time_format');
            }
            if (!Schema::hasColumn('user_preferences', 'show_week_numbers')) {
                $table->boolean('show_week_numbers')->default(false)->after('first_day_of_week');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_preferences', function (Blueprint $table) {
            $table->dropColumn([
                'calendar_type',
                'date_format',
                'time_format',
                'first_day_of_week',
                'show_week_numbers',
            ]);
        });
    }
};
