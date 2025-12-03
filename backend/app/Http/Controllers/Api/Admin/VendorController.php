<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Vendor;
use Illuminate\Http\Request;

class VendorController extends Controller
{
    /**
     * @OA\Get(
     *     path="/admin/vendors",
     *     summary="Get list of vendors",
     *     tags={"Admin Vendors"},
     *     security={{"sanctum": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation"
     *     )
     * )
     */
    public function index()
    {
        return response()->json(Vendor::all());
    }

    /**
     * @OA\Post(
     *     path="/admin/vendors",
     *     summary="Create a new vendor",
     *     tags={"Admin Vendors"},
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name"},
     *             @OA\Property(property="name", type="string", example="Vendor A"),
     *             @OA\Property(property="contact_info", type="string", example="08123456789"),
     *             @OA\Property(property="address", type="string", example="123 Main St")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Vendor created successfully"
     *     )
     * )
     */
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

    /**
     * @OA\Get(
     *     path="/admin/vendors/{id}",
     *     summary="Get vendor details",
     *     tags={"Admin Vendors"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Vendor ID or Slug",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation"
     *     )
     * )
     */
    public function show(Vendor $vendor)
    {
        return response()->json($vendor);
    }

    /**
     * @OA\Put(
     *     path="/admin/vendors/{id}",
     *     summary="Update a vendor",
     *     tags={"Admin Vendors"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Vendor ID or Slug",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="slug", type="string"),
     *             @OA\Property(property="contact_info", type="string"),
     *             @OA\Property(property="address", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Vendor updated successfully"
     *     )
     * )
     */
    public function update(Request $request, Vendor $vendor)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'nullable|string|max:255',
            'contact_info' => 'nullable|string|max:255',
            'address' => 'nullable|string',
        ]);

        $vendor->update($validated);
        return response()->json($vendor);
    }

    /**
     * @OA\Delete(
     *     path="/admin/vendors/{id}",
     *     summary="Delete a vendor",
     *     tags={"Admin Vendors"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Vendor ID or Slug",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=204,
     *         description="Vendor deleted"
     *     )
     * )
     */
    public function destroy(Vendor $vendor)
    {
        $vendor->delete();
        return response()->json(null, 204);
    }
}
