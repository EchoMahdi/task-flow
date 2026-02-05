<?php

/**
 * English Translation Messages
 * Backend API responses, error messages, validation messages
 */

return [
    // ============================================
    // General Messages
    // ============================================
    'app' => [
        'name' => 'TaskFlow',
        'description' => 'Your personal task management solution',
    ],

    // ============================================
    // Authentication Messages
    // ============================================
    'auth' => [
        'login' => [
            'title' => 'Sign In',
            'success' => 'Welcome back! You have successfully logged in.',
            'failed' => 'Invalid credentials. Please try again.',
            'email_required' => 'The email address is required.',
            'password_required' => 'The password is required.',
        ],
        'register' => [
            'title' => 'Create Account',
            'success' => 'Account created successfully! Welcome to TaskFlow.',
            'failed' => 'Registration failed. Please try again.',
            'name_required' => 'The name is required.',
            'email_required' => 'The email address is required.',
            'password_required' => 'The password is required.',
            'password_min' => 'Password must be at least 8 characters.',
            'password_confirmed' => 'Passwords do not match.',
        ],
        'logout' => [
            'success' => 'You have been logged out successfully.',
        ],
        'forgot_password' => [
            'title' => 'Reset Password',
            'success' => 'We have sent you an email with password reset instructions.',
            'email_sent' => 'Password reset email sent.',
            'email_not_found' => 'We could not find a user with that email address.',
        ],
        'reset_password' => [
            'title' => 'Reset Password',
            'success' => 'Your password has been reset successfully.',
        ],
    ],

    // ============================================
    // Task Messages
    // ============================================
    'tasks' => [
        'index' => [
            'title' => 'Tasks',
            'empty' => 'No tasks found. Create your first task!',
            'loading' => 'Loading tasks...',
        ],
        'show' => [
            'title' => 'Task Details',
        ],
        'create' => [
            'title' => 'Create Task',
            'success' => 'Task created successfully.',
            'failed' => 'Failed to create task. Please try again.',
        ],
        'update' => [
            'title' => 'Edit Task',
            'success' => 'Task updated successfully.',
            'failed' => 'Failed to update task. Please try again.',
        ],
        'delete' => [
            'title' => 'Delete Task',
            'success' => 'Task deleted successfully.',
            'failed' => 'Failed to delete task. Please try again.',
            'confirm' => 'Are you sure you want to delete this task?',
        ],
        'complete' => [
            'success' => 'Task marked as completed.',
            'undone' => 'Task marked as pending.',
        ],
        'restore' => [
            'success' => 'Task restored successfully.',
        ],
        'fields' => [
            'title' => 'Title',
            'description' => 'Description',
            'status' => 'Status',
            'priority' => 'Priority',
            'due_date' => 'Due Date',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ],
        'status' => [
            'pending' => 'Pending',
            'in_progress' => 'In Progress',
            'completed' => 'Completed',
            'archived' => 'Archived',
        ],
        'priority' => [
            'low' => 'Low',
            'medium' => 'Medium',
            'high' => 'High',
            'urgent' => 'Urgent',
        ],
        'validation' => [
            'title_required' => 'The task title is required.',
            'title_max' => 'The task title cannot exceed 255 characters.',
            'status_invalid' => 'The selected status is invalid.',
            'priority_invalid' => 'The selected priority is invalid.',
        ],
    ],

    // ============================================
    // Tag Messages
    // ============================================
    'tags' => [
        'index' => [
            'title' => 'Tags',
            'empty' => 'No tags found.',
            'loading' => 'Loading tags...',
        ],
        'create' => [
            'success' => 'Tag created successfully.',
            'failed' => 'Failed to create tag.',
        ],
        'update' => [
            'success' => 'Tag updated successfully.',
            'failed' => 'Failed to update tag.',
        ],
        'delete' => [
            'success' => 'Tag deleted successfully.',
            'failed' => 'Failed to delete tag.',
            'confirm' => 'Are you sure you want to delete this tag?',
        ],
        'fields' => [
            'name' => 'Name',
            'color' => 'Color',
        ],
    ],

    // ============================================
    // Notification Messages
    // ============================================
    'notifications' => [
        'index' => [
            'title' => 'Notifications',
            'empty' => 'No notifications.',
            'loading' => 'Loading notifications...',
        ],
        'settings' => [
            'title' => 'Notification Settings',
            'success' => 'Settings saved successfully.',
        ],
        'reminder' => [
            'task_due' => 'Task ":title" is due soon',
            'task_overdue' => 'Task ":title" is overdue',
        ],
    ],

    // ============================================
    // User Preferences Messages
    // ============================================
    'preferences' => [
        'updated' => 'Preferences saved successfully.',
        'updated_failed' => 'Failed to save preferences.',
        'language' => [
            'label' => 'Language',
            'en' => 'English',
            'fa' => 'Persian (فارسی)',
        ],
        'theme' => [
            'label' => 'Theme',
            'light' => 'Light',
            'dark' => 'Dark',
            'system' => 'System',
        ],
        'date_format' => [
            'label' => 'Date Format',
        ],
    ],

    // ============================================
    // Validation Error Messages
    // ============================================
    'validation' => [
        'required' => 'The :attribute field is required.',
        'email' => 'The :attribute must be a valid email address.',
        'min' => [
            'string' => 'The :attribute must be at least :min characters.',
        ],
        'max' => [
            'string' => 'The :attribute cannot exceed :max characters.',
        ],
        'confirmed' => 'The :attribute confirmation does not match.',
        'unique' => 'The :attribute has already been taken.',
        'exists' => 'The selected :attribute is invalid.',
        'date' => 'The :attribute is not a valid date.',
        'in' => 'The selected :attribute is invalid.',
        'array' => 'The :attribute must be an array.',
    ],

    // ============================================
    // Error Messages
    // ============================================
    'errors' => [
        'unauthorized' => 'You are not authorized to perform this action.',
        'forbidden' => 'Access denied.',
        'not_found' => 'The requested resource was not found.',
        'server_error' => 'An unexpected error occurred. Please try again later.',
        'too_many_requests' => 'Too many requests. Please slow down.',
        'validation_failed' => 'The given data was invalid.',
        'throttle' => 'Too many attempts. Please try again in :seconds seconds.',
    ],

    // ============================================
    // Success Messages
    // ============================================
    'success' => [
        'operation_completed' => 'Operation completed successfully.',
        'data_saved' => 'Data saved successfully.',
        'data_deleted' => 'Data deleted successfully.',
        'data_updated' => 'Data updated successfully.',
    ],

    // ============================================
    // Common UI Labels
    // ============================================
    'common' => [
        'save' => 'Save',
        'cancel' => 'Cancel',
        'delete' => 'Delete',
        'edit' => 'Edit',
        'create' => 'Create',
        'update' => 'Update',
        'search' => 'Search',
        'filter' => 'Filter',
        'loading' => 'Loading...',
        'no_data' => 'No data available',
        'confirm' => 'Confirm',
        'yes' => 'Yes',
        'no' => 'No',
        'back' => 'Back',
        'next' => 'Next',
        'previous' => 'Previous',
        'submit' => 'Submit',
        'close' => 'Close',
        'view' => 'View',
        'actions' => 'Actions',
        'settings' => 'Settings',
        'profile' => 'Profile',
        'logout' => 'Logout',
        'login' => 'Login',
        'register' => 'Register',
        'remember_me' => 'Remember me',
        'forgot_password' => 'Forgot password?',
        'password' => 'Password',
        'email' => 'Email',
        'name' => 'Name',
        'success' => 'Success',
        'error' => 'Error',
        'warning' => 'Warning',
        'info' => 'Info',
    ],

    // ============================================
    // Date and Time
    // ============================================
    'datetime' => [
        'today' => 'Today',
        'yesterday' => 'Yesterday',
        'tomorrow' => 'Tomorrow',
        'now' => 'Now',
        'just_now' => 'Just now',
        'ago' => ':time ago',
        'in_future' => 'in :time',
        'seconds' => 'seconds',
        'minutes' => 'minutes',
        'hours' => 'hours',
        'days' => 'days',
        'weeks' => 'weeks',
        'months' => 'months',
        'years' => 'years',
    ],

    // ============================================
    // Pagination
    // ============================================
    'pagination' => [
        'previous' => 'Previous',
        'next' => 'Next',
        'showing' => 'Showing :first to :last of :total results',
    ],
];
