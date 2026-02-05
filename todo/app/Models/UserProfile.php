<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'bio',
        'birth_date',
        'gender',
        'website',
        'social_links',
        'company',
        'job_title',
        'address',
        'city',
        'country',
        'postal_code',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'social_links' => 'array',
    ];

    /**
     * Get the user that owns the profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get formatted address.
     */
    public function getFormattedAddressAttribute(): string
    {
        $parts = array_filter([
            $this->address,
            $this->city,
            $this->country,
            $this->postal_code,
        ]);
        
        return implode(', ', $parts) ?: '';
    }

    /**
     * Calculate age from birth date.
     */
    public function getAgeAttribute(): ?int
    {
        if (!$this->birth_date) {
            return null;
        }
        
        return $this->birth_date->age;
    }

    /**
     * Get full location.
     */
    public function getFullLocationAttribute(): string
    {
        $location = [];
        
        if ($this->city) {
            $location[] = $this->city;
        }
        
        if ($this->country) {
            $location[] = $this->country;
        }
        
        return implode(', ', $location) ?: '';
    }
}
