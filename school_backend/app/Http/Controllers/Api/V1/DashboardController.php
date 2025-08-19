<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Student;
use App\Models\ClassRoom;
use App\Models\Section;
use App\Models\Session;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics based on user role
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated',
                    'status' => 401
                ], 401);
            }
            
            $role = $user->getPrimaryRoleAttribute()->name ?? 'user';
            
            \Log::info('Dashboard request for user: ' . $user->id . ' with role: ' . $role);

            switch ($role) {
                case 'superadmin':
                case 'admin':
                    return $this->getAdminDashboard($request);
                case 'teacher':
                    return $this->getTeacherDashboard($user, $request);
                case 'accountant':
                    return $this->getAccountantDashboard($request);
                case 'student':
                    return $this->getStudentDashboard($user);
                default:
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid role: ' . $role,
                        'status' => 400
                    ], 400);
            }
        } catch (\Exception $e) {
            \Log::error('Dashboard index error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Internal server error: ' . $e->getMessage(),
                'status' => 500
            ], 500);
        }
    }

    /**
     * Get admin dashboard statistics
     */
    private function getAdminDashboard(Request $request = null)
    {
        try {
            // Get the session ID from request or use active session
            $sessionId = $request ? $request->get('session_id') : null;
            
            if ($sessionId) {
                $session = Session::find($sessionId);
                if (!$session) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Session not found',
                        'status' => 404
                    ], 404);
                }
            } else {
                $session = Session::getActiveSession();
                if (!$session) {
                    return response()->json([
                        'success' => false,
                        'message' => 'No active session found',
                        'status' => 404
                    ], 404);
                }
            }
            
            // Calculate performance metrics
            $totalStudents = Student::where('session_id', $session->id)->count();
            $totalTeachers = User::role('teacher')->count();
            $totalClasses = ClassRoom::where('session_id', $session->id)->count();
            $totalSections = Section::where('session_id', $session->id)->count();
            
            // Calculate academic performance (placeholder - in real app, calculate from actual data)
            $academicPerformance = $this->calculateAcademicPerformance($session->id);
            
            // Calculate attendance rate (placeholder - in real app, calculate from actual data)
            $attendanceRate = $this->calculateAttendanceRate($session->id);
            
            // Calculate fee collection rate (placeholder - in real app, calculate from actual data)
            $feeCollectionRate = $this->calculateFeeCollectionRate($session->id);
            
            $stats = [
                'total_students' => $totalStudents,
                'total_teachers' => $totalTeachers,
                'total_classes' => $totalClasses,
                'total_sections' => $totalSections,
                'recent_activities' => $this->getRecentActivities(),
                'system_health' => [
                    'status' => 'healthy',
                    'last_backup' => now()->subDays(2)->format('Y-m-d H:i:s'),
                    'active_users_today' => User::where('status', 'active')->count(),
                    'uptime' => 99.9,
                    'database_size' => '2.5 GB'
                ],
                'performance_metrics' => [
                    'academic_performance' => $academicPerformance,
                    'attendance_rate' => $attendanceRate,
                    'fee_collection_rate' => $feeCollectionRate,
                    'teacher_satisfaction' => 85
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Admin dashboard data retrieved successfully'
            ]);
        } catch (\Exception $e) {
            \Log::error('Dashboard error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => [
                    'total_students' => 0,
                    'total_teachers' => 0,
                    'total_classes' => 0,
                    'total_sections' => 0,
                    'recent_activities' => [],
                    'system_health' => [
                        'status' => 'error',
                        'last_backup' => 'N/A',
                        'active_users_today' => 0,
                        'uptime' => 0,
                        'database_size' => 'N/A'
                    ],
                    'performance_metrics' => [
                        'academic_performance' => 0,
                        'attendance_rate' => 0,
                        'fee_collection_rate' => 0,
                        'teacher_satisfaction' => 0
                    ]
                ],
                'message' => 'Dashboard data retrieved with errors'
            ]);
        }
    }

    /**
     * Get teacher dashboard statistics
     */
    private function getTeacherDashboard($user, Request $request = null)
    {
        try {
            // Get the session ID from request or use active session
            $sessionId = $request ? $request->get('session_id') : null;
            
            if ($sessionId) {
                $session = Session::find($sessionId);
                if (!$session) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Session not found',
                        'status' => 404
                    ], 404);
                }
            } else {
                $session = Session::getActiveSession();
                if (!$session) {
                    return response()->json([
                        'success' => false,
                        'message' => 'No active session found',
                        'status' => 404
                    ], 404);
                }
            }
            
            // For now, return placeholder data filtered by session
            // In a real implementation, you'd query actual class assignments
            $assignedClassesCount = 3;
            $totalStudents = Student::where('session_id', $session->id)->count();
            $attendanceToday = 98;
            $attendancePercentage = 92;
            
            $stats = [
                'assigned_classes' => [
                    'count' => $assignedClassesCount,
                    'classes' => [
                        ['id' => 1, 'name' => 'Class 10A', 'section' => 'A', 'students_count' => 35],
                        ['id' => 2, 'name' => 'Class 9B', 'section' => 'B', 'students_count' => 32],
                        ['id' => 3, 'name' => 'Class 8A', 'section' => 'A', 'students_count' => 38]
                    ]
                ],
                'todays_timetable' => [
                    ['time' => '08:00 AM', 'class' => 'Class 10A', 'subject' => 'Mathematics'],
                    ['time' => '09:00 AM', 'class' => 'Class 9B', 'subject' => 'Science'],
                    ['time' => '10:00 AM', 'class' => 'Class 8A', 'subject' => 'English']
                ],
                'total_students' => $totalStudents,
                'attendance_today' => $attendanceToday,
                'attendance_percentage' => $attendancePercentage
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Teacher dashboard data retrieved successfully'
            ]);
        } catch (\Exception $e) {
            \Log::error('Teacher dashboard error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => [
                    'assigned_classes' => ['count' => 0, 'classes' => []],
                    'todays_timetable' => [],
                    'total_students' => 0,
                    'attendance_today' => 0,
                    'attendance_percentage' => 0
                ],
                'message' => 'Teacher dashboard data retrieved with errors'
            ]);
        }
    }

    /**
     * Get accountant dashboard statistics
     */
    private function getAccountantDashboard(Request $request = null)
    {
        try {
            // Get the session ID from request or use active session
            $sessionId = $request ? $request->get('session_id') : null;
            
            if ($sessionId) {
                $session = Session::find($sessionId);
                if (!$session) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Session not found',
                        'status' => 404
                    ], 404);
                }
            } else {
                $session = Session::getActiveSession();
                if (!$session) {
                                        return response()->json([
                        'success' => false,
                        'message' => 'No active session found',
                        'status' => 400
                    ], 400);
                }
            }
            
            // For now, return placeholder data
            // In a real implementation, you'd query actual financial data filtered by session
            $todaysCollection = 120000;
            $transactions = 45;
            $pending = 25000;
            $pendingDues = 450000;
            $studentsCount = Student::where('session_id', $session->id)->count();
            $overdueCount = 23;
            $monthlyCollected = 850000;
            $monthlyPending = 320000;
            $previousMonth = 780000;
            
            $stats = [
                'todays_collection' => [
                    'amount' => $todaysCollection,
                    'transactions' => $transactions,
                    'pending' => $pending,
                    'target' => $todaysCollection + $pending
                ],
                'pending_dues' => [
                    'total_amount' => $pendingDues,
                    'students_count' => $studentsCount,
                    'overdue_count' => $overdueCount
                ],
                'monthly_summary' => [
                    'collected' => $monthlyCollected,
                    'pending' => $monthlyPending,
                    'total_students' => $studentsCount,
                    'previous_month' => $previousMonth
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Accountant dashboard data retrieved successfully'
            ]);
        } catch (\Exception $e) {
            \Log::error('Accountant dashboard error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data' => [
                    'todays_collection' => ['amount' => 0, 'transactions' => 0, 'pending' => 0, 'target' => 0],
                    'pending_dues' => ['total_amount' => 0, 'students_count' => 0, 'overdue_count' => 0],
                    'monthly_summary' => ['collected' => 0, 'pending' => 0, 'total_students' => 0, 'previous_month' => 0]
                ],
                'message' => 'Accountant dashboard data retrieved with errors'
            ]);
        }
    }

    /**
     * Get student dashboard statistics
     */
    private function getStudentDashboard($user)
    {
        $student = $user->student;
        
        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student record not found',
                'status' => 404
            ], 404);
        }

        $stats = [
            'class_info' => [
                'class' => $student->class->name ?? 'N/A',
                'section' => $student->section->name ?? 'N/A',
                'roll_number' => $student->admission_no ?? 'N/A'
            ],
            'attendance' => [
                'percentage' => 85,
                'present_days' => 17,
                'total_days' => 20
            ],
            'upcoming_exams' => [
                ['subject' => 'Mathematics', 'date' => now()->addDays(3)->format('Y-m-d'), 'type' => 'Mid-term'],
                ['subject' => 'Science', 'date' => now()->addDays(7)->format('Y-m-d'), 'type' => 'Unit Test'],
                ['subject' => 'English', 'date' => now()->addDays(10)->format('Y-m-d'), 'type' => 'Mid-term']
            ],
            'recent_results' => [
                ['subject' => 'Mathematics', 'score' => 85, 'grade' => 'A'],
                ['subject' => 'Science', 'score' => 78, 'grade' => 'B+'],
                ['subject' => 'English', 'score' => 92, 'grade' => 'A+']
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
            'message' => 'Student dashboard data retrieved successfully'
        ]);
    }

    /**
     * Get recent activities for admin dashboard
     */
    private function getRecentActivities()
    {
        // For now, return placeholder data with enhanced structure
        // In a real implementation, you'd query actual activity logs
        return [
            [
                'id' => 'act-001',
                'action' => 'New student registered',
                'user' => 'John Doe',
                'time' => now()->subHours(2)->format('Y-m-d H:i:s'),
                'type' => 'success',
                'details' => 'Student ID: STU-2024-001'
            ],
            [
                'id' => 'act-002',
                'action' => 'Class schedule updated',
                'user' => 'Admin User',
                'time' => now()->subHours(4)->format('Y-m-d H:i:s'),
                'type' => 'info',
                'details' => 'Class 10A timetable modified'
            ],
            [
                'id' => 'act-003',
                'action' => 'Fee payment received',
                'user' => 'Jane Smith',
                'time' => now()->subHours(6)->format('Y-m-d H:i:s'),
                'type' => 'success',
                'details' => 'Amount: ₹15,000'
            ],
            [
                'id' => 'act-004',
                'action' => 'New teacher added',
                'user' => 'Admin User',
                'time' => now()->subHours(8)->format('Y-m-d H:i:s'),
                'type' => 'info',
                'details' => 'Teacher: Sarah Johnson'
            ],
            [
                'id' => 'act-005',
                'action' => 'System backup completed',
                'user' => 'System',
                'time' => now()->subHours(12)->format('Y-m-d H:i:s'),
                'type' => 'success',
                'details' => 'Backup size: 2.3 GB'
            ]
        ];
    }

    /**
     * Calculate academic performance (placeholder implementation)
     */
    private function calculateAcademicPerformance($sessionId)
    {
        // In a real implementation, calculate from actual exam results
        // For now, return a placeholder value
        return 85;
    }

    /**
     * Calculate attendance rate (placeholder implementation)
     */
    private function calculateAttendanceRate($sessionId)
    {
        // In a real implementation, calculate from actual attendance records
        // For now, return a placeholder value
        return 92;
    }

    /**
     * Calculate fee collection rate (placeholder implementation)
     */
    private function calculateFeeCollectionRate($sessionId)
    {
        // In a real implementation, calculate from actual fee collection data
        // For now, return a placeholder value
        return 78;
    }
}
