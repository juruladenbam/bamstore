<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CouponService;
use App\Exceptions\CouponException;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    protected $couponService;

    public function __construct(CouponService $couponService)
    {
        $this->couponService = $couponService;
    }

    /**
     * Check coupon validity and calculate discount without applying it.
     */
    public function check(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string',
            'cart_total' => 'required|numeric|min:0',
            'phone_number' => 'nullable|string',
        ]);

        try {
            $coupon = $this->couponService->validate(
                $validated['code'],
                $validated['cart_total'],
                $validated['phone_number'] ?? null
            );

            $discountAmount = $this->couponService->calculate($coupon, $validated['cart_total']);

            return response()->json([
                'valid' => true,
                'code' => $coupon->code,
                'discount_amount' => $discountAmount,
                'final_total' => max(0, $validated['cart_total'] - $discountAmount),
                'message' => 'Kupon berhasil dipasang!'
            ]);

        } catch (CouponException $e) {
            return response()->json([
                'valid' => false,
                'message' => $e->getMessage()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'valid' => false,
                'message' => 'Terjadi kesalahan sistem.'
            ], 500);
        }
    }
}
