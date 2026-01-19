<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Exceptions\CouponException;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class CouponService
{
    /**
     * Validate a coupon code against business rules.
     * 
     * @param string|null $code
     * @param float $cartTotal
     * @param string|null $userIdentifier (e.g. phone number)
     * @param bool $lockForUpdate Whether to lock the record for update (use in checkout)
     * @return Coupon
     * @throws CouponException
     */
    public function validate(?string $code, float $cartTotal, ?string $userIdentifier = null, bool $lockForUpdate = false): Coupon
    {
        if (empty($code)) {
            throw new CouponException("Kode kupon tidak boleh kosong.");
        }

        $query = Coupon::where('code', $code);
        
        if ($lockForUpdate) {
            $query->lockForUpdate();
        }

        $coupon = $query->first();

        if (!$coupon) {
            throw new CouponException("Kupon tidak ditemukan.");
        }

        // 1. Basic Status
        if (!$coupon->is_active) {
            throw new CouponException("Kupon ini sudah tidak aktif.");
        }

        // 2. Date Window
        $now = Carbon::now();
        if ($coupon->start_date && $now->lt($coupon->start_date)) {
            throw new CouponException("Kupon ini belum dapat digunakan.");
        }
        if ($coupon->end_date && $now->gt($coupon->end_date)) {
            throw new CouponException("Kupon ini sudah kedaluwarsa.");
        }

        // 3. Minimum Purchase
        if ($coupon->min_purchase && $cartTotal < $coupon->min_purchase) {
            $minFormatted = "Rp " . number_format($coupon->min_purchase, 0, ',', '.');
            throw new CouponException("Minimal belanja untuk kupon ini adalah {$minFormatted}.");
        }

        // 4. Global Usage Limit
        if ($coupon->usage_limit !== null) {
            $currentUsageCount = CouponUsage::where('coupon_id', $coupon->id)->count();
            if ($currentUsageCount >= $coupon->usage_limit) {
                throw new CouponException("Kuota kupon ini sudah habis.");
            }
        }

        // 5. User Usage Limit
        if ($userIdentifier && $coupon->usage_limit_per_user > 0) {
            $userUsageCount = CouponUsage::where('coupon_id', $coupon->id)
                ->where('user_identifier', $userIdentifier)
                ->count();
            
            if ($userUsageCount >= $coupon->usage_limit_per_user) {
                throw new CouponException("Anda sudah menggunakan kupon ini.");
            }
        }

        return $coupon;
    }

    /**
     * Calculate discount amount for a given coupon and cart total.
     * 
     * @param Coupon $coupon
     * @param float $cartTotal
     * @return float
     */
    public function calculate(Coupon $coupon, float $cartTotal): float
    {
        $discountAmount = 0;

        if ($coupon->type === 'fixed') {
            $discountAmount = (float) $coupon->value;
        } elseif ($coupon->type === 'percent') {
            $discountAmount = $cartTotal * ($coupon->value / 100);
            
            // Apply cap if exists
            if ($coupon->max_discount_amount && $discountAmount > $coupon->max_discount_amount) {
                $discountAmount = (float) $coupon->max_discount_amount;
            }
        }

        // Discount cannot exceed cart total
        return min($discountAmount, (float) $cartTotal);
    }
}
