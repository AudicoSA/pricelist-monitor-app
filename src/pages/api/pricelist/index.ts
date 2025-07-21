import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  const sessionCookie = req.cookies.session;
  if (!sessionCookie || sessionCookie !== 'authenticated') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const {
        page = '1',
        limit = '50',
        supplier = '',
        category = '',
        minPrice = '0',
        maxPrice = '999999',
        aiEnhanced = ''
      } = req.query;

      let query = supabase
        .from('central_pricelist')
        .select('*', { count: 'exact' });

      // Apply filters
      if (supplier) {
        query = query.eq('supplier', supplier);
      }

      if (category) {
        query = query.eq('category_id', category);
      }

      if (minPrice || maxPrice) {
        query = query
          .gte('price', parseFloat(minPrice as string))
          .lte('price', parseFloat(maxPrice as string));
      }

      if (aiEnhanced !== '') {
        query = query.eq('ai_enhanced', aiEnhanced === 'true');
      }

      // Pagination
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      query = query
        .order('updated_at', { ascending: false })
        .range(offset, offset + limitNum - 1);

      const { data: products, error, count } = await query;

      if (error) {
        throw error;
      }

      // Get stats
      const { data: statsData, error: statsError } = await supabase
        .from('central_pricelist')
        .select('supplier, category_id, ai_enhanced');

      let stats = {
        total: count || 0,
        suppliers: 0,
        categories: 0,
        aiEnhanced: 0
      };

      if (statsData && !statsError) {
        const suppliers = new Set(statsData.map(item => item.supplier));
        const categories = new Set(statsData.map(item => item.category_id));
        const aiEnhanced = statsData.filter(item => item.ai_enhanced).length;

        stats = {
          total: count || 0,
          suppliers: suppliers.size,
          categories: categories.size,
          aiEnhanced
        };
      }

      return res.status(200).json({
        products: products || [],
        total: count || 0,
        page: pageNum,
        limit: limitNum,
        stats
      });

    } catch (error) {
      console.error('Error fetching pricelists:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch pricelists',
        details: error.message 
      });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { productIds } = req.body;

      if (!productIds || !Array.isArray(productIds)) {
        return res.status(400).json({ error: 'Product IDs array required' });
      }

      const { error } = await supabase
        .from('central_pricelist')
        .delete()
        .in('product_id', productIds);

      if (error) {
        throw error;
      }

      return res.status(200).json({ 
        success: true, 
        message: `Deleted ${productIds.length} products` 
      });

    } catch (error) {
      console.error('Error deleting products:', error);
      return res.status(500).json({ 
        error: 'Failed to delete products',
        details: error.message 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}