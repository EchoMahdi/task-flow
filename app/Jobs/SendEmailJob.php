<?php

namespace App\Jobs;

use App\Traits\JobTracking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * Generic email sending job for transactional emails.
 * 
 * Features:
 * - Supports multiple email templates
 * - Configurable retry strategy
 * - Detailed logging and tracking
 * - Prevents duplicate sends
 */
class SendEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, JobTracking;

    /**
     * Email recipient address.
     */
    protected string $to;

    /**
     * Email recipient name.
     */
    protected ?string $toName;

    /**
     * Email subject.
     */
    protected string $subject;

    /**
     * Email HTML content.
     */
    protected ?string $htmlContent;

    /**
     * Email text content (plain text fallback).
     */
    protected ?string $textContent;

    /**
     * Email view template name.
     */
    protected ?string $view;

    /**
     * View data for template.
     */
    protected array $viewData;

    /**
     * Email metadata for tracking.
     */
    protected array $metadata;

    /**
     * Maximum retry attempts.
     */
    public int $tries = 5;

    /**
     * Job timeout in seconds.
     */
    public int $timeout = 60;

    /**
     * Queue name.
     */
    public string $queue = 'emails';

    /**
     * Create a new email job instance.
     */
    public function __construct(
        string $to,
        ?string $toName,
        string $subject,
        ?string $htmlContent = null,
        ?string $textContent = null
    ) {
        $this->to = $to;
        $this->toName = $toName;
        $this->subject = $subject;
        $this->htmlContent = $htmlContent;
        $this->textContent = $textContent;
        $this->viewData = [];
        $this->metadata = [];
    }

    /**
     * Create email job from view template.
     */
    public static function fromView(
        string $to,
        ?string $toName,
        string $subject,
        string $view,
        array $viewData = []
    ): self {
        $job = new self($to, $toName, $subject);
        $job->view = $view;
        $job->viewData = $viewData;
        return $job;
    }

    /**
     * Add metadata for tracking.
     */
    public function withMetadata(array $metadata): self
    {
        $this->metadata = array_merge($this->metadata, $metadata);
        return $this;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $this->startTracking('emails');

        try {
            // Validate recipient
            if (!$this->isValidEmail($this->to)) {
                $this->fail("Invalid email address: {$this->to}");
                return;
            }

            // Send email
            $this->sendEmail();

            $this->complete([
                'to' => $this->to,
                'subject' => $this->subject,
                'sent_at' => now()->toIso8601String(),
                ...$this->metadata,
            ]);

        } catch (Throwable $e) {
            $this->handleFailure($e);
            throw $e; // Re-throw for queue worker to handle retry
        }
    }

    /**
     * Send the email.
     */
    protected function sendEmail(): void
    {
        if ($this->view) {
            // Use view template
            Mail::view($this->view, $this->viewData)
                ->to($this->to, $this->toName)
                ->subject($this->subject)
                ->send();
        } else {
            // Use raw HTML content
            Mail::html($this->htmlContent ?? '')
                ->to($this->to, $this->toName)
                ->subject($this->subject)
                ->send();
        }

        Log::channel('email')->info('Email sent successfully', [
            'to' => $this->to,
            'subject' => $this->subject,
            'job_id' => $this->getJobStatus()?->job_id,
        ]);
    }

    /**
     * Handle job failure.
     */
    protected function handleFailure(Throwable $e): void
    {
        $this->fail($e->getMessage(), $e->getTraceAsString());

        Log::channel('email')->error('Email sending failed', [
            'to' => $this->to,
            'subject' => $this->subject,
            'error' => $e->getMessage(),
            'attempts' => $this->getCurrentAttempt(),
        ]);

        // Determine if should retry
        if ($this->canRetry()) {
            $delay = $this->getRetryDelay();
            $this->release($delay);
        }
    }

    /**
     * Get retry delay based on attempt number.
     */
    protected function getRetryDelay(): int
    {
        $attempt = $this->getCurrentAttempt();
        return match ($attempt) {
            1 => 60,      // 1 minute
            2 => 300,     // 5 minutes
            3 => 900,     // 15 minutes
            4 => 1800,    // 30 minutes
            default => 3600, // 1 hour
        };
    }

    /**
     * Validate email address.
     */
    protected function isValidEmail(string $email): bool
    {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    /**
     * Get unique ID for this job (prevent duplicates).
     */
    public function uniqueId(): string
    {
        return 'email_' . md5($this->to . $this->subject . ($this->metadata['type'] ?? 'generic'));
    }

    /**
     * Get tags for monitoring.
     */
    public function tags(): array
    {
        return ['email', $this->metadata['type'] ?? 'generic', $this->to];
    }
}
