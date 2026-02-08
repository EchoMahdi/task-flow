<?php

/**
 * User Preferences Settings Diagnostic Script
 * 
 * This script diagnoses why Date Format, Start of Week, Time Format, 
 * and Default Task View settings are not saving.
 * 
 * Usage: cd todo && php diagnostic.php
 */

echo "========================================\n";
echo "User Preferences Diagnostic Script\n";
echo "========================================\n\n";

$results = [
    'fillable' => ['status' => 'pending', 'message' => ''],
    'validation' => ['status' => 'pending', 'message' => ''],
    'database' => ['status' => 'pending', 'message' => ''],
    'save_test' => ['status' => 'pending', 'message' => ''],
    'auth_service' => ['status' => 'pending', 'message' => ''],
];

// Bootstrap Laravel
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\UserPreference;

// ============================================
// 1. Check UserPreference Model $fillable
// ============================================
echo "[1/5] Checking UserPreference Model \$fillable...\n";

try {
    $reflection = new ReflectionClass(UserPreference::class);
    $fillables = $reflection->getProperty('fillable');
    $fillables->setAccessible(true);
    $fillableValues = $fillables->getValue(new UserPreference());
    
    $requiredFields = [
        'date_format',
        'time_format', 
        'start_of_week',
        'default_task_view',
        'theme',
        'language',
        'email_notifications',
        'push_notifications',
        'weekly_digest',
        'marketing_emails',
    ];
    
    $missingFields = [];
    foreach ($requiredFields as $field) {
        if (!in_array($field, $fillableValues)) {
            $missingFields[] = $field;
        }
    }
    
    if (empty($missingFields)) {
        echo "  [PASS] All required fields are in \$fillable\n";
        echo "  Fields: " . implode(', ', $fillableValues) . "\n";
        $results['fillable']['status'] = 'pass';
        $results['fillable']['message'] = 'All required fields are fillable';
    } else {
        echo "  [FAIL] Missing fields in \$fillable:\n";
        foreach ($missingFields as $field) {
            echo "    - $field\n";
        }
        $results['fillable']['status'] = 'fail';
        $results['fillable']['message'] = 'Missing fields: ' . implode(', ', $missingFields);
    }
} catch (Exception $e) {
    echo "  [ERROR] " . $e->getMessage() . "\n";
    $results['fillable']['status'] = 'error';
    $results['fillable']['message'] = $e->getMessage();
}

echo "\n";

// ============================================
// 2. Check Database Migration Columns
// ============================================
echo "[2/5] Checking Database Migration Columns...\n";

try {
    $columns = DB::select("PRAGMA table_info(user_preferences)");
    $columnNames = array_map(function($col) {
        return $col->name;
    }, $columns);
    
    $requiredColumns = [
        'date_format',
        'time_format',
        'start_of_week',
        'default_task_view',
    ];
    
    $missingColumns = [];
    foreach ($requiredColumns as $column) {
        if (!in_array($column, $columnNames)) {
            $missingColumns[] = $column;
        }
    }
    
    if (empty($missingColumns)) {
        echo "  [PASS] All required columns exist in database\n";
        echo "  Columns found: " . implode(', ', $columnNames) . "\n";
        $results['database']['status'] = 'pass';
        $results['database']['message'] = 'All required columns exist';
    } else {
        echo "  [FAIL] Missing columns in database:\n";
        foreach ($missingColumns as $column) {
            echo "    - $column\n";
        }
        $results['database']['status'] = 'fail';
        $results['database']['message'] = 'Missing columns: ' . implode(', ', $missingColumns);
    }
} catch (Exception $e) {
    echo "  [ERROR] " . $e->getMessage() . "\n";
    $results['database']['status'] = 'error';
    $results['database']['message'] = $e->getMessage();
}

echo "\n";

// ============================================
// 3. Check Controller Validation Rules
// ============================================
echo "[3/5] Checking Controller Validation Rules...\n";

