// components/FileUpload.tsx
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onUploadComplete: (result: any) => void;
}

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload/pricelist', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        onUploadComplete(result);
      } else {
        setError(result.message || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`upload-area cursor-pointer ${isDragActive ? 'dragover' : ''}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="loading-spinner mb-4"></div>
            <p className="text-sm text-gray-600">Processing file...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <svg
              className="w-12 h-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-lg font-medium text-gray-900 mb-2">
              {isDragActive ? 'Drop your pricelist here' : 'Upload pricelist file'}
            </p>
            <p className="text-sm text-gray-600">
              Supports Excel (.xlsx, .xls) and PDF files
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Maximum file size: 50MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800 text-sm">{error}</div>
        </div>
      )}
    </div>
  );
}