<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\FeeTransaction;
use App\Models\Student;
use App\Models\FeeType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class FeeTransactionController extends Controller
{
    /**
     * Display a listing of fee transactions
     */
    public function index(Request $request)
    {
        try {
            $query = FeeTransaction::with(['student.classRoom', 'student.section', 'feeType.feeGroup', 'collectedBy'])
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

            // Filter by payment mode
            if ($request->has('payment_mode')) {
                $query->byPaymentMode($request->payment_mode);
            }

            // Filter by date range
            if ($request->has('date_from') && $request->has('date_to')) {
                $query->inDateRange($request->date_from, $request->date_to);
            }

            // Filter by payment date
            if ($request->has('payment_date')) {
                $query->whereDate('payment_date', $request->payment_date);
            }

            // Search by receipt number or student name
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('receipt_no', 'like', '%' . $search . '%')
                      ->orWhereHas('student', function ($subQ) use ($search) {
                          $subQ->where('name', 'like', '%' . $search . '%')
                               ->orWhere('admission_no', 'like', '%' . $search . '%');
                      });
                });
            }

            $transactions = $query->orderBy('payment_date', 'desc')
                ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $transactions,
                'message' => 'Fee transactions retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve fee transactions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified transaction
     */
    public function show($id)
    {
        try {
            $transaction = FeeTransaction::with(['student.classRoom', 'student.section', 'feeType.feeGroup', 'collectedBy'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $transaction,
                'message' => 'Transaction retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Get transaction by receipt number
     */
    public function getByReceipt($receiptNo)
    {
        try {
            $transaction = FeeTransaction::with(['student.classRoom', 'student.section', 'feeType.feeGroup', 'collectedBy'])
                ->where('receipt_no', $receiptNo)
                ->first();

            if (!$transaction) {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaction not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $transaction,
                'message' => 'Transaction retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve transaction',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get transaction summary
     */
    public function getTransactionSummary(Request $request)
    {
        try {
            $query = FeeTransaction::inSession($request->session_id);

            // Apply filters
            if ($request->has('class_id')) {
                $query->byClass($request->class_id);
            }

            if ($request->has('section_id')) {
                $query->bySection($request->section_id);
            }

            if ($request->has('date_from') && $request->has('date_to')) {
                $query->inDateRange($request->date_from, $request->date_to);
            }

            if ($request->has('payment_mode')) {
                $query->byPaymentMode($request->payment_mode);
            }

            $transactions = $query->get();

            // Calculate summary
            $summary = [
                'total_transactions' => $transactions->count(),
                'total_amount_collected' => $transactions->sum('amount_paid'),
                'total_students' => $transactions->unique('student_id')->count(),
                'payment_mode_breakdown' => $transactions->groupBy('payment_mode')
                    ->map(function ($group) {
                        return [
                            'count' => $group->count(),
                            'amount' => $group->sum('amount_paid')
                        ];
                    }),
                'daily_collection' => $transactions->groupBy('payment_date')
                    ->map(function ($group) {
                        return [
                            'count' => $group->count(),
                            'amount' => $group->sum('amount_paid')
                        ];
                    })
                    ->sortKeys()
                    ->take(30) // Last 30 days
            ];

            return response()->json([
                'success' => true,
                'data' => $summary,
                'message' => 'Transaction summary retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve transaction summary',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get today's collection summary
     */
    public function getTodayCollection()
    {
        try {
            $today = Carbon::today();
            
            $transactions = FeeTransaction::whereDate('payment_date', $today)->get();

            $summary = [
                'date' => $today->format('Y-m-d'),
                'total_transactions' => $transactions->count(),
                'total_amount' => $transactions->sum('amount_paid'),
                'payment_modes' => $transactions->groupBy('payment_mode')
                    ->map(function ($group) {
                        return [
                            'count' => $group->count(),
                            'amount' => $group->sum('amount_paid')
                        ];
                    }),
                'recent_transactions' => FeeTransaction::with(['student', 'feeType.feeGroup'])
                    ->whereDate('payment_date', $today)
                    ->orderBy('created_at', 'desc')
                    ->take(10)
                    ->get()
            ];

            return response()->json([
                'success' => true,
                'data' => $summary,
                'message' => 'Today\'s collection summary retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve today\'s collection summary',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get monthly collection summary
     */
    public function getMonthlyCollection(Request $request)
    {
        try {
            $month = $request->get('month', Carbon::now()->format('Y-m'));
            $startDate = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
            $endDate = Carbon::createFromFormat('Y-m', $month)->endOfMonth();

            $transactions = FeeTransaction::inDateRange($startDate, $endDate)
                ->inSession($request->session_id)
                ->get();

            $summary = [
                'month' => $month,
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'total_transactions' => $transactions->count(),
                'total_amount' => $transactions->sum('amount_paid'),
                'daily_breakdown' => $transactions->groupBy('payment_date')
                    ->map(function ($group) {
                        return [
                            'count' => $group->count(),
                            'amount' => $group->sum('amount_paid')
                        ];
                    })
                    ->sortKeys(),
                'payment_mode_breakdown' => $transactions->groupBy('payment_mode')
                    ->map(function ($group) {
                        return [
                            'count' => $group->count(),
                            'amount' => $group->sum('amount_paid')
                        ];
                    })
            ];

            return response()->json([
                'success' => true,
                'data' => $summary,
                'message' => 'Monthly collection summary retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve monthly collection summary',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate receipt for a transaction
     */
    public function generateReceipt($id)
    {
        try {
            $transaction = FeeTransaction::with(['student.classRoom', 'student.section', 'feeType.feeGroup', 'collectedBy'])
                ->findOrFail($id);

            $receipt = [
                'receipt_no' => $transaction->receipt_no,
                'date' => $transaction->payment_date->format('d/m/Y'),
                'student_name' => $transaction->student->name,
                'admission_no' => $transaction->student->admission_no,
                'class' => $transaction->student->classRoom->name ?? 'N/A',
                'section' => $transaction->student->section->name ?? 'N/A',
                'fee_type' => $transaction->feeType->name,
                'fee_group' => $transaction->feeType->feeGroup->name,
                'amount_paid' => $transaction->amount_paid,
                'payment_mode' => ucfirst($transaction->payment_mode),
                'collected_by' => $transaction->collectedBy->name ?? 'N/A',
                'notes' => $transaction->notes,
                'reference_no' => $transaction->reference_no
            ];

            return response()->json([
                'success' => true,
                'data' => $receipt,
                'message' => 'Receipt generated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate receipt',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update transaction notes
     */
    public function updateNotes(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'notes' => 'nullable|string|max:1000'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $transaction = FeeTransaction::findOrFail($id);
            $transaction->update(['notes' => $request->notes]);

            return response()->json([
                'success' => true,
                'data' => $transaction->load(['student', 'feeType.feeGroup']),
                'message' => 'Transaction notes updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update transaction notes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Collect fee payment with advanced features
     */
    public function collectFee(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'student_id' => 'required|exists:students,id',
                'fee_type_id' => 'required|exists:fee_types,id',
                'amount_paid' => 'required|numeric|min:0.01',
                'payment_date' => 'required|date',
                'payment_mode' => 'required|in:cash,online,cheque,bank_transfer',
                'session_id' => 'required|exists:sessions,id',
                'notes' => 'nullable|string|max:1000',
                'reference_no' => 'nullable|string|max:255'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if student has this fee assigned
            $studentFee = \App\Models\StudentFee::where('student_id', $request->student_id)
                ->where('fee_type_id', $request->fee_type_id)
                ->where('session_id', $request->session_id)
                ->first();

            if (!$studentFee) {
                return response()->json([
                    'success' => false,
                    'message' => 'Fee not assigned to this student'
                ], 400);
            }

            // Check if payment amount exceeds remaining amount
            $remainingAmount = $studentFee->amount_due - $studentFee->amount_paid;
            if ($request->amount_paid > $remainingAmount) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment amount exceeds remaining amount'
                ], 400);
            }

            \DB::beginTransaction();

            try {
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

                \DB::commit();

                return response()->json([
                    'success' => true,
                    'data' => $transaction->load(['student.classRoom', 'student.section', 'feeType.feeGroup', 'collectedBy']),
                    'message' => 'Payment collected successfully'
                ]);

            } catch (\Exception $e) {
                \DB::rollback();
                throw $e;
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to collect payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate invoice for a student
     */
    public function generateInvoice(Request $request, $studentId)
    {
        try {
            $validator = Validator::make($request->all(), [
                'session_id' => 'required|exists:sessions,id',
                'include_paid' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $student = \App\Models\Student::with(['classRoom', 'section'])
                ->findOrFail($studentId);

            $query = \App\Models\StudentFee::with(['feeType.feeGroup'])
                ->where('student_id', $studentId)
                ->where('session_id', $request->session_id);

            if (!$request->include_paid) {
                $query->where('status', '!=', 'paid');
            }

            $studentFees = $query->get();

            $invoice = [
                'invoice_no' => 'INV' . date('Y') . date('m') . str_pad($studentId, 4, '0', STR_PAD_LEFT),
                'date' => now()->format('Y-m-d'),
                'student' => [
                    'id' => $student->id,
                    'name' => $student->name,
                    'admission_no' => $student->admission_no,
                    'class' => $student->classRoom->name ?? 'N/A',
                    'section' => $student->section->name ?? 'N/A'
                ],
                'session' => \App\Models\Session::find($request->session_id)->name,
                'fees' => $studentFees->map(function ($fee) {
                    return [
                        'fee_type' => $fee->feeType->name,
                        'fee_group' => $fee->feeType->feeGroup->name,
                        'amount_due' => $fee->amount_due,
                        'amount_paid' => $fee->amount_paid,
                        'remaining' => $fee->amount_due - $fee->amount_paid,
                        'status' => $fee->status,
                        'due_date' => $fee->due_date
                    ];
                }),
                'summary' => [
                    'total_due' => $studentFees->sum('amount_due'),
                    'total_paid' => $studentFees->sum('amount_paid'),
                    'total_remaining' => $studentFees->sum('amount_due') - $studentFees->sum('amount_paid')
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $invoice,
                'message' => 'Invoice generated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate invoice',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get fee breakdown for a student
     */
    public function getFeeSplit(Request $request, $studentId)
    {
        try {
            $validator = Validator::make($request->all(), [
                'session_id' => 'required|exists:sessions,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $student = \App\Models\Student::with(['classRoom', 'section'])
                ->findOrFail($studentId);

            $studentFees = \App\Models\StudentFee::with(['feeType.feeGroup'])
                ->where('student_id', $studentId)
                ->where('session_id', $request->session_id)
                ->get();

            $feeBreakdown = [
                'student' => [
                    'id' => $student->id,
                    'name' => $student->name,
                    'admission_no' => $student->admission_no,
                    'class' => $student->classRoom->name ?? 'N/A',
                    'section' => $student->section->name ?? 'N/A'
                ],
                'session' => \App\Models\Session::find($request->session_id)->name,
                'by_fee_group' => $studentFees->groupBy('feeType.feeGroup.name')->map(function ($group) {
                    return [
                        'total_due' => $group->sum('amount_due'),
                        'total_paid' => $group->sum('amount_paid'),
                        'total_remaining' => $group->sum('amount_due') - $group->sum('amount_paid'),
                        'fee_types' => $group->map(function ($fee) {
                            return [
                                'name' => $fee->feeType->name,
                                'amount_due' => $fee->amount_due,
                                'amount_paid' => $fee->amount_paid,
                                'remaining' => $fee->amount_due - $fee->amount_paid,
                                'status' => $fee->status,
                                'due_date' => $fee->due_date
                            ];
                        })
                    ];
                }),
                'by_status' => [
                    'pending' => $studentFees->where('status', 'pending')->sum('amount_due'),
                    'partial' => $studentFees->where('status', 'partial')->sum('amount_due') - $studentFees->where('status', 'partial')->sum('amount_paid'),
                    'overdue' => $studentFees->where('status', 'overdue')->sum('amount_due'),
                    'paid' => $studentFees->where('status', 'paid')->sum('amount_paid')
                ],
                'summary' => [
                    'total_due' => $studentFees->sum('amount_due'),
                    'total_paid' => $studentFees->sum('amount_paid'),
                    'total_remaining' => $studentFees->sum('amount_due') - $studentFees->sum('amount_paid')
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $feeBreakdown,
                'message' => 'Fee breakdown retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve fee breakdown',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
