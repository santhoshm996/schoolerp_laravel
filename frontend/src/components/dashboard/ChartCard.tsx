import React from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  data: {
    current: number;
    previous?: number;
    target?: number;
    unit?: string;
  };
  type: 'metric' | 'progress' | 'comparison' | 'status';
  status?: 'success' | 'warning' | 'error' | 'info';
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  loading?: boolean;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  data,
  type,
  status = 'info',
  icon: Icon,
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

  const getStatusIcon = () => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5 text-blue-600" />;
    }
  };

  const calculateChange = () => {
    if (!data.previous || data.previous === 0) return null;
    const change = ((data.current - data.previous) / data.previous) * 100;
    return {
      value: Math.abs(change),
      isPositive: change >= 0,
      icon: change > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
    };
  };

  const getProgressPercentage = () => {
    if (!data.target || data.target === 0) return 0;
    return Math.min((data.current / data.target) * 100, 100);
  };

  if (loading) {
    return (
      <div className={`${getStatusColor()} rounded-xl border p-6 hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer' : ''}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-40"></div>
        </div>
      </div>
    );
  }

  const change = calculateChange();
  const progressPercentage = getProgressPercentage();

  return (
    <div 
      className={`${getStatusColor()} rounded-xl border p-6 hover:shadow-md transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:scale-[1.02]' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className="p-2 rounded-lg bg-gray-100">
            <Icon className="h-6 w-6 text-gray-600" />
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Main Value */}
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-gray-900">
            {data.current.toLocaleString()}
          </span>
          {data.unit && (
            <span className="text-lg text-gray-500">{data.unit}</span>
          )}
        </div>

        {/* Change Indicator */}
        {change && (
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-medium ${
              change.isPositive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {change.icon}
              <span>{change.value.toFixed(1)}%</span>
            </div>
            <span className="text-sm text-gray-500">
              vs previous period
            </span>
          </div>
        )}

        {/* Progress Bar for Progress Type */}
        {type === 'progress' && data.target && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{progressPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  progressPercentage >= 80 ? 'bg-green-500' :
                  progressPercentage >= 60 ? 'bg-yellow-500' :
                  progressPercentage >= 40 ? 'bg-blue-500' : 'bg-red-500'
                }`}
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500">
              Target: {data.target.toLocaleString()}
            </div>
          </div>
        )}

        {/* Status Indicator for Status Type */}
        {type === 'status' && (
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className={`text-sm font-medium ${
              status === 'success' ? 'text-green-700' :
              status === 'warning' ? 'text-yellow-700' :
              status === 'error' ? 'text-red-700' : 'text-blue-700'
            }`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        )}

        {/* Comparison for Comparison Type */}
        {type === 'comparison' && data.previous && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500">Current</p>
              <p className="text-lg font-semibold text-gray-900">{data.current.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Previous</p>
              <p className="text-lg font-semibold text-gray-700">{data.previous.toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartCard;
