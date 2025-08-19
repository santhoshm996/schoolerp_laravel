import React, { useState } from 'react';
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
  LogOut,
  Menu,
  X,
  Shield,
  Database,
  CreditCard,
  ClipboardList,
  BookOpenCheck,
  GraduationCap as GraduationCapIcon,
  UserCog,
  BellRing,
  TrendingUp,
  PieChart,
  FileSpreadsheet,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  type?: 'section-header' | 'menu-item' | 'divider';
  badge?: string;
  badgeColor?: string;
  children?: NavigationItem[];
  isExpanded?: boolean;
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getNavigationItems = () => {
    if (!user) return [];

    const baseItems = [
      { 
        name: 'Dashboard', 
        href: '/', 
        icon: LayoutDashboard,
        type: 'menu-item' as const
      }
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
          { 
            name: 'Student List', 
            href: '/students', 
            icon: Users,
            type: 'menu-item' as const,
            badge: 'Live'
          },
          { 
            name: 'Add New Student', 
            href: '/student-admission', 
            icon: UserPlus,
            type: 'menu-item' as const,
            badge: 'New',
            badgeColor: 'bg-green-100 text-green-800'
          },
          { 
            name: 'Bulk Import', 
            href: '/student-bulk-import', 
            icon: FileSpreadsheet,
            type: 'menu-item' as const
          },
          
          // Academics Section
          { 
            type: 'section-header' as const, 
            name: 'Academics', 
            icon: GraduationCap 
          },
          { 
            name: 'Classes', 
            href: '/classes', 
            icon: GraduationCapIcon,
            type: 'menu-item' as const
          },
          { 
            name: 'Sections', 
            href: '/sections', 
            icon: Building2,
            type: 'menu-item' as const
          },
          { 
            name: 'Sessions', 
            href: '/sessions', 
            icon: Calendar,
            type: 'menu-item' as const
          },
          
          // User Management Section
          { 
            type: 'section-header' as const, 
            name: 'User Management', 
            icon: UserCog 
          },
          { 
            name: 'Users', 
            href: '/users', 
            icon: Users,
            type: 'menu-item' as const
          },
          { 
            name: 'Teachers', 
            href: '/teachers', 
            icon: BookOpen,
            type: 'menu-item' as const
          },
          { 
            name: 'Roles & Permissions', 
            href: '/roles', 
            icon: Shield,
            type: 'menu-item' as const
          },
          
          // Finance Section
          { 
            type: 'section-header' as const, 
            name: 'Finance', 
            icon: Calculator 
          },
          { 
            name: 'Fee Groups', 
            href: '/fee-groups', 
            icon: CreditCard,
            type: 'menu-item' as const
          },
          { 
            name: 'Fee Master', 
            href: '/fee-master', 
            icon: BookOpen,
            type: 'menu-item' as const
          },
          { 
            name: 'Fee Assignment', 
            href: '/fee-assignment', 
            icon: Users,
            type: 'menu-item' as const
          },
          { 
            name: 'Fee Collection', 
            href: '/fee-collection', 
            icon: Calculator,
            type: 'menu-item' as const
          },
          { 
            name: 'Financial Reports', 
            href: '/financial-reports', 
            icon: BarChart3,
            type: 'menu-item' as const
          },
          
          // Reports & Analytics
          { 
            type: 'section-header' as const, 
            name: 'Reports & Analytics', 
            icon: BarChart3 
          },
          { 
            name: 'Academic Reports', 
            href: '/academic-reports', 
            icon: BookOpenCheck,
            type: 'menu-item' as const
          },
          { 
            name: 'Attendance Reports', 
            href: '/attendance-reports', 
            icon: ClipboardList,
            type: 'menu-item' as const
          },
          { 
            name: 'Performance Analytics', 
            href: '/analytics', 
            icon: TrendingUp,
            type: 'menu-item' as const
          },
          
          // System Section
          { 
            type: 'section-header' as const, 
            name: 'System', 
            icon: Cog 
          },
          { 
            name: 'Schools', 
            href: '/schools', 
            icon: School,
            type: 'menu-item' as const
          },
          { 
            name: 'Settings', 
            href: '/settings', 
            icon: Settings,
            type: 'menu-item' as const
          },
          { 
            name: 'Database', 
            href: '/database', 
            icon: Database,
            type: 'menu-item' as const
          }
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
          { 
            name: 'Student List', 
            href: '/students', 
            icon: Users,
            type: 'menu-item' as const
          },
          { 
            name: 'Student Profiles', 
            href: '/student-profiles', 
            icon: User,
            type: 'menu-item' as const
          },
          
          // Academics Section
          { 
            type: 'section-header' as const, 
            name: 'Academics', 
            icon: GraduationCap 
          },
          { 
            name: 'Classes Assigned', 
            href: '/classes-assigned', 
            icon: GraduationCapIcon,
            type: 'menu-item' as const
          },
          { 
            name: 'Attendance', 
            href: '/attendance', 
            icon: Calendar,
            type: 'menu-item' as const
          },
          { 
            name: 'Exams & Results', 
            href: '/exams', 
            icon: FileText,
            type: 'menu-item' as const
          },
          { 
            name: 'Timetable', 
            href: '/timetable', 
            icon: Calendar,
            type: 'menu-item' as const
          },
          
          // Reports Section
          { 
            type: 'section-header' as const, 
            name: 'Reports', 
            icon: BarChart3 
          },
          { 
            name: 'Class Reports', 
            href: '/class-reports', 
            icon: BarChart3,
            type: 'menu-item' as const
          },
          { 
            name: 'Student Progress', 
            href: '/student-progress', 
            icon: TrendingUp,
            type: 'menu-item' as const
          },
          { 
            name: 'Attendance Reports', 
            href: '/attendance-reports', 
            icon: ClipboardList,
            type: 'menu-item' as const
          }
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
          { 
            name: 'Fee Collection', 
            href: '/fee-collection', 
            icon: Calculator,
            type: 'menu-item' as const
          },
          { 
            name: 'Fee Structure', 
            href: '/fee-structure', 
            icon: CreditCard,
            type: 'menu-item' as const
          },
          { 
            name: 'Payment History', 
            href: '/payment-history', 
            icon: FileText,
            type: 'menu-item' as const
          },
          { 
            name: 'Pending Dues', 
            href: '/pending-dues', 
            icon: AlertCircle,
            type: 'menu-item' as const,
            badge: 'Live',
            badgeColor: 'bg-red-100 text-red-800'
          },
          
          // Reports Section
          { 
            type: 'section-header' as const, 
            name: 'Reports', 
            icon: BarChart3 
          },
          { 
            name: 'Financial Reports', 
            href: '/financial-reports', 
            icon: BarChart3,
            type: 'menu-item' as const
          },
          { 
            name: 'Collection Reports', 
            href: '/collection-reports', 
            icon: PieChart,
            type: 'menu-item' as const
          },
          { 
            name: 'Student Ledger', 
            href: '/student-ledger', 
            icon: FileSpreadsheet,
            type: 'menu-item' as const
          }
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
          { 
            name: 'My Profile', 
            href: '/profile', 
            icon: User,
            type: 'menu-item' as const
          },
          { 
            name: 'Attendance', 
            href: '/attendance', 
            icon: Calendar,
            type: 'menu-item' as const
          },
          { 
            name: 'Exams', 
            href: '/exams', 
            icon: FileText,
            type: 'menu-item' as const
          },
          { 
            name: 'Results', 
            href: '/results', 
            icon: BarChart3,
            type: 'menu-item' as const
          },
          { 
            name: 'Timetable', 
            href: '/timetable', 
            icon: Calendar,
            type: 'menu-item' as const
          },
          { 
            name: 'Assignments', 
            href: '/assignments', 
            icon: BookOpen,
            type: 'menu-item' as const
          },
          
          // Communication Section
          { 
            type: 'section-header' as const, 
            name: 'Communication', 
            icon: MessageSquare 
          },
          { 
            name: 'Messages', 
            href: '/messages', 
            icon: MessageSquare,
            type: 'menu-item' as const
          },
          { 
            name: 'Notifications', 
            href: '/notifications', 
            icon: BellRing,
            type: 'menu-item' as const
          }
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
          className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
            isActive
              ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600 shadow-sm'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          }`}
          title={isCollapsed ? item.name : undefined}
        >
          <item.icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} ${
            isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
          }`} />
          {!isCollapsed && (
            <div className="flex items-center justify-between flex-1">
              <span>{item.name}</span>
              {item.badge && (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  item.badgeColor || 'bg-blue-100 text-blue-800'
                }`}>
                  {item.badge}
                </span>
              )}
            </div>
          )}
        </Link>
      </li>
    );
  };

  const renderMobileMenu = () => (
    <div className="md:hidden">
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        {mobileMenuOpen ? (
          <X className="h-6 w-6 text-gray-600" />
        ) : (
          <Menu className="h-6 w-6 text-gray-600" />
        )}
      </button>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}>
          <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            {/* Mobile header */}
            <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h1 className="text-xl font-bold text-gray-900">School ERP</h1>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Mobile navigation */}
            <nav className="mt-6 px-4 pb-20 overflow-y-auto h-full mobile-sidebar-scrollbar">
              <ul className="space-y-1">
                {navigationItems.map((item, index) => renderNavigationItem(item, index))}
              </ul>
            </nav>

            {/* Mobile user info & logout */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user?.role_description || user?.role}
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5 mr-3" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 bg-white shadow-xl transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}>
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <School className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">School ERP</h1>
            </div>
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

        {/* Navigation - with proper scrolling */}
        <div className="flex-1 overflow-hidden sidebar-nav">
          <nav className="h-full overflow-y-auto px-4 pb-4 sidebar-scrollbar">
            <ul className="space-y-1 pt-6">
              {navigationItems.map((item, index) => renderNavigationItem(item, index))}
            </ul>
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          {!isCollapsed && (
            <div className="mb-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {user?.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {user?.role_description || user?.role}
                  </div>
                </div>
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
            <LogOut className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {renderMobileMenu()}
    </>
  );
};

export default Sidebar;
