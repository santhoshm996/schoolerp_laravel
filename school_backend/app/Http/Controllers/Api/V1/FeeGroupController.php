<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\FeeGroup;
use App\Models\Session;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class FeeGroupController extends Controller
{
    /**
     * Display a listing of fee groups
     */
    public function index(Request $request)
    {
        try {
            $query = FeeGroup::with(['session', 'feeTypes'])
                ->inSession($request->session_id);

            // Filter by active status
            if ($request->has('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            }

            // Search by name
            if ($request->has('search')) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }

            $feeGroups = $query->orderBy('name')->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $feeGroups,
                'message' => 'Fee groups retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve fee groups',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created fee group
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'session_id' => 'required|exists:sessions,id',
                'is_active' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if fee group with same name exists in the session
            $existingFeeGroup = FeeGroup::where('name', $request->name)
                ->where('session_id', $request->session_id)
                ->first();

            if ($existingFeeGroup) {
                return response()->json([
                    'success' => false,
                    'message' => 'A fee group with this name already exists in the selected session'
                ], 422);
            }

            $feeGroup = FeeGroup::create($request->all());

            return response()->json([
                'success' => true,
                'data' => $feeGroup->load(['session', 'feeTypes']),
                'message' => 'Fee group created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create fee group',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified fee group
     */
    public function show($id)
    {
        try {
            $feeGroup = FeeGroup::with(['session', 'feeTypes'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $feeGroup,
                'message' => 'Fee group retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fee group not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified fee group
     */
    public function update(Request $request, $id)
    {
        try {
            $feeGroup = FeeGroup::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'session_id' => 'required|exists:sessions,id',
                'is_active' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if fee group with same name exists in the session (excluding current one)
            $existingFeeGroup = FeeGroup::where('name', $request->name)
                ->where('session_id', $request->session_id)
                ->where('id', '!=', $id)
                ->first();

            if ($existingFeeGroup) {
                return response()->json([
                    'success' => false,
                    'message' => 'A fee group with this name already exists in the selected session'
                ], 422);
            }

            $feeGroup->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $feeGroup->load(['session', 'feeTypes']),
                'message' => 'Fee group updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update fee group',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified fee group
     */
    public function destroy($id)
    {
        try {
            $feeGroup = FeeGroup::findOrFail($id);

            // Check if fee group has fee types
            if ($feeGroup->feeTypes()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete fee group. It contains fee types.'
                ], 422);
            }

            $feeGroup->delete();

            return response()->json([
                'success' => true,
                'message' => 'Fee group deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete fee group',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get fee groups for a specific session
     */
    public function getBySession($sessionId)
    {
        try {
            $feeGroups = FeeGroup::with(['session', 'feeTypes'])
                ->where('session_id', $sessionId)
                ->where('is_active', true)
                ->orderBy('name')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $feeGroups,
                'message' => 'Fee groups retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve fee groups',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
