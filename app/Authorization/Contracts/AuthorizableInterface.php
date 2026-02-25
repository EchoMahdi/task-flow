<?php

namespace App\Authorization\Contracts;

/**
 * Interface for models that can be authorized.
 *
 * Models implementing this interface can define their own
 * authorization rules and ownership logic.
 */
interface AuthorizableInterface
{
    /**
     * Get the owner of this entity.
     *
     * @return \App\Models\User|null
     */
    public function getOwner(): ?\App\Models\User;

    /**
     * Get the owner ID of this entity.
     *
     * @return int|null
     */
    public function getOwnerId(): ?int;

    /**
     * Check if the given user is the owner.
     *
     * @param \App\Models\User $user
     * @return bool
     */
    public function isOwnedBy(\App\Models\User $user): bool;

    /**
     * Get the scope context for this entity (e.g., project, team).
     *
     * @return array<string, mixed>
     */
    public function getAuthorizationContext(): array;

    /**
     * Get the permission scope for this entity.
     * Returns the scope identifier (e.g., 'project', 'team', 'global').
     *
     * @return string
     */
    public function getPermissionScope(): string;
}