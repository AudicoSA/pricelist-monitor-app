// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Fallback to empty strings to prevent runtime crashes
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

// Check if credentials are missing and log warnings
if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Missing Supabase credentials in environment variables! Using mock client.');
  console.warn('Please check that your .env.local file exists and contains:');
  console.warn('SUPABASE_URL=https://your-project.supabase.co');
  console.warn('SUPABASE_KEY=your_supabase_anon_key_here');
}

// Create the Supabase client with fallbacks to prevent crashes
export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: false,
    },
  }
);

// For admin operations that require service role
export const adminSupabase = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey) 
  : supabase;

// Helper function to save products to Supabase
export const saveToSupabase = async (products: any[]) => {
  if (!supabaseUrl || !supabaseKey) {
    console.log('⚠️ No Supabase credentials - using mock response instead');
    return { 
      success: true, 
      message: 'Mock response (no Supabase credentials)', 
      count: products.length 
    };
  }
  
  try {
    const { data, error } = await supabase
      .from('central_pricelist')
      .insert(products);
    
    if (error) throw error;
    
    return { 
      success: true, 
      message: `${products.length} products saved to database`,
      count: products.length
    };
  } catch (error) {
    console.error('Error saving to Supabase:', error);
    return { 
      success: false, 
      message: `Error: ${error.message || 'Unknown error'}`,
      count: 0
    };
  }
};

// Helper function to create the pricelist table
export const createPricelistTable = async () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('⚠️ No Supabase credentials for admin operations');
    return { success: false, message: 'Missing Supabase admin credentials' };
  }

  const schema = `
    CREATE TABLE IF NOT EXISTS central_pricelist (
      id SERIAL PRIMARY KEY,
      product_id TEXT NOT NULL,
      name TEXT NOT NULL,
      category_id INTEGER,
      price DECIMAL(10,2),
      description TEXT,
      image_url TEXT,
      title TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      supplier TEXT,
      source_file TEXT,
      price_type TEXT,
      original_price DECIMAL(10,2),
      currency TEXT DEFAULT 'ZAR',
      UNIQUE(product_id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_central_pricelist_product_id ON central_pricelist (product_id);
    CREATE INDEX IF NOT EXISTS idx_central_pricelist_category_id ON central_pricelist (category_id);
    CREATE INDEX IF NOT EXISTS idx_central_pricelist_supplier ON central_pricelist (supplier);
  `;

  try {
    await adminSupabase.rpc('execute_sql', { query: schema });
    return { success: true, message: 'Table created successfully' };
  } catch (error) {
    console.error('Error creating table:', error);
    return { 
      success: false, 
      message: `Error creating table: ${error.message || 'Unknown error'}`
    };
  }
};
