import React, { useState, useRef } from 'react';
import { clsx } from 'clsx';
import { Upload, X, Eye } from 'lucide-react';

interface FileUploadProps {
  label?: string;
  error?: string | undefined;
  helperText?: string;
  accept?: string;
  maxSize?: number; // in MB
  value?: File | null;
  onChange: (file: File | null) => void;
  previewUrl?: string;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  error,
  helperText,
  accept = 'image/*',
  maxSize = 2,
  onChange,
  previewUrl,
  className
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    // Validate file type
    if (accept !== 'image/*' && !file.type.match(accept)) {
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      return;
    }

    onChange(file);
    
    // Create local preview URL
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setLocalPreviewUrl(url);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    onChange(null);
    setLocalPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayPreviewUrl = localPreviewUrl || previewUrl;

  return (
    <div className={clsx('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          <span className="text-red-500 ml-1">*</span>
        </label>
      )}
      
      <div
        className={clsx(
          'relative border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300',
          error ? 'border-red-300' : 'border-gray-300',
          'hover:border-gray-400'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        {!displayPreviewUrl ? (
          <div className="space-y-2">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="text-sm text-gray-600">
              <span className="font-medium text-blue-600 hover:text-blue-500">
                Click to upload
              </span>{' '}
              or drag and drop
            </div>
            <p className="text-xs text-gray-500">
              {accept === 'image/*' ? 'PNG, JPG, JPEG' : accept} up to {maxSize}MB
            </p>
          </div>
        ) : (
          <div className="relative">
            <img
              src={displayPreviewUrl}
              alt="Preview"
              className="mx-auto h-32 w-32 object-cover rounded-lg"
            />
            <div className="mt-2 flex justify-center space-x-2">
              <button
                type="button"
                onClick={() => window.open(displayPreviewUrl, '_blank')}
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </button>
              <button
                type="button"
                onClick={removeFile}
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
              >
                <X className="h-3 w-3 mr-1" />
                Remove
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default FileUpload;
