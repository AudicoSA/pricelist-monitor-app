// lib/ai-processor.ts
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as crypto from 'crypto';

export interface ProcessedProduct {
  product_id: string;
  name: string;
  category_id: number;
  price: number;
  description: string;
  image_url?: string;
  title?: string;
  created_at: string;
  updated_at: string;
  supplier: string;
  source_file: string;
  price_type: 'retail_excl_vat' | 'retail_incl_vat' | 'cost_excl_vat' | 'cost_incl_vat';
  original_price: number;
  currency: string;
  confidence_score?: number;
}

// AI Intelligence for detecting file formats and structures
export class PricelistAI {

  static detectSupplierFromFilename(filename: string): string {
    const name = filename.toLowerCase();

    // Supplier detection patterns based on your actual files
    if (name.includes('nology')) return 'Nology';
    if (name.includes('av distribution')) return 'AV Distribution';
    if (name.includes('platinum')) return 'Platinum';
    if (name.includes('alpha')) return 'Alpha Technologies';
    if (name.includes('akai')) return 'Akai Professional';
    if (name.includes('akg')) return 'AKG Professional';
    if (name.includes('allen')) return 'Allen Heath';
    if (name.includes('audac')) return 'Audac';
    if (name.includes('barkan')) return 'Barkan';
    if (name.includes('chauvet')) return 'Chauvet';

    // Extract from filename if no pattern match
    const parts = filename.split(/[-_\s]+/);
    return parts[0] || 'Unknown Supplier';
  }

  static detectPriceType(columnName: string, value: any): 'retail_excl_vat' | 'retail_incl_vat' | 'cost_excl_vat' | 'cost_incl_vat' {
    const col = columnName.toLowerCase();

    // Retail patterns
    if (col.includes('retail') || col.includes('rrp') || col.includes('recommended')) {
      return col.includes('incl') ? 'retail_incl_vat' : 'retail_excl_vat';
    }

    // Cost patterns
    if (col.includes('cost') || col.includes('trade')) {
      return col.includes('incl') ? 'cost_incl_vat' : 'cost_excl_vat';
    }

    // VAT detection
    if (col.includes('excl')) return 'retail_excl_vat';
    if (col.includes('incl')) return 'retail_incl_vat';

    // Default assumption
    return 'retail_excl_vat';
  }

  static extractBrand(productName: string, supplierName: string): string {
    const name = productName.toUpperCase();

    // Brand patterns from your data
    const brands = [
      'YEALINK', 'ATLONA', 'AUDAC', 'XILICA', 'PROCAB', 'SENNHEISER',
      'HOLLYLAND', 'RYCOTE', 'AIDA', 'FORTINGE', 'AXXENT', 'AUDIO TECHNICA',
      'GIBSON', 'EPIPHONE', 'NORD', 'PIONEER DJ', 'RCF', 'TANNOY',
      'JABRA', 'DNAKE', 'LG', 'SHELLY', 'HUAWEI', 'MIKROTIK', 'SAMSUNG'
    ];

    for (const brand of brands) {
      if (name.includes(brand)) {
        return brand;
      }
    }

    // Use supplier as brand if no specific brand found
    return supplierName;
  }

  static categorizeProduct(productName: string, description: string = ''): number {
    const text = (productName + ' ' + description).toLowerCase();

    // Category mapping (adjust based on your needs)
    if (text.includes('headphone') || text.includes('speaker') || text.includes('microphone') || text.includes('audio')) {
      return 3; // Audio Equipment
    }
    if (text.includes('video') || text.includes('hdmi') || text.includes('camera') || text.includes('display')) {
      return 2; // Video Equipment
    }
    if (text.includes('cable') || text.includes('mount') || text.includes('case') || text.includes('bracket')) {
      return 4; // Accessories
    }
    if (text.includes('phone') || text.includes('communication') || text.includes('voip')) {
      return 1; // Communication
    }

    return 1; // Default category
  }

