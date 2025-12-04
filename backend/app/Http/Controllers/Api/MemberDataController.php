<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MemberDataPool;
use Illuminate\Http\Request;

class MemberDataController extends Controller
{
    /**
     * @OA\Get(
     *     path="/members/search",
     *     summary="Search members by name or phone",
     *     tags={"Members"},
     *     @OA\Parameter(
     *         name="query",
     *         in="query",
     *         description="Search query (min 3 chars)",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation"
     *     )
     * )
     */
    public function search(Request $request)
    {
        $query = $request->input('query');

        if (!$query || strlen($query) < 3) {
            return response()->json([]);
        }

        $members = MemberDataPool::where('phone_number', 'like', "%{$query}%")
            ->orWhere('name', 'like', "%{$query}%")
            ->limit(10)
            ->get(['name', 'phone_number', 'qobilah']);

        return response()->json($members);
    }
}
