<?php

namespace App\Events\Exceptions;

use Exception;

/**
 * Event Validation Exception
 * 
 * Thrown when an event payload fails validation against its contract.
 * 
 * @package App\Events\Exceptions
 */
class EventValidationException extends Exception
{
    /**
     * The event name that failed validation
     */
    protected string $eventName;

    /**
     * The payload that failed validation
     */
    protected array $payload;

    /**
     * Validation errors
     */
    protected array $errors = [];

    /**
     * Create a new EventValidationException instance
     * 
     * @param string $message
     * @param int $code
     * @param \Throwable|null $previous
     * @param string $eventName
     * @param array $payload
     * @param array $errors
     */
    public function __construct(
        string $message = "",
        int $code = 0,
        ?\Throwable $previous = null,
        string $eventName = "",
        array $payload = [],
        array $errors = []
    ) {
        parent::__construct($message, $code, $previous);
        
        $this->eventName = $eventName;
        $this->payload = $payload;
        $this->errors = $errors;
    }

    /**
     * Get the event name that failed validation
     * 
     * @return string
     */
    public function getEventName(): string
    {
        return $this->eventName;
    }

    /**
     * Get the payload that failed validation
     * 
     * @return array
     */
    public function getPayload(): array
    {
        return $this->payload;
    }

    /**
     * Get validation errors
     * 
     * @return array
     */
    public function getErrors(): array
    {
        return $this->errors;
    }

    /**
     * Convert to array for logging or API responses
     * 
     * @return array
     */
    public function toArray(): array
    {
        return [
            'message' => $this->getMessage(),
            'event' => $this->eventName,
            'errors' => $this->errors,
            'payload' => $this->payload,
        ];
    }
}
