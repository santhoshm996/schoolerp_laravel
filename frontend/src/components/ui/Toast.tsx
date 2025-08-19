import React, { useEffect, useState } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastComponent: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-remove after duration
    if (toast.duration !== 0) {
      const removeTimer = setTimeout(() => {
        setIsLeaving(true);
        setTimeout(() => onRemove(toast.id), 300);
      }, toast.duration || 5000);
      
      return () => clearTimeout(removeTimer);
    }
    
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-400" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />;
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-blue-400" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-400" />;
    }
  };

  const getStyles = () => {
    const baseStyles = "transform transition-all duration-300 ease-in-out";
    
    if (isLeaving) {
      return clsx(baseStyles, "translate-x-full opacity-0");
    }
    
    if (isVisible) {
      return clsx(baseStyles, "translate-x-0 opacity-100");
    }
    
    return clsx(baseStyles, "translate-x-full opacity-0");
  };

  const getTypeStyles = () => {
    switch (toast.type) {
      case 'success':
        return "bg-green-50 border-green-200 text-green-800";
      case 'error':
        return "bg-red-50 border-red-200 text-red-800";
      case 'warning':
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case 'info':
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  return (
    <div className={clsx(
      "relative w-full max-w-sm bg-white rounded-lg shadow-lg border p-4",
      getTypeStyles(),
      getStyles()
    )}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{toast.title}</p>
          {toast.message && (
            <p className="text-sm mt-1 opacity-90">{toast.message}</p>
          )}
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={handleRemove}
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors duration-200"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Progress bar */}
      {toast.duration !== 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
          <div 
            className="h-full bg-current opacity-30 transition-all duration-300 ease-linear"
            style={{
              width: isLeaving ? '0%' : '100%',
              transitionDuration: `${toast.duration || 5000}ms`
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ToastComponent;
