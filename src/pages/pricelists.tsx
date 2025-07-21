import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import PricelistTable from '../components/PricelistTable';

interface Filters {
  supplier: string;
  category: string;
  priceRange: {
    min: number;
    max: number;
  };
  aiEnhanced: boolean | null;
}

export default function Pricelists() {
  const [pricelists, setPricelists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<Filters>({
    supplier: '',
    category: '',
    priceRange: { min: 0, max: 50000 },
    aiEnhanced: null
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0
  });

  const [stats, setStats] = useState({
    total: 0,
    suppliers: 0,
    categories: 0,
    aiEnhanced: 0
  });

  useEffect(() => {
    fetchPricelists();
  }, [filters, pagination.page]);

  const fetchPricelists = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        supplier: filters.supplier,
        category: filters.category,
        minPrice: filters.priceRange.min.toString(),
        maxPrice: filters.priceRange.max.toString(),
        ...(filters.aiEnhanced !== null && { aiEnhanced: filters.aiEnhanced.toString() })
      });

      const response = await fetch(`/api/pricelists?${query}`);
      const data = await response.json();

      if (response.ok) {
        setPricelists(data.products);
        setPagination(prev => ({ ...prev, total: data.total }));
        setStats(data.stats);
      } else {
        setError(data.error || 'Failed to fetch pricelists');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleAIEnhancement = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}/enhance`, {
        method: 'POST',
      });

      if (response.ok) {
        fetchPricelists(); // Refresh the list
      }
    } catch (err) {
      console.error('Failed to enhance product:', err);
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
                  Pricelists
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  View and manage all your consolidated pricelist data
                </p>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <button
                  onClick={fetchPricelists}
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-opencart-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Refresh
                </button>
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
                      <span className="text-white font-semibold text-sm">{stats.total}</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
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
                      <span className="text-white font-semibold text-sm">{stats.suppliers}</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Suppliers</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.suppliers}</dd>
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
                      <span className="text-white font-semibold text-sm">{stats.categories}</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Categories</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.categories}</dd>
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
                      <span className="text-white font-semibold text-sm">{stats.aiEnhanced}</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">AI Enhanced</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.aiEnhanced}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Filters</h3>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Supplier</label>
                  <select
                    value={filters.supplier}
                    onChange={(e) => handleFilterChange({ supplier: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">All Suppliers</option>
                    <option value="Nology">Nology</option>
                    <option value="AV Distribution">AV Distribution</option>
                    <option value="Platinum">Platinum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange({ category: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">All Categories</option>
                    <option value="Communication Devices">Communication Devices</option>
                    <option value="Audio Equipment">Audio Equipment</option>
                    <option value="Video Equipment">Video Equipment</option>
                    <option value="Networking">Networking</option>
                    <option value="Cables & Accessories">Cables & Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">AI Enhancement</label>
                  <select
                    value={filters.aiEnhanced === null ? '' : filters.aiEnhanced.toString()}
                    onChange={(e) => handleFilterChange({ 
                      aiEnhanced: e.target.value === '' ? null : e.target.value === 'true' 
                    })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">All Products</option>
                    <option value="true">AI Enhanced</option>
                    <option value="false">Not Enhanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Price Range (ZAR)</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <input
                      type="number"
                      value={filters.priceRange.min}
                      onChange={(e) => handleFilterChange({ 
                        priceRange: { ...filters.priceRange, min: Number(e.target.value) }
                      })}
                      className="w-20 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Min"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      value={filters.priceRange.max}
                      onChange={(e) => handleFilterChange({ 
                        priceRange: { ...filters.priceRange, max: Number(e.target.value) }
                      })}
                      className="w-20 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white shadow rounded-lg">
            <PricelistTable
              data={pricelists}
              loading={loading}
              error={error}
              onAIEnhance={handleAIEnhancement}
              pagination={pagination}
              onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
            />
          </div>

          {/* Mystery Products Alert */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Products Needing AI Enhancement
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Found products with mysterious codes that need AI enhancement:
                  </p>
                  <ul className="list-disc list-inside mt-2">
                    <li><strong>COM-YHS33-EAR</strong> (R14) - Likely Yealink YHS33 headset ear cushion</li>
                    <li><strong>COM-T21P E2 HS</strong> (R85) - Probably Yealink T21P IP phone with headset support</li>
                  </ul>
                  <p className="mt-2">
                    Click the "Enhance with AI" button on these products to get detailed descriptions!
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