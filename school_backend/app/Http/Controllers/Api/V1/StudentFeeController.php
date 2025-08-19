<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\StudentFee;
use App\Models\Student;
use App\Models\FeeType;
use App\Models\FeeTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class StudentFeeController extends Controller
{
    /**
     * Display a listing of student fees
     */
    public function index(Request $request)
    {
        try {
            $query = StudentFee::with(['student.classRoom', 'student.section', 'feeType.feeGroup', 'session'])
                ->inSession($request->session_id);

            // Filter by student
            if ($request->has('student_id')) {
                $query->byStudent($request->student_id);
            }

            // Filter by class
            if ($request->has('class_id')) {
                $query->byClass($request->class_id);
            }

            // Filter by section
            if ($request->has('section_id')) {
                $query->bySection($request->section_id);
            }

            // Filter by status
            if ($request->has('status')) {
                $query->byStatus($request->status);
            }

            // Filter by fee type
            if ($request->has('fee_type_id')) {
                $query->where('fee_type_id', $request->fee_type_id);
            }

            // Search by student name or admission number
            if ($request->has('search')) {
                $search = $request->search;
                $query->whereHas('student', function ($q) use ($search) {
                    $q->where('name', 'like', '%' . $search . '%')
                      ->orWhere('admission_no', 'like', '%' . $search . '%');
                });
            }

            $studentFees = $query->orderBy('created_at', 'desc')
                ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $studentFees,
                'message' => 'Student fees retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve student fees',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Assign fees to students
     */
    public function assignFees(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'student_ids' => 'required|array|min:1',
                'student_ids.*' => 'exists:students,id',
                'fee_type_ids' => 'required|array|min:1',
                'fee_type_ids.*' => 'exists:fee_types,id',
                'session_id' => 'required|exists:sessions,id',
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

            DB::beginTransaction();

            $assignedCount = 0;
            $errors = [];

            foreach ($request->student_ids as $studentId) {
                foreach ($request->fee_type_ids as $feeTypeId) {
                    try {
                        // Check if fee is already assigned
                        $existingFee = StudentFee::where('student_id', $studentId)
                            ->where('fee_type_id', $feeTypeId)
                            ->where('session_id', $request->session_id)
                            ->first();

                        if ($existingFee) {
                            $errors[] = "Fee already assigned to student ID: {$studentId}";
                            continue;
                        }

                        // Get fee type details
                        $feeType = FeeType::find($feeTypeId);
                        
                        // Verify fee type belongs to the session
                        if ($feeType->session_id != $request->session_id) {
                            $errors[] = "Fee type ID: {$feeTypeId} does not belong to the selected session";
                            continue;
                        }

                        // Create student fee record
                        StudentFee::create([
                            'student_id' => $studentId,
                            'fee_type_id' => $feeTypeId,
                            'amount_due' => $feeType->amount,
                            'amount_paid' => 0,
                            'status' => 'pending',
                            'session_id' => $request->session_id,
                            'due_date' => $request->due_date ?? $feeType->due_date,
                            'notes' => $request->notes
                        ]);

                        $assignedCount++;
                    } catch (\Exception $e) {
                        $errors[] = "Failed to assign fee to student ID: {$studentId} - " . $e->getMessage();
                    }
                }
            }

            if ($assignedCount > 0) {
                DB::commit();
                
                return response()->json([
                    'success' => true,
                    'message' => "Successfully assigned {$assignedCount} fee(s) to students",
                    'assigned_count' => $assignedCount,
                    'errors' => $errors
                ]);
            } else {
                DB::rollBack();
                
                return response()->json([
                    'success' => false,
                    'message' => 'No fees were assigned',
                    'errors' => $errors
                ], 422);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign fees',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Collect fee payment
     */
    public function collectPayment(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'student_id' => 'required|exists:students,id',
                'fee_type_id' => 'required|exists:fee_types,id',
                'amount_paid' => 'required|numeric|min:0.01',
                'payment_date' => 'required|date',
                'payment_mode' => 'required|in:cash,online,cheque,bank_transfer',
                'session_id' => 'required|exists:sessions,id',
                'notes' => 'nullable|string',
                'reference_no' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            // Get student fee record
            $studentFee = StudentFee::where('student_id', $request->student_id)
                ->where('fee_type_id', $request->fee_type_id)
                ->where('session_id', $request->session_id)
                ->first();

            if (!$studentFee) {
                return response()->json([
                    'success' => false,
                    'message' => 'Fee not assigned to this student'
                ], 422);
            }

            // Check if payment amount exceeds due amount
            if ($request->amount_paid > $studentFee->remaining_amount) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment amount cannot exceed remaining due amount'
                ], 422);
            }

            // Create fee transaction
            $transaction = FeeTransaction::create([
                'student_id' => $request->student_id,
                'fee_type_id' => $request->fee_type_id,
                'amount_paid' => $request->amount_paid,
                'payment_date' => $request->payment_date,
                'payment_mode' => $request->payment_mode,
                'receipt_no' => FeeTransaction::generateReceiptNo(),
                'session_id' => $request->session_id,
                'collected_by' => auth()->id(),
                'notes' => $request->notes,
                'reference_no' => $request->reference_no
            ]);

            // Update student fee record
            $studentFee->amount_paid += $request->amount_paid;
            $studentFee->updateStatus();
            $studentFee->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => [
                    'transaction' => $transaction->load(['student', 'feeType.feeGroup']),
                    'student_fee' => $studentFee->load(['student', 'feeType.feeGroup'])
                ],
                'message' => 'Payment collected successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to collect payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get fee summary for a student
     */
    public function getStudentFeeSummary($studentId, Request $request)
    {
        try {
            $sessionId = $request->session_id;
            
            $studentFees = StudentFee::with(['feeType.feeGroup'])
                ->where('student_id', $studentId)
                ->inSession($sessionId)
                ->get();

            $summary = [
                'total_due' => $studentFees->sum('amount_due'),
                'total_paid' => $studentFees->sum('amount_paid'),
                'total_remaining' => $studentFees->sum('remaining_amount'),
                'pending_count' => $studentFees->where('status', 'pending')->count(),
                'partial_count' => $studentFees->where('status', 'partial')->count(),
                'paid_count' => $studentFees->where('status', 'paid')->count(),
                'overdue_count' => $studentFees->where('status', 'overdue')->count(),
                'fees' => $studentFees
            ];

            return response()->json([
                'success' => true,
                'data' => $summary,
                'message' => 'Student fee summary retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve student fee summary',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get fee reports
     */
    public function getFeeReports(Request $request)
    {
        try {
            $query = StudentFee::with(['student.classRoom', 'student.section', 'feeType.feeGroup'])
                ->inSession($request->session_id);

            // Apply filters
            if ($request->has('class_id')) {
                $query->byClass($request->class_id);
            }

            if ($request->has('section_id')) {
                $query->bySection($request->section_id);
            }

            if ($request->has('status')) {
                $query->byStatus($request->status);
            }

            if ($request->has('date_from')) {
                $query->where('created_at', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->where('created_at', '<=', $request->date_to);
            }

            $reports = $query->get();

            // Calculate summary
            $summary = [
                'total_students' => $reports->unique('student_id')->count(),
                'total_fees_due' => $reports->sum('amount_due'),
                'total_fees_paid' => $reports->sum('amount_paid'),
                'total_fees_remaining' => $reports->sum('remaining_amount'),
                'pending_amount' => $reports->where('status', 'pending')->sum('amount_due'),
                'partial_amount' => $reports->where('status', 'partial')->sum('remaining_amount'),
                'overdue_amount' => $reports->where('status', 'overdue')->sum('remaining_amount')
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'summary' => $summary,
                    'reports' => $reports
                ],
                'message' => 'Fee reports retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve fee reports',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove fee assignment
     */
    public function removeFeeAssignment($id)
    {
        try {
            $studentFee = StudentFee::findOrFail($id);

            // Check if fee has payments
            if ($studentFee->amount_paid > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot remove fee assignment. It has payments.'
                ], 422);
            }

            $studentFee->delete();

            return response()->json([
                'success' => true,
                'message' => 'Fee assignment removed successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove fee assignment',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
