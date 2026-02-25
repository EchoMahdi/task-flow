<?php

namespace App\Authorization\Strategies;

use App\Authorization\Contracts\PermissionStrategyInterface;
use App\Authorization\DTOs\PermissionContext;
use App\Models\User;
use Illuminate\Support\Facades\Gate;

/**
 * Custom Policy Strategy
 *
 * Evaluates permissions using Laravel's Gate/Policies.
 * This strategy integrates with Laravel's native authorization system.
 *
 * Priority: 50 (lower priority - used as fallback)
 */
class CustomPolicyStrategy implements PermissionStrategyInterface
{
    /**
     * Strategy name.
     */
    public const NAME = 'custom_policy';

    /**
     * Strategy priority.
     */
    public const PRIORITY = 50;

    /**
     * Custom policy callbacks.
     *
     * @var array<string, callable>
     */
    protected array $policies = [];

    /**
     * Check if this strategy supports the given permission.
     *
     * @param string $permission
     * @param mixed $context
     * @return bool
     */
    public function supports(string $permission, mixed $context = null): bool
    {
        // Check if we have a registered custom policy
        if (isset($this->policies[$permission])) {
            return true;
        }

        // Check if Laravel Gate has a policy for this
        if ($context !== null && is_object($context)) {
            $resource = $context instanceof PermissionContext ? $context->resource : $context;
            if ($resource && $this->hasGatePolicy($permission, $resource)) {
                return true;
            }
        }

        // Check for ability-based permissions
        return Gate::has($permission);
    }

    /**
     * Evaluate using custom policies.
     *
     * @param User $user
     * @param string $permission
     * @param mixed $context
     * @return bool
     */
    public function evaluate(User $user, string $permission, mixed $context = null): bool
    {
        // Check registered custom policies first
        if (isset($this->policies[$permission])) {
            $result = call_user_func($this->policies[$permission], $user, $context);
            return (bool) $result;
        }

        // Use Laravel Gate
        $resource = $this->extractResource($context);

        try {
            if ($resource) {
                return Gate::forUser($user)->allows($permission, $resource);
            }

            return Gate::forUser($user)->allows($permission);
        } catch (\Exception $e) {
            // If Gate throws an exception, the policy doesn't exist
            return false;
        }
    }

    /**
     * Get the strategy name.
     *
     * @return string
     */
    public function getName(): string
    {
        return self::NAME;
    }

    /**
     * Get the strategy priority.
     *
     * @return int
     */
    public function getPriority(): int
    {
        return self::PRIORITY;
    }

    /**
     * Register a custom policy callback.
     *
     * @param string $permission
     * @param callable $callback
     * @return static
     */
    public function registerPolicy(string $permission, callable $callback): static
    {
        $this->policies[$permission] = $callback;
        
        return $this;
    }

    /**
     * Register multiple policies.
     *
     * @param array<string, callable> $policies
     * @return static
     */
    public function registerPolicies(array $policies): static
    {
        foreach ($policies as $permission => $callback) {
            $this->registerPolicy($permission, $callback);
        }
        
        return $this;
    }

    /**
     * Remove a registered policy.
     *
     * @param string $permission
     * @return static
     */
    public function removePolicy(string $permission): static
    {
        unset($this->policies[$permission]);
        
        return $this;
    }

    /**
     * Check if a policy is registered.
     *
     * @param string $permission
     * @return bool
     */
    public function hasPolicy(string $permission): bool
    {
        return isset($this->policies[$permission]);
    }

    /**
     * Get all registered policies.
     *
     * @return array<string, callable>
     */
    public function getPolicies(): array
    {
        return $this->policies;
    }

    /**
     * Check if Laravel Gate has a policy for the resource.
     *
     * @param string $ability
     * @param object $resource
     * @return bool
     */
    protected function hasGatePolicy(string $ability, object $resource): bool
    {
        try {
            // Check if there's a policy registered for this resource
            $policy = Gate::getPolicyFor($resource);
            return $policy !== null && method_exists($policy, $ability);
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Extract resource from context.
     *
     * @param mixed $context
     * @return object|null
     */
    protected function extractResource(mixed $context): ?object
    {
        if ($context instanceof PermissionContext) {
            return $context->resource;
        }

        if (is_object($context)) {
            return $context;
        }

        return null;
    }

    /**
     * Create a policy for project-level permissions.
     *
     * @param string $permission
     * @param string $projectPermission
     * @return static
     */
    public function registerProjectPolicy(string $permission, string $projectPermission): static
    {
        return $this->registerPolicy($permission, function (User $user, $context) use ($projectPermission) {
            $resource = $context instanceof PermissionContext ? $context->resource : $context;
            
            if (!$resource || !isset($resource->project_id)) {
                return false;
            }

            $project = $resource->project ?? \App\Models\Project::find($resource->project_id);
            
            if (!$project) {
                return false;
            }

            // Check if user has permission in the project context
            return $user->hasPermission("project.{$projectPermission}") ||
                   $project->user_id === $user->id;
        });
    }

    /**
     * Create a policy for team-level permissions.
     *
     * @param string $permission
     * @param string $teamRole
     * @return static
     */
    public function registerTeamPolicy(string $permission, string $teamRole): static
    {
        return $this->registerPolicy($permission, function (User $user, $context) use ($teamRole) {
            $resource = $context instanceof PermissionContext ? $context->resource : $context;
            
            if (!$resource || !isset($resource->team_id)) {
                return false;
            }

            $team = $resource->team ?? \App\Models\Team::find($resource->team_id);
            
            if (!$team) {
                return false;
            }

            // Check user's role in the team
            $memberRole = $team->getMemberRole($user);
            
            if (!$memberRole) {
                return false;
            }

            $roleHierarchy = [
                'owner' => 3,
                'admin' => 2,
                'member' => 1,
            ];

            return ($roleHierarchy[$memberRole] ?? 0) >= ($roleHierarchy[$teamRole] ?? 0);
        });
    }
}