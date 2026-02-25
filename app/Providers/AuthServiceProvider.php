<?php

namespace App\Providers;

use App\Models\NotificationRule;
use App\Models\Project;
use App\Models\SavedView;
use App\Models\Subtask;
use App\Models\Tag;
use App\Models\Task;
use App\Models\Team;
use App\Policies\NotificationRulePolicy;
use App\Policies\ProjectPolicy;
use App\Policies\SavedViewPolicy;
use App\Policies\SubtaskPolicy;
use App\Policies\TagPolicy;
use App\Policies\TaskPolicy;
use App\Policies\TeamPolicy;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;

/**
 * Auth Service Provider
 *
 * Registers authorization policies and gates.
 * This serves as the single source of truth for model-policy bindings.
 */
class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        NotificationRule::class => NotificationRulePolicy::class,
        Project::class => ProjectPolicy::class,
        SavedView::class => SavedViewPolicy::class,
        Subtask::class => SubtaskPolicy::class,
        Tag::class => TagPolicy::class,
        Task::class => TaskPolicy::class,
        Team::class => TeamPolicy::class,
    ];

    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Register all policies
        foreach ($this->policies as $model => $policy) {
            Gate::policy($model, $policy);
        }

        // Implicit model-policy binding is automatic in Laravel 11
        // but we can define additional gates here if needed
    }
}
