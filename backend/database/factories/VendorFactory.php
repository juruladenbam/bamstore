<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Vendor>
 */
class VendorFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $company = $this->faker->company();
        return [
            'name' => $company . ' Official',
            'contact_info' => '+62 8' . $this->faker->numerify('## #### ####'),
            'address' => $this->faker->address(),
        ];
    }
}
