<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductSku;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class AdminOrderEditApiTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create();
        Sanctum::actingAs($this->admin);
    }

    public function test_api_update_order_info()
    {
        $order = Order::factory()->create([
            'checkout_name' => 'Original Name',
            'qobilah' => 'QOBILAH MARIYAH'
        ]);

        $response = $this->putJson("/api/admin/orders/{$order->id}", [
            'checkout_name' => 'New Name',
            'qobilah' => 'QOBILAH BUSYRI',
            'phone_number' => '08123456789',
            'payment_method' => 'cash'
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('order.checkout_name', 'New Name');
                 
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'checkout_name' => 'New Name',
            'last_edited_by' => $this->admin->id
        ]);
    }

    public function test_api_add_item_to_order()
    {
        $product = Product::factory()->create();
        ProductSku::create([
            'product_id' => $product->id,
            'sku' => 'API-SKU',
            'price' => 150000,
            'stock' => 10,
            'variant_ids' => []
        ]);

        $order = Order::factory()->create();

        $response = $this->postJson("/api/admin/orders/{$order->id}/items", [
            'product_id' => $product->id,
            'variant_ids' => [],
            'quantity' => 1,
            'recipient_name' => 'API Tester'
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure(['message', 'item', 'order']);
                 
        $this->assertDatabaseHas('order_items', [
            'order_id' => $order->id,
            'recipient_name' => 'API Tester'
        ]);
    }

    public function test_api_get_order_history()
    {
        $order = Order::factory()->create();
        
        // Make a change to generate logs
        $this->putJson("/api/admin/orders/{$order->id}", [
            'checkout_name' => 'Name Change'
        ]);

        $response = $this->getJson("/api/admin/orders/{$order->id}/history");

        $response->assertStatus(200)
                 ->assertJsonStructure(['logs']);
        
        $this->assertNotEmpty($response->json('logs'));
    }

    public function test_api_resolve_price_adjustment()
    {
        $order = Order::factory()->create([
            'status' => 'completed',
            'price_adjustment_status' => 'underpaid',
            'price_adjustment_amount' => 50000
        ]);

        $response = $this->postJson("/api/admin/orders/{$order->id}/resolve-adjustment", [
            'resolution' => 'paid'
        ]);

        $response->assertStatus(200);
        
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'price_adjustment_status' => 'none',
            'price_adjustment_amount' => 0
        ]);
    }
}
