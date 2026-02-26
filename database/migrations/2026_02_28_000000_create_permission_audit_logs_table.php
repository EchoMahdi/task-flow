<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Creates the permission_audit_logs table to track WHO changed
     * a role/permission, FOR WHOM, and WHEN for security compliance.
     */
    public function up(): void
    {
        Schema::create('permission_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('admin_id')->comment('The admin user who performed the action');
            $table->unsignedBigInteger('target_user_id')->nullable()->comment('The user whose permissions were changed');
            $table->string('action')->comment('Action type: granted, revoked, synced_role, synced_permission');
            $table->string('role_or_permission_name')->comment('Name of the role or permission that was changed');
            $table->string('action_type')->default('permission')->comment('Whether this was a role or permission change');
            $table->json('metadata')->nullable()->comment('Additional context like old/new values');
            $table->timestamp('created_at')->useCurrent();

            // Indexes for efficient querying
            $table->index('admin_id', 'idx_audit_admin');
            $table->index('target_user_id', 'idx_audit_target_user');
            $table->index('action', 'idx_audit_action');
            $table->index('created_at', 'idx_audit_created_at');
            $table->index(['target_user_id', 'created_at'], 'idx_audit_user_created');
            $table->index(['admin_id', 'created_at'], 'idx_audit_admin_created');

            // Foreign keys
            $table->foreign('admin_id')
                ->references('id')
                ->on('users')
                ->onDelete('restrict');

            $table->foreign('target_user_id')
                ->references('id')
                ->on('users')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permission_audit_logs');
    }
};
