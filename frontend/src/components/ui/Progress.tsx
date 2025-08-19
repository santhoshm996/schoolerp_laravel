import React from 'react';
import { clsx } from 'clsx';

interface ProgressProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

const Progress: React.FC<ProgressProps> = ({ currentStep, totalSteps, className }) => {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className={clsx('w-full', className)}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm text-gray-500">{Math.round(percentage)}% Complete</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default Progress;
