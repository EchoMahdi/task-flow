<?php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_headers' => ['*'],
    'allowed_origins' => ['http://localhost:5174','http://127.0.0.1:5174'],
    'allowed_origins_patterns' => [],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
