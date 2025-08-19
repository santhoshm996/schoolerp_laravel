<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\FeeType;
use App\Models\FeeGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FeeTypeController extends Controller
{
    /**
     * Display a listing of fee types
     */
    public function index(Request $request)
    {
        try {
            $query = FeeType::with(['feeGroup', 'session'])
                ->inSession($request->session_id);

            // Filter by fee group
            if ($request->has('fee_group_id')) {
                $query->where('fee_group_id', $request->fee_group_id);
            }

            // Filter by active status
            if ($request->has('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            }

            // Filter by frequency
            if ($request->has('frequency')) {
                $query->where('frequency', $request->frequency);
            }

            // Search by name
            if ($request->has('search')) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }

            $feeTypes = $query->orderBy('name')->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $feeTypes,
                'message' => 'Fee types retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve fee types',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created fee type
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'amount' => 'required|numeric|min:0',
                'fee_group_id' => 'required|exists:fee_groups,id',
                'session_id' => 'required|exists:sessions,id',
                'frequency' => 'required|in:one_time,monthly,quarterly,yearly',
                'due_date' => 'nullable|date|after_or_equal:today',
                'is_active' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if fee type with same name exists in the fee group and session
            $existingFeeType = FeeType::where('name', $request->name)
                ->where('fee_group_id', $request->fee_group_id)
                ->where('session_id', $request->session_id)
                ->first();

            if ($existingFeeType) {
                return response()->json([
                    'success' => false,
                    'message' => 'A fee type with this name already exists in the selected fee group and session'
                ], 422);
            }

            // Verify fee group belongs to the same session
            $feeGroup = FeeGroup::find($request->fee_group_id);
            if ($feeGroup->session_id != $request->session_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Fee group does not belong to the selected session'
                ], 422);
            }

            $feeType = FeeType::create($request->all());

            return response()->json([
                'success' => true,
                'data' => $feeType->load(['feeGroup', 'session']),
                'message' => 'Fee type created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create fee type',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified fee type
     */
    public function show($id)
    {
        try {
            $feeType = FeeType::with(['feeGroup', 'session'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $feeType,
                'message' => 'Fee type retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fee type not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified fee type
     */
    public function update(Request $request, $id)
    {
        try {
            $feeType = FeeType::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'amount' => 'required|numeric|min:0',
                'fee_group_id' => 'required|exists:fee_groups,id',
                'session_id' => 'required|exists:sessions,id',
                'frequency' => 'required|in:one_time,monthly,quarterly,yearly',
                'due_date' => 'nullable|date',
                'is_active' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if fee type with same name exists in the fee group and session (excluding current one)
            $existingFeeType = FeeType::where('name', $request->name)
                ->where('fee_group_id', $request->fee_group_id)
                ->where('session_id', $request->session_id)
                ->where('id', '!=', $id)
                ->first();

            if ($existingFeeType) {
                return response()->json([
                    'success' => false,
                    'message' => 'A fee type with this name already exists in the selected fee group and session'
                ], 422);
            }

            // Verify fee group belongs to the same session
            $feeGroup = FeeGroup::find($request->fee_group_id);
            if ($feeGroup->session_id != $request->session_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Fee group does not belong to the selected session'
                ], 422);
            }

            $feeType->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $feeType->load(['feeGroup', 'session']),
                'message' => 'Fee type updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update fee type',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified fee type
     */
    public function destroy($id)
    {
        try {
            $feeType = FeeType::findOrFail($id);

            // Check if fee type has student fees
            if ($feeType->studentFees()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete fee type. It is assigned to students.'
                ], 422);
            }

            // Check if fee type has transactions
            if ($feeType->feeTransactions()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete fee type. It has payment transactions.'
                ], 422);
            }

            $feeType->delete();

            return response()->json([
                'success' => true,
                'message' => 'Fee type deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete fee type',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get fee types for a specific fee group
     */
    public function getByFeeGroup($feeGroupId)
    {
        try {
            $feeTypes = FeeType::with(['feeGroup', 'session'])
                ->where('fee_group_id', $feeGroupId)
                ->where('is_active', true)
                ->orderBy('name')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $feeTypes,
                'message' => 'Fee types retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve fee types',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
