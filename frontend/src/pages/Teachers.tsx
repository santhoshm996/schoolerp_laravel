import React from 'react';
import { UserGroupIcon } from '@heroicons/react/24/outline';

const Teachers: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Teacher Management</h3>
        <p className="mt-1 text-sm text-gray-500">
          Teacher management features will be implemented in the next phase.
        </p>
      </div>
    </div>
  );
};

export default Teachers;
