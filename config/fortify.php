<?php

use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Laravel\Fortify\Features;

return [
    /*
    |--------------------------------------------------------------------------
    | Fortify Guard
    |--------------------------------------------------------------------------
    |
    | Here you may specify which guard should be used to authenticate users.
    | Typically, this should be the "web" guard for session-based authentication.
    |
    */
    'guard' => 'web',

    /*
    |--------------------------------------------------------------------------
    | Fortify Password Broker
    |--------------------------------------------------------------------------
    |
    | Here you may specify which password broker configuration is used to
    | verify and reset user passwords. This should match the password
    | broker used for authentication.
    |
    */
    'passwords' => 'users',

    /*
    |--------------------------------------------------------------------------
    | Username / Email
    |--------------------------------------------------------------------------
    |
    | This value defines which model attribute should be considered as the
    | "username" field of the user. Typically, this might be the "email"
    | field, but you may change this if you need to use another field.
    |
    */
    'username' => 'email',

    /*
    |--------------------------------------------------------------------------
    | Eloquent Must Verify Email
    |--------------------------------------------------------------------------
    |
    | If this option is set to "true", users must verify their email address
    | before they can log in. This is handled by the MustVerifyEmail trait.
    |
    */
    'must_verify_email' => true,

    /*
    |--------------------------------------------------------------------------
    | Session Authentication Timeout
    |--------------------------------------------------------------------------
    |
    | Here you may specify the number of seconds that a user can be inactive
    | before they are logged out. The timeout is calculated from the last
    | activity time.
    |
    */
    'session_timeout' => 120,

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting
    |--------------------------------------------------------------------------
    |
    | Fortify automatically applies rate limiting to all login attempts.
    | You may customize the maximum number of attempts per minute.
    |
    */
    'rate_limiting' => [
        'limit' => 5,
        'decay_seconds' => 60,
    ],

    /*
    |--------------------------------------------------------------------------
    | Features
    |--------------------------------------------------------------------------
    |
    | Some features are disabled by default. You may enable or disable
    | features based on your application's needs.
    |
    */
    'features' => [
        Features::registration(),
        Features::resetPasswords(),
        Features::emailVerification(),
        Features::updateProfileInformation(),
        Features::updatePasswords(),
        Features::twoFactorAuthentication([
            'confirmPassword' => true,
            'confirm' => true,
        ]),
    ],
];
