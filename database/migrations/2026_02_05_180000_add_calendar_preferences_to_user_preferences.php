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
            if (!Schema::hasColumn('user_preferences', 'calendar_type')) {
                $table->string('calendar_type')->default('gregorian')->after('language');
            }
            if (!Schema::hasColumn('user_preferences', 'show_week_numbers')) {
                $table->boolean('show_week_numbers')->default(false)->after('default_task_view');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_preferences', function (Blueprint $table) {
            $table->dropColumn(['calendar_type', 'show_week_numbers']);
        });
    }
};
