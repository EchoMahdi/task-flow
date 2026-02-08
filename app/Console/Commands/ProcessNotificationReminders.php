<?php

namespace App\Console\Commands;

use App\Services\NotificationService;
use Illuminate\Console\Command;

class ProcessNotificationReminders extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'notifications:process {--dry-run : Run without actually sending notifications}';

    /**
     * The console command description.
     */
    protected $description = 'Process due notification reminders and dispatch jobs';

    /**
     * The notification service instance.
     */
    protected NotificationService $notificationService;

    /**
     * Create a new command instance.
     */
    public function __construct(NotificationService $notificationService)
    {
        parent::__construct();
        $this->notificationService = $notificationService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $dryRun = $this->option('dry-run');
        
        $this->info('Starting notification processing...');
        
        if ($dryRun) {
            $this->warn('DRY RUN MODE - No notifications will be sent');
        }

        try {
            if ($dryRun) {
                // In dry run mode, just count what would be sent
                $dueRules = $this->getDueRulesCount();
                $this->info("Found {$dueRules} rules that would be processed");
                return Command::SUCCESS;
            }

            $dispatched = $this->notificationService->dispatchDueNotifications();
            
            $this->info("Successfully dispatched {$dispatched} notification jobs");
            
            return Command::SUCCESS;
            
        } catch (\Exception $e) {
            $this->error('Error processing notifications: ' . $e->getMessage());
            
            return Command::FAILURE;
        }
    }

    /**
     * Get count of due rules (for dry run).
     */
    protected function getDueRulesCount(): int
    {
        return \App\Models\NotificationRule::where('is_enabled', true)
            ->whereDoesntHave('notificationLogs', function ($query) {
                $query->where('status', 'sent')
                    ->where('created_at', '>', now()->subHours(1));
            })
            ->count();
    }
}
