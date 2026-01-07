<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
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
            "QOBILAH SAIDAH", "QOBILAH THOHIR AL ALY", "NYAI NIHAYA (NGAGLIK)"
        ];

        return [
            'checkout_name' => $this->faker->name(),
            'phone_number' => '+62 8' . $this->faker->numerify('## #### ####'),
            'qobilah' => $this->faker->randomElement($qobilahs),
            'payment_method' => $this->faker->randomElement(['transfer', 'cash']),
            'status' => $this->faker->randomElement(['new', 'paid', 'processed', 'ready_pickup', 'completed', 'cancelled']),
            'total_amount' => 0, // Will be calculated based on items
            'created_at' => $this->faker->dateTimeBetween('-3 months', 'now'),
        ];
    }
}
