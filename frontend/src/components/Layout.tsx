import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import ToastContainer from './ui/ToastContainer';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';

const Layout: React.FC = () => {
  const { user } = useAuth();
  const { toasts, removeToast } = useToast();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/users') return 'Users';
    if (path === '/schools') return 'Schools';
    if (path === '/sections') return 'Sections';
    if (path === '/classes') return 'Classes';
    if (path === '/students') return 'Students';
    if (path === '/student-admission') return 'Student Admission';
    if (path === '/teachers') return 'Teachers';
    if (path === '/parents') return 'Parents';
    if (path === '/finance') return 'Finance';
    if (path === '/reports') return 'Reports';
    if (path === '/settings') return 'Settings';
    if (path === '/profile') return 'My Profile';
    if (path === '/attendance') return 'Attendance';
    if (path === '/exams') return 'Exams';
    if (path === '/results') return 'Results';
    if (path === '/classes-assigned') return 'Classes Assigned';
    if (path === '/fee-collection') return 'Fee Collection';
    if (path === '/fee-groups') return 'Fee Groups';
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-lg bg-white shadow-lg border border-gray-200"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5 text-gray-600" />
          ) : (
            <Menu className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={toggleSidebar} 
      />

      {/* Main content */}
      <div className={`transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
      }`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                {getPageTitle()}
              </h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-sm text-gray-700">
                Welcome, <span className="font-medium">{user?.name}</span>
                <span className="ml-2 text-xs bg-blue-200 px-2 py-1 rounded-full">
                  {user?.role_description || user?.role}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default Layout;
