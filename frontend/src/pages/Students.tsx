import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  AcademicCapIcon,
  MagnifyingGlassIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { apiClient } from '../services/apiClient';
import StudentBulkImport from './StudentBulkImport';
import { useNavigate } from 'react-router-dom';

interface Student {
  id: number;
  admission_no: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  address: string;
  class: {
    id: number;
    name: string;
  };
  section: {
    id: number;
    name: string;
  };
  user: {
    id: number;
    username: string;
    status: string;
  };
  created_at: string;
  updated_at: string;
}

interface Class {
  id: number;
  name: string;
  section: {
    id: number;
    name: string;
  };
}

interface Section {
  id: number;
  name: string;
}

const Students: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'list' | 'bulk-import'>('list');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  useEffect(() => {
    if (activeTab === 'list') {
      fetchStudents();
      fetchClassesAndSections();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'list') {
      fetchStudents();
    }
  }, [searchTerm, selectedClass, selectedSection, pagination.current_page]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current_page.toString(),
        search: searchTerm,
        ...(selectedClass && { class_id: selectedClass }),
        ...(selectedSection && { section_id: selectedSection }),
      });

      const response = await apiClient.get(`/api/v1/students?${params}`);
      setStudents(response.data.data);
      setPagination(response.data.pagination);
    } catch (err: any) {
      setError('Failed to fetch students');
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassesAndSections = async () => {
    try {
      // Fetch classes and sections separately using existing endpoints
      const [classesResponse, sectionsResponse] = await Promise.all([
        apiClient.get('/api/v1/classes'),
        apiClient.get('/api/v1/sections')
      ]);
      
      setClasses(classesResponse.data.data);
      setSections(sectionsResponse.data.data);
    } catch (err: any) {
      console.error('Error fetching classes and sections:', err);
    }
  };



  const handleView = (studentId: number) => {
    navigate(`/students/${studentId}`);
  };

  const handleDelete = async (studentId: number) => {
    if (!window.confirm('Are you sure you want to delete this student? This will also delete their user account.')) {
      return;
    }

    try {
      await apiClient.delete(`/api/v1/students/${studentId}`);
      setStudents(students.filter(student => student.id !== studentId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete student');
      console.error('Error deleting student:', err);
    }
  };

  const handleEdit = (student: Student) => {
    navigate(`/student-admission?edit=${student.id}`);
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, current_page: page }));
  };

  if (loading && students.length === 0 && activeTab === 'list') {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Student List
          </button>
          <button
            onClick={() => setActiveTab('bulk-import')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'bulk-import'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Bulk Import
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'bulk-import' ? (
        <StudentBulkImport />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Student Management</h2>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/student-admission')}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                New Student Admission
              </button>

            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Quick Actions Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Quick Actions</h3>
                <p className="text-blue-700 text-sm">
                  Add new students with complete information including photos, parent details, and guardian information.
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => navigate('/student-admission')}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <PlusIcon className="mr-2 h-5 w-5" />
                  New Student Admission
                </button>
                <button
                  onClick={() => setActiveTab('bulk-import')}
                  className="inline-flex items-center px-6 py-3 bg-white text-blue-600 text-sm font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 border border-blue-300 shadow-sm hover:shadow-md"
                >
                  Bulk Import
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, admission no, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Classes</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} - {cls.section?.name || 'No Section'}
                    </option>
                  ))}
                </select>
                
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Sections</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>





          {/* Students Table */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">All Students</h3>
            </div>
            
            {students.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by adding a new student.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class & Section
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <button
                              onClick={() => handleView(student.id)}
                              className="text-sm font-medium text-blue-600 hover:text-blue-900 text-left"
                            >
                              {student.name}
                            </button>
                            <div className="text-sm text-gray-500">{student.admission_no}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {student.class.name} - {student.section.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{student.email}</div>
                          {student.phone && (
                            <div className="text-sm text-gray-500">{student.phone}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            student.user.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {student.user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleView(student.id)}
                            className="text-green-600 hover:text-green-900 mr-4"
                            title="View"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(student)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                            title="Edit"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(student.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="flex justify-center">
              <nav className="flex space-x-2">
                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg ${
                      page === pagination.current_page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </nav>
            </div>
          )}

          {/* Floating Action Button for Mobile */}
          <div className="fixed bottom-6 right-6 md:hidden">
            <button
              onClick={() => navigate('/student-admission')}
              className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 hover:scale-110"
              title="Add New Student"
            >
              <PlusIcon className="h-6 w-6" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Students;
