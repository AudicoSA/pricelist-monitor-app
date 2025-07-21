import React, { useState } from 'react';

interface ExportOptionsProps {
  onExport: (options: {
    format: string;
    supplier?: string;
    category?: string;
    includeAIData?: boolean;
  }) => void;
  loading: boolean;
  suppliers: string[];
  categories: string[];
}

export default function ExportOptions({
  onExport,
  loading,
  suppliers,
  categories
}: ExportOptionsProps) {
  const [format, setFormat] = useState('xlsx');
  const [supplier, setSupplier] = useState('');
  const [category, setCategory] = useState('');
  const [includeAIData, setIncludeAIData] = useState(true);

  const handleExport = () => {
    onExport({
      format,
      supplier: supplier || undefined,
      category: category || undefined,
      includeAIData
    });
  };

  const formatOptions = [
    { value: 'xlsx', label: 'Excel (.xlsx)', description: 'Best for OpenCart bulk import' },
    { value: 'csv', label: 'CSV (.csv)', description: 'Universal format for data import' },
    { value: 'json', label: 'JSON (.json)', description: 'For API integration and custom apps' }
  ];

  return (
    <div className="space-y-6">
      {/* Format Selection */}
      <div>
        <label className="text-base font-medium text-gray-900">Export Format</label>
        <p className="text-sm leading-5 text-gray-500">Choose the format for your export</p>
        <fieldset className="mt-4">
          <div className="space-y-4">
            {formatOptions.map((option) => (
              <div key={option.value} className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id={option.value}
                    name="format"
                    type="radio"
                    checked={format === option.value}
                    onChange={(e) => setFormat(e.target.value)}
                    value={option.value}
                    className="focus:ring-opencart-blue h-4 w-4 text-opencart-blue border-gray-300"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor={option.value} className="font-medium text-gray-700">
                    {option.label}
                  </label>
                  <p className="text-gray-500">{option.description}</p>
                </div>
              </div>
            ))}
          </div>
        </fieldset>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="supplier" className="block text-sm font-medium text-gray-700">
            Supplier Filter
          </label>
          <select
            id="supplier"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-opencart-blue focus:border-opencart-blue sm:text-sm"
          >
            <option value="">All Suppliers</option>
            {suppliers.map((sup) => (
              <option key={sup} value={sup}>
                {sup}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category Filter
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-opencart-blue focus:border-opencart-blue sm:text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* AI Data Option */}
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="includeAIData"
            name="includeAIData"
            type="checkbox"
            checked={includeAIData}
            onChange={(e) => setIncludeAIData(e.target.checked)}
            className="focus:ring-opencart-blue h-4 w-4 text-opencart-blue border-gray-300 rounded"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="includeAIData" className="font-medium text-gray-700">
            Include AI Enhancement Data
          </label>
          <p className="text-gray-500">
            Include enhanced descriptions, AI confidence scores, and validation data
          </p>
        </div>
      </div>

      {/* Export Button */}
      <div className="pt-4">
        <button
          onClick={handleExport}
          disabled={loading}
          className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-opencart-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opencart-blue disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Exporting...
            </>
          ) : (
            <>
              <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Data
            </>
          )}
        </button>
      </div>

      {/* AI Enhancement Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              AI Enhancement Notice
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Your exports will include products with enhanced information like:
              </p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Detailed descriptions for mysterious codes (COM-YHS33-EAR, COM-T21P E2 HS)</li>
                <li>AI-validated prices and specifications</li>
                <li>Smart category assignments</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}