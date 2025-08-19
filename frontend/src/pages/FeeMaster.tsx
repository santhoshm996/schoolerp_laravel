import React, { useState, useEffect } from 'react';
import { useSession } from '../contexts/SessionContext';
import { useAuth } from '../contexts/AuthContext';
import { feesService } from '../services/feesService';
import type { FeeMaster, FeeGroup, FeeType, ClassRoom } from '../services/feesService';
import { useToast } from '../contexts/ToastContext';
import { Search, Plus, Edit, Trash2, DollarSign, Users, BookOpen } from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Tabs from '../components/ui/Tabs';

interface FeeMasterFormData {
  fee_group_id: number;
  fee_type_id: number;
  class_id: number;
  amount: number;
  session_id: number;
}

const FeeMasterPage: React.FC = () => {
  const { currentSession } = useSession();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [feeMasters, setFeeMasters] = useState<FeeMaster[]>([]);
  const [feeGroups, setFeeGroups] = useState<FeeGroup[]>([]);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedFeeGroup, setSelectedFeeGroup] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingFeeMaster, setEditingFeeMaster] = useState<FeeMaster | null>(null);
  const [formData, setFormData] = useState<FeeMasterFormData>({
    fee_group_id: 0,
    fee_type_id: 0,
    class_id: 0,
    amount: 0,
    session_id: 0
  });

  const isAdmin = user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'accountant';

  useEffect(() => {
    if (currentSession) {
      fetchFeeMasters();
      fetchInitialData();
    }
  }, [currentSession]);

  useEffect(() => {
    if (currentSession) {
      formData.session_id = currentSession.id;
    }
  }, [currentSession]);

  const fetchInitialData = async () => {
    try {
      const [feeGroupsRes, classesRes] = await Promise.all([
        feesService.getFeeGroups(currentSession?.id),
        feesService.getClasses()
      ]);

      if (feeGroupsRes.success) {
        setFeeGroups(feeGroupsRes.data.data || feeGroupsRes.data);
      }
      if (classesRes.success) {
        setClasses(classesRes.data.data || classesRes.data);
      }
    } catch (error) {
      showToast('error', 'Failed to fetch initial data');
    }
  };

  const fetchFeeMasters = async () => {
    if (!currentSession) return;
    
    try {
      setLoading(true);
      const response = await feesService.getFeeMasters(currentSession.id, {
        search: searchTerm,
        class_id: selectedClass || undefined,
        fee_group_id: selectedFeeGroup || undefined
      });
      
      if (response.success) {
        const masters = response.data.data || response.data;
        setFeeMasters(masters);
      }
    } catch (error: any) {
      showToast('error', 'Failed to fetch fee masters');
    } finally {
      setLoading(false);
    }
  };

  const handleFeeGroupChange = async (feeGroupId: string) => {
    setSelectedFeeGroup(feeGroupId);
    setFormData(prev => ({ ...prev, fee_group_id: parseInt(feeGroupId), fee_type_id: 0 }));
    
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentSession) {
      showToast('error', 'No active session selected');
      return;
    }

    try {
      let response;
      if (editingFeeMaster) {
        response = await feesService.updateFeeMaster(editingFeeMaster.id, formData);
      } else {
        response = await feesService.createFeeMaster(formData);
      }
      
      if (response.success) {
        showToast('success', editingFeeMaster ? 'Fee master updated successfully' : 'Fee master created successfully');
        setShowForm(false);
        setEditingFeeMaster(null);
        resetForm();
        fetchFeeMasters();
      }
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Failed to save fee master');
    }
  };

  const handleEdit = (feeMaster: FeeMaster) => {
    setEditingFeeMaster(feeMaster);
    setFormData({
      fee_group_id: feeMaster.fee_group_id,
      fee_type_id: feeMaster.fee_type_id,
      class_id: feeMaster.class_id,
      amount: feeMaster.amount,
      session_id: feeMaster.session_id
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this fee master entry?')) return;
    
    try {
      const response = await feesService.deleteFeeMaster(id);
      if (response.success) {
        showToast('success', 'Fee master deleted successfully');
        fetchFeeMasters();
      }
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Failed to delete fee master');
    }
  };

  const resetForm = () => {
    setFormData({
      fee_group_id: 0,
      fee_type_id: 0,
      class_id: 0,
      amount: 0,
      session_id: currentSession?.id || 0
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingFeeMaster(null);
    resetForm();
  };

  if (!currentSession) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please select a session to view fee master</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Master</h1>
          <p className="text-gray-600">Manage fee amounts for classes and fee types in {currentSession.name}</p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Fee Master
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search fee types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full"
              options={[
                { value: '', label: 'All Classes' },
                ...classes.map(cls => ({ value: cls.id.toString(), label: cls.name }))
              ]}
            />
          </div>
          <div>
            <Select
              value={selectedFeeGroup}
              onChange={(e) => setSelectedFeeGroup(e.target.value)}
              className="w-full"
              options={[
                { value: '', label: 'All Fee Groups' },
                ...feeGroups.map(group => ({ value: group.id.toString(), label: group.name }))
              ]}
            />
          </div>
          <div>
            <Button 
              onClick={fetchFeeMasters}
              className="w-full"
            >
              Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Fee Master Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingFeeMaster ? 'Edit Fee Master' : 'Add New Fee Master'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fee Group *
                </label>
                <Select
                  value={formData.fee_group_id.toString()}
                  onChange={(e) => handleFeeGroupChange(e.target.value)}
                  required
                  options={[
                    { value: '0', label: 'Select Fee Group' },
                    ...feeGroups.map(group => ({ value: group.id.toString(), label: group.name }))
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fee Type *
                </label>
                <Select
                  value={formData.fee_type_id.toString()}
                  onChange={(e) => setFormData({ ...formData, fee_type_id: parseInt(e.target.value) })}
                  required
                  disabled={!formData.fee_group_id}
                  options={[
                    { value: '0', label: 'Select Fee Type' },
                    ...feeTypes.map(type => ({ value: type.id.toString(), label: type.name }))
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class *
                </label>
                <Select
                  value={formData.class_id.toString()}
                  onChange={(e) => setFormData({ ...formData, class_id: parseInt(e.target.value) })}
                  required
                  options={[
                    { value: '0', label: 'Select Class' },
                    ...classes.map(cls => ({ value: cls.id.toString(), label: cls.name }))
                  ]}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  required
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session
                </label>
                <Input
                  type="text"
                  value={currentSession.name}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" className="inline-flex items-center gap-2">
                {editingFeeMaster ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {editingFeeMaster ? 'Update Fee Master' : 'Create Fee Master'}
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

      {/* Fee Master List */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading fee masters...</p>
          </div>
        ) : feeMasters.length === 0 ? (
          <div className="p-6 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No fee masters</h3>
            <p className="mt-1 text-sm text-gray-500">
              {isAdmin ? 'Get started by creating a new fee master entry.' : 'No fee masters found for the current session.'}
            </p>
            {isAdmin && (
              <div className="mt-6">
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Fee Master
                </Button>
              </div>
            )}
          </div>
        ) : (
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
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Session
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
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
                      <div className="text-sm text-gray-900">{feeMaster.class_room?.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₹{feeMaster.amount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{feeMaster.session?.name}</div>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(feeMaster)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(feeMaster.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeeMasterPage;
