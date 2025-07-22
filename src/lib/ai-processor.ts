// Enhanced AI Processor with OpenAI & Anthropic Integration
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import * as XLSX from 'xlsx';

export interface PriceCalculationResult {
  cost_excl_vat: number;
  cost_incl_vat: number;
  retail_excl_vat: number;
  retail_incl_vat: number;
  markup_percentage: number;
  detected_price_type: string;
  ai_confidence: number;
}

export interface ProcessedProduct {
  product_id: string;
  name: string;
  description?: string;
  category_id: number;
  supplier: string;
  source_file: string;
  prices: PriceCalculationResult;
  processing_notes: string;
}

export class EnhancedAIProcessor {
  private openai: OpenAI;
  private anthropic: Anthropic;
  private readonly VAT_RATE = 0.15; // 15% VAT for South Africa

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!
    });
    
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!
    });
  }

  /**
   * Process Excel file with intelligent price detection and calculation
   */
  async processExcelFile(
    filePath: string, 
    userSelectedPriceType?: string,
    userMarkupPercentage?: number
  ): Promise {
    try {
      console.log(`🔍 Starting AI processing: ${filePath}`);
      
      // Validate file exists
      const fs = require('fs');
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      // Read Excel workbook
      const workbook = XLSX.readFile(filePath);
      const products: ProcessedProduct[] = [];
      
      // Process each sheet with AI analysis
      for (const sheetName of workbook.SheetNames) {
        console.log(`📊 AI analyzing sheet: ${sheetName}`);
        
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length === 0) {
          console.log(`⚠️ Sheet ${sheetName} is empty, skipping`);
          continue;
        }

        // Use AI to analyze sheet structure
        const sheetStructure = await this.analyzeSheetWithAI(jsonData, sheetName);
        
        if (!sheetStructure.isValid) {
          console.log(`❌ Sheet ${sheetName} structure not recognized by AI`);
          continue;
        }

        // Extract products using AI-detected structure
        const sheetProducts = await this.extractProductsFromSheet(
          jsonData, 
          sheetStructure,
          userSelectedPriceType,
          userMarkupPercentage,
          filePath,
          sheetName
        );
        
        products.push(...sheetProducts);
        console.log(`✅ Extracted ${sheetProducts.length} products from ${sheetName}`);
      }
      
      console.log(`🎉 Total products processed: ${products.length}`);
      return products;
      
    } catch (error) {
      console.error(`💥 AI Processing failed: ${error.message}`);
      throw new Error(`Enhanced AI processing failed: ${error.message}`);
    }
  }

  /**
   * Use OpenAI to analyze Excel sheet structure intelligently
   */
  private async analyzeSheetWithAI(data: any[][], sheetName: string): Promise {
    try {
      // Prepare sample data for AI analysis
      const sampleRows = data.slice(0, 15);
      const sampleText = sampleRows
        .map((row, index) => `Row ${index}: ${row.slice(0, 10).join(' | ')}`)
        .join('\n');

      const analysisPrompt = `
Analyze this Excel sheet data and identify the structure for a pricelist:

Sheet Name: ${sheetName}
Sample Data:
${sampleText}

Identify:
1. Header row index (which row contains column headers)
2. Column mappings for: name, price, description, category, brand
3. Price type: retail_incl_vat, retail_excl_vat, cost_excl_vat, or cost_incl_vat
4. Supplier name from sheet name or content
5. Data quality assessment

Return ONLY valid JSON:
{
  "isValid": true|false,
  "headerRowIndex": 0,
  "columns": {
    "name": 1,
    "price": 2,
    "description": 3,
    "category": 4
  },
  "detectedPriceType": "retail_excl_vat",
  "supplierName": "detected_supplier",
  "confidence": 0.95,
  "dataStartRow": 1,
  "reasoning": "Brief explanation"
}`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system", 
            content: "You are an expert at analyzing Excel pricelist structures. Return only valid JSON."
          },
          { role: "user", content: analysisPrompt }
        ],
        temperature: 0.1,
        max_tokens: 1000
      });
      
      const aiResponse = response.choices[0].message.content?.trim();
      if (!aiResponse) {
        return this.createFallbackStructure();
      }

      // Parse AI response
      let aiAnalysis;
      try {
        aiAnalysis = JSON.parse(aiResponse);
      } catch (parseError) {
        console.log(`⚠️ AI response parsing failed, using fallback`);
        return this.createFallbackStructure();
      }

      // Validate AI analysis
      if (!aiAnalysis.isValid || !aiAnalysis.columns) {
        return this.createFallbackStructure();
      }

      console.log(`🤖 AI Analysis: ${aiAnalysis.confidence} confidence, ${aiAnalysis.reasoning}`);
      return aiAnalysis;

    } catch (error) {
      console.error(`🔥 OpenAI analysis failed: ${error.message}`);
      return this.createFallbackStructure();
    }
  }

  /**
   * Extract products from sheet using AI-detected structure
   */
  private async extractProductsFromSheet(
    data: any[][],
    structure: any,
    userPriceType?: string,
    userMarkup?: number,
    sourceFile?: string,
    sheetName?: string
  ): Promise {
    const products: ProcessedProduct[] = [];
    const startRow = structure.dataStartRow || (structure.headerRowIndex + 1);
    
    for (let i = startRow; i < data.length; i++) {
      const row = data[i];
      
      // Skip empty rows
      if (!row || row.length === 0 || row.every(cell => !cell)) {
        continue;
      }
      
      try {
        // Extract data using AI-detected columns
        const name = this.getCellValue(row, structure.columns.name);
        const priceText = this.getCellValue(row, structure.columns.price);
        const description = this.getCellValue(row, structure.columns.description);
        
        // Validate essential data
        if (!name || !priceText) {
          continue;
        }

        // Parse price with intelligent handling
        const price = this.parsePrice(priceText);
        if (price <= 0) {
          continue;
        }

        // Use user selection or AI detection for price type
        const priceType = userPriceType || structure.detectedPriceType || 'retail_excl_vat';
        const markup = userMarkup || this.estimateMarkup(name, structure.supplierName) || 30;

        // Intelligent supplier detection
        const supplier = this.detectSupplier(
          sourceFile || '', 
          sheetName || '', 
          name, 
          structure.supplierName
        );

        // Smart category assignment
        const categoryId = this.detectCategory(name, description, supplier);

        // Calculate all price variants
        const priceCalculation = this.calculateAllPrices(price, priceType, markup);

        // Create product object
        const product: ProcessedProduct = {
          product_id: this.generateProductId(name, supplier),
          name: name.trim(),
          description: description?.trim() || undefined,
          category_id: categoryId,
          supplier,
          source_file: this.getFileName(sourceFile),
          prices: {
            ...priceCalculation,
            detected_price_type: priceType,
            ai_confidence: structure.confidence || 0.85
          },
          processing_notes: `AI processed: ${priceType} at ${markup}% markup from ${sheetName || 'sheet'}`
        };
        
        products.push(product);
        
      } catch (rowError) {
        console.error(`⚠️ Error processing row ${i}: ${rowError.message}`);
        continue;
      }
    }
    
    return products;
  }

  /**
   * Intelligent price calculation for all variants
   */
  private calculateAllPrices(
    inputPrice: number, 
    priceType: string, 
    markupPercentage: number
  ): Omit {
    
    const markupMultiplier = 1 + (markupPercentage / 100);
    const result: any = { 
      markup_percentage: Math.round(markupPercentage * 100) / 100 
    };
    
    switch (priceType) {
      case 'retail_incl_vat':
        // Given: Retail price including 15% VAT
        result.retail_incl_vat = inputPrice;
        result.retail_excl_vat = inputPrice / (1 + this.VAT_RATE);
        result.cost_incl_vat = inputPrice / markupMultiplier;
        result.cost_excl_vat = result.cost_incl_vat / (1 + this.VAT_RATE);
        break;
        
      case 'retail_excl_vat':
        // Given: Retail price excluding VAT
        result.retail_excl_vat = inputPrice;
        result.retail_incl_vat = inputPrice * (1 + this.VAT_RATE);
        result.cost_excl_vat = inputPrice / markupMultiplier;
        result.cost_incl_vat = result.cost_excl_vat * (1 + this.VAT_RATE);
        break;
        
      case 'cost_excl_vat':
        // Given: Cost price excluding VAT
        result.cost_excl_vat = inputPrice;
        result.cost_incl_vat = inputPrice * (1 + this.VAT_RATE);
        result.retail_excl_vat = inputPrice * markupMultiplier;
        result.retail_incl_vat = result.retail_excl_vat * (1 + this.VAT_RATE);
        break;
        
      case 'cost_incl_vat':
        // Given: Cost price including VAT
        result.cost_incl_vat = inputPrice;
        result.cost_excl_vat = inputPrice / (1 + this.VAT_RATE);
        result.retail_incl_vat = inputPrice * markupMultiplier;
        result.retail_excl_vat = result.retail_incl_vat / (1 + this.VAT_RATE);
        break;
        
      default:
        throw new Error(`Unknown price type: ${priceType}`);
    }
    
    // Round all prices to 2 decimal places
    Object.keys(result).forEach(key => {
      if (typeof result[key] === 'number' && key !== 'markup_percentage') {
        result[key] = Math.round(result[key] * 100) / 100;
      }
    });
    
    return result;
  }

  /**
   * Intelligent supplier detection from multiple sources
   */
  private detectSupplier(filename: string, sheetName: string, productName: string, aiDetected?: string): string {
    // Priority order: AI detected > filename > sheet name > product name
    if (aiDetected && aiDetected !== 'unknown') {
      return aiDetected;
    }

    const supplierPatterns = {
      'nology': 'Nology',
      'av distribution': 'AV Distribution',
      'av-distribution': 'AV Distribution',
      'avdistribution': 'AV Distribution',
      'platinum': 'Platinum',
      'yealink': 'Nology', // Brand association
      'atlona': 'AV Distribution',
      'audio technica': 'Platinum',
      'audiotechnica': 'Platinum'
    };
    
    const searchText = `${filename} ${sheetName} ${productName}`.toLowerCase();
    
    for (const [pattern, supplier] of Object.entries(supplierPatterns)) {
      if (searchText.includes(pattern)) {
        return supplier;
      }
    }
    
    return 'Unknown Supplier';
  }

  /**
   * Smart category detection based on product characteristics
   */
  private detectCategory(name: string, description?: string, supplier?: string): number {
    const text = `${name} ${description || ''} ${supplier || ''}`.toLowerCase();
    
    // Category mapping based on your data
    if (text.match(/yealink|phone|headset|communication|voip|pbx/i)) {
      return 1; // Communications
    }
    
    if (text.match(/hdmi|transmitter|video|av|atlona|broadcast|streaming/i)) {
      return 2; // Audio/Video
    }
    
    if (text.match(/audio.*technica|headphone|speaker|monitor|microphone|platinum/i)) {
      return 3; // Audio Equipment
    }
    
    return 1; // Default to Communications
  }

  /**
   * Estimate markup based on supplier and product type
   */
  private estimateMarkup(productName: string, supplier?: string): number {
    const name = productName.toLowerCase();
    const sup = supplier?.toLowerCase() || '';
    
    // High-end equipment typically has lower markup
    if (name.includes('atlona') || name.includes('professional') || sup.includes('av distribution')) {
      return 25;
    }
    
    // Audio equipment moderate markup
    if (name.includes('audio') || name.includes('technica') || sup.includes('platinum')) {
      return 28;
    }
    
    // Standard equipment
    return 30;
  }

  /**
   * Utility functions
   */
  private getCellValue(row: any[], columnIndex: number): string {
    if (columnIndex < 0 || columnIndex >= row.length) return '';
    const value = row[columnIndex];
    return value ? value.toString().trim() : '';
  }

  private parsePrice(priceText: string): number {
    if (!priceText) return 0;
    
    // Remove currency symbols and spaces
    const cleaned = priceText.toString()
      .replace(/[R$€£,\s]/g, '')
      .replace(/[^\d.-]/g, '');
    
    const price = parseFloat(cleaned);
    return isNaN(price) ? 0 : price;
  }

  private generateProductId(name: string, supplier: string): string {
    const crypto = require('crypto');
    const hash = crypto
      .createHash('md5')
      .update(`${name}_${supplier}_${Date.now()}`)
      .digest('hex');
    return `PID_${hash.substring(0, 12).toUpperCase()}`;
  }

  private getFileName(filePath?: string): string {
    if (!filePath) return 'unknown';
    return filePath.split('/').pop() || filePath.split('\\').pop() || 'unknown';
  }

  private createFallbackStructure(): any {
    return {
      isValid: true,
      headerRowIndex: 0,
      columns: { name: 0, price: 1, description: 2 },
      detectedPriceType: 'retail_excl_vat',
      supplierName: 'Unknown',
      confidence: 0.60,
      dataStartRow: 1,
      reasoning: 'Fallback structure used'
    };
  }
}