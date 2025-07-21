import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Head from 'next/head';

const Upload: React.FC = () => {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    count?: number;
  } | null>(null);
  const [stats, setStats] = useState({
    totalUploaded: 0,
    processing: 0,
    completed: 0,
    errors: 0
  });
  const [priceType, setPriceType] = useState('retail_incl_vat');
  const [markupPercentage, setMarkupPercentage] = useState(0);
  
  // Fetch stats on load
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/upload/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch upload stats:', error);
      }
    };
    
    fetchStats();
  }, []);

  // File drag & drop handlers
  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  }, []);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  }, []);

  // Handle file upload
  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('priceType', priceType);
    formData.append('markupPercentage', markupPercentage.toString());

    try {
      const response = await fetch('/api/upload/pricelist', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      setUploadResult(result);
      
      // Update stats
      if (result.success) {
        setStats(prev => ({
          ...prev,
          totalUploaded: prev.totalUploaded + 1,
          completed: prev.completed + 1
        }));
      } else {
        setStats(prev => ({
          ...prev,
          totalUploaded: prev.totalUploaded + 1,
          errors: prev.errors + 1
        }));
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadResult({
        success: false,
        message: `Upload failed: ${error.message}`
      });
      
      setStats(prev => ({
        ...prev,
        totalUploaded: prev.totalUploaded + 1,
        errors: prev.errors + 1
      }));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Upload Pricelists - AI Pricelist Monitor</title>
      </Head>
      
      <div className="px-4 py-5 sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900">Upload Pricelists</h1>
        <p className="mt-1 text-sm text-gray-600">
          Upload Excel or PDF pricelists with AI enhancement
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 px-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="text-sm font-medium text-gray-500">Total Uploads</div>
          <div className="text-2xl font-semibold">{stats.totalUploaded}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <div className="text-sm font-medium text-gray-500">Processing</div>
          <div className="text-2xl font-semibold">{stats.processing}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="text-sm font-medium text-gray-500">Completed</div>
          <div className="text-2xl font-semibold">{stats.completed}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <div className="text-sm font-medium text-gray-500">Errors</div>
          <div className="text-2xl font-semibold">{stats.errors}</div>
        </div>
      </div>
      
      <div className="px-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Pricelist</h2>
          
          {/* Price Type Options */}
          <div className="mb-6">
            <h3 className="text-md font-medium mb-2">Price Type</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center">
                <input
                  id="retail-incl-vat"
                  type="radio"
                  name="price-type"
                  className="h-4 w-4 text-blue-600 border-gray-300"
                  checked={priceType === 'retail_incl_vat'}
                  onChange={() => setPriceType('retail_incl_vat')}
                />
                <label htmlFor="retail-incl-vat" className="ml-2 block text-sm text-gray-700">
                  Retail incl VAT
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="cost-incl-vat"
                  type="radio"
                  name="price-type"
                  className="h-4 w-4 text-blue-600 border-gray-300"
                  checked={priceType === 'cost_incl_vat'}
                  onChange={() => setPriceType('cost_incl_vat')}
                />
                <label htmlFor="cost-incl-vat" className="ml-2 block text-sm text-gray-700">
                  Cost incl VAT
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="cost-excl-vat"
                  type="radio"
                  name="price-type"
                  className="h-4 w-4 text-blue-600 border-gray-300"
                  checked={priceType === 'cost_excl_vat'}
                  onChange={() => setPriceType('cost_excl_vat')}
                />
                <label htmlFor="cost-excl-vat" className="ml-2 block text-sm text-gray-700">
                  Cost Excl VAT
                </label>
              </div>
            </div>
          </div>
          
          {/* Markup Percentage */}
          <div className="mb-6">
            <h3 className="text-md font-medium mb-2">Markup Percentage</h3>
            <div className="flex items-center w-full max-w-xs">
              <input
                type="number"
                min="0"
                max="1000"
                step="1"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={markupPercentage}
                onChange={(e) => setMarkupPercentage(parseInt(e.target.value) || 0)}
              />
              <span className="ml-2 text-sm text-gray-500">%</span>
            </div>
          </div>
          
          {/* File Upload Dropzone */}
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onDragEnter={onDragEnter}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <div className="space-y-2">
              <div className="flex justify-center">
                <svg className="h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M24 10v28m-14-14h28" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="text-sm text-gray-600">
                <label htmlFor="file-upload" className="cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={onFileChange} accept=".xlsx,.xls,.pdf,.csv" />
                </label>
                <span> or drag and drop</span>
              </div>
              <p className="text-xs text-gray-500">Excel, PDF, or CSV up to 50MB</p>
            </div>
            
            {file && (
              <div className="mt-4 text-sm text-gray-800">
                Selected: <span className="font-medium">{file.name}</span> ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                !file || uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!file || uploading}
              onClick={handleUpload}
            >
              {uploading ? 'Processing...' : 'Upload Pricelist'}
            </button>
          </div>
          
          {uploadResult && (
            <div className={`mt-4 p-4 rounded-md ${uploadResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <p className="text-sm font-medium">{uploadResult.message}</p>
              {uploadResult.success && uploadResult.count !== undefined && (
                <p className="text-sm mt-1">Processed {uploadResult.count} products</p>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* AI Enhancement Info */}
      <div className="px-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">AI Enhancement</h2>
          <p className="text-sm text-gray-600 mb-4">
            Our AI system will automatically enhance product data with:
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
            <li>Enhanced product descriptions using OpenAI and Anthropic Claude</li>
            <li>Smart category detection based on product characteristics</li>
            <li>Product code identification (e.g., decoding "COM-YHS33-EAR" as "Yealink YHS33 Headset Ear Cushion")</li>
            <li>Price validation against market rates</li>
          </ul>
        </div>
      </div>
      
      {/* Recent Uploads Section */}
      <div className="px-4 mb-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Recent Uploads</h2>
          </div>
          <div className="px-6 py-4">
            {/* Would normally fetch from API, using static for demo */}
            <p className="text-sm text-gray-500 italic">Upload history will appear here</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Upload;