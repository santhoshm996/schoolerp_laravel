import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSession } from '../contexts/SessionContext';
import { useToast } from '../contexts/ToastContext';
import { dashboardService } from '../services/dashboardService';
import StatCard from '../components/dashboard/StatCard';
import ChartCard from '../components/dashboard/ChartCard';
import QuickActionCard from '../components/dashboard/QuickActionCard';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import DataTable from '../components/dashboard/DataTable';
import SessionSelector from '../components/SessionSelector';
import { useSessionChange } from '../hooks/useSessionChange';
import { 
  Users, 
  GraduationCap, 
  Building2, 
  UserCheck,
  BookOpen,
  Calendar,
  Calculator,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  BarChart3,
  UserPlus,
  Target,
  Activity,
  Shield,
  Database
} from 'lucide-react';

interface DashboardData {
  total_students?: number;
  total_teachers?: number;
  total_classes?: number;
  total_sections?: number;
  system_health?: {
    status?: string;
    last_backup?: string;
    active_users_today?: number;
    uptime?: number;
    database_size?: number;
  };
  recent_activities?: Array<{
    id: string;
    action: string;
    user: string;
    time: string;
    type?: 'success' | 'warning' | 'error' | 'info';
    details?: string;
  }>;
  assigned_classes?: {
    count?: number;
    classes?: Array<{
      id: number;
      name: string;
      section: string;
      students_count: number;
    }>;
  };
  todays_timetable?: Array<{
    time: string;
    class: string;
    subject: string;
  }>;
  attendance_today?: number;
  attendance_percentage?: number;
  todays_collection?: {
    amount?: number;
    transactions?: number;
    pending?: number;
    target?: number;
  };
  pending_dues?: {
    total_amount?: number;
    students_count?: number;
    overdue_count?: number;
  };
  monthly_summary?: {
    collected?: number;
    pending?: number;
    total_students?: number;
    previous_month?: number;
  };
  class_info?: {
    class?: string;
    section?: string;
    roll_number?: string;
  };
  attendance?: {
    percentage?: number;
    present_days?: number;
    total_days?: number;
  };
  upcoming_exams?: Array<{
    subject: string;
    date: string;
    type: string;
  }>;
  recent_results?: Array<{
    subject: string;
    score: number;
    grade: string;
  }>;
  performance_metrics?: {
    academic_performance?: number;
    attendance_rate?: number;
    fee_collection_rate?: number;
    teacher_satisfaction?: number;
  };
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { currentSession } = useSession();
  const { showError } = useToast();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, [currentSession]);

  // Listen for session changes and refresh dashboard data
  useSessionChange(() => {
    fetchDashboardData();
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getDashboardData(currentSession?.id);
      setDashboardData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data');
      showError('Error', err.message || 'Failed to fetch dashboard data');
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value}%`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-96"></div>
          </div>
        </div>
        
        {/* Loading Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded-xl">
        <div className="flex items-start">
          <AlertCircle className="h-6 w-6 text-red-400 mt-0.5 flex-shrink-0" />
          <div className="ml-3">
            <h3 className="text-lg font-medium text-red-800">Error Loading Dashboard</h3>
            <div className="mt-2 text-red-700">{error}</div>
            <button
              onClick={fetchDashboardData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !dashboardData) {
    return null;
  }

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user.name}! 👋
            </h1>
            <p className="text-lg text-gray-600 mb-3">
              Here's an overview of your school system performance.
            </p>
            {currentSession && (
              <div className="flex items-center space-x-2 text-blue-600">
                <Calendar className="h-5 w-5" />
                <span className="font-medium">
                  Academic Session: {currentSession.name} ({new Date(currentSession.start_date).getFullYear()}-{new Date(currentSession.end_date).getFullYear()})
                </span>
              </div>
            )}
          </div>
          {(user.role === 'superadmin' || user.role === 'admin') && (
            <SessionSelector />
          )}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={dashboardData.total_students || 0}
          icon={Users}
          iconColor="text-blue-600"
          bgColor="bg-blue-100"
          trend={{ value: 12, isPositive: true, label: 'vs last month' }}
          status="success"
        />
        <StatCard
          title="Total Teachers"
          value={dashboardData.total_teachers || 0}
          icon={BookOpen}
          iconColor="text-green-600"
          bgColor="bg-green-100"
          trend={{ value: 5, isPositive: true, label: 'vs last month' }}
          status="success"
        />
        <StatCard
          title="Total Classes"
          value={dashboardData.total_classes || 0}
          icon={GraduationCap}
          iconColor="text-purple-600"
          bgColor="bg-purple-100"
          status="info"
        />
        <StatCard
          title="Total Sections"
          value={dashboardData.total_sections || 0}
          icon={Building2}
          iconColor="text-orange-600"
          bgColor="bg-orange-100"
          status="info"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Academic Performance"
          subtitle="Overall student performance"
          data={{ current: 85, target: 90, unit: '%' }}
          type="progress"
          status="success"
          icon={Target}
        />
        <ChartCard
          title="Attendance Rate"
          subtitle="Student attendance this month"
          data={{ current: 92, previous: 89, unit: '%' }}
          type="comparison"
          status="success"
          icon={CheckCircle}
        />
        <ChartCard
          title="System Health"
          subtitle="Infrastructure status"
          data={{ current: 100, unit: '%' }}
          type="status"
          status="success"
          icon={Shield}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            title="Add Student"
            subtitle="New Admission"
            icon={UserPlus}
            iconColor="text-blue-600"
            bgColor="bg-blue-100"
            href="/student-admission"
            badge="New"
            badgeColor="bg-green-100 text-green-800"
          />
          
          <QuickActionCard
            title="View Students"
            subtitle="Manage List"
            icon={Users}
            iconColor="text-green-600"
            bgColor="bg-green-100"
            href="/students"
          />
          
          <QuickActionCard
            title="Manage Classes"
            subtitle="Add/Edit"
            icon={GraduationCap}
            iconColor="text-purple-600"
            bgColor="bg-purple-100"
            href="/classes"
          />
          
          <QuickActionCard
            title="Manage Users"
            subtitle="Staff/Admin"
            icon={BookOpen}
            iconColor="text-orange-600"
            bgColor="bg-orange-100"
            href="/users"
          />
        </div>
      </div>

      {/* System Health & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Database className="h-5 w-5 mr-2 text-blue-600" />
            System Health
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="text-sm font-medium text-gray-700">Status</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <CheckCircle className="h-4 w-4 mr-1" />
                {dashboardData.system_health?.status || 'Healthy'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-sm font-medium text-gray-700">Last Backup</span>
              <span className="text-sm text-gray-900">{dashboardData.system_health?.last_backup || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
              <span className="text-sm font-medium text-gray-700">Active Users Today</span>
              <span className="text-sm text-gray-900">{dashboardData.system_health?.active_users_today || 0}</span>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <ActivityFeed
          title="Recent Activities"
          activities={dashboardData.recent_activities?.map((activity, index) => ({
            ...activity,
            id: activity.id || `activity-${index}`
          })) || []}
          maxItems={5}
          onViewAll={() => window.location.href = '/activities'}
        />
      </div>
    </div>
  );

  const renderTeacherDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user.name}! 👋
        </h1>
        <p className="text-lg text-gray-600">
          Manage your classes and track student progress effectively.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Assigned Classes"
          value={dashboardData.assigned_classes?.count || 0}
          icon={GraduationCap}
          iconColor="text-blue-600"
          bgColor="bg-blue-100"
          status="info"
        />
        <StatCard
          title="Total Students"
          value={dashboardData.total_students || 0}
          icon={Users}
          iconColor="text-green-600"
          bgColor="bg-green-100"
          status="success"
        />
        <StatCard
          title="Attendance Today"
          value={dashboardData.attendance_today || 0}
          icon={CheckCircle}
          iconColor="text-purple-600"
          bgColor="bg-purple-100"
          progress={dashboardData.attendance_percentage || 0}
          status="success"
        />
        <StatCard
          title="Classes Today"
          value={dashboardData.todays_timetable?.length || 0}
          icon={Calendar}
          iconColor="text-orange-600"
          bgColor="bg-orange-100"
          status="info"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Attendance Rate"
          subtitle="This month's attendance"
          data={{ current: dashboardData.attendance_percentage || 0, target: 95, unit: '%' }}
          type="progress"
          status={dashboardData.attendance_percentage && dashboardData.attendance_percentage >= 90 ? 'success' : 'warning'}
          icon={CheckCircle}
        />
        <ChartCard
          title="Class Performance"
          subtitle="Average student scores"
          data={{ current: 78, previous: 75, unit: '%' }}
          type="comparison"
          status="success"
          icon={BarChart3}
        />
      </div>

      {/* Assigned Classes & Today's Timetable */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DataTable
          title="Assigned Classes"
          columns={[
            { key: 'name', label: 'Class' },
            { key: 'section', label: 'Section' },
            { key: 'students_count', label: 'Students' }
          ]}
          data={dashboardData.assigned_classes?.classes || []}
        />

        <DataTable
          title="Today's Timetable"
          columns={[
            { key: 'time', label: 'Time' },
            { key: 'class', label: 'Class' },
            { key: 'subject', label: 'Subject' }
          ]}
          data={dashboardData.todays_timetable || []}
        />
      </div>
    </div>
  );

  const renderAccountantDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user.name}! 👋
        </h1>
        <p className="text-lg text-gray-600">
          Track financial performance and manage fee collections efficiently.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Collection"
          value={formatCurrency(dashboardData.todays_collection?.amount || 0)}
          icon={Calculator}
          iconColor="text-green-600"
          bgColor="bg-green-100"
          subtitle={`${dashboardData.todays_collection?.transactions || 0} transactions`}
          status="success"
        />
        <StatCard
          title="Pending Dues"
          value={formatCurrency(dashboardData.pending_dues?.total_amount || 0)}
          icon={AlertCircle}
          iconColor="text-red-600"
          bgColor="bg-red-100"
          subtitle={`${dashboardData.pending_dues?.students_count || 0} students`}
          status="error"
        />
        <StatCard
          title="Monthly Collection"
          value={formatCurrency(dashboardData.monthly_summary?.collected || 0)}
          icon={TrendingUp}
          iconColor="text-blue-600"
          bgColor="bg-blue-100"
          status="success"
        />
        <StatCard
          title="Overdue Count"
          value={dashboardData.pending_dues?.overdue_count || 0}
          icon={Clock}
          iconColor="text-orange-600"
          bgColor="bg-orange-100"
          status="warning"
        />
      </div>

      {/* Financial Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Collection Rate"
          subtitle="This month's collection"
          data={{ 
            current: dashboardData.monthly_summary?.collected || 0, 
            target: (dashboardData.monthly_summary?.collected || 0) + (dashboardData.monthly_summary?.pending || 0),
            unit: '₹'
          }}
          type="progress"
          status="success"
          icon={DollarSign}
        />
        <ChartCard
          title="Monthly Growth"
          subtitle="vs previous month"
          data={{ 
            current: dashboardData.monthly_summary?.collected || 0, 
            previous: dashboardData.monthly_summary?.previous_month || 0,
            unit: '₹'
          }}
          type="comparison"
          status="success"
          icon={TrendingUp}
        />
        <ChartCard
          title="Pending Amount"
          subtitle="Outstanding dues"
          data={{ 
            current: dashboardData.monthly_summary?.pending || 0,
            unit: '₹'
          }}
          type="metric"
          status="warning"
          icon={AlertCircle}
        />
      </div>

      {/* Financial Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
          Monthly Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(dashboardData.monthly_summary?.collected || 0)}
            </p>
            <p className="text-sm text-gray-600">Total Collected</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-3xl font-bold text-red-600">
              {formatCurrency(dashboardData.monthly_summary?.pending || 0)}
            </p>
            <p className="text-sm text-gray-600">Total Pending</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-3xl font-bold text-blue-600">
              {dashboardData.monthly_summary?.total_students || 0}
            </p>
            <p className="text-sm text-gray-600">Total Students</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStudentDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user.name}! 👋
        </h1>
        <p className="text-lg text-gray-600">
          Track your academic progress and stay updated with your performance.
        </p>
      </div>

      {/* Class Info & Attendance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Class"
          value={dashboardData.class_info?.class || 'N/A'}
          icon={GraduationCap}
          iconColor="text-blue-600"
          bgColor="bg-blue-100"
          status="info"
        />
        <StatCard
          title="Section"
          value={dashboardData.class_info?.section || 'N/A'}
          icon={Building2}
          iconColor="text-green-600"
          bgColor="bg-green-100"
          status="info"
        />
        <StatCard
          title="Attendance"
          value={formatPercentage(dashboardData.attendance?.percentage || 0)}
          icon={CheckCircle}
          iconColor="text-purple-600"
          bgColor="bg-purple-100"
          subtitle={`${dashboardData.attendance?.present_days || 0}/${dashboardData.attendance?.total_days || 0} days`}
          progress={dashboardData.attendance?.percentage || 0}
          status={dashboardData.attendance?.percentage && dashboardData.attendance.percentage >= 80 ? 'success' : 'warning'}
        />
        <StatCard
          title="Roll Number"
          value={dashboardData.class_info?.roll_number || 'N/A'}
          icon={UserCheck}
          iconColor="text-orange-600"
          bgColor="bg-orange-100"
          status="info"
        />
      </div>

      {/* Academic Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Attendance Rate"
          subtitle="This month's attendance"
          data={{ 
            current: dashboardData.attendance?.percentage || 0, 
            target: 90,
            unit: '%'
          }}
          type="progress"
          status={dashboardData.attendance?.percentage && dashboardData.attendance.percentage >= 85 ? 'success' : 'warning'}
          icon={CheckCircle}
        />
        <ChartCard
          title="Academic Performance"
          subtitle="Average score this term"
          data={{ 
            current: 78, 
            previous: 75,
            unit: '%'
          }}
          type="comparison"
          status="success"
          icon={Target}
        />
      </div>

      {/* Upcoming Exams & Recent Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DataTable
          title="Upcoming Exams"
          columns={[
            { key: 'subject', label: 'Subject' },
            { key: 'date', label: 'Date' },
            { key: 'type', label: 'Type' }
          ]}
          data={dashboardData.upcoming_exams || []}
        />

        <DataTable
          title="Recent Results"
          columns={[
            { key: 'subject', label: 'Subject' },
            { key: 'score', label: 'Score' },
            { key: 'grade', label: 'Grade' }
          ]}
          data={dashboardData.recent_results || []}
        />
      </div>
    </div>
  );

  const getDashboardContent = () => {
    switch (user.role) {
      case 'superadmin':
      case 'admin':
        return renderAdminDashboard();
      case 'teacher':
        return renderTeacherDashboard();
      case 'accountant':
        return renderAccountantDashboard();
      case 'student':
        return renderStudentDashboard();
      default:
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Activity className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Dashboard</h3>
            <p className="text-gray-500">
              Welcome to the School ERP system.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {getDashboardContent()}
      
      {/* Floating Action Button for Mobile - Admin/Teacher Only */}
      {(user.role === 'superadmin' || user.role === 'admin' || user.role === 'teacher') && (
        <div className="fixed bottom-6 right-6 md:hidden z-50">
          <button
            onClick={() => window.location.href = '/student-admission'}
            className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 hover:scale-110"
            title="Add New Student"
          >
            <UserCheck className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
