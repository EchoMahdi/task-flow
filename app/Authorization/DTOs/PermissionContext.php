<?php

namespace App\Authorization\DTOs;

/**
 * Data Transfer Object for Permission Context.
 *
 * Encapsulates all context needed for permission evaluation.
 */
class PermissionContext
{
    /**
     * @param string $permission The permission to check
     * @param \App\Models\User $user The user to check for
     * @param mixed $resource The resource being accessed (model instance or null)
     * @param string|null $scope The scope (global, project, team, workspace)
     * @param int|null $scopeId The scope entity ID
     * @param array<string, mixed> $metadata Additional metadata
     */
    public function __construct(
        public readonly string $permission,
        public readonly \App\Models\User $user,
        public readonly mixed $resource = null,
        public readonly ?string $scope = null,
        public readonly ?int $scopeId = null,
        public readonly array $metadata = []
    ) {}

    /**
     * Create from a resource model.
     *
     * @param string $permission
     * @param \App\Models\User $user
     * @param object $resource
     * @return static
     */
    public static function fromResource(string $permission, \App\Models\User $user, object $resource): static
    {
        $scope = null;
        $scopeId = null;

        // Extract scope from resource if it implements AuthorizableInterface
        if ($resource instanceof \App\Authorization\Contracts\AuthorizableInterface) {
            $context = $resource->getAuthorizationContext();
            $scope = $context['scope'] ?? $resource->getPermissionScope();
            $scopeId = $context['scope_id'] ?? null;
        }

        return new static(
            permission: $permission,
            user: $user,
            resource: $resource,
            scope: $scope,
            scopeId: $scopeId
        );
    }

    /**
     * Create for a specific scope.
     *
     * @param string $permission
     * @param \App\Models\User $user
     * @param string $scope
     * @param int $scopeId
     * @return static
     */
    public static function forScope(string $permission, \App\Models\User $user, string $scope, int $scopeId): static
    {
        return new static(
            permission: $permission,
            user: $user,
            scope: $scope,
            scopeId: $scopeId
        );
    }

    /**
     * Create for global scope.
     *
     * @param string $permission
     * @param \App\Models\User $user
     * @return static
     */
    public static function global(string $permission, \App\Models\User $user): static
    {
        return new static(
            permission: $permission,
            user: $user,
            scope: 'global'
        );
    }

    /**
     * Check if this context has a resource.
     *
     * @return bool
     */
    public function hasResource(): bool
    {
        return $this->resource !== null;
    }

    /**
     * Check if this context has a scope.
     *
     * @return bool
     */
    public function hasScope(): bool
    {
        return $this->scope !== null;
    }

    /**
     * Check if this is a global scope context.
     *
     * @return bool
     */
    public function isGlobal(): bool
    {
        return $this->scope === 'global' || $this->scope === null;
    }

    /**
     * Get a metadata value.
     *
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    public function getMetadata(string $key, mixed $default = null): mixed
    {
        return $this->metadata[$key] ?? $default;
    }

    /**
     * Create a copy with additional metadata.
     *
     * @param array<string, mixed> $metadata
     * @return static
     */
    public function withMetadata(array $metadata): static
    {
        return new static(
            permission: $this->permission,
            user: $this->user,
            resource: $this->resource,
            scope: $this->scope,
            scopeId: $this->scopeId,
            metadata: array_merge($this->metadata, $metadata)
        );
    }
}