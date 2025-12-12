<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = [
            'Pakaian Pria', 'Pakaian Wanita', 'Anak-anak', 'Aksesoris',
            'Muslim Wear', 'Outerwear', 'Sepatu', 'Tas'
        ];

        $name = $this->faker->unique()->randomElement($categories);
        return [
            'name' => $name,
            'slug' => \Illuminate\Support\Str::slug($name),
        ];
    }
}