try {
    $controllerPath = __DIR__ . '/app/Http/Controllers/Api/AuthController.php';
    $controllerContent = file_get_contents($controllerPath);
    
    $validationFields = [
        'date_format' => preg_match("/'date_format'.*validate/", $controllerContent),
        'time_format' => preg_match("/'time_format'.*validate/", $controllerContent),
        'start_of_week' => preg_match("/'start_of_week'.*validate/", $controllerContent),
        'default_task_view' => preg_match("/'default_task_view'.*validate/", $controllerContent),
    ];
    
    $missingValidations = [];
    foreach ($validationFields as $field => $found) {
        if (!$found) {
            $missingValidations[] = $field;
        }
    }
    
    if (empty($missingValidations)) {
        echo "  [PASS] All required fields have validation rules\n";
        $results['validation']['status'] = 'pass';
        $results['validation']['message'] = 'All fields have validation rules';
    } else {
        echo "  [FAIL] Missing validation rules for:\n";
        foreach ($missingValidations as $field) {
            echo "    - $field\n";
        }
        $results['validation']['status'] = 'fail';
        $results['validation']['message'] = 'Missing validation for: ' . implode(', ', $missingValidations);
    }
} catch (Exception $e) {
    echo "  [ERROR] " . $e->getMessage() . "\n";
    $results['validation']['status'] = 'error';
    $results['validation']['message'] = $e->getMessage();
}

echo "\n";

// ============================================
// 4. Check AuthService $allowedFields
// ============================================
echo "[4/5] Checking AuthService \$allowedFields...\n";

try {
    $servicePath = __DIR__ . '/app/Services/AuthService.php';
    $serviceContent = file_get_contents($servicePath);
    
    $requiredFields = [
        'date_format',
        'time_format',
        'start_of_week',
        'default_task_view',
    ];
    
    $missingFields = [];
    foreach ($requiredFields as $field) {
        if (strpos($serviceContent, "'$field'") === false) {
            $missingFields[] = $field;
        }
    }
    
    if (empty($missingFields)) {
        echo "  [PASS] All required fields in \$allowedFields\n";
        $results['auth_service']['status'] = 'pass';
        $results['auth_service']['message'] = 'All fields in allowedFields';
    } else {
        echo "  [FAIL] Missing in \$allowedFields:\n";
        foreach ($missingFields as $field) {
            echo "    - $field\n";
        }
        $results['auth_service']['status'] = 'fail';
        $results['auth_service']['message'] = 'Missing in allowedFields: ' . implode(', ', $missingFields);
    }
} catch (Exception $e) {
    echo "  [ERROR] " . $e->getMessage() . "\n";
    $results['auth_service']['status'] = 'error';
    $results['auth_service']['message'] = $e->getMessage();
}

echo "\n";

// ============================================
// 5. Test Save Functionality
// ============================================
echo "[5/5] Testing Save Functionality...\n";

