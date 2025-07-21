import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ExportOptions from '../components/ExportOptions';

interface ExportStats {
  totalProducts: number;
  suppliers: string[];
  categories: string[];
  lastExport: string | null;
}

export default function Export() {
  const [stats, setStats] = useState<ExportStats>({
    totalProducts: 0,
    suppliers: [],
    categories: [],
    lastExport: null
  });

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportHistory, setExportHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchExportHistory();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/pricelists/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExportHistory = async () => {
    try {
      const response = await fetch('/api/exports/history');
      if (response.ok) {
        const data = await response.json();
        setExportHistory(data);
      }
    } catch (error) {
      console.error('Failed to fetch export history:', error);
    }
  };

  const handleExport = async (options: {
    format: string;
    supplier?: string;
    category?: string;
    includeAIData?: boolean;
  }) => {
    setExporting(true);
    try {
      const query = new URLSearchParams({
        format: options.format,
        ...(options.supplier && { supplier: options.supplier }),
        ...(options.category && { category: options.category }),
        ...(options.includeAIData && { includeAIData: 'true' })
      });

      const response = await fetch(`/api/pricelist/export?${query}`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `pricelist_${new Date().toISOString().split('T')[0]}.${options.format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);

        // Refresh export history
        fetchExportHistory();
      } else {
        alert('Export failed. Please try again.');
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
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
                  Export Data
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Export your consolidated pricelist data for OpenCart integration
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
                      <span className="text-white font-semibold text-sm">{stats.totalProducts}</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalProducts}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{stats.suppliers.length}</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Suppliers</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.suppliers.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{stats.categories.length}</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Categories</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.categories.length}</dd>
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
                      <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Last Export</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.lastExport ? stats.lastExport : 'Never'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Export Options */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Export Options</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Choose format and filters for your export
                </p>
              </div>
              <div className="px-6 py-6">
                <ExportOptions
                  onExport={handleExport}
                  loading={exporting}
                  suppliers={stats.suppliers}
                  categories={stats.categories}
                />
              </div>
            </div>

            {/* Export History */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Export History</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Recent export activities
                </p>
              </div>
              <div className="px-6 py-4">
                {exportHistory.length === 0 ? (
                  <p className="text-gray-500 text-sm">No exports yet</p>
                ) : (
                  <div className="space-y-3">
                    {exportHistory.map((export_item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-3 bg-green-500"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {export_item.format.toUpperCase()} Export
                            </p>
                            <p className="text-xs text-gray-500">
                              {export_item.productCount} products • {export_item.supplier || 'All suppliers'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{export_item.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* OpenCart Integration Guide */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  OpenCart Integration
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p className="mb-2">
                    Your exports are ready for OpenCart integration:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Excel:</strong> Direct import to OpenCart products table</li>
                    <li><strong>CSV:</strong> Bulk import via OpenCart admin interface</li>
                    <li><strong>JSON:</strong> API integration for automated sync</li>
                  </ul>
                  <div className="mt-4 p-3 bg-white rounded border">
                    <p className="text-xs text-gray-600 font-mono">
                      Current exports include: product_id, name, category_id, price, description, etc.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Enhanced Products Notice */}
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  AI Enhanced Data Available
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Your exports can include AI-enhanced data such as:
                  </p>
                  <ul className="list-disc list-inside mt-2">
                    <li>Enhanced product descriptions (like the detailed info for COM-SC spiral cord)</li>
                    <li>AI-validated prices and specifications</li>
                    <li>Smart category assignments</li>
                    <li>Brand and model information</li>
                  </ul>
                  <p className="mt-2">
                    Enable "Include AI Data" when exporting to get the enhanced information!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}