import React, { useState, useEffect } from 'react';
import { useSession } from '../contexts/SessionContext';
import { useAuth } from '../contexts/AuthContext';
import { feesService } from '../services/feesService';
import type { FeeMaster, FeeGroup, FeeType, ClassRoom, Section } from '../services/feesService';
import { useToast } from '../contexts/ToastContext';
import { Search, Users, DollarSign, CheckCircle, AlertCircle, BookOpen } from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';

interface FeeAssignmentFormData {
  class_id: number;
  section_id?: number;
  fee_type_ids: number[];
  session_id: number;
  due_date?: string;
  notes?: string;
}

interface Student {
  id: number;
  name: string;
  admission_no: string;
  class_room?: {
    id: number;
    name: string;
  };
  section?: {
    id: number;
    name: string;
  };
}

const FeeAssignment: React.FC = () => {
  const { currentSession } = useSession();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [feeMasters, setFeeMasters] = useState<FeeMaster[]>([]);
  const [feeGroups, setFeeGroups] = useState<FeeGroup[]>([]);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedFeeGroup, setSelectedFeeGroup] = useState<string>('');
  const [selectedFeeTypes, setSelectedFeeTypes] = useState<number[]>([]);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState<FeeAssignmentFormData>({
    class_id: 0,
    section_id: undefined,
    fee_type_ids: [],
    session_id: 0,
    due_date: '',
    notes: ''
  });

  const isAdmin = user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'accountant';

  useEffect(() => {
    if (currentSession) {
      fetchInitialData();
    }
  }, [currentSession]);

  useEffect(() => {
    if (currentSession) {
      assignmentForm.session_id = currentSession.id;
    }
  }, [currentSession]);

  const fetchInitialData = async () => {
    try {
      const [feeGroupsRes, classesRes, sectionsRes] = await Promise.all([
        feesService.getFeeGroups(currentSession?.id),
        feesService.getClasses(),
        feesService.getSections()
      ]);

      if (feeGroupsRes.success) {
        setFeeGroups(feeGroupsRes.data.data || feeGroupsRes.data);
      }
      if (classesRes.success) {
        setClasses(classesRes.data.data || classesRes.data);
      }
      if (sectionsRes.success) {
        setSections(sectionsRes.data.data || sectionsRes.data);
      }
    } catch (error) {
      showToast('error', 'Failed to fetch initial data');
    }
  };

  const handleClassChange = async (classId: string) => {
    setSelectedClass(classId);
    setSelectedSection('');
    setAssignmentForm(prev => ({ ...prev, class_id: parseInt(classId), section_id: undefined }));
    
    if (classId) {
      // Filter sections for the selected class
      const classSections = sections.filter(section => section.class_id === parseInt(classId));
      setSections(classSections);
      
      // Fetch students in the selected class
      await fetchStudents(parseInt(classId));
      
      // Fetch fee masters for the selected class
      await fetchFeeMasters(parseInt(classId));
    } else {
      setStudents([]);
      setFeeMasters([]);
    }
  };

  const handleSectionChange = async (sectionId: string) => {
    setSelectedSection(sectionId);
    setAssignmentForm(prev => ({ ...prev, section_id: sectionId ? parseInt(sectionId) : undefined }));
    
    if (sectionId && selectedClass) {
      // Fetch students in the selected class and section
      await fetchStudents(parseInt(selectedClass), parseInt(sectionId));
    }
  };

  const handleFeeGroupChange = async (feeGroupId: string) => {
    setSelectedFeeGroup(feeGroupId);
    setSelectedFeeTypes([]);
    setAssignmentForm(prev => ({ ...prev, fee_type_ids: [] }));
    
    if (feeGroupId) {
      try {
        const response = await feesService.getFeeTypesByFeeGroup(parseInt(feeGroupId));
        if (response.success) {
          setFeeTypes(response.data.data || response.data);
        }
      } catch (error) {
        showToast('error', 'Failed to fetch fee types');
      }
    } else {
      setFeeTypes([]);
    }
  };

  const handleFeeTypeChange = (feeTypeId: number, checked: boolean) => {
    if (checked) {
      setSelectedFeeTypes(prev => [...prev, feeTypeId]);
      setAssignmentForm(prev => ({ ...prev, fee_type_ids: [...prev.fee_type_ids, feeTypeId] }));
    } else {
      setSelectedFeeTypes(prev => prev.filter(id => id !== feeTypeId));
      setAssignmentForm(prev => ({ ...prev, fee_type_ids: prev.fee_type_ids.filter(id => id !== feeTypeId) }));
    }
  };

  const fetchStudents = async (classId: number, sectionId?: number) => {
    try {
      const response = await feesService.getStudents({
        class_id: classId,
        section_id: sectionId,
        session_id: currentSession?.id
      });
      
      if (response.success) {
        const studentsData = response.data.data || response.data;
        setStudents(studentsData);
      }
    } catch (error) {
      showToast('error', 'Failed to fetch students');
    }
  };

  const fetchFeeMasters = async (classId: number) => {
    try {
      const response = await feesService.getFeeMasters(currentSession?.id, {
        class_id: classId
      });
      
      if (response.success) {
        const masters = response.data.data || response.data;
        setFeeMasters(masters);
      }
    } catch (error) {
      showToast('error', 'Failed to fetch fee masters');
    }
  };

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentSession) {
      showToast('error', 'No active session selected');
      return;
    }

    if (selectedFeeTypes.length === 0) {
      showToast('error', 'Please select at least one fee type');
      return;
    }

    try {
      setLoading(true);
      const response = await feesService.assignFees(assignmentForm);
      
      if (response.success) {
        showToast('success', response.data.message || 'Fees assigned successfully');
        setShowAssignmentForm(false);
        resetForm();
        
        // Refresh students and fee masters
        if (selectedClass) {
          await fetchStudents(parseInt(selectedClass), selectedSection ? parseInt(selectedSection) : undefined);
          await fetchFeeMasters(parseInt(selectedClass));
        }
      }
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Failed to assign fees');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAssignmentForm({
      class_id: 0,
      section_id: undefined,
      fee_type_ids: [],
      session_id: currentSession?.id || 0,
      due_date: '',
      notes: ''
    });
    setSelectedFeeTypes([]);
  };

  const handleCancel = () => {
    setShowAssignmentForm(false);
    resetForm();
  };

  const getTotalFeeAmount = () => {
    if (!selectedClass || selectedFeeTypes.length === 0) return 0;
    
    return feeMasters
      .filter(master => selectedFeeTypes.includes(master.fee_type_id))
      .reduce((total, master) => total + master.amount, 0);
  };

  if (!currentSession) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please select a session to view fee assignment</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Assignment</h1>
          <p className="text-gray-600">Assign fees to students based on fee master in {currentSession.name}</p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setShowAssignmentForm(true)}
            className="inline-flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Assign Fees
          </Button>
        )}
      </div>

      {/* Selection Controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <Select
              value={selectedClass}
              onChange={(e) => handleClassChange(e.target.value)}
              className="w-full"
              options={[
                { value: '', label: 'Select Class' },
                ...classes.map(cls => ({ value: cls.id.toString(), label: cls.name }))
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section (Optional)</label>
            <Select
              value={selectedSection}
              onChange={(e) => handleSectionChange(e.target.value)}
              className="w-full"
              disabled={!selectedClass}
              options={[
                { value: '', label: 'All Sections' },
                ...sections.map(section => ({ value: section.id.toString(), label: section.name }))
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fee Group</label>
            <Select
              value={selectedFeeGroup}
              onChange={(e) => handleFeeGroupChange(e.target.value)}
              className="w-full"
              options={[
                { value: '', label: 'Select Fee Group' },
                ...feeGroups.map(group => ({ value: group.id.toString(), label: group.name }))
              ]}
            />
          </div>
        </div>
      </div>

      {/* Fee Assignment Form */}
      {showAssignmentForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Assign Fees to Students</h2>
          
          <form onSubmit={handleAssignmentSubmit} className="space-y-6">
            {/* Class and Section Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <Input
                  type="text"
                  value={classes.find(c => c.id.toString() === selectedClass)?.name || ''}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                <Input
                  type="text"
                  value={sections.find(s => s.id.toString() === selectedSection)?.name || 'All Sections'}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>

            {/* Fee Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Select Fee Types</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {feeTypes.map((feeType) => {
                  const feeMaster = feeMasters.find(m => m.fee_type_id === feeType.id);
                  const isSelected = selectedFeeTypes.includes(feeType.id);
                  
                  return (
                    <div
                      key={feeType.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleFeeTypeChange(feeType.id, !isSelected)}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleFeeTypeChange(feeType.id, !isSelected)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{feeType.name}</div>
                          <div className="text-sm text-gray-500">{feeType.fee_group?.name}</div>
                          {feeMaster && (
                            <div className="text-sm font-medium text-blue-600">
                              ₹{feeMaster.amount}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {feeTypes.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  {selectedFeeGroup ? 'No fee types found in this group' : 'Please select a fee group first'}
                </p>
              )}
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <Input
                  type="date"
                  value={assignmentForm.due_date}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, due_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <Input
                  type="text"
                  value={assignmentForm.notes}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, notes: e.target.value })}
                  placeholder="Optional notes for fee assignment"
                />
              </div>
            </div>

            {/* Summary */}
            {selectedFeeTypes.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Assignment Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Students:</span>
                    <span className="ml-2 font-medium text-blue-900">{students.length}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Fee Types:</span>
                    <span className="ml-2 font-medium text-blue-900">{selectedFeeTypes.length}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Total Amount:</span>
                    <span className="ml-2 font-medium text-blue-900">₹{getTotalFeeAmount()}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                type="submit"
                disabled={loading || selectedFeeTypes.length === 0}
                className="inline-flex items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {loading ? 'Assigning Fees...' : 'Assign Fees to Students'}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Students List */}
      {selectedClass && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Students in {classes.find(c => c.id.toString() === selectedClass)?.name}
              {selectedSection && ` - ${sections.find(s => s.id.toString() === selectedSection)?.name}`}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {students.length} student{students.length !== 1 ? 's' : ''} found
            </p>
          </div>
          
          {students.length === 0 ? (
            <div className="p-6 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No students found in the selected class and section.
              </p>
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
                      Admission No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Section
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {student.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.admission_no}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.class_room?.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.section?.name || 'N/A'}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Fee Masters Preview */}
      {selectedClass && feeMasters.length > 0 && (
        <div className="bg-white rounded-lg shadow mt-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Available Fee Types</h3>
            <p className="text-sm text-gray-600 mt-1">
              Fee types available for {classes.find(c => c.id.toString() === selectedClass)?.name}
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fee Group
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fee Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {feeMasters.map((feeMaster) => (
                  <tr key={feeMaster.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {feeMaster.fee_group?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{feeMaster.fee_type?.name}</div>
                      <div className="text-sm text-gray-500">{feeMaster.fee_type?.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₹{feeMaster.amount}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeAssignment;
