<?php

namespace App\Events\Contracts;

/**
 * Event Contract Interface
 * 
 * Defines the contract for event validation and transformation.
 * Each event type should implement this interface to ensure
 * payload consistency and validation.
 * 
 * @package App\Events\Contracts
 */
interface EventContract
{
    /**
     * Validate the event payload
     * 
     * @param array $payload
     * @return bool True if payload is valid, false otherwise
     */
    public function validate(array $payload): bool;

    /**
     * Transform the event payload to the expected format
     * 
     * @param array $payload
     * @return array Transformed payload
     */
    public function transform(array $payload): array;

    /**
     * Get the required fields for this event
     * 
     * @return string[]
     */
    public function getRequiredFields(): array;

    /**
     * Get the event name this contract handles
     * 
     * @return string
     */
    public function getEventName(): string;
}
