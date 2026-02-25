<?php

namespace App\Authorization\Builders;

use App\Authorization\DTOs\PermissionContext;
use App\Models\User;

/**
 * Permission Context Builder
 *
 * Provides a fluent interface for building permission contexts.
 */
class PermissionContextBuilder
{
    protected string $permission;
    protected ?User $user = null;
    protected mixed $resource = null;
    protected ?string $scope = null;
    protected ?int $scopeId = null;
    protected array $metadata = [];

    /**
     * Create a new builder instance.
     *
     * @param string $permission
     */
    public function __construct(string $permission)
    {
        $this->permission = $permission;
    }

    /**
     * Set the user for the context.
     *
     * @param User $user
     * @return static
     */
    public function forUser(User $user): static
    {
        $this->user = $user;
        return $this;
    }

    /**
     * Set the resource for the context.
     *
     * @param object $resource
     * @return static
     */
    public function forResource(object $resource): static
    {
        $this->resource = $resource;
        return $this;
    }

    /**
     * Set the scope for the context.
     *
     * @param string $scope
     * @param int|null $scopeId
     * @return static
     */
    public function inScope(string $scope, ?int $scopeId = null): static
    {
        $this->scope = $scope;
        $this->scopeId = $scopeId;
        return $this;
    }

    /**
     * Set the project scope.
     *
     * @param int $projectId
     * @return static
     */
    public function inProject(int $projectId): static
    {
        return $this->inScope('project', $projectId);
    }

    /**
     * Set the team scope.
     *
     * @param int $teamId
     * @return static
     */
    public function inTeam(int $teamId): static
    {
        return $this->inScope('team', $teamId);
    }

    /**
     * Set the workspace scope.
     *
     * @param int $workspaceId
     * @return static
     */
    public function inWorkspace(int $workspaceId): static
    {
        return $this->inScope('workspace', $workspaceId);
    }

    /**
     * Set as global scope.
     *
     * @return static
     */
    public function global(): static
    {
        $this->scope = 'global';
        return $this;
    }

    /**
     * Add metadata to the context.
     *
     * @param string $key
     * @param mixed $value
     * @return static
     */
    public function withMetadata(string $key, mixed $value): static
    {
        $this->metadata[$key] = $value;
        return $this;
    }

    /**
     * Add multiple metadata values.
     *
     * @param array $metadata
     * @return static
     */
    public function withMetadataArray(array $metadata): static
    {
        $this->metadata = array_merge($this->metadata, $metadata);
        return $this;
    }

    /**
     * Build the permission context.
     *
     * @return PermissionContext
     * @throws \RuntimeException If user is not set
     */
    public function build(): PermissionContext
    {
        if ($this->user === null) {
            throw new \RuntimeException('User must be set for permission context.');
        }

        return new PermissionContext(
            permission: $this->permission,
            user: $this->user,
            resource: $this->resource,
            scope: $this->scope,
            scopeId: $this->scopeId,
            metadata: $this->metadata
        );
    }

    /**
     * Build and evaluate the permission.
     *
     * @return bool
     */
    public function evaluate(): bool
    {
        $context = $this->build();
        return \App\Facades\Authorization::evaluateContext($context);
    }

    /**
     * Build and authorize (throws exception if not authorized).
     *
     * @return void
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function authorize(): void
    {
        if (!$this->evaluate()) {
            throw new \Illuminate\Auth\Access\AuthorizationException(
                "You do not have permission to perform this action."
            );
        }
    }
}