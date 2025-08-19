import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  XMarkIcon,
  CheckIcon,
  AcademicCapIcon 
} from '@heroicons/react/24/outline';
import { apiClient } from '../services/apiClient';
import { useSessionChange } from '../hooks/useSessionChange';

interface Section {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

const Sections: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [formData, setFormData] = useState({ name: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSections();
  }, []);

  // Listen for session changes and refresh data
  useSessionChange(() => {
    fetchSections();
  });

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/v1/sections');
      setSections(response.data.data);
    } catch (err: any) {
      setError('Failed to fetch sections');
      showError('Error', 'Failed to fetch sections');
      console.error('Error fetching sections:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingSection) {
        // Update existing section
        await apiClient.put(`/api/v1/sections/${editingSection.id}`, formData);
        setSections(sections.map(section => 
          section.id === editingSection.id 
            ? { ...section, name: formData.name }
            : section
        ));
      } else {
        // Create new section
        const response = await apiClient.post('/api/v1/sections', formData);
        setSections([...sections, response.data.data]);
      }

      // Reset form
      setFormData({ name: '' });
      setEditingSection(null);
      setShowForm(false);
      
      // Show success message
      if (editingSection) {
        showSuccess('Section Updated', 'Section has been updated successfully');
      } else {
        showSuccess('Section Created', 'Section has been created successfully');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save section');
      showError('Error', err.response?.data?.message || 'Failed to save section');
      console.error('Error saving section:', err);
    }
  };

  const handleEdit = (section: Section) => {
    setEditingSection(section);
    setFormData({ name: section.name });
    setShowForm(true);
  };

  const handleDelete = async (sectionId: number) => {
    if (!window.confirm('Are you sure you want to delete this section?')) {
      return;
    }

    try {
      await apiClient.delete(`/api/v1/sections/${sectionId}`);
      setSections(sections.filter(section => section.id !== sectionId));
      showSuccess('Section Deleted', 'Section has been deleted successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete section');
      showError('Error', err.response?.data?.message || 'Failed to delete section');
      console.error('Error deleting section:', err);
    }
  };

  const resetForm = () => {
    setFormData({ name: '' });
    setEditingSection(null);
    setShowForm(false);
    setError('');
  };

  if (loading) {
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
        <h1 className="text-2xl font-bold text-gray-900">Sections</h1>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Section
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {editingSection ? 'Edit Section' : 'Add New Section'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Section Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter section name"
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <CheckIcon className="mr-2 h-4 w-4" />
                {editingSection ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sections Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Sections</h3>
        </div>
        
        {sections.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No sections</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new section.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Section Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sections.map((section) => (
                  <tr key={section.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {section.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(section.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(section.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(section)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(section.id)}
                        className="text-red-600 hover:text-red-900"
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
    </div>
  );
};

export default Sections;
