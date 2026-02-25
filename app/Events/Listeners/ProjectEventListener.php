<?php

namespace App\Events\Listeners;

use Illuminate\Support\Facades\Log;

/**
 * Project Event Listener
 * 
 * Handles project-related events.
 * 
 * @package App\Events\Listeners
 */
class ProjectEventListener
{
    /**
     * Handle project created event
     * 
     * @param array $payload
     * @return void
     */
    public function handleProjectCreated(array $payload): void
    {
        Log::info('Project created via event system', [
            'projectId' => $payload['projectId'] ?? null,
            'name' => $payload['name'] ?? null,
            'source' => $payload['source'] ?? 'unknown',
        ]);
    }

    /**
     * Handle project updated event
     * 
     * @param array $payload
     * @return void
     */
    public function handleProjectUpdated(array $payload): void
    {
        Log::info('Project updated via event system', [
            'projectId' => $payload['projectId'] ?? null,
            'changes' => $payload['changes'] ?? [],
            'source' => $payload['source'] ?? 'unknown',
        ]);
    }

    /**
     * Handle project deleted event
     * 
     * @param array $payload
     * @return void
     */
    public function handleProjectDeleted(array $payload): void
    {
        Log::info('Project deleted via event system', [
            'projectId' => $payload['projectId'] ?? null,
            'source' => $payload['source'] ?? 'unknown',
        ]);
    }

    /**
     * Handle project archived event
     * 
     * @param array $payload
     * @return void
     */
    public function handleProjectArchived(array $payload): void
    {
        Log::info('Project archived via event system', [
            'projectId' => $payload['projectId'] ?? null,
            'source' => $payload['source'] ?? 'unknown',
        ]);
    }

    /**
     * Handle project restored event
     * 
     * @param array $payload
     * @return void
     */
    public function handleProjectRestored(array $payload): void
    {
        Log::info('Project restored via event system', [
            'projectId' => $payload['projectId'] ?? null,
            'source' => $payload['source'] ?? 'unknown',
        ]);
    }
}
