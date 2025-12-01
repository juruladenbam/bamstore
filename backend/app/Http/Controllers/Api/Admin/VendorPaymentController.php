<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\VendorPayment;
use Illuminate\Http\Request;

class VendorPaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = VendorPayment::with('vendor');

        if ($request->has('vendor_id')) {
            $query->where('vendor_id', $request->vendor_id);
        }

        return response()->json($query->latest()->get());
    }

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

    public function destroy($id)
    {
        VendorPayment::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
