import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard,
  Users,
  Building2,
  GraduationCap,
  UserCheck,
  BookOpen,
  Calculator,
  BarChart3,
  Settings,
  User,
  Calendar,
  FileText,
  ChevronLeft,
  ChevronRight,
  School,
  UserPlus,
  Cog,

} from 'lucide-react';

interface NavigationItem {
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  type?: 'section-header';
}

interface SectionHeaderItem {
  type: 'section-header';
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

type NavigationItemType = NavigationItem | SectionHeaderItem;

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getNavigationItems = () => {
    if (!user) return [];

    const baseItems = [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard }
    ];

    switch (user.role) {
      case 'superadmin':
      case 'admin':
        return [
          ...baseItems,
          // Student Management Section
          { 
            type: 'section-header' as const, 
            name: 'Student Management', 
            icon: UserCheck 
          },
          { name: 'Student List', href: '/students', icon: UserCheck },
          { name: 'Add New Student', href: '/student-admission', icon: UserPlus },
          
          // Academics Section
          { 
            type: 'section-header' as const, 
            name: 'Academics', 
            icon: GraduationCap 
          },
          { name: 'Classes', href: '/classes', icon: GraduationCap },
          { name: 'Sections', href: '/sections', icon: Building2 },
          
          // System Settings Section
          { 
            type: 'section-header' as const, 
            name: 'System Settings', 
            icon: Cog 
          },
          { name: 'Users', href: '/users', icon: Users },
          { name: 'Settings', href: '/settings', icon: Settings },
          
          // Additional Features
          { name: 'Schools', href: '/schools', icon: School },
          { name: 'Teachers', href: '/teachers', icon: BookOpen },
          { name: 'Finance', href: '/finance', icon: Calculator },
          { name: 'Reports', href: '/reports', icon: BarChart3 }
        ];

      case 'teacher':
        return [
          ...baseItems,
          // Student Management Section
          { 
            type: 'section-header' as const, 
            name: 'Student Management', 
            icon: UserCheck 
          },
          { name: 'Student List', href: '/students', icon: UserCheck },
          
          // Academics Section
          { 
            type: 'section-header' as const, 
            name: 'Academics', 
            icon: GraduationCap 
          },
          { name: 'Classes Assigned', href: '/classes-assigned', icon: GraduationCap },
          { name: 'Attendance', href: '/attendance', icon: Calendar },
          { name: 'Reports', href: '/reports', icon: BarChart3 }
        ];

      case 'accountant':
        return [
          ...baseItems,
          // Finance Section
          { 
            type: 'section-header' as const, 
            name: 'Finance', 
            icon: Calculator 
          },
          { name: 'Fee Collection', href: '/fee-collection', icon: Calculator },
          { name: 'Reports', href: '/reports', icon: BarChart3 }
        ];

      case 'student':
        return [
          ...baseItems,
          // Academic Section
          { 
            type: 'section-header' as const, 
            name: 'Academic', 
            icon: GraduationCap 
          },
          { name: 'My Profile', href: '/profile', icon: User },
          { name: 'Attendance', href: '/attendance', icon: Calendar },
          { name: 'Exams', href: '/exams', icon: FileText },
          { name: 'Results', href: '/results', icon: BarChart3 }
        ];

      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderNavigationItem = (item: NavigationItemType, index: number) => {
    if (item.type === 'section-header') {
      if (isCollapsed) {
        return (
          <li key={`header-${index}`} className="mt-6 first:mt-0">
            <div className="px-3 py-2">
              <div className="w-full h-px bg-gray-200"></div>
            </div>
          </li>
        );
      }
      
      return (
        <li key={`header-${index}`} className="mt-6 first:mt-0">
          <div className="px-3 py-2">
            <div className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <item.icon className="h-4 w-4 mr-2" />
              {item.name}
            </div>
          </div>
        </li>
      );
    }

    // Type guard to ensure this is a navigation item with href
    if (!item.href) {
      return null;
    }
    
    const isActive = location.pathname === item.href;
    return (
      <li key={item.name}>
        <Link
          to={item.href}
          className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            isActive
              ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          }`}
          title={isCollapsed ? item.name : undefined}
        >
          <item.icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
          {!isCollapsed && <span>{item.name}</span>}
        </Link>
      </li>
    );
  };

  return (
    <div className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-gray-900">School ERP</h1>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-8 px-4">
        <ul className="space-y-1">
          {navigationItems.map((item, index) => renderNavigationItem(item, index))}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        {!isCollapsed && (
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-900 truncate">
              {user?.name}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {user?.role_description || user?.role}
            </div>
          </div>
        )}
        
        <button
          onClick={handleLogout}
          className={`w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <Settings className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
