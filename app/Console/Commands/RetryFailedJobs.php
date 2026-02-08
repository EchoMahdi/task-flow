<?php

namespace App\Console\Commands;

use App\Services\QueueManager;
use Illuminate\Console\Command;

class RetryFailedJobs extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'queue:retry-failed 
                            {--all : Retry all failed jobs (default: last 24h)}
                            {--hours= : Retry jobs from specific hours ago}
                            {--dry-run : Show what would be done without executing}';

    /**
     * The console command description.
     */
    protected $description = 'Retry failed queue jobs';

    /**
     * Queue manager instance.
     */
    protected QueueManager $queueManager;

    /**
     * Create a new command instance.
     */
    public function __construct(QueueManager $queueManager)
    {
        parent::__construct();
        $this->queueManager = $queueManager;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $dryRun = $this->option('dry-run');
        $retryAll = $this->option('all');
        $hours = (int) $this->option('hours');

        if ($hours > 0) {
            $hoursOption = $hours;
        } elseif ($retryAll) {
            $hoursOption = 0; // All
        } else {
            $hoursOption = 24; // Default: last 24 hours
        }

        // Get failed jobs
        $failedStats = $this->queueManager->getFailedJobStats();
        
        if ($hoursOption > 0) {
            $count = \Illuminate\Support\Facades\DB::table('failed_jobs')
                ->where('created_at', '>', now()->subHours($hoursOption))
                ->count();
            $this->info("Found {$count} failed jobs from last {$hoursOption} hours");
        } else {
            $count = $failedStats['total'];
            $this->info("Found {$count} total failed jobs");
        }

        if ($count === 0) {
            $this->info('No failed jobs to retry');
            return Command::SUCCESS;
        }

        if ($dryRun) {
            $this->warn("DRY RUN: Would retry {$count} jobs");
            return Command::SUCCESS;
        }

        // Retry failed jobs
        $this->info('Retrying failed jobs...');

        try {
            if ($hoursOption > 0) {
                $this->retryJobsFromHours($hoursOption);
            } elseif ($retryAll) {
                $this->retryAllJobs();
            } else {
                $this->retryJobsFromHours(24);
            }

            $this->info('Successfully queued failed jobs for retry');
            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error("Error retrying jobs: {$e->getMessage()}");
            return Command::FAILURE;
        }
    }

    /**
     * Retry all jobs.
     */
    protected function retryAllJobs(): void
    {
        $failedIds = \Illuminate\Support\Facades\DB::table('failed_jobs')
            ->pluck('id');

        foreach ($failedIds as $id) {
            \Illuminate\Support\Facades\Artisan::call("queue:retry {$id}");
        }
    }

    /**
     * Retry jobs from specified hours.
     */
    protected function retryJobsFromHours(int $hours): void
    {
        $failedIds = \Illuminate\Support\Facades\DB::table('failed_jobs')
            ->where('created_at', '>', now()->subHours($hours))
            ->pluck('id');

        foreach ($failedIds as $id) {
            \Illuminate\Support\Facades\Artisan::call("queue:retry {$id}");
            $this->line("Retried job: {$id}");
        }
    }
}
