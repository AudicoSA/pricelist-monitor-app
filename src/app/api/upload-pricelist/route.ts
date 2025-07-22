import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import pdf from 'pdf-parse';
import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';

// Use your existing environment variable names
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

interface PricelistProduct {
  product_id: string;
  name: string;
  category_id: number;
  price: number;
  description?: string;
  supplier: string;
  source_file: string;
  price_type: 'retail_incl_vat' | 'retail_excl_vat' | 'cost_incl_vat' | 'cost_excl_vat';
  original_price: number;
  currency: string;
  markup_percentage: number;
  cost_price_excl_vat: number;
  cost_price_incl_vat: number;
  calculated_retail_price: number;
  created_at: string;
  updated_at: string;
}

interface UploadConfig {
  supplier_name: string;
  price_type: 'retail_incl_vat' | 'retail_excl_vat' | 'cost_incl_vat' | 'cost_excl_vat';
  markup_percentage: number;
  ai_provider: 'openai' | 'anthropic';
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const configStr = formData.get('config') as string;
    
    if (!file || !configStr) {
      return NextResponse.json({ error: 'File and config required' }, { status: 400 });
    }

    const config: UploadConfig = JSON.parse(configStr);
    const buffer = Buffer.from(await file.arrayBuffer());
    
    let extractedData: any[] = [];
    
    // Determine file type and process accordingly
    const fileExtension = file.name.toLowerCase().split('.').pop();
    
    if (fileExtension === 'pdf') {
      // Process PDF using AI
      extractedData = await processPDFPricelist(buffer, config);
    } else if (['xlsx', 'xls'].includes(fileExtension || '')) {
      // Process Excel file with improved Nology parsing
      extractedData = await processExcelPricelist(buffer, config);
    } else {
      return NextResponse.json({ error: 'Unsupported file format. Please upload PDF, XLSX, or XLS files.' }, { status: 400 });
    }

    // Process and enhance data with COMPLETE cost calculations (like your existing perfect data)
    const processedProducts = await processProductsWithCompleteCalculations(extractedData, config, file.name);

    // Insert into Supabase
    const { data, error } = await supabase
      .from('central_pricelist')
      .insert(processedProducts)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Database insertion failed', details: error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${processedProducts.length} products from ${file.name}`,
      products: data,
      file_type: fileExtension,
      supplier: config.supplier_name
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload processing failed', details: String(error) }, { status: 500 });
  }
}

async function processPDFPricelist(buffer: Buffer, config: UploadConfig): Promise<any[]> {
  try {
    // Extract text from PDF
    const pdfData = await pdf(buffer);
    const text = pdfData.text;

    // Use AI to extract product information
    const prompt = `
    Extract product information from this pricelist text. Return a JSON array of products with the following structure:
    {
      "name": "product name",
      "price": number (price value only),
      "description": "product description", 
      "model_number": "model/SKU if available",
      "category": "product category"
    }

    Pricing context:
    - Supplier: ${config.supplier_name}
    - Price type: ${config.price_type}
    - Currency: Look for ZAR, R, USD, $ or other currency indicators

    Text to analyze:
    ${text}
    `;

    let aiResponse: string;
    
    if (config.ai_provider === 'openai') {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
      });
      aiResponse = response.choices[0]?.message?.content || '[]';
    } else {
    const response = await anthropic.messages.create({
  model: 'claude-3-sonnet-20240229',
  max_tokens: 4000,
  messages: [{ role: 'user', content: prompt }],
    });
    // Handle the response correctly
    const messageContent = response.content[0];
    if (messageContent.type === 'text') {
     aiResponse = messageContent.text;
    } else {
    aiResponse = '[]';
    }  

    // Parse AI response
    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('AI could not extract valid product data from PDF');
    }

    return JSON.parse(jsonMatch[0]);

  } catch (error) {
    console.error('PDF processing error:', error);
    throw new Error(`PDF processing failed: ${error}`);
  }
}

