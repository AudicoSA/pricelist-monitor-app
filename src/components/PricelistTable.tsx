import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface Product {
  product_id: string;
  name: string;
  category_id: number;
  price: number;
  description: string;
  image_url?: string;
  title?: string;
  supplier: string;
  price_type: string;
  currency: string;
  ai_enhanced?: boolean;
  ai_confidence_score?: number;
}

interface PricelistTableProps {
  products: Product[];
  loading: boolean;
  error?: string;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEnhanceWithAI: (productId: string) => void;
  enhancingProductId?: string;
}

const PricelistTable: React.FC<PricelistTableProps> = ({
  products,
  loading,
  error,
  page,
  totalPages,
  onPageChange,
  onEnhanceWithAI,
  enhancingProductId
}) => {
  const router = useRouter();
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const needsAIEnhancement = (product: Product) => {
    // Products with vague descriptions or COM-* codes that need enhancement
    return (
      (product.name.includes('COM-YHS33-EAR') || 
       product.name.includes('COM-T21P E2 HS')) && 
      !product.ai_enhanced
    );
  };

  const getCategoryName = (categoryId: number) => {
    // Using number keys to match categoryId type
    const categories: { [key: number]: string } = {
      1: 'Communication Devices',
      2: 'AV Equipment', 
      3: 'Audio Equipment',
      4: 'Cables & Accessories',
      5: 'Networking'
    };
    return categories[categoryId] || 'Unknown';
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency || 'ZAR',
      minimumFractionDigits: 2
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="spinner"></div>
        <p className="ml-2">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-4">
        <p className="text-red-700">Error: {error}</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
        <p className="text-blue-700">No products found. Try adjusting your filters or uploading pricelist files.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-blue-700 text-white">
            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('name')}>
              Product {sortField === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
            </th>
            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('category_id')}>
              Category {sortField === 'category_id' && (sortDirection === 'asc' ? '▲' : '▼')}
            </th>
            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('price')}>
              Price {sortField === 'price' && (sortDirection === 'asc' ? '▲' : '▼')}
            </th>
            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('supplier')}>
              Supplier {sortField === 'supplier' && (sortDirection === 'asc' ? '▲' : '▼')}
            </th>
            <th className="px-4 py-2">AI Status</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr 
              key={product.product_id} 
              className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${needsAIEnhancement(product) ? 'bg-yellow-50' : ''}`}
            >
              <td className="px-4 py-2 border-b">
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-gray-600">{product.description}</div>
              </td>
              <td className="px-4 py-2 border-b">
                {getCategoryName(product.category_id)}
              </td>
              <td className="px-4 py-2 border-b">
                {formatPrice(product.price, product.currency)}
                <div className="text-xs text-gray-500">{product.price_type}</div>
              </td>
              <td className="px-4 py-2 border-b">
                {product.supplier}
              </td>
              <td className="px-4 py-2 border-b">
                {product.ai_enhanced ? (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    Enhanced ({Math.round((product.ai_confidence_score || 0) * 100)}%)
                  </span>
                ) : needsAIEnhancement(product) ? (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                    Needs Enhancement
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                    Standard
                  </span>
                )}
              </td>
              <td className="px-4 py-2 border-b">
                {!product.ai_enhanced && (
                  <button
                    className={`px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 ${
                      enhancingProductId === product.product_id ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={() => onEnhanceWithAI(product.product_id)}
                    disabled={enhancingProductId === product.product_id}
                  >
                    {enhancingProductId === product.product_id ? 'Processing...' : 'Enhance with AI'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing page <span className="font-medium">{page}</span> of{' '}
              <span className="font-medium">{totalPages || 1}</span>
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
                  page === 1 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                &laquo; Previous
              </button>
              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                Page {page}
              </span>
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
                  page >= totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                Next &raquo;
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricelistTable;