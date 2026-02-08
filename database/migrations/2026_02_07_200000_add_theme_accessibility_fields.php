<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Adds accessibility and advanced theme preference fields to user_preferences table.
     */
    public function up(): void
    {
        Schema::table('user_preferences', function (Blueprint $table) {
            // Extended theme settings
            $table->string('theme_mode', 20)->default('system')->after('theme');
            $table->string('app_locale', 10)->default('en')->after('language');
            
            // Accessibility preferences
            $table->boolean('reduced_motion')->default(false);
            $table->boolean('high_contrast')->default(false);
            $table->decimal('font_scale', 3, 2)->default(1.00);
            
            // Color customization (optional extension)
            $table->string('primary_color', 7)->nullable()->after('font_scale');
            $table->string('accent_color', 7)->nullable()->after('primary_color');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_preferences', function (Blueprint $table) {
            $table->dropColumn([
                'theme_mode',
                'app_locale',
                'reduced_motion',
                'high_contrast',
                'font_scale',
                'primary_color',
                'accent_color',
            ]);
        });
    }
};
