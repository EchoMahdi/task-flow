<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\User;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Project>
 */
class ProjectFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Project::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'team_id' => null,
            'name' => fake()->company(),
            'color' => fake()->hexColor(),
            'icon' => 'folder',
            'is_favorite' => false,
            'is_archived' => false,
            'archived_at' => null,
            'parent_id' => null,
        ];
    }

    /**
     * Indicate that the project is favorited.
     *
     * @return static
     */
    public function favorited(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_favorite' => true,
        ]);
    }

    /**
     * Indicate that the project is archived.
     *
     * @return static
     */
    public function archived(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_archived' => true,
            'archived_at' => now(),
        ]);
    }

    /**
     * Indicate that the project belongs to a team.
     *
     * @return static
     */
    public function forTeam(Team $team): static
    {
        return $this->state(fn (array $attributes) => [
            'team_id' => $team->id,
            'user_id' => null,
        ]);
    }
}
