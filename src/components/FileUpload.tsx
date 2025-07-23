'use client';

import React, { useState } from 'react';

interface UploadConfig {
  supplier_name: string;
  price_type: 'retail_incl_vat' | 'retail_excl_vat' | 'cost_incl_vat' | 'cost_excl_vat';
  markup_percentage: number;
  ai_provider: 'openai' | 'anthropic';
}

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [config, setConfig] = useState<UploadConfig>({
    supplier_name: '',
    price_type: 'retail_excl_vat',
    markup_percentage: 30,
    ai_provider: 'openai'
  });
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleConfigChange = (key: keyof UploadConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !config.supplier_name) {
      setError('Please select a file and enter supplier name');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('config', JSON.stringify(config));

      const response = await fetch('/api/upload-pricelist', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Upload Pricelist</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select File (PDF, XLS, XLSX)
          </label>
          <input
            type="file"
            accept=".pdf,.xls,.xlsx"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* Supplier Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Supplier Name
          </label>
          <input
            type="text"
            value={config.supplier_name}
            onChange={(e) => handleConfigChange('supplier_name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter supplier name"
          />
        </div>

        {/* Price Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Type
          </label>
          <select
            value={config.price_type}
            onChange={(e) => handleConfigChange('price_type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="retail_excl_vat">Retail Excluding VAT</option>
            <option value="retail_incl_vat">Retail Including VAT</option>
            <option value="cost_excl_vat">Cost Excluding VAT</option>
            <option value="cost_incl_vat">Cost Including VAT</option>
          </select>
        </div>

        {/* Markup Percentage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Markup Percentage
          </label>
          <input
            type="number"
            value={config.markup_percentage}
            onChange={(e) => handleConfigChange('markup_percentage', parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            max="1000"
          />
        </div>

        {/* AI Provider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            AI Provider
          </label>
          <select
            value={config.ai_provider}
            onChange={(e) => handleConfigChange('ai_provider', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uploading || !file || !config.supplier_name}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {uploading ? 'Processing...' : 'Upload Pricelist'}
        </button>
      </form>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">Error: {error}</p>
        </div>
      )}

      {/* Success Result */}
      {result && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="text-green-800 font-semibold">Upload Successful!</h3>
          <p className="text-green-700">{result.message}</p>
          <p className="text-sm text-green-600">
            Processed {result.products?.length || 0} products from {result.supplier}
          </p>
        </div>
      )}
    </div>
  );
}