<?php

namespace App\Console\Commands;

use App\Jobs\HeavyProcessingJob;
use Illuminate\Support\Facades\DB;

/**
 * Example Heavy Processing Job: Generate Report
 * 
 * This demonstrates how to extend HeavyProcessingJob for
 * resource-intensive operations like report generation.
 */
class GenerateReportJob extends HeavyProcessingJob
{
    /**
     * Report type to generate.
     */
    protected string $reportType;

    /**
     * Date range for the report.
     */
    protected string $startDate;
    protected string $endDate;

    /**
     * User ID who requested the report.
     */
    protected ?int $userId;

    /**
     * Create a new job instance.
     */
    public function __construct(
        string $reportType,
        string $startDate,
        string $endDate,
        ?int $userId = null
    ) {
        $this->reportType = $reportType;
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->userId = $userId;
    }

    /**
     * Process a chunk of data.
     */
    protected function processChunk(array $chunk): array
    {
        $results = [];

        foreach ($chunk as $item) {
            // Process each item
            $results[] = [
                'item_id' => $item['id'],
                'processed' => true,
                'data' => $this->processItem($item),
            ];
        }

        return $results;
    }

    /**
     * Process a single item.
     */
    protected function processItem(array $item): array
    {
        // Example: Aggregate data for report
        return [
            'value' => $item['value'] * 1.1,
            'timestamp' => now()->toIso8601String(),
        ];
    }

    /**
     * Get total number of items to process.
     */
    protected function getTotalItems(): int
    {
        return DB::table('report_data')
            ->whereBetween('created_at', [$this->startDate, $this->endDate])
            ->count();
    }

    /**
     * Get items to process.
     */
    protected function getItems(): array
    {
        return DB::table('report_data')
            ->whereBetween('created_at', [$this->startDate, $this->endDate])
            ->select(['id', 'value', 'created_at'])
            ->get()
            ->toArray();
    }

    /**
     * Get unique job ID.
     */
    public function uniqueId(): string
    {
        return "report_{$this->reportType}_{$this->startDate}_{$this->endDate}";
    }

    /**
     * Get tags for monitoring.
     */
    public function tags(): array
    {
        return ['report', $this->reportType, $this->userId ? "user_{$this->userId}" : 'system'];
    }
}
