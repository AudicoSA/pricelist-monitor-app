// pages/api/pricelist/export.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Check authentication
  const sessionCookie = req.cookies['admin-session'];
  if (sessionCookie !== 'authenticated') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const { format = 'xlsx', supplier, category } = req.query;

    let query = supabase
      .from('central_pricelist')
      .select('*')
      .order('supplier', { ascending: true })
      .order('name', { ascending: true });

    if (supplier) {
      query = query.eq('supplier', supplier);
    }
    if (category) {
      query = query.eq('category_id', category);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'No products found' });
    }

    if (format === 'xlsx') {
      // Export as Excel for OpenCart import
      const opencartData = data.map(product => ({
        'Product ID': product.product_id,
        'Name': product.name,
        'Description': product.description,
        'Price': product.price,
        'Category ID': product.category_id,
        'Supplier': product.supplier,
        'SKU': product.product_id,
        'Stock': '999', // Default stock
        'Status': '1', // Active
        'Currency': product.currency || 'ZAR',
        'Tax Class': '1', // Default tax class
        'Created': product.created_at,
        'Updated': product.updated_at
      }));

      const ws = XLSX.utils.json_to_sheet(opencartData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Products');

      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

      res.setHeader('Content-Disposition', `attachment; filename="pricelist-export-${Date.now()}.xlsx"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      return res.send(buffer);

    } else if (format === 'json') {
      // Export as JSON for API integration
      res.setHeader('Content-Disposition', `attachment; filename="pricelist-export-${Date.now()}.json"`);
      res.setHeader('Content-Type', 'application/json');
      return res.json({
        success: true,
        exportDate: new Date().toISOString(),
        productCount: data.length,
        products: data
      });

    } else if (format === 'csv') {
      // Export as CSV
      const csvHeaders = [
        'product_id', 'name', 'description', 'price', 'category_id', 
        'supplier', 'currency', 'created_at', 'updated_at'
      ];

      const csvRows = data.map(product => 
        csvHeaders.map(header => `"${product[header] || ''}"`).join(',')
      );

      const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');

      res.setHeader('Content-Disposition', `attachment; filename="pricelist-export-${Date.now()}.csv"`);
      res.setHeader('Content-Type', 'text/csv');
      return res.send(csvContent);
    }

    return res.status(400).json({ message: 'Unsupported export format' });

  } catch (error) {
    console.error('Export error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Export failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}