import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface QuickActionCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  href: string;
  onClick?: () => void;
  badge?: string;
  badgeColor?: string;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  bgColor,
  href,
  onClick,
  badge,
  badgeColor = 'bg-blue-100 text-blue-800'
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.location.href = href;
    }
  };

  return (
    <button
      onClick={handleClick}
      className="group relative flex flex-col items-center p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      {/* Badge */}
      {badge && (
        <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-medium ${badgeColor}`}>
          {badge}
        </div>
      )}
      
      {/* Icon */}
      <div className={`p-4 ${bgColor} rounded-full mb-4 group-hover:scale-110 transition-transform duration-200`}>
        <Icon className={`h-8 w-8 ${iconColor}`} />
      </div>
      
      {/* Content */}
      <div className="text-center">
        <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors">
          {subtitle}
        </p>
      </div>
      
      {/* Hover Effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-50/0 to-blue-50/0 group-hover:from-blue-50/20 group-hover:to-blue-50/20 transition-all duration-200 pointer-events-none" />
    </button>
  );
};

export default QuickActionCard;
