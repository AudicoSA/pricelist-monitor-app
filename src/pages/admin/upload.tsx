import React, { useState } from 'react';
import Layout from '../../components/Layout';
import FileUpload from '../../components/FileUpload';

interface UploadStats {
  totalUploaded: number;
  processing: number;
  completed: number;
  errors: number;
}

export default function Upload() {
  const [uploadStats, setUploadStats] = useState<UploadStats>({
    totalUploaded: 0,
    processing: 0,
    completed: 0,
    errors: 0
  });

  const [recentUploads, setRecentUploads] = useState<any[]>([]);

  const handleUploadComplete = (result: any) => {
    console.log('Upload completed:', result);
    setUploadStats(prev => ({
      ...prev,
      totalUploaded: prev.totalUploaded + 1,
      completed: prev.completed + (result.success ? 1 : 0),
      errors: prev.errors + (result.success ? 0 : 1)
    }));

    setRecentUploads(prev => [result, ...prev.slice(0, 4)]);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                  Upload Pricelists
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Upload Excel or PDF pricelist files for AI processing and enhancement
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-opencart-blue rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{uploadStats.totalUploaded}</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Uploaded</dt>
                      <dd className="text-lg font-medium text-gray-900">{uploadStats.totalUploaded}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{uploadStats.processing}</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Processing</dt>
                      <dd className="text-lg font-medium text-gray-900">{uploadStats.processing}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-opencart-green rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{uploadStats.completed}</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                      <dd className="text-lg font-medium text-gray-900">{uploadStats.completed}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{uploadStats.errors}</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Errors</dt>
                      <dd className="text-lg font-medium text-gray-900">{uploadStats.errors}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Upload Files</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Drag and drop your pricelist files or click to select
                </p>
              </div>
              <div className="px-6 py-6">
                <FileUpload onUploadComplete={handleUploadComplete} />
              </div>
            </div>

            {/* Recent Uploads */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Uploads</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Latest file processing results
                </p>
              </div>
              <div className="px-6 py-4">
                {recentUploads.length === 0 ? (
                  <p className="text-gray-500 text-sm">No uploads yet</p>
                ) : (
                  <div className="space-y-3">
                    {recentUploads.map((upload, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${
                            upload.success ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{upload.filename}</p>
                            <p className="text-xs text-gray-500">{upload.productsProcessed} products processed</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{upload.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Enhancement Info */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  AI Enhancement Active
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Your uploaded files will be processed with AI enhancement to:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Validate product information and identify mysterious codes (like COM-YHS33-EAR)</li>
                    <li>Enhance product descriptions with detailed specifications</li>
                    <li>Categorize products automatically using AI intelligence</li>
                    <li>Validate prices against market data</li>
                    <li>Find duplicate products and merge them intelligently</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}