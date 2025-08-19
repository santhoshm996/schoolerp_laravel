import React, { useState } from 'react';
import { 
  ArrowUpTrayIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { apiClient } from '../services/apiClient';

interface ImportResult {
  total: number;
  imported: number;
  failed: number;
  errors: string[];
}

const StudentBulkImport: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        setError('');
      } else {
        setError('Please select a valid CSV file');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please select a valid CSV file');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/api/v1/students/bulk-import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload file');
      console.error('Error uploading file:', err);
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `admission_no,name,email,phone,dob,gender,address,class_name,section_name
ST001,John Doe,john.doe@example.com,+1234567890,2005-01-15,male,123 Main St,Class 10,Section A
ST002,Jane Smith,jane.smith@example.com,+1234567891,2005-03-20,female,456 Oak Ave,Class 10,Section A
ST003,Mike Johnson,mike.johnson@example.com,+1234567892,2005-06-10,male,789 Pine Rd,Class 9,Section B`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setFile(null);
    setError('');
    setResult(null);
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bulk Import Students</h1>
          <p className="mt-1 text-sm text-gray-600">
            Import multiple students at once using a CSV file
          </p>
        </div>
        <button
          onClick={downloadTemplate}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          <DocumentArrowDownIcon className="mr-2 h-4 w-4" />
          Download Template
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <InformationCircleIcon className="h-5 w-5 text-blue-400 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Import Instructions</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Use the CSV template format with headers: admission_no, name, email, phone, dob, gender, address, class_name, section_name</li>
                <li>Class and section names must match existing records in the system</li>
                <li>Admission numbers and emails must be unique</li>
                <li>Date format: YYYY-MM-DD (e.g., 2005-01-15)</li>
                <li>Gender options: male, female, other</li>
                <li>Phone and address fields are optional</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Upload Area */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label htmlFor="file-input" className="cursor-pointer">
              <span className="text-lg font-medium text-gray-900">
                {file ? file.name : 'Drop your CSV file here, or click to browse'}
              </span>
              <input
                id="file-input"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {file ? 'File selected successfully' : 'CSV files only, max 2MB'}
          </p>
        </div>

        {file && (
          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-600">{file.name}</span>
            </div>
            <button
              onClick={resetForm}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Remove
            </button>
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={resetForm}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <ArrowUpTrayIcon className="mr-2 h-4 w-4" />
                Upload & Import
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Import Results</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <InformationCircleIcon className="h-8 w-8 text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800">Total Records</p>
                  <p className="text-2xl font-bold text-blue-900">{result.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-8 w-8 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">Successfully Imported</p>
                  <p className="text-2xl font-bold text-green-900">{result.imported}</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <XCircleIcon className="h-8 w-8 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">Failed</p>
                  <p className="text-2xl font-bold text-red-900">{result.failed}</p>
                </div>
              </div>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Errors:</h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                {result.errors.map((error, index) => (
                  <div key={index} className="flex items-start space-x-2 text-sm text-red-700 mb-2">
                    <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Import Another File
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentBulkImport;
