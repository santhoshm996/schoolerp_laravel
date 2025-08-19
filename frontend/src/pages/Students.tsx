import React from 'react';
import { AcademicCapIcon } from '@heroicons/react/24/outline';

const Students: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Student Management</h3>
        <p className="mt-1 text-sm text-gray-500">
          Student management features will be implemented in the next phase.
        </p>
      </div>
    </div>
  );
};

export default Students;
