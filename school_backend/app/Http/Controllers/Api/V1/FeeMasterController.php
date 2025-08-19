<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\FeeMaster;
use App\Models\Student;
use App\Models\StudentFee;
use App\Models\FeeType;
use App\Models\ClassRoom;
use App\Models\FeeGroup;
use App\Models\Session;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class FeeMasterController extends Controller
{
    /**
     * Display a listing of fee master entries
     */
    public function index(Request $request)
    {
        try {
            $query = FeeMaster::with(['feeGroup', 'feeType', 'classRoom', 'session'])
                ->inSession($request->session_id);

            // Filter by class
            if ($request->has('class_id')) {
                $query->byClass($request->class_id);
            }

            // Filter by fee group
            if ($request->has('fee_group_id')) {
                $query->byFeeGroup($request->fee_group_id);
            }

            // Filter by fee type
            if ($request->has('fee_type_id')) {
                $query->byFeeType($request->fee_type_id);
            }

            // Search by fee type name
            if ($request->has('search')) {
                $query->whereHas('feeType', function ($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->search . '%');
                });
            }

            $feeMasters = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $feeMasters,
                'message' => 'Fee master entries retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve fee master entries',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created fee master entry
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'fee_group_id' => 'required|exists:fee_groups,id',
                'fee_type_id' => 'required|exists:fee_types,id',
                'class_id' => 'required|exists:classes,id',
                'amount' => 'required|numeric|min:0',
                'session_id' => 'required|exists:sessions,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if fee master entry already exists for this combination
            $existingEntry = FeeMaster::where('fee_type_id', $request->fee_type_id)
                ->where('class_id', $request->class_id)
                ->where('session_id', $request->session_id)
                ->first();

            if ($existingEntry) {
                return response()->json([
                    'success' => false,
                    'message' => 'A fee master entry already exists for this fee type, class, and session combination'
                ], 422);
            }

            // Verify fee type belongs to the fee group
            $feeType = FeeType::find($request->fee_type_id);
            if ($feeType->fee_group_id != $request->fee_group_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Fee type does not belong to the selected fee group'
                ], 422);
            }

            // Verify fee group and fee type belong to the same session
            if ($feeType->session_id != $request->session_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Fee type does not belong to the selected session'
                ], 422);
            }

            $feeMaster = FeeMaster::create($request->all());

            return response()->json([
                'success' => true,
                'data' => $feeMaster->load(['feeGroup', 'feeType', 'classRoom', 'session']),
                'message' => 'Fee master entry created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create fee master entry',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified fee master entry
     */
    public function show($id)
    {
        try {
            $feeMaster = FeeMaster::with(['feeGroup', 'feeType', 'classRoom', 'session'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $feeMaster,
                'message' => 'Fee master entry retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fee master entry not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified fee master entry
     */
    public function update(Request $request, $id)
    {
        try {
            $feeMaster = FeeMaster::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'fee_group_id' => 'required|exists:fee_groups,id',
                'fee_type_id' => 'required|exists:fee_types,id',
                'class_id' => 'required|exists:classes,id',
                'amount' => 'required|numeric|min:0',
                'session_id' => 'required|exists:sessions,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if fee master entry already exists for this combination (excluding current one)
            $existingEntry = FeeMaster::where('fee_type_id', $request->fee_type_id)
                ->where('class_id', $request->class_id)
                ->where('session_id', $request->session_id)
                ->where('id', '!=', $id)
                ->first();

            if ($existingEntry) {
                return response()->json([
                    'success' => false,
                    'message' => 'A fee master entry already exists for this fee type, class, and session combination'
                ], 422);
            }

            // Verify fee type belongs to the fee group
            $feeType = FeeType::find($request->fee_type_id);
            if ($feeType->fee_group_id != $request->fee_group_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Fee type does not belong to the selected fee group'
                ], 422);
            }

            // Verify fee group and fee type belong to the same session
            if ($feeType->session_id != $request->session_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Fee type does not belong to the selected session'
                ], 422);
            }

            $feeMaster->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $feeMaster->load(['feeGroup', 'feeType', 'classRoom', 'session']),
                'message' => 'Fee master entry updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update fee master entry',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified fee master entry
     */
    public function destroy($id)
    {
        try {
            $feeMaster = FeeMaster::findOrFail($id);

            // Check if this fee master entry can be deleted
            if (!$feeMaster->canBeDeleted()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete fee master entry. It is already assigned to students.'
                ], 422);
            }

            $feeMaster->delete();

            return response()->json([
                'success' => true,
                'message' => 'Fee master entry deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete fee master entry',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Assign fees to students based on fee master
     */
    public function assignFees(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'class_id' => 'required|exists:classes,id',
                'section_id' => 'nullable|exists:sections,id',
                'session_id' => 'required|exists:sessions,id',
                'fee_type_ids' => 'required|array|min:1',
                'fee_type_ids.*' => 'exists:fee_types,id',
                'due_date' => 'nullable|date|after_or_equal:today',
                'notes' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Get students in the specified class and section
            $studentsQuery = Student::where('class_id', $request->class_id)
                ->where('session_id', $request->session_id);

            if ($request->section_id) {
                $studentsQuery->where('section_id', $request->section_id);
            }

            $students = $studentsQuery->get();

            if ($students->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No students found in the specified class and section'
                ], 422);
            }

            // Get fee master entries for the specified fee types and class
            $feeMasters = FeeMaster::whereIn('fee_type_id', $request->fee_type_ids)
                ->where('class_id', $request->class_id)
                ->where('session_id', $request->session_id)
                ->get();

            if ($feeMasters->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No fee master entries found for the specified fee types and class'
                ], 422);
            }

            $assignedCount = 0;
            $errors = [];

            DB::beginTransaction();

            try {
                foreach ($students as $student) {
                    foreach ($feeMasters as $feeMaster) {
                        // Check if fee is already assigned to this student
                        $existingFee = StudentFee::where('student_id', $student->id)
                            ->where('fee_type_id', $feeMaster->fee_type_id)
                            ->where('session_id', $request->session_id)
                            ->first();

                        if ($existingFee) {
                            $errors[] = "Fee type '{$feeMaster->feeType->name}' already assigned to student '{$student->name}'";
                            continue;
                        }

                        // Create student fee record
                        StudentFee::create([
                            'student_id' => $student->id,
                            'fee_type_id' => $feeMaster->fee_type_id,
                            'amount_due' => $feeMaster->amount,
                            'amount_paid' => 0,
                            'status' => 'pending',
                            'session_id' => $request->session_id,
                            'due_date' => $request->due_date,
                            'notes' => $request->notes
                        ]);

                        $assignedCount++;
                    }
                }

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => "Successfully assigned fees to {$assignedCount} students",
                    'data' => [
                        'assigned_count' => $assignedCount,
                        'total_students' => $students->count(),
                        'errors' => $errors
                    ]
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign fees to students',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get fee master summary for a class
     */
    public function getClassSummary(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'class_id' => 'required|exists:classes,id',
                'session_id' => 'required|exists:sessions,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $feeMasters = FeeMaster::with(['feeGroup', 'feeType'])
                ->where('class_id', $request->class_id)
                ->where('session_id', $request->session_id)
                ->get();

            $summary = [
                'total_fee_types' => $feeMasters->count(),
                'total_amount' => $feeMasters->sum('amount'),
                'fee_groups' => $feeMasters->groupBy('fee_group_id')->map(function ($group) {
                    return [
                        'fee_group_name' => $group->first()->feeGroup->name,
                        'fee_types' => $group->map(function ($feeMaster) {
                            return [
                                'fee_type_name' => $feeMaster->feeType->name,
                                'amount' => $feeMaster->amount,
                                'formatted_amount' => $feeMaster->formatted_amount
                            ];
                        })
                    ];
                })
            ];

            return response()->json([
                'success' => true,
                'data' => $summary,
                'message' => 'Fee master summary retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve fee master summary',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
