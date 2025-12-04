<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\VendorPayment;
use Illuminate\Http\Request;

class VendorPaymentController extends Controller
{
    /**
     * @OA\Get(
     *     path="/admin/vendor-payments",
     *     summary="Get list of vendor payments",
     *     tags={"Admin Vendor Payments"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="vendor_id",
     *         in="query",
     *         description="Filter by Vendor ID",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation"
     *     )
     * )
     */
    public function index(Request $request)
    {
        $query = VendorPayment::with('vendor');

        if ($request->has('vendor_id')) {
            $query->where('vendor_id', $request->vendor_id);
        }

        return response()->json($query->latest()->get());
    }

    /**
     * @OA\Post(
     *     path="/admin/vendor-payments",
     *     summary="Create a new vendor payment",
     *     tags={"Admin Vendor Payments"},
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"vendor_id", "amount", "type", "payment_date"},
     *             @OA\Property(property="vendor_id", type="integer", example=1),
     *             @OA\Property(property="amount", type="number", format="float", example=50000),
     *             @OA\Property(property="type", type="string", enum={"dp", "installment", "full_payment"}, example="dp"),
     *             @OA\Property(property="payment_date", type="string", format="date", example="2023-10-01"),
     *             @OA\Property(property="notes", type="string", example="Down payment")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Payment created successfully"
     *     )
     * )
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'amount' => 'required|numeric|min:0',
            'type' => 'required|in:dp,installment,full_payment',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string'
        ]);

        $payment = VendorPayment::create($validated);
        return response()->json($payment, 201);
    }

    /**
     * @OA\Delete(
     *     path="/admin/vendor-payments/{id}",
     *     summary="Delete a vendor payment",
     *     tags={"Admin Vendor Payments"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Payment ID",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=204,
     *         description="Payment deleted"
     *     )
     * )
     */
    public function destroy($id)
    {
        VendorPayment::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
