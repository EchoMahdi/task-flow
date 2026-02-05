<?php

namespace App\Console\Commands;

use App\Services\QueueManager;
use Illuminate\Console\Command;

class MonitorQueue extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'queue:monitor 
                            {--verbose : Show detailed output}
                            {--json : Output as JSON}
                            {--check : Only check health, no alerts}';

    /**
     * The console command description.
     */
    protected $description = 'Monitor queue health and display statistics';

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
        $json = $this->option('json');
        $verbose = $this->option('verbose');
        $checkOnly = $this->option('check');

        // Get all statistics
        $queueStatus = $this->queueManager->getQueueStatus();
        $jobStats = $this->queueManager->getJobStatusStats();
        $failedStats = $this->queueManager->getFailedJobStats();
        $performance = $this->queueManager->getPerformanceMetrics();

        if ($checkOnly) {
            return $this->queueManager->isHealthy() 
                ? Command::SUCCESS 
                : Command::FAILURE;
        }

        if ($json) {
            $this->output->writeln(json_encode([
                'timestamp' => now()->toIso8601String(),
                'queues' => $queueStatus,
                'job_stats' => $jobStats,
                'failed_jobs' => $failedStats,
                'performance' => $performance,
                'healthy' => $this->queueManager->isHealthy(),
            ], JSON_PRETTY_PRINT));
            return Command::SUCCESS;
        }

        // Display summary table
        $this->info('Queue Health Monitor');
        $this->line('==================');
        $this->newLine();

        // Queue status
        $this->info('Queue Status:');
        $queueTable = [];
        foreach ($queueStatus as $queue => $data) {
            if ($queue === 'total') continue;
            $queueTable[] = [
                'Queue' => $queue,
                'Pending' => $data['pending'],
                'Processing' => $data['processing'],
            ];
        }
        $queueTable[] = [
            'Queue' => 'TOTAL',
            'Pending' => $queueStatus['total']['pending'],
            'Processing' => $queueStatus['total']['processing'],
        ];
        $this->table(['Queue', 'Pending', 'Processing'], $queueTable);
        $this->newLine();

        // Job statistics
        $this->info('Job Statistics:');
        $this->line("  Pending:    {$jobStats['pending']}");
        $this->line("  Processing: {$jobStats['processing']}");
        $this->line("  Completed:  {$jobStats['completed']}");
        $this->line("  Failed:     {$jobStats['failed']}");
        $this->line("  Retrying:   {$jobStats['retrying']}");
        $this->warn("  Stuck:      {$jobStats['stuck']}");
        $this->newLine();

        // Failed jobs
        $this->info('Failed Jobs:');
        $this->line("  Total:       {$failedStats['total']}");
        $this->line("  Last 24h:    {$failedStats['recent_24h']}");
        $this->line("  Last 1h:     {$failedStats['recent_1h']}");
        $this->newLine();

        // Performance metrics
        if ($verbose) {
            $this->info('Performance (24h):');
            $this->line("  Completed:  {$performance['jobs_completed_24h']} jobs");
            $this->line("  Avg Duration: " . round($performance['avg_duration_seconds'], 2) . 's');
            $this->line("  Min Duration: " . round($performance['min_duration_seconds'], 2) . 's');
            $this->line("  Max Duration: " . round($performance['max_duration_seconds'], 2) . 's');
            $this->line("  Median:      " . round($performance['median_duration_seconds'], 2) . 's');
            $this->newLine();
        }

        // Health status
        $healthy = $this->queueManager->isHealthy();
        if ($healthy) {
            $this->info('✓ Queue is healthy');
            return Command::SUCCESS;
        } else {
            $this->error('✗ Queue health check failed');
            return Command::FAILURE;
        }
    }
}
