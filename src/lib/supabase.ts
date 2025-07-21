// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { ProcessedProduct } from './ai-processor';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function saveToSupabase(products: ProcessedProduct[]): Promise<ProcessedProduct[]> {
  if (products.length === 0) return [];

  try {
    // Batch insert with upsert to handle duplicates
    const { data, error } = await supabase
      .from('central_pricelist')
      .upsert(products, {
        onConflict: 'product_id',
        ignoreDuplicates: false
      })
      .select();

    if (error) {
      console.error('Supabase save error:', error);
      throw new Error(`Failed to save products: ${error.message}`);
    }

    console.log(`Successfully saved ${data?.length || 0} products to Supabase`);
    return data || [];

  } catch (error) {
    console.error('Database operation failed:', error);
    throw error;
  }
}

export async function createPricelistTable() {
  const { error } = await supabase.rpc('create_pricelist_table');

  if (error) {
    console.error('Failed to create table:', error);
    throw error;
  }
}

// SQL function for creating the pricelist table
export const createTableSQL = `
CREATE TABLE IF NOT EXISTS central_pricelist (
  product_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  category_id INTEGER DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  title VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  supplier VARCHAR(100) NOT NULL,
  source_file VARCHAR(200),
  price_type VARCHAR(20) DEFAULT 'retail_excl_vat',
  original_price DECIMAL(10,2),
  currency VARCHAR(5) DEFAULT 'ZAR',
  confidence_score DECIMAL(3,2)
);

CREATE INDEX IF NOT EXISTS idx_supplier ON central_pricelist(supplier);
CREATE INDEX IF NOT EXISTS idx_category ON central_pricelist(category_id);
CREATE INDEX IF NOT EXISTS idx_updated ON central_pricelist(updated_at);
`;