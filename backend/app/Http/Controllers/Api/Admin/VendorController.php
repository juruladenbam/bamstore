<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Vendor;
use Illuminate\Http\Request;

class VendorController extends Controller
{
    public function index()
    {
        return response()->json(Vendor::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_info' => 'nullable|string|max:255',
            'address' => 'nullable|string',
        ]);

        $vendor = Vendor::create($validated);
        return response()->json($vendor, 201);
    }

    public function show(string $id)
    {
        return response()->json(Vendor::findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $vendor = Vendor::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'contact_info' => 'nullable|string|max:255',
            'address' => 'nullable|string',
        ]);

        $vendor->update($validated);
        return response()->json($vendor);
    }

    public function destroy(string $id)
    {
        Vendor::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
