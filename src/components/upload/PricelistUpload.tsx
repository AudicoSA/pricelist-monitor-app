'use client';

import React, { useState } from 'react';
import { DocumentArrowUpIcon, CogIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface UploadConfig {
  supplier_name: string;
  price_type: 'retail_incl_vat' | 'retail_excl_vat' | 'cost_incl_vat' | 'cost_excl_vat';
  markup_percentage: number;
  ai_provider: 'openai' | 'anthropic';
}

const PricelistUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [config, setConfig] = useState<UploadConfig>({
    supplier_name: '',
    price_type: 'retail_excl_vat',
    markup_percentage: 30,
    ai_provider: 'openai'
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileExtension = selectedFile.name.toLowerCase().split('.').pop();
      if (!['pdf', 'xlsx', 'xls'].includes(fileExtension || '')) {
        setError('Please select a PDF, XLSX, or XLS file');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file || !config.supplier_name) {
      setError('Please select a file and enter supplier name');
      return;
    }

    setIsUploading(true);
    setError('');
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('config', JSON.stringify(config));

      const response = await fetch('/api/upload-pricelist', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadResult(result);
        setFile(null);
        setConfig(prev => ({ ...prev, supplier_name: '' }));
      } else {
        setError(result.error || 'Upload failed');
      }

    } catch (error) {
      setError('Upload failed: ' + String(error));
    } finally {
      setIsUploading(false);
    }
  };

  const getPriceTypeDescription = (type: string) => {
    const descriptions = {
      'retail_incl_vat': 'Retail price includes VAT - system will calculate cost by removing markup',
      'retail_excl_vat': 'Retail price excludes VAT - system will add 15% VAT to final price',
      'cost_incl_vat': 'Cost price includes VAT - system will add markup to get retail price',
      'cost_excl_vat': 'Cost price excludes VAT - system will add VAT then markup to get retail price'
    };
    return descriptions[type as keyof typeof descriptions] || '';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <DocumentArrowUpIcon className="w-8 h-8" />
            AI Pricelist Upload
          </h2>
          <p className="text-blue-100 mt-1">
            Upload PDF or Excel pricelists with intelligent AI processing
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* File Upload Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <DocumentArrowUpIcon className="w-5 h-5" />
              Upload File
            </h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept=".pdf,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label 
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-4"
              >
                <DocumentArrowUpIcon className="w-12 h-12 text-gray-400" />
                <div>
                  <p className="text-lg font-medium text-gray-700">
                    Choose PDF or Excel file
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports PDF, XLSX, and XLS formats
                  </p>
                </div>
              </label>
              
              {file && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-800">
                    Selected: {file.name}
                  </p>
                  <p className="text-xs text-green-600">
                    File type: {file.name.split('.').pop()?.toUpperCase()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Configuration Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CogIcon className="w-5 h-5" />
              Processing Configuration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Supplier Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier Name *
                </label>
                <input
                  type="text"
                  value={config.supplier_name}
                  onChange={(e) => setConfig(prev => ({ ...prev, supplier_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter supplier name"
                />
              </div>

              {/* Markup Percentage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Markup Percentage
                </label>
                <input
                  type="number"
                  value={config.markup_percentage}
                  onChange={(e) => setConfig(prev => ({ ...prev, markup_percentage: parseFloat(e.target.value) || 30 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="200"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Used to calculate cost vs retail prices
                </p>
              </div>

              {/* Price Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Type in File
                </label>
                <select
                  value={config.price_type}
                  onChange={(e) => setConfig(prev => ({ ...prev, price_type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="retail_excl_vat">Retail (excl VAT)</option>
                  <option value="retail_incl_vat">Retail (incl VAT)</option>
                  <option value="cost_excl_vat">Cost (excl VAT)</option>
                  <option value="cost_incl_vat">Cost (incl VAT)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {getPriceTypeDescription(config.price_type)}
                </p>
              </div>

              {/* AI Provider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Provider (for PDF processing)
                </label>
                <select
                  value={config.ai_provider}
                  onChange={(e) => setConfig(prev => ({ ...prev, ai_provider: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="openai">OpenAI GPT-4</option>
                  <option value="anthropic">Anthropic Claude</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  AI model used to extract data from PDF files
                </p>
              </div>
            </div>
          </div>

          {/* Upload Button */}
          <div className="flex justify-end">
            <button
              onClick={handleUpload}
              disabled={!file || !config.supplier_name || isUploading}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <DocumentArrowUpIcon className="w-5 h-5" />
                  Upload & Process
                </>
              )}
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <ExclamationCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">Upload Failed</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Success Display */}
          {uploadResult && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-800 font-medium">Upload Successful!</p>
                  <p className="text-green-700 text-sm">{uploadResult.message}</p>
                  <div className="mt-2 text-xs text-green-600">
                    <p>Supplier: {uploadResult.supplier}</p>
                    <p>File type: {uploadResult.file_type?.toUpperCase()}</p>
                    <p>Products processed: {uploadResult.products?.length || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PricelistUpload;