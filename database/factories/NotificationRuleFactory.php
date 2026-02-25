<?php

namespace Database\Factories;

use App\Models\NotificationRule;
use App\Models\User;
use App\Models\Task;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\NotificationRule>
 */
class NotificationRuleFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = NotificationRule::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'task_id' => null,
            'channel' => fake()->randomElement(['email', 'sms', 'push', 'in_app']),
            'reminder_offset' => fake()->numberBetween(1, 60),
            'reminder_unit' => fake()->randomElement(['minutes', 'hours', 'days']),
            'is_enabled' => true,
            'last_sent_at' => null,
        ];
    }

    /**
     * Indicate that the notification rule is disabled.
     *
     * @return static
     */
    public function disabled(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_enabled' => false,
        ]);
    }

    /**
     * Indicate that the notification rule is for a specific task.
     *
     * @return static
     */
    public function forTask(Task $task): static
    {
        return $this->state(fn (array $attributes) => [
            'task_id' => $task->id,
        ]);
    }
}
