import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  UsersIcon, 
  UserGroupIcon, 
  AcademicCapIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const getDashboardContent = () => {
    if (!user) return null;

    switch (user.role) {
      case 'superadmin':
      case 'admin':
        return (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user.name}! 👋
              </h1>
              <p className="text-gray-600 mt-2">
                You have full access to manage the school system.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-500">
                    <UsersIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">-</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-500">
                    <UserGroupIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900">-</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-purple-500">
                    <CogIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">System Status</p>
                    <p className="text-2xl font-bold text-gray-900">Active</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200">
                  <UsersIcon className="h-6 w-6 text-blue-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Manage Users</span>
                </button>
                <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors duration-200">
                  <ChartBarIcon className="h-6 w-6 text-green-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">View Reports</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 'teacher':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user.name}! 👋
              </h1>
              <p className="text-gray-600 mt-2">
                Teacher dashboard - Class and student management features coming soon.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Teacher Dashboard</h3>
              <p className="mt-1 text-sm text-gray-500">
                Class management and student features will be implemented in the next phase.
              </p>
            </div>
          </div>
        );

      case 'accountant':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user.name}! 👋
              </h1>
              <p className="text-gray-600 mt-2">
                Accountant dashboard - Financial management features coming soon.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Accountant Dashboard</h3>
              <p className="mt-1 text-sm text-gray-500">
                Financial management features will be implemented in the next phase.
              </p>
            </div>
          </div>
        );

      case 'student':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user.name}! 👋
              </h1>
              <p className="text-gray-600 mt-2">
                Student dashboard - Academic features coming soon.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Student Dashboard</h3>
              <p className="mt-1 text-sm text-gray-500">
                Academic features will be implemented in the next phase.
              </p>
            </div>
          </div>
        );

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
    </div>
  );
};

export default Dashboard;
