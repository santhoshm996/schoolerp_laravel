import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  HomeIcon, 
  BuildingOfficeIcon, 
  AcademicCapIcon, 
  UserGroupIcon, 
  UsersIcon, 
  UserIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getNavigation = () => {
    const baseNavigation = [
      { name: 'Dashboard', href: '/', icon: HomeIcon },
    ];

    // Add role-based navigation
    if (user?.role === 'superadmin' || user?.role === 'admin') {
      baseNavigation.push(
        { name: 'Users', href: '/users', icon: UsersIcon }
      );
    }

    // Add placeholder navigation for future features
    baseNavigation.push(
      { name: 'Schools', href: '/schools', icon: BuildingOfficeIcon },
      { name: 'Sections', href: '/sections', icon: AcademicCapIcon },
      { name: 'Classes', href: '/classes', icon: AcademicCapIcon },
      { name: 'Teachers', href: '/teachers', icon: UserGroupIcon },
      { name: 'Students', href: '/students', icon: UsersIcon },
      { name: 'Parents', href: '/parents', icon: UserIcon }
    );

    return baseNavigation;
  };

  const navigation = getNavigation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-16 items-center justify-center border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">School ERP</h1>
        </div>
        
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="pl-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
              </h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Welcome, <span className="font-medium">{user?.name}</span>
                <span className="ml-2 text-xs bg-blue-200 px-2 py-1 rounded-full">
                  {user?.role_description || user?.role}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center text-sm text-gray-700 hover:text-gray-900 transition-colors duration-200"
              >
                <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
