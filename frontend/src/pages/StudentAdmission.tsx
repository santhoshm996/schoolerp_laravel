import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserPlus, GraduationCap, Users, Shield, ArrowLeft, Save } from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import FileUpload from '../components/ui/FileUpload';
import Tabs from '../components/ui/Tabs';
import Progress from '../components/ui/Progress';
import { apiClient } from '../services/apiClient';

interface FormData {
  // Student Information
  admission_no: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  address: string;
  photo: File | null;
  class_id: string;
  section_id: string;
  
  // Parent Information
  father_name: string;
  father_phone: string;
  father_email: string;
  father_photo: File | null;
  mother_name: string;
  mother_phone: string;
  mother_email: string;
  mother_photo: File | null;
  
  // Guardian Information
  guardian_name: string;
  guardian_relationship: string;
  guardian_phone: string;
  guardian_email: string;
  guardian_photo: File | null;
}

interface FormErrors {
  general?: string;
  admission_no?: string;
  name?: string;
  email?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  address?: string;
  photo?: string;
  class_id?: string;
  section_id?: string;
  father_name?: string;
  father_phone?: string;
  father_email?: string;
  father_photo?: string;
  mother_name?: string;
  mother_phone?: string;
  mother_email?: string;
  mother_photo?: string;
  guardian_name?: string;
  guardian_relationship?: string;
  guardian_phone?: string;
  guardian_email?: string;
  guardian_photo?: string;
}

interface ClassSection {
  id: number;
  name: string;
  sections?: Array<{ id: number; name: string }>;
}