try {
    // Get first user
    $user = User::first();
    
    if (!$user) {
        echo "  [WARN] No users found in database\n";
        $results['save_test']['status'] = 'skip';
        $results['save_test']['message'] = 'No users found';
    } else {
        echo "  Testing with user: " . $user->email . "\n";
        
        // Get or create preferences
        $preferences = $user->preferences ?? new UserPreference(['user_id' => $user->id]);
        
        echo "  Before save:\n";
        echo "    - date_format: " . ($preferences->date_format ?? 'NULL') . "\n";
        echo "    - time_format: " . ($preferences->time_format ?? 'NULL') . "\n";
        echo "    - start_of_week: " . ($preferences->start_of_week ?? 'NULL') . "\n";
        echo "    - default_task_view: " . ($preferences->default_task_view ?? 'NULL') . "\n";
        
        // Test data
        $testData = [
            'date_format' => 'm/d/Y',
            'time_format' => 'h:i A',
            'start_of_week' => 0,
            'default_task_view' => 'board',
        ];
        
        echo "  Saving test data:\n";
        foreach ($testData as $key => $value) {
            echo "    - $key: $value\n";
        }
        
        // Try to save
        $preferences->date_format = $testData['date_format'];
        $preferences->time_format = $testData['time_format'];
        $preferences->start_of_week = $testData['start_of_week'];
        $preferences->default_task_view = $testData['default_task_view'];
        
        $saved = $preferences->save();
        
        if ($saved) {
            // Refresh from database
            $preferences = UserPreference::where('user_id', $user->id)->first();
            
            echo "  After save:\n";
            echo "    - date_format: " . $preferences->date_format . "\n";
            echo "    - time_format: " . $preferences->time_format . "\n";
            echo "    - start_of_week: " . $preferences->start_of_week . "\n";
            echo "    - default_task_view: " . $preferences->default_task_view . "\n";
            
            // Verify
            $passed = true;
            $failedFields = [];
            foreach ($testData as $key => $expected) {
                if ($preferences->$key != $expected) {
                    $passed = false;
                    $failedFields[] = "$key (expected: $expected, got: {$preferences->$key})";
                }
            }
            
            if ($passed) {
                echo "  [PASS] All fields saved and verified\n";
                $results['save_test']['status'] = 'pass';
                $results['save_test']['message'] = 'All fields saved correctly';
            } else {
                echo "  [FAIL] Some fields don't match:\n";
                foreach ($failedFields as $field) {
                    echo "    - $field\n";
                }
                $results['save_test']['status'] = 'fail';
                $results['save_test']['message'] = 'Failed fields: ' . implode(', ', $failedFields);
            }
        } else {
            echo "  [FAIL] Save returned false\n";
            $results['save_test']['status'] = 'fail';
            $results['save_test']['message'] = 'Save returned false';
        }
    }
} catch (Exception $e) {
    echo "  [ERROR] " . $e->getMessage() . "\n";
    echo "  Trace: " . $e->getTraceAsString() . "\n";
    $results['save_test']['status'] = 'error';
    $results['save_test']['message'] = $e->getMessage();
}

echo "\n";

// ============================================
// Summary
// ============================================
echo "========================================\n";
echo "DIAGNOSTIC SUMMARY\n";
echo "========================================\n\n";

$allPassed = true;
foreach ($results as $test => $result) {
    $status = $result['status'];
    $icon = ($status === 'pass') ? '[PASS]' : (($status === 'fail' || $status === 'error') ? '[FAIL]' : '[WARN]');
    
    echo "$icon " . strtoupper($test) . ": $status\n";
    echo "   " . $result['message'] . "\n\n";
    
    if (in_array($status, ['fail', 'error'])) {
        $allPassed = false;
    }
}

echo "========================================\n";

if ($allPassed) {
    echo "ALL TESTS PASSED!\n";
    echo "Settings should be saving correctly.\n";
    echo "If settings still don't save in the frontend, check:\n";
    echo "  1. Frontend is sending correct data format\n";
    echo "  2. API endpoint is being called\n";
    echo "  3. CSRF token is valid\n";
    echo "  4. No JavaScript errors in console\n";
} else {
    echo "SOME TESTS FAILED!\n";
    echo "Please fix the failed tests above.\n";
    echo "\nCommon fixes:\n";
    
    if ($results['fillable']['status'] !== 'pass') {
        echo "  - Add missing fields to UserPreference::\$fillable\n";
    }
    if ($results['database']['status'] !== 'pass') {
        echo "  - Run: php artisan migrate\n";
        echo "  - Create migration to add missing columns\n";
    }
    if ($results['validation']['status'] !== 'pass') {
        echo "  - Add validation rules in AuthController\n";
    }
    if ($results['auth_service']['status'] !== 'pass') {
        echo "  - Add fields to AuthService::\$allowedFields\n";
    }
}

echo "========================================\n";
