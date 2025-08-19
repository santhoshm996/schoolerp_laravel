import React, { useState, useEffect } from 'react';
import { useSession } from '../contexts/SessionContext';
import { useAuth } from '../contexts/AuthContext';
import { feesService } from '../services/feesService';
import type { FeeGroup } from '../services/feesService';
import { useToast } from '../contexts/ToastContext';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

interface FeeGroupFormData {
  name: string;
  description: string;
  session_id: number;
  is_active: boolean;
}

const FeeGroups: React.FC = () => {
  const { currentSession } = useSession();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [feeGroups, setFeeGroups] = useState<FeeGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingFeeGroup, setEditingFeeGroup] = useState<FeeGroup | null>(null);
  const [formData, setFormData] = useState<FeeGroupFormData>({
    name: '',
    description: '',
    session_id: currentSession?.id || 0,
    is_active: true
  });

  const isAdmin = user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'accountant';

  useEffect(() => {
    if (currentSession) {
      fetchFeeGroups();
    }
  }, [currentSession]);

  const fetchFeeGroups = async () => {
    if (!currentSession) return;
    
    try {
      setLoading(true);
      const response = await feesService.getFeeGroups(currentSession.id, {
        search: searchTerm,
        is_active: filterActive === 'all' ? undefined : filterActive === 'active'
      });
      
      if (response.success) {
        setFeeGroups(response.data.data || response.data);
      }
    } catch (error: any) {
      showToast('error', 'Failed to fetch fee groups');
      console.error('Error fetching fee groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentSession) {
      showToast('error', 'No active session selected');
      return;
    }

    try {
      const data = { ...formData, session_id: currentSession.id };
      
      if (editingFeeGroup) {
        const response = await feesService.updateFeeGroup(editingFeeGroup.id, data);
        if (response.success) {
          showToast('success', 'Fee group updated successfully');
          setEditingFeeGroup(null);
        }
      } else {
        const response = await feesService.createFeeGroup(data);
        if (response.success) {
          showToast('success', 'Fee group created successfully');
        }
      }
      
      resetForm();
      fetchFeeGroups();
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Failed to save fee group');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this fee group?')) return;
    
    try {
      const response = await feesService.deleteFeeGroup(id);
      if (response.success) {
        showToast('success', 'Fee group deleted successfully');
        fetchFeeGroups();
      }
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Failed to delete fee group');
    }
  };

  const handleEdit = (feeGroup: FeeGroup) => {
    setEditingFeeGroup(feeGroup);
    setFormData({
      name: feeGroup.name,
      description: feeGroup.description || '',
      session_id: feeGroup.session_id,
      is_active: feeGroup.is_active
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      session_id: currentSession?.id || 0,
      is_active: true
    });
    setEditingFeeGroup(null);
    setShowForm(false);
  };

  const filteredFeeGroups = feeGroups.filter(feeGroup => {
    const matchesSearch = feeGroup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (feeGroup.description && feeGroup.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterActive === 'all' || 
                         (filterActive === 'active' && feeGroup.is_active) ||
                         (filterActive === 'inactive' && !feeGroup.is_active);
    
    return matchesSearch && matchesFilter;
  });

  if (!currentSession) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please select a session to view fee groups</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Groups</h1>
          <p className="text-gray-600">Manage fee groups for {currentSession.name}</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowForm(true)} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus className="w-4 h-4" />
            Add Fee Group
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search fee groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="w-32"
              options={[
                { value: 'all', label: 'All' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
              ]}
            />
            <button 
              onClick={fetchFeeGroups}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingFeeGroup ? 'Edit Fee Group' : 'Add New Fee Group'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Enter fee group name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Select
                  value={formData.is_active ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                  options={[
                    { value: 'true', label: 'Active' },
                    { value: 'false', label: 'Inactive' }
                  ]}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter description (optional)"
              />
            </div>
            <div className="flex gap-2">
              <button 
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {editingFeeGroup ? 'Update' : 'Create'} Fee Group
              </button>
              <button 
                type="button" 
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Fee Groups List */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading fee groups...</p>
          </div>
        ) : filteredFeeGroups.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No fee groups found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fee Types
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFeeGroups.map((feeGroup) => (
                  <tr key={feeGroup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{feeGroup.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {feeGroup.description || 'No description'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {feeGroup.fee_types?.length || 0} fee types
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        feeGroup.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {feeGroup.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(feeGroup.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(feeGroup)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(feeGroup.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

export default FeeGroups;