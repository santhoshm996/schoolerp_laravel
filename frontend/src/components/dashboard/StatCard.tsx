import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  bgColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  subtitle?: string;
  progress?: number;
  status?: 'success' | 'warning' | 'error' | 'info';
  onClick?: () => void;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor = 'text-blue-600',
  bgColor = 'bg-blue-100',
  trend,
  subtitle,
  progress,
  status = 'info',
  onClick,
  loading = false
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'error': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  const getProgressColor = () => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  if (loading) {
    return (
      <div className={`${getStatusColor()} rounded-xl border p-6 hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer' : ''}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`${getStatusColor()} rounded-xl border p-6 hover:shadow-md transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:scale-[1.02]' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-baseline space-x-2">
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                trend.isPositive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {trend.isPositive ? '↗' : '↘'} {trend.value}%
              {trend.label && <span className="ml-1 text-xs opacity-75">({trend.label})</span>}
            </span>
          )}
        </div>
        
        {subtitle && (
          <p className="text-sm text-gray-500">{subtitle}</p>
        )}
        
        {progress !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