const StudentAdmission: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editStudentId = searchParams.get('edit');
  
  const [activeTab, setActiveTab] = useState('student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [sections, setSections] = useState<Array<{ id: number; name: string }>>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [classesError, setClassesError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    admission_no: '',
    name: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    address: '',
    photo: null,
    class_id: '',
    section_id: '',
    father_name: '',
    father_phone: '',
    father_email: '',
    father_photo: null,
    mother_name: '',
    mother_phone: '',
    mother_email: '',
    mother_photo: null,
    guardian_name: '',
    guardian_relationship: '',
    guardian_phone: '',
    guardian_email: '',
    guardian_photo: null,
  });

  const tabs = [
    { id: 'student', label: 'Student Information', icon: <GraduationCap className="h-4 w-4" /> },
    { id: 'parent', label: 'Parent Information', icon: <Users className="h-4 w-4" /> },
    { id: 'guardian', label: 'Guardian Information', icon: <Shield className="h-4 w-4" /> },
  ];

  useEffect(() => {
    fetchClassesAndSections();
    if (editStudentId) {
      fetchStudentForEdit();
    }
  }, [editStudentId]);

  const fetchClassesAndSections = async () => {
    try {
      setLoadingClasses(true);
      setClassesError('');
      console.log('Fetching classes and sections...');
      
      const response = await apiClient.get('/api/v1/students/classes-sections');
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        setClasses(response.data.data.classes);
        setSections(response.data.data.sections);
        console.log('Classes loaded:', response.data.data.classes);
        console.log('Sections loaded:', response.data.data.sections);
      } else {
        console.error('API returned success: false:', response.data);
        setClassesError('Failed to load classes and sections');
      }
    } catch (error) {
      console.error('Failed to fetch classes and sections:', error);
      setClassesError('Failed to load classes and sections');
      
      // Try alternative endpoints as fallback
      try {
        console.log('Trying alternative endpoints...');
        const [classesResponse, sectionsResponse] = await Promise.all([
          apiClient.get('/api/v1/classes'),
          apiClient.get('/api/v1/sections')
        ]);
        
        if (classesResponse.data.success) {
          setClasses(classesResponse.data.data);
          console.log('Classes loaded from alternative endpoint:', classesResponse.data.data);
        }
        
        if (sectionsResponse.data.success) {
          setSections(sectionsResponse.data.data);
          console.log('Sections loaded from alternative endpoint:', sectionsResponse.data.data);
        }
      } catch (fallbackError) {
        console.error('Fallback endpoints also failed:', fallbackError);
        setClassesError('All endpoints failed to load classes and sections');
      }
    } finally {
      setLoadingClasses(false);
    }
  };

  const fetchStudentForEdit = async () => {
    if (!editStudentId) return;
    
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/api/v1/students/${editStudentId}`);
      const student = response.data.data;
      
      // Update form data with existing student information
      setFormData({
        admission_no: student.admission_no,
        name: student.name,
        email: student.email,
        phone: student.phone || '',
        dob: student.dob || '',
        gender: student.gender || '',
        address: student.address || '',
        photo: null, // We'll handle existing photos separately
        class_id: student.class.id.toString(),
        section_id: student.section.id.toString(),
        father_name: student.parent?.father_name || '',
        father_phone: student.parent?.father_phone || '',
        father_email: student.parent?.father_phone || '',
        father_photo: null,
        mother_name: student.parent?.mother_name || '',
        mother_phone: student.parent?.mother_phone || '',
        mother_email: student.parent?.mother_email || '',
        mother_photo: null,
        guardian_name: student.guardian?.name || '',
        guardian_relationship: student.guardian?.relationship || '',
        guardian_phone: student.guardian?.phone || '',
        guardian_email: student.guardian?.email || '',
        guardian_photo: null,
      });
    } catch (error) {
      console.error('Failed to fetch student for editing:', error);
      setErrors({ general: 'Failed to load student data for editing' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Student Information validation
    if (!formData.admission_no) newErrors.admission_no = 'Admission number is required';
    if (!formData.name) newErrors.name = 'Student name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.class_id) newErrors.class_id = 'Class is required';
    if (!formData.section_id) newErrors.section_id = 'Section is required';

    // Email format validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();

      // Add student data
      Object.keys(formData).forEach(key => {
        const value = formData[key as keyof FormData];
        if (value !== null && value !== '') {
          if (value instanceof File) {
            formDataToSend.append(key, value);
          } else {
            formDataToSend.append(key, value as string);
          }
        }
      });

      let response;
      if (editStudentId) {
        // Update existing student
        response = await apiClient.put(`/api/v1/students/${editStudentId}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Create new student
        response = await apiClient.post('/api/v1/students', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      if (response.data.success) {
        // Show success message and redirect
        const message = editStudentId ? 'Student updated successfully!' : 'Student created successfully!';
        alert(message);
        navigate('/students');
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        setErrors(prev => ({ ...prev, general: 'Please check the form for errors.' }));
      } else {
        const message = editStudentId ? 'Failed to update student.' : 'Failed to create student.';
        setErrors(prev => ({ ...prev, general: `${message} Please try again.` }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentStep = () => {
    switch (activeTab) {
      case 'student': return 1;
      case 'parent': return 2;
      case 'guardian': return 3;
      default: return 1;
    }
  };

  const canProceedToNext = () => {
    switch (activeTab) {
      case 'student':
        return formData.admission_no && formData.name && formData.email && formData.class_id && formData.section_id;
      case 'parent':
        return true; // Parent info is optional
      case 'guardian':
        return true; // Guardian info is optional
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (activeTab === 'student' && !canProceedToNext()) {
      validateForm();
      return;
    }
    
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  return (
    <div> className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/students')}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserPlus className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {editStudentId ? 'Edit Student' : 'Student Admission'}
              </h1>
              <p className="text-gray-600 mt-1">
                {editStudentId ? 'Update student information' : 'Register new students into the system'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-gray-600">Loading student data...</span>
          </div>
        </div>
      )}

      {/* General Error Message */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{errors.general}</div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <Progress currentStep={getCurrentStep()} totalSteps={3} />
      </div>

      {/* Tabs */}
      {!isLoading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 pt-6">
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>

          <div className="p-6">
            {/* Student Information Tab */}
            {activeTab === 'student' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Admission Number"
                    value={formData.admission_no}
                    onChange={(e) => handleInputChange('admission_no', e.target.value)}
                    error={errors.admission_no}
                    required
                  />
                  <Input
                    label="Full Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    error={errors.name}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    error={errors.email}
                    required
                  />
                  <Input
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    error={errors.phone}
                  />
                  <Input
                    label="Date of Birth"
                    type="date"
                    value={formData.dob}
                    onChange={(e) => handleInputChange('dob', e.target.value)}
                    error={errors.dob}
                  />
                  <Select
                    label="Gender"
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    options={[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'other', label: 'Other' },
                    ]}
                    error={errors.gender}
                  />
                  <Select
                    label="Class"
                    value={formData.class_id}
                    onChange={(e) => handleInputChange('class_id', e.target.value)}
                    options={classes.map(cls => ({ value: cls.id.toString(), label: cls.name }))}
                    error={errors.class_id || classesError}
                    helperText={loadingClasses ? 'Loading classes...' : classes.length === 0 ? 'No classes available' : undefined}
                    required
                  />
                  <Select
                    label="Section"
                    value={formData.section_id}
                    onChange={(e) => handleInputChange('section_id', e.target.value)}
                    options={sections.map(sec => ({ value: sec.id.toString(), label: sec.name }))}
                    error={errors.section_id || classesError}
                    helperText={loadingClasses ? 'Loading sections...' : sections.length === 0 ? 'No sections available' : undefined}
                    required
                  />
                </div>
                
                <Input
                  label="Address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  error={errors.address}
                />
                
                <div className="md:col-span-2">
                  <FileUpload
                    label="Student Photo"
                    value={formData.photo}
                    onChange={(file) => handleInputChange('photo', file)}
                    error={errors.photo}
                    helperText="Upload a clear photo of the student (JPG, PNG, max 2MB)"
                  />
                </div>
              </div>
            )}

          {/* Parent Information Tab */}
          {activeTab === 'parent' && (
            <div className="space-y-8">
              {/* Father Information */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Father Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Father's Name"
                    value={formData.father_name}
                    onChange={(e) => handleInputChange('father_name', e.target.value)}
                    error={errors.father_name}
                  />
                  <Input
                    label="Father's Phone"
                    value={formData.father_phone}
                    onChange={(e) => handleInputChange('father_phone', e.target.value)}
                    error={errors.father_phone}
                  />
                  <Input
                    label="Father's Email"
                    type="email"
                    value={formData.father_email}
                    onChange={(e) => handleInputChange('father_email', e.target.value)}
                    error={errors.father_email}
                  />
                  <div className="md:col-span-2">
                    <FileUpload
                      label="Father's Photo"
                      value={formData.father_photo}
                      onChange={(file) => handleInputChange('father_photo', file)}
                      error={errors.father_photo}
                      helperText="Upload a clear photo of the father (JPG, PNG, max 2MB)"
                    />
                  </div>
                </div>
              </div>

              {/* Mother Information */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Mother Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Mother's Name"
                    value={formData.mother_name}
                    onChange={(e) => handleInputChange('mother_name', e.target.value)}
                    error={errors.mother_name}
                  />
                  <Input
                    label="Mother's Phone"
                    value={formData.mother_phone}
                    onChange={(e) => handleInputChange('mother_phone', e.target.value)}
                    error={errors.mother_phone}
                  />
                  <Input
                    label="Mother's Email"
                    type="email"
                    value={formData.mother_email}
                    onChange={(e) => handleInputChange('mother_email', e.target.value)}
                    error={errors.mother_email}
                  />
                  <div className="md:col-span-2">
                    <FileUpload
                      label="Mother's Photo"
                      value={formData.mother_photo}
                      onChange={(file) => handleInputChange('mother_photo', file)}
                      error={errors.mother_photo}
                      helperText="Upload a clear photo of the mother (JPG, PNG, max 2MB)"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Guardian Information Tab */}
          {activeTab === 'guardian' && (
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Guardian Information (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Guardian's Name"
                    value={formData.guardian_name}
                    onChange={(e) => handleInputChange('guardian_name', e.target.value)}
                    error={errors.guardian_name}
                  />
                  <Input
                    label="Relationship to Student"
                    value={formData.guardian_relationship}
                    onChange={(e) => handleInputChange('guardian_relationship', e.target.value)}
                    error={errors.guardian_relationship}
                    helperText="e.g., Uncle, Aunt, Grandparent"
                  />
                  <Input
                    label="Guardian's Phone"
                    value={formData.guardian_phone}
                    onChange={(e) => handleInputChange('guardian_phone', e.target.value)}
                    error={errors.guardian_phone}
                  />
                  <Input
                    label="Guardian's Email"
                    type="email"
                    value={formData.guardian_email}
                    onChange={(e) => handleInputChange('guardian_email', e.target.value)}
                    error={errors.guardian_email}
                  />
                  <div className="md:col-span-2">
                    <FileUpload
                      label="Guardian's Photo"
                      value={formData.guardian_photo}
                      onChange={(file) => handleInputChange('guardian_photo', file)}
                      error={errors.guardian_photo}
                      helperText="Upload a clear photo of the guardian (JPG, PNG, max 2MB)"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={activeTab === 'student'}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex space-x-3">
              {activeTab !== 'guardian' ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceedToNext()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !canProceedToNext()}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editStudentId ? 'Updating Student...' : 'Creating Student...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editStudentId ? 'Update Student' : 'Create Student'}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAdmission;
