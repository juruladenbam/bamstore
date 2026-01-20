<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductSku;
use App\Models\User;
use App\Services\OrderEditService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderEditTest extends TestCase
{
    use RefreshDatabase;

    protected $service;
    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(OrderEditService::class);
        $this->admin = User::factory()->create();
    }

    public function test_add_item_decrements_stock()
    {
        $product = Product::factory()->create(['base_price' => 100000]);
        $sku = ProductSku::create([
            'product_id' => $product->id,
            'sku' => 'TEST-SKU',
            'price' => 100000,
            'stock' => 10,
            'variant_ids' => []
        ]);

        $order = Order::factory()->create(['total_amount' => 0, 'grand_total' => 0]);

        $this->service->addItem($order, [
            'product_id' => $product->id,
            'variant_ids' => [],
            'quantity' => 2,
            'recipient_name' => 'Tester'
        ], $this->admin);

        $this->assertEquals(8, $sku->fresh()->stock);
        $this->assertCount(1, $order->items);
        $this->assertEquals(200000, $order->fresh()->total_amount);
        $this->assertDatabaseHas('order_edit_logs', [
            'order_id' => $order->id,
            'action' => 'add_item'
        ]);
    }

    public function test_remove_item_restores_stock()
    {
        $product = Product::factory()->create();
        $sku = ProductSku::create([
            'product_id' => $product->id,
            'sku' => 'TEST-SKU',
            'price' => 100000,
            'stock' => 10,
            'variant_ids' => []
        ]);

        $order = Order::factory()->create();
        $item = OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'sku' => 'TEST-SKU',
            'quantity' => 3,
            'unit_price_at_order' => 100000,
            'recipient_name' => 'Tester'
        ]);

        // Create a dummy second item so we can remove the first one
        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'sku' => 'TEST-SKU-2',
            'quantity' => 1,
            'unit_price_at_order' => 50000,
            'recipient_name' => 'Tester 2'
        ]);
        
        // Simulate initial stock decrement
        $sku->decrement('stock', 3);
        $this->assertEquals(7, $sku->fresh()->stock);

        $this->service->removeItem($order, $item, $this->admin);

        $this->assertEquals(10, $sku->fresh()->stock);
        $this->assertDatabaseMissing('order_items', ['id' => $item->id]);
        $this->assertDatabaseHas('order_edit_logs', [
            'order_id' => $order->id,
            'action' => 'remove_item'
        ]);
    }

    public function test_update_item_quantity_adjusts_stock()
    {
        $product = Product::factory()->create();
        $sku = ProductSku::create([
            'product_id' => $product->id,
            'sku' => 'TEST-SKU',
            'price' => 100000,
            'stock' => 10,
            'variant_ids' => []
        ]);

        $order = Order::factory()->create();
        $item = OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'sku' => 'TEST-SKU',
            'quantity' => 2,
            'unit_price_at_order' => 100000,
            'recipient_name' => 'Tester'
        ]);
        
        $sku->decrement('stock', 2); // stock now 8

        // Increase quantity to 5 (needs 3 more)
        $this->service->updateItem($order, $item, ['quantity' => 5], $this->admin);

        $this->assertEquals(5, $sku->fresh()->stock); // 8 - 3 = 5
        $this->assertEquals(5, $item->fresh()->quantity);

        // Decrease quantity to 1 (returns 4)
        $this->service->updateItem($order, $item, ['quantity' => 1], $this->admin);
        
        $this->assertEquals(9, $sku->fresh()->stock); // 5 + 4 = 9
        $this->assertEquals(1, $item->fresh()->quantity);
    }

    public function test_cancelling_order_restores_all_items_stock()
    {
        $product = Product::factory()->create();
        $sku = ProductSku::create([
            'product_id' => $product->id,
            'sku' => 'TEST-SKU',
            'price' => 100000,
            'stock' => 10,
            'variant_ids' => []
        ]);

        $order = Order::factory()->create(['status' => 'new']);
        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'sku' => 'TEST-SKU',
            'quantity' => 2,
            'unit_price_at_order' => 100000,
            'recipient_name' => 'Tester'
        ]);
        
        $sku->decrement('stock', 2); // stock now 8

        $this->service->updateInfo($order, ['status' => 'cancelled'], $this->admin);

        $this->assertEquals(10, $sku->fresh()->stock);
        $this->assertEquals('cancelled', $order->fresh()->status);
        $this->assertDatabaseHas('order_edit_logs', [
            'order_id' => $order->id,
            'action' => 'update_status',
            'new_value' => 'cancelled'
        ]);
    }
}