async function processExcelPricelist(buffer: Buffer, config: UploadConfig): Promise<any[]> {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    let allProducts = [];
    
    // Get all potential vendor sheets (excluding system sheets)
    const vendorSheets = workbook.SheetNames.filter(name => 
      !['PRICING', 'INDEX', 'SUMMARY', 'INFO', 'Categories', 'EOL Products', 'Promotions', 'New Products', 'Warehouse Clearance', 'Delivery'].includes(name)
    );
    
    console.log(`Processing ${vendorSheets.length} vendor sheets:`, vendorSheets);
    
    for (const sheetName of vendorSheets.slice(0, 15)) { // Process first 15 vendor sheets
      try {
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON with no header to see raw structure
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (rawData.length < 4) continue; // Need at least 4 rows for Nology structure
        
        // For Nology files, find the row that contains SKU, DESCRIPTION, PRICE
        // Analysis shows headers are typically in row 3 (index 3)
        let headerRowIndex = -1;
        for (let i = 0; i < Math.min(6, rawData.length); i++) {
          const row = rawData[i];
          if (Array.isArray(row) && row.some(cell => 
            cell && typeof cell === 'string' && 
            (cell.toUpperCase().includes('SKU') || 
             (cell.toUpperCase().includes('DESCRIPTION') && 
              rawData[i].some(c => c && c.toString().toUpperCase().includes('PRICE'))))
          )) {
            headerRowIndex = i;
            break;
          }
        }
        
        if (headerRowIndex === -1) {
          console.warn(`No header row found in sheet ${sheetName}`);
          continue;
        }
        
        const headers = rawData[headerRowIndex];
        const dataRows = rawData.slice(headerRowIndex + 1);
        
        console.log(`Sheet ${sheetName}: Found headers at row ${headerRowIndex}:`, headers);
        
        // Find column indices with flexible matching
        const skuIdx = headers.findIndex(h => h && 
          (h.toString().toUpperCase().includes('SKU') || 
           h.toString().toUpperCase().includes('CODE')));
        
        const descIdx = headers.findIndex(h => h && 
          h.toString().toUpperCase().includes('DESCRIPTION'));
        
        const priceIdx = headers.findIndex(h => h && 
          h.toString().toUpperCase().includes('PRICE') &&
          !h.toString().toUpperCase().includes('SUGGESTED') &&
          !h.toString().toUpperCase().includes('ADVERTISING') &&
          !h.toString().toUpperCase().includes('MSRP'));
        
        if (skuIdx === -1 || descIdx === -1 || priceIdx === -1) {
          console.warn(`Missing required columns in sheet ${sheetName}: SKU(${skuIdx}), DESC(${descIdx}), PRICE(${priceIdx})`);
          continue;
        }
        
        console.log(`Processing ${sheetName}: SKU col ${skuIdx}, DESC col ${descIdx}, PRICE col ${priceIdx}`);
        
        // Process each row
        let productCount = 0;
        for (const row of dataRows) {
          if (!Array.isArray(row)) continue;
          
          const sku = row[skuIdx];
          const description = row[descIdx];
          const price = row[priceIdx];
          
          // Skip invalid rows - be very specific about filtering
          if (!sku || !description || !price || 
              typeof price !== 'number' || price <= 0 ||
              // Skip category headers
              (typeof description === 'string' && (
                description.toUpperCase().includes('CATEGORY') ||
                description.toUpperCase() === description || // ALL CAPS likely a category
                description.length < 5 // Too short to be a real product description
              )) ||
              // Skip if SKU looks like a category
              (typeof sku === 'string' && (
                sku.toUpperCase().includes('CATEGORY') ||
                sku.length < 2
              ))) {
            continue;
          }
          
          allProducts.push({
            name: `${sku} - ${description}`.substring(0, 100),
            price: parseFloat(price),
            description: description.toString(),
            model_number: sku.toString(),
            category: sheetName,
            vendor: sheetName
          });
          productCount++;
          
          // Limit products per sheet to avoid overwhelming
          if (productCount >= 50) break;
        }
        
        console.log(`Extracted ${productCount} products from ${sheetName}`);
        
      } catch (error) {
        console.warn(`Error processing sheet ${sheetName}:`, error);
        continue;
      }
    }
    
    console.log(`Total products extracted from Excel: ${allProducts.length}`);
    return allProducts;

  } catch (error) {
    console.error('Excel processing error:', error);
    throw new Error(`Excel processing failed: ${error}`);
  }
}

