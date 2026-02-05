<?php

namespace App\Console;

use App\Console\Commands\MonitorQueue;
use App\Console\Commands\ProcessNotificationReminders;
use App\Console\Commands\RetryFailedJobs;
use App\Services\QueueManager;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');

        // Register additional commands
        $this->commands([
            MonitorQueue::class,
            RetryFailedJobs::class,
        ]);
    }

    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Process notification reminders every 5 minutes
        // This ensures timely delivery while being efficient
        $schedule->command(ProcessNotificationReminders::class)
            ->everyFiveMinutes()
            ->withoutOverlapping()
            ->runInBackground()
            ->onOneServer()
            ->appendOutputTo(storage_path('logs/scheduler.log'))
            ->onSuccess(function () {
                // Log successful execution
                \Illuminate\Support\Facades\Log::channel('scheduler')
                    ->info('Notification processing completed successfully');
            })
            ->onFailure(function () {
                // Alert on failure
                \Illuminate\Support\Facades\Log::channel('alerts')
                    ->error('Notification processing failed');
            });

        // Monitor queue health every minute
        $schedule->command(MonitorQueue::class, ['--check' => true])
            ->everyMinute()
            ->withoutOverlapping()
            ->runInBackground()
            ->onOneServer();

        // Detailed queue monitoring every 5 minutes
        $schedule->command(MonitorQueue::class)
            ->everyFiveMinutes()
            ->withoutOverlapping()
            ->appendOutputTo(storage_path('logs/queue-monitor.log'));

        // Retry failed jobs every hour
        $schedule->command(RetryFailedJobs::class)
            ->hourly()
            ->withoutOverlapping()
            ->appendOutputTo(storage_path('logs/queue-retry.log'))
            ->onOneServer();

        // Clear old failed jobs daily at 2 AM
        $schedule->command('queue:flush')
            ->dailyAt('02:00')
            ->withoutOverlapping()
            ->onOneServer();

        // Restart queue workers daily at 3 AM (prevent memory leaks)
        $schedule->command('queue:restart')
            ->dailyAt('03:00')
            ->onOneServer();
    }

    /**
     * Register the commands for the application.
     */
    protected function scheduleTimezone(): \DateTimeZone
    {
        return new \DateTimeZone(config('app.timezone', 'UTC'));
    }
}
