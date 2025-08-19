import React from 'react';
import { Clock, User, Activity, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface ActivityItem {
  id: string;
  action: string;
  user: string;
  time: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  details?: string;
}

interface ActivityFeedProps {
  title: string;
  activities: ActivityItem[];
  maxItems?: number;
  loading?: boolean;
  emptyMessage?: string;
  onViewAll?: () => void;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  title,
  activities,
  maxItems = 5,
  loading = false,
  emptyMessage = 'No activities to show',
  onViewAll
}) => {
  const getActivityIcon = (type?: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getActivityColor = (type?: string) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'error':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const formatTime = (timeString: string) => {
    const time = new Date(timeString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return time.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {onViewAll && (
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          {[...Array(maxItems)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="h-4 w-4 bg-gray-200 rounded-full mt-1"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const displayActivities = activities.slice(0, maxItems);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {onViewAll && activities.length > maxItems && (
          <button 
            onClick={onViewAll}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
          >
            View All ({activities.length})
          </button>
        )}
      </div>
      
      {displayActivities.length === 0 ? (
        <div className="text-center py-8">
          <Info className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayActivities.map((activity) => (
            <div 
              key={activity.id}
              className={`flex items-start space-x-3 p-3 rounded-lg border-l-4 ${getActivityColor(activity.type)}`}
            >
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {activity.action}
                </p>
                
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <User className="h-3 w-3" />
                    <span>{activity.user}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(activity.time)}</span>
                  </div>
                </div>
                
                {activity.details && (
                  <p className="text-xs text-gray-600 mt-1">{activity.details}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