async function processProductsWithCompleteCalculations(products: any[], config: UploadConfig, fileName: string): Promise<PricelistProduct[]> {
  return products.map((product, index) => {
    const originalPrice = product.price;
    let finalRetailPrice = originalPrice;
    let costExclVat = 0;
    let costInclVat = 0;
    let calculatedRetailPrice = 0;
    
    // COMPLETE pricing logic with all cost calculations (matches your existing perfect data)
    switch (config.price_type) {
      case 'retail_incl_vat':
        // Price already includes VAT and is retail price
        finalRetailPrice = originalPrice;
        calculatedRetailPrice = originalPrice;
        // Reverse calculate cost by removing markup
        costInclVat = originalPrice / (1 + config.markup_percentage / 100);
        costExclVat = costInclVat / 1.15;
        break;
        
      case 'retail_excl_vat':
        // Price excludes VAT but is retail price - THIS MATCHES YOUR EXISTING NOLOGY DATA
        finalRetailPrice = originalPrice * 1.15; // Add VAT for final retail
        calculatedRetailPrice = finalRetailPrice;
        // Reverse calculate cost by removing markup from original price (matches your 30% data)
        costExclVat = originalPrice / (1 + config.markup_percentage / 100);
        costInclVat = costExclVat * 1.15;
        break;
        
      case 'cost_incl_vat':
        // Price includes VAT but is cost price
        costInclVat = originalPrice;
        costExclVat = originalPrice / 1.15;
        finalRetailPrice = originalPrice * (1 + config.markup_percentage / 100);
        calculatedRetailPrice = finalRetailPrice;
        break;
        
      case 'cost_excl_vat':
        // Price excludes VAT and is cost price
        costExclVat = originalPrice;
        costInclVat = originalPrice * 1.15;
        calculatedRetailPrice = costInclVat * (1 + config.markup_percentage / 100);
        finalRetailPrice = calculatedRetailPrice;
        break;
        
      default:
        // Default to retail excluding VAT (matches your existing Nology data)
        finalRetailPrice = originalPrice * 1.15;
        calculatedRetailPrice = finalRetailPrice;
        costExclVat = originalPrice / (1 + config.markup_percentage / 100);
        costInclVat = costExclVat * 1.15;
    }

    return {
      product_id: `PID_${Math.random().toString(36).substr(2, 12).toUpperCase()}`,
      name: product.name || `Product ${index + 1}`,
      category_id: determineCategoryId(product.category || 'General'),
      price: Math.round(finalRetailPrice * 100) / 100,
      description: product.description || '',
      supplier: config.supplier_name,
      source_file: fileName,
      price_type: config.price_type,
      original_price: originalPrice,
      currency: 'ZAR',
      markup_percentage: config.markup_percentage,
      cost_price_excl_vat: Math.round(costExclVat * 100) / 100,
      cost_price_incl_vat: Math.round(costInclVat * 100) / 100,
      calculated_retail_price: Math.round(calculatedRetailPrice * 100) / 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  });
}

function determineCategoryId(category: string): number {
  const categoryMap: { [key: string]: number } = {
    'yealink': 1,
    'mikrotik': 1, 
    'ip phone': 1,
    'phone': 1,
    'accessories': 1,
    'av equipment': 2,
    'atlona': 2,
    'hdmi': 2,
    'transmitter': 2,
    'headphones': 3,
    'audio': 3,
    'speakers': 4,
    'denon': 4,
    'general': 5
  };
  
  const lowerCategory = category.toLowerCase();
  for (const [key, value] of Object.entries(categoryMap)) {
    if (lowerCategory.includes(key)) {
      return value;
    }
  }
  return 5; // Default category
}