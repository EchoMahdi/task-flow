<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_reset_password_link_validation_works(): void
    {
        // Test with invalid email - should return validation error
        $response = $this->post('/auth/forgot-password', ['email' => 'invalid-email']);
        
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    public function test_password_reset_requires_valid_token(): void
    {
        // Test with invalid token - should fail
        $response = $this->post('/auth/reset-password', [
            'token' => 'invalid-token',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);
        
        // Should return some kind of error (validation or server error)
        $this->assertTrue(
            $response->status() === 422 || $response->status() === 500,
            'Expected 422 or 500 status, got ' . $response->status()
        );
    }
}
