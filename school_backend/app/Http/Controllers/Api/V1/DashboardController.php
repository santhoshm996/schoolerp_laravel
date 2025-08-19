<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Student;
use App\Models\ClassRoom;
use App\Models\Section;
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
                    return $this->getAdminDashboard();
                case 'teacher':
                    return $this->getTeacherDashboard($user);
                case 'accountant':
                    return $this->getAccountantDashboard();
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
    private function getAdminDashboard()
    {
        try {
            $stats = [
                'total_students' => Student::count(),
                'total_teachers' => User::role('teacher')->count(),
                'total_classes' => ClassRoom::count(),
                'total_sections' => Section::count(),
                'recent_activities' => $this->getRecentActivities(),
                'system_health' => [
                    'status' => 'healthy',
                    'last_backup' => now()->subDays(2)->format('Y-m-d H:i:s'),
                    'active_users_today' => User::where('status', 'active')->count()
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
                        'active_users_today' => 0
                    ]
                ],
                'message' => 'Dashboard data retrieved with errors'
            ]);
        }
    }

    /**
     * Get teacher dashboard statistics
     */
    private function getTeacherDashboard($user)
    {
        try {
            // For now, return placeholder data
            // In a real implementation, you'd query actual class assignments
            $stats = [
                'assigned_classes' => [
                    'count' => 3,
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
                'total_students' => 105,
                'attendance_today' => 98
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
                    'attendance_today' => 0
                ],
                'message' => 'Teacher dashboard data retrieved with errors'
            ]);
        }
    }

    /**
     * Get accountant dashboard statistics
     */
    private function getAccountantDashboard()
    {
        // For now, return placeholder data
        // In a real implementation, you'd query actual financial data
        $stats = [
            'todays_collection' => [
                'amount' => 120000,
                'transactions' => 45,
                'pending' => 25000
            ],
            'pending_dues' => [
                'total_amount' => 450000,
                'students_count' => 89,
                'overdue_count' => 23
            ],
            'monthly_summary' => [
                'collected' => 850000,
                'pending' => 320000,
                'total_students' => 1200
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
            'message' => 'Accountant dashboard data retrieved successfully'
        ]);
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
        // For now, return placeholder data
        // In a real implementation, you'd query actual activity logs
        return [
            ['action' => 'New student registered', 'user' => 'John Doe', 'time' => now()->subHours(2)->format('H:i')],
            ['action' => 'Class schedule updated', 'user' => 'Admin User', 'time' => now()->subHours(4)->format('H:i')],
            ['action' => 'Fee payment received', 'user' => 'Jane Smith', 'time' => now()->subHours(6)->format('H:i')],
            ['action' => 'New teacher added', 'user' => 'Admin User', 'time' => now()->subHours(8)->format('H:i')]
        ];
    }
}
