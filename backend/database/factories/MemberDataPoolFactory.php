<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MemberDataPool>
 */
class MemberDataPoolFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $qobilahs = [
            "QOBILAH MARIYAH", "QOBILAH BUSYRI", "QOBILAH MUZAMMAH", "QOBILAH SULHAN",
            "QOBILAH SHOLIHATUN", "QOBILAH NURSIYAM", "QOBILAH NI'MAH", "QOBILAH ABD MAJID",
            "QOBILAH SAIDAH", "QOBILAH THOHIR AL ALY", "QOBILAH ABD. ROHIM (NGAGLIK)"
        ];

        return [
            'name' => $this->faker->name(),
            'phone_number' => '+62 8' . $this->faker->numerify('## #### ####'),
            'qobilah' => $this->faker->randomElement($qobilahs),
            'order_count' => $this->faker->numberBetween(0, 10),
        ];
    }
}
