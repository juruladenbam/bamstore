<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $adjectives = ['Premium', 'Exclusive', 'Casual', 'Formal', 'Modern', 'Classic', 'Trendy'];
        $types = ['Kemeja', 'Kaos', 'Celana', 'Gamis', 'Tunik', 'Jaket', 'Sweater', 'Rok'];
        $materials = ['Katun', 'Linen', 'Denim', 'Rayon', 'Silk', 'Wool'];

        $name = $this->faker->randomElement($adjectives) . ' ' .
                $this->faker->randomElement($types) . ' ' .
                $this->faker->randomElement($materials);

        return [
            'category_id' => \App\Models\Category::factory(),
            'vendor_id' => \App\Models\Vendor::factory(),
            'name' => $name,
            'slug' => \Illuminate\Support\Str::slug($name . '-' . $this->faker->unique()->numberBetween(100, 999)),
            'description' => $this->faker->paragraph(),
            'base_price' => $this->faker->numberBetween(50, 500) * 1000, // 50k - 500k
            'status' => $this->faker->randomElement(['ready', 'pre_order']),
        ];
    }
}