  static generateProductId(supplier: string, sku: string): string {
    const hash = crypto.createHash('md5').update(`${supplier}_${sku}`).digest('hex');
    return `PID_${hash.substring(0, 12).toUpperCase()}`;
  }

  static calculateConfidence(product: any): number {
    let score = 0.5; // Base score

    if (product.name && product.name.trim()) score += 0.2;
    if (product.price && product.price > 0) score += 0.2;
    if (product.description && product.description.trim()) score += 0.1;

    return Math.min(score, 1.0);
  }
}

// Excel file processor with intelligent format detection
export async function processExcelFile(filePath: string): Promise<ProcessedProduct[]> {
  const workbook = XLSX.readFile(filePath);
  const results: ProcessedProduct[] = [];

  const filename = filePath.split('/').pop() || '';
  const supplier = PricelistAI.detectSupplierFromFilename(filename);

  for (const sheetName of workbook.SheetNames) {
    // Skip disclaimer and content sheets
    if (sheetName.toLowerCase().includes('disclaimer') || 
        sheetName.toLowerCase().includes('content') ||
        sheetName.toLowerCase().includes('delivery')) {
      continue;
    }

    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    if (data.length < 2) continue;

    // Find header row (intelligent detection)
    let headerRow = 0;
    for (let i = 0; i < Math.min(5, data.length); i++) {
      const row = data[i];
      if (row && row.some(cell => 
        typeof cell === 'string' && 
        (cell.toLowerCase().includes('sku') || 
         cell.toLowerCase().includes('product') || 
         cell.toLowerCase().includes('description') ||
         cell.toLowerCase().includes('price'))
      )) {
        headerRow = i;
        break;
      }
    }

    const headers = data[headerRow] || [];

    // Find column indices intelligently
    const skuCol = headers.findIndex(h => 
      h && typeof h === 'string' && 
      (h.toLowerCase().includes('sku') || 
       h.toLowerCase().includes('code') ||
       h.toLowerCase().includes('stock code'))
    );

    const nameCol = headers.findIndex(h => 
      h && typeof h === 'string' && 
      (h.toLowerCase().includes('name') || 
       h.toLowerCase().includes('product') ||
       h.toLowerCase().includes('description'))
    );

    const priceCol = headers.findIndex(h => 
      h && typeof h === 'string' && 
      (h.toLowerCase().includes('price') || 
       h.toLowerCase().includes('retail') ||
       h.toLowerCase().includes('cost'))
    );

    const descCol = headers.findIndex(h => 
      h && typeof h === 'string' && 
      h.toLowerCase().includes('description')
    );

    // Process data rows
    for (let i = headerRow + 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      const sku = skuCol >= 0 ? row[skuCol] : `${sheetName}_${i}`;
      const name = nameCol >= 0 ? row[nameCol] : '';
      const price = priceCol >= 0 ? parseFloat(row[priceCol]) : 0;
      const description = descCol >= 0 ? row[descCol] : '';

      if (!sku || !name || price <= 0) continue;

      const product: ProcessedProduct = {
        product_id: PricelistAI.generateProductId(supplier, String(sku)),
        name: `${PricelistAI.extractBrand(String(name), supplier)} ${String(name)}`.trim(),
        category_id: PricelistAI.categorizeProduct(String(name), String(description)),
        price: price,
        description: String(description || name),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        supplier: supplier,
        source_file: filename,
        price_type: PricelistAI.detectPriceType(headers[priceCol] || '', price),
        original_price: price,
        currency: 'ZAR',
        confidence_score: PricelistAI.calculateConfidence({ name, price, description })
      };

      results.push(product);
    }
  }

  return results;
}

// PDF processor (simplified - you can enhance with pdf-parse)
export async function processPdfFile(filePath: string): Promise<ProcessedProduct[]> {
  // Basic PDF processing - can be enhanced with proper PDF parsing
  const filename = filePath.split('/').pop() || '';
  const supplier = PricelistAI.detectSupplierFromFilename(filename);

  // For now, return empty array - implement PDF text extraction as needed
  return [];
}