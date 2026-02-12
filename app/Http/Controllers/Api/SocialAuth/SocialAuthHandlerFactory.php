<?php

namespace App\Http\Controllers\Api\SocialAuth;

use App\Services\AuthService;
use InvalidArgumentException;

class SocialAuthHandlerFactory
{
    protected AuthService $authService;
    protected array $handlers = [];

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
        $this->registerDefaultHandlers();
    }

    /**
     * Register the default handlers.
     */
    protected function registerDefaultHandlers(): void
    {
        $this->handlers['google'] = new GoogleSocialAuthHandler($this->authService);
        $this->handlers['github'] = new GitHubSocialAuthHandler($this->authService);
    }

    /**
     * Get a handler for the given provider.
     */
    public function getHandler(string $provider): SocialAuthHandlerInterface
    {
        if (!isset($this->handlers[$provider])) {
            throw new InvalidArgumentException("Provider [{$provider}] is not supported.");
        }

        return $this->handlers[$provider];
    }

    /**
     * Check if a provider is supported.
     */
    public function supports(string $provider): bool
    {
        return isset($this->handlers[$provider]);
    }

    /**
     * Get all supported providers.
     */
    public function getSupportedProviders(): array
    {
        return array_keys($this->handlers);
    }

    /**
     * Register a new handler.
     */
    public function registerHandler(string $provider, SocialAuthHandlerInterface $handler): self
    {
        $this->handlers[$provider] = $handler;
        return $this;
    }
}
