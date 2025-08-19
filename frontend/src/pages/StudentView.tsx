import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  AcademicCapIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  IdentificationIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  UsersIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { apiClient } from '../services/apiClient';

interface Student {
  id: number;
  admission_no: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  address: string;
  photo?: string;
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
    email_verified_at: string | null;
  };
  parent?: {
    id: number;
    father_name?: string;
    father_phone?: string;
    father_email?: string;
    father_photo?: string;
    mother_name?: string;
    mother_phone?: string;
    mother_email?: string;
    mother_photo?: string;
  };
  guardian?: {
    id: number;
    name?: string;
    relationship?: string;
    phone?: string;
    email?: string;
    photo?: string;
  };
  created_at: string;
  updated_at: string;
}

const StudentView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    if (id) {
      fetchStudent();
    }
  }, [id]);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/v1/students/${id}`);
      setStudent(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch student details');
      console.error('Error fetching student:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/students?edit=${id}`);
  };

  const handleDelete = async () => {
    if (!student) return;

    try {
      await apiClient.delete(`/api/v1/students/${student.id}`);
      navigate('/students');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete student');
      console.error('Error deleting student:', err);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getGenderDisplay = (gender: string) => {
    if (!gender) return 'Not specified';
    return gender.charAt(0).toUpperCase() + gender.slice(1);
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: <UserIcon className="h-4 w-4" /> },
    { id: 'academic', label: 'Academic Info', icon: <AcademicCapIcon className="h-4 w-4" /> },
    { id: 'parent', label: 'Parent Info', icon: <UsersIcon className="h-4 w-4" /> },
    { id: 'guardian', label: 'Guardian Info', icon: <ShieldCheckIcon className="h-4 w-4" /> },
    { id: 'account', label: 'Account Info', icon: <IdentificationIcon className="h-4 w-4" /> },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/students')}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Students
          </button>
        </div>
        
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/students')}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Students
          </button>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Student Not Found</h3>
              <div className="mt-2 text-sm text-yellow-700">The requested student could not be found.</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/students')}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Students
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Student Profile</h1>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/student-admission')}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <UserIcon className="mr-2 h-4 w-4" />
            Add New Student
          </button>
          <button
            onClick={handleEdit}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <PencilIcon className="mr-2 h-4 w-4" />
            Edit Student
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            Delete Student
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 pt-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="p-6">
          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              {/* Student Photo */}
              <div className="flex justify-center mb-6">
                {student.photo ? (
                  <div className="relative">
                    <img
                      src={`http://school_backend.test/storage/${student.photo}`}
                      alt="Student Photo"
                      className="h-32 w-32 object-cover rounded-lg shadow-md"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-blue-100 rounded-full p-2">
                      <PhotoIcon className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="h-32 w-32 bg-gray-100 rounded-lg shadow-md flex items-center justify-center">
                      <PhotoIcon className="h-16 w-16 text-gray-400" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-gray-100 rounded-full p-2">
                      <PhotoIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                )}
              </div>

              {/* Basic Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <IdentificationIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Admission Number</p>
                    <p className="text-sm text-gray-900">{student.admission_no}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <UserIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Full Name</p>
                    <p className="text-sm text-gray-900">{student.name}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <EnvelopeIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email Address</p>
                    <p className="text-sm text-gray-900">{student.email}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <PhoneIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone Number</p>
                    <p className="text-sm text-gray-900">{student.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CalendarIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                    <p className="text-sm text-gray-900">{formatDate(student.dob)}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <UserIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Gender</p>
                    <p className="text-sm text-gray-900">{getGenderDisplay(student.gender)}</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              {student.address && (
                <div className="flex items-start space-x-3">
                  <MapPinIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="text-sm text-gray-900">{student.address}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Academic Information Tab */}
          {activeTab === 'academic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                  <AcademicCapIcon className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Class</p>
                    <p className="text-lg font-semibold text-gray-900">{student.class.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                  <AcademicCapIcon className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Section</p>
                    <p className="text-lg font-semibold text-gray-900">{student.section.name}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Parent Information Tab */}
          {activeTab === 'parent' && (
            <div className="space-y-8">
              {student.parent ? (
                <>
                  {/* Father Information */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <UsersIcon className="h-5 w-5 text-blue-600 mr-2" />
                      Father Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {student.parent.father_name && (
                        <div className="flex items-start space-x-3">
                          <UserIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Name</p>
                            <p className="text-sm text-gray-900">{student.parent.father_name}</p>
                          </div>
                        </div>
                      )}
                      
                      {student.parent.father_phone && (
                        <div className="flex items-start space-x-3">
                          <PhoneIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Phone</p>
                            <p className="text-sm text-gray-900">{student.parent.father_phone}</p>
                          </div>
                        </div>
                      )}
                      
                      {student.parent.father_email && (
                        <div className="flex items-start space-x-3">
                          <EnvelopeIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Email</p>
                            <p className="text-sm text-gray-900">{student.parent.father_email}</p>
                          </div>
                        </div>
                      )}
                      
                      {student.parent.father_photo && (
                        <div className="md:col-span-2">
                          <div className="flex items-center space-x-3">
                            <PhotoIcon className="h-5 w-5 text-blue-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-500">Photo</p>
                              <img
                                src={`http://school_backend.test/storage/${student.parent.father_photo}`}
                                alt="Father's Photo"
                                className="h-20 w-20 object-cover rounded-lg mt-2"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mother Information */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <UsersIcon className="h-5 w-5 text-pink-600 mr-2" />
                      Mother Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {student.parent.mother_name && (
                        <div className="flex items-start space-x-3">
                          <UserIcon className="h-5 w-5 text-pink-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Name</p>
                            <p className="text-sm text-gray-900">{student.parent.mother_name}</p>
                          </div>
                        </div>
                      )}
                      
                      {student.parent.mother_phone && (
                        <div className="flex items-start space-x-3">
                          <PhoneIcon className="h-5 w-5 text-pink-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Phone</p>
                            <p className="text-sm text-gray-900">{student.parent.mother_phone}</p>
                          </div>
                        </div>
                      )}
                      
                      {student.parent.mother_email && (
                        <div className="flex items-start space-x-3">
                          <EnvelopeIcon className="h-5 w-5 text-pink-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Email</p>
                            <p className="text-sm text-gray-900">{student.parent.mother_email}</p>
                          </div>
                        </div>
                      )}
                      
                      {student.parent.mother_photo && (
                        <div className="md:col-span-2">
                          <div className="flex items-center space-x-3">
                            <PhotoIcon className="h-5 w-5 text-pink-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-500">Photo</p>
                              <img
                                src={`http://school_backend.test/storage/${student.parent.mother_photo}`}
                                alt="Mother's Photo"
                                className="h-20 w-20 object-cover rounded-lg mt-2"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No Parent Information</h3>
                  <p className="mt-1 text-sm text-gray-500">Parent details have not been added yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Guardian Information Tab */}
          {activeTab === 'guardian' && (
            <div className="space-y-6">
              {student.guardian ? (
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <ShieldCheckIcon className="h-5 w-5 text-purple-600 mr-2" />
                    Guardian Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {student.guardian.name && (
                      <div className="flex items-start space-x-3">
                        <UserIcon className="h-5 w-5 text-purple-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Name</p>
                          <p className="text-sm text-gray-900">{student.guardian.name}</p>
                        </div>
                      </div>
                    )}
                    
                    {student.guardian.relationship && (
                      <div className="flex items-start space-x-3">
                        <ShieldCheckIcon className="h-5 w-5 text-purple-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Relationship</p>
                          <p className="text-sm text-gray-900">{student.guardian.relationship}</p>
                        </div>
                      </div>
                    )}
                    
                    {student.guardian.phone && (
                      <div className="flex items-start space-x-3">
                        <PhoneIcon className="h-5 w-5 text-purple-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Phone</p>
                          <p className="text-sm text-gray-900">{student.guardian.phone}</p>
                        </div>
                      </div>
                    )}
                    
                    {student.guardian.email && (
                      <div className="flex items-start space-x-3">
                        <EnvelopeIcon className="h-5 w-5 text-purple-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Email</p>
                          <p className="text-sm text-gray-900">{student.guardian.email}</p>
                        </div>
                      </div>
                    )}
                    
                    {student.guardian.photo && (
                      <div className="md:col-span-2">
                        <div className="flex items-center space-x-3">
                          <PhotoIcon className="h-5 w-5 text-purple-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Photo</p>
                            <img
                              src={`http://school_backend.test/storage/${student.guardian.photo}`}
                              alt="Guardian's Photo"
                              className="h-20 w-20 object-cover rounded-lg mt-2"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No Guardian Information</h3>
                  <p className="mt-1 text-sm text-gray-500">Guardian details have not been added yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Account Information Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                  <IdentificationIcon className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Username</p>
                    <p className="text-lg font-semibold text-gray-900">{student.user.username}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Account Status</p>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(student.user.status)}`}>
                      {student.user.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                  <EnvelopeIcon className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email Verified</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {student.user.email_verified_at ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg">
                  <CalendarIcon className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Created</p>
                    <p className="text-lg font-semibold text-gray-900">{formatDate(student.created_at)}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <CalendarIcon className="h-8 w-8 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Updated</p>
                  <p className="text-lg font-semibold text-gray-900">{formatDate(student.updated_at)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Student</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete {student.name}? This action will also delete their user account and cannot be undone.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentView;
