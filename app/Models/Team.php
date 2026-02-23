<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Team Model
 * 
 * Represents a team that can own projects and have multiple members.
 * 
 * @property int $id
 * @property int $owner_id
 * @property string $name
 * @property string|null $description
 * @property string|null $avatar
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 */
class Team extends Model
{
    use HasFactory;

    /**
     * Available member roles.
     */
    public const ROLES = [
        'owner' => 'Owner',
        'admin' => 'Admin',
        'member' => 'Member',
    ];

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'owner_id',
        'name',
        'description',
        'avatar',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'owner_id' => 'integer',
    ];

    /**
     * Get the owner of the team.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Get all team members.
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'team_user')
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * Get all projects owned by this team.
     */
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    /**
     * Get team admins (members with admin or owner role).
     */
    public function admins(): BelongsToMany
    {
        return $this->members()
            ->whereIn('team_user.role', ['owner', 'admin']);
    }

    /**
     * Check if a user is a member of this team.
     */
    public function hasMember(User $user): bool
    {
        return $this->members()->where('users.id', $user->id)->exists();
    }

    /**
     * Get a user's role in this team.
     */
    public function getMemberRole(User $user): ?string
    {
        $member = $this->members()->where('users.id', $user->id)->first();
        return $member?->pivot->role;
    }

    /**
     * Check if a user is an owner of this team.
     */
    public function isOwner(User $user): bool
    {
        return $this->owner_id === $user->id;
    }

    /**
     * Check if a user is an admin (owner or admin role) of this team.
     */
    public function isAdmin(User $user): bool
    {
        $role = $this->getMemberRole($user);
        return in_array($role, ['owner', 'admin']);
    }

    /**
     * Add a member to the team.
     */
    public function addMember(User $user, string $role = 'member'): void
    {
        if (!$this->hasMember($user)) {
            $this->members()->attach($user->id, ['role' => $role]);
        }
    }

    /**
     * Remove a member from the team.
     */
    public function removeMember(User $user): void
    {
        $this->members()->detach($user->id);
    }

    /**
     * Update a member's role.
     */
    public function updateMemberRole(User $user, string $role): void
    {
        if ($this->hasMember($user)) {
            $this->members()->updateExistingPivot($user->id, ['role' => $role]);
        }
    }

    /**
     * Get the member count.
     */
    public function getMemberCountAttribute(): int
    {
        return $this->members()->count();
    }

    /**
     * Get the project count.
     */
    public function getProjectCountAttribute(): int
    {
        return $this->projects()->count();
    }

    /**
     * Scope to filter teams where user is a member.
     */
    public function scopeWhereUserIsMember($query, User $user)
    {
        return $query->whereHas('members', function ($q) use ($user) {
            $q->where('users.id', $user->id);
        });
    }

    /**
     * Scope to filter teams owned by a user.
     */
    public function scopeWhereOwner($query, User $user)
    {
        return $query->where('owner_id', $user->id);
    }
}
