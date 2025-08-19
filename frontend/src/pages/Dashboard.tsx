import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dashboardService } from '../services/dashboardService';
import StatCard from '../components/dashboard/StatCard';
import DataTable from '../components/dashboard/DataTable';
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
  AlertCircle
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
  };
  recent_activities?: Array<{
    action: string;
    user: string;
    time: string;
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
  todays_collection?: {
    amount?: number;
    transactions?: number;
    pending?: number;
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
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getDashboardData();
      setDashboardData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data');
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.name}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Here's an overview of your school system.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={dashboardData.total_students || 0}
          icon={Users}
          iconColor="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatCard
          title="Total Teachers"
          value={dashboardData.total_teachers || 0}
          icon={BookOpen}
          iconColor="text-green-600"
          bgColor="bg-green-100"
        />
        <StatCard
          title="Total Classes"
          value={dashboardData.total_classes || 0}
          icon={GraduationCap}
          iconColor="text-purple-600"
          bgColor="bg-purple-100"
        />
        <StatCard
          title="Total Sections"
          value={dashboardData.total_sections || 0}
          icon={Building2}
          iconColor="text-orange-600"
          bgColor="bg-orange-100"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => window.location.href = '/student-admission'}
            className="flex flex-col items-center p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
          >
            <div className="p-3 bg-blue-100 rounded-full mb-3 group-hover:bg-blue-200 transition-colors">
              <UserCheck className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-blue-900">Add Student</span>
            <span className="text-xs text-blue-600 mt-1">New Admission</span>
          </button>
          
          <button
            onClick={() => window.location.href = '/students'}
            className="flex flex-col items-center p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
          >
            <div className="p-3 bg-green-100 rounded-full mb-3 group-hover:bg-green-200 transition-colors">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-green-900">View Students</span>
            <span className="text-xs text-green-600 mt-1">Manage List</span>
          </button>
          
          <button
            onClick={() => window.location.href = '/classes'}
            className="flex flex-col items-center p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
          >
            <div className="p-3 bg-purple-100 rounded-full mb-3 group-hover:bg-purple-200 transition-colors">
              <GraduationCap className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-purple-900">Manage Classes</span>
            <span className="text-xs text-purple-600 mt-1">Add/Edit</span>
          </button>
          
          <button
            onClick={() => window.location.href = '/users'}
            className="flex flex-col items-center p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
          >
            <div className="p-3 bg-orange-100 rounded-full mb-3 group-hover:bg-orange-200 transition-colors">
              <BookOpen className="h-6 w-6 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-orange-900">Manage Users</span>
            <span className="text-xs text-orange-600 mt-1">Staff/Admin</span>
          </button>
        </div>
      </div>

      {/* System Health & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle className="h-4 w-4 mr-1" />
                {dashboardData.system_health?.status || 'Healthy'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Backup</span>
              <span className="text-sm text-gray-900">{dashboardData.system_health?.last_backup || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Users Today</span>
              <span className="text-sm text-gray-900">{dashboardData.system_health?.active_users_today || 0}</span>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-3">
            {dashboardData.recent_activities?.map((activity, index: number) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                </div>
              </div>
            )) || (
              <p className="text-sm text-gray-500">No recent activities</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTeacherDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.name}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your classes and track student progress.
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
        />
        <StatCard
          title="Total Students"
          value={dashboardData.total_students || 0}
          icon={Users}
          iconColor="text-green-600"
          bgColor="bg-green-100"
        />
        <StatCard
          title="Attendance Today"
          value={dashboardData.attendance_today || 0}
          icon={CheckCircle}
          iconColor="text-purple-600"
          bgColor="bg-purple-100"
        />
        <StatCard
          title="Classes Today"
          value={dashboardData.todays_timetable?.length || 0}
          icon={Calendar}
          iconColor="text-orange-600"
          bgColor="bg-orange-100"
        />
      </div>

      {/* Assigned Classes & Today's Timetable */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Classes */}
        <DataTable
          title="Assigned Classes"
          columns={[
            { key: 'name', label: 'Class' },
            { key: 'section', label: 'Section' },
            { key: 'students_count', label: 'Students' }
          ]}
          data={dashboardData.assigned_classes?.classes || []}
        />

        {/* Today's Timetable */}
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.name}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Track financial performance and manage fee collections.
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
        />
        <StatCard
          title="Pending Dues"
          value={formatCurrency(dashboardData.pending_dues?.total_amount || 0)}
          icon={AlertCircle}
          iconColor="text-red-600"
          bgColor="bg-red-100"
          subtitle={`${dashboardData.pending_dues?.students_count || 0} students`}
        />
        <StatCard
          title="Monthly Collection"
          value={formatCurrency(dashboardData.monthly_summary?.collected || 0)}
          icon={TrendingUp}
          iconColor="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatCard
          title="Overdue Count"
          value={dashboardData.pending_dues?.overdue_count || 0}
          icon={Clock}
          iconColor="text-orange-600"
          bgColor="bg-orange-100"
        />
      </div>

      {/* Financial Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(dashboardData.monthly_summary?.collected || 0)}
            </p>
            <p className="text-sm text-gray-600">Total Collected</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(dashboardData.monthly_summary?.pending || 0)}
            </p>
            <p className="text-sm text-gray-600">Total Pending</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.name}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Track your academic progress and stay updated.
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
        />
        <StatCard
          title="Section"
          value={dashboardData.class_info?.section || 'N/A'}
          icon={Building2}
          iconColor="text-green-600"
          bgColor="bg-green-100"
        />
        <StatCard
          title="Attendance"
          value={formatPercentage(dashboardData.attendance?.percentage || 0)}
          icon={CheckCircle}
          iconColor="text-purple-600"
          bgColor="bg-purple-100"
          subtitle={`${dashboardData.attendance?.present_days || 0}/${dashboardData.attendance?.total_days || 0} days`}
        />
        <StatCard
          title="Roll Number"
          value={dashboardData.class_info?.roll_number || 'N/A'}
          icon={UserCheck}
          iconColor="text-orange-600"
          bgColor="bg-orange-100"
        />
      </div>

      {/* Upcoming Exams & Recent Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Exams */}
        <DataTable
          title="Upcoming Exams"
          columns={[
            { key: 'subject', label: 'Subject' },
            { key: 'date', label: 'Date' },
            { key: 'type', label: 'Type' }
          ]}
          data={dashboardData.upcoming_exams || []}
        />

        {/* Recent Results */}
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
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <h3 className="text-sm font-medium text-gray-900">Dashboard</h3>
            <p className="mt-1 text-sm text-gray-500">
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
        <div className="fixed bottom-6 right-6 md:hidden">
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
