// Enhanced API endpoint for intelligent pricelist processing
import { NextApiRequest, NextApiResponse } from 'next';
import { EnhancedAIProcessor } from '../../../lib/ai-processor';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false, // Required for file uploads
  },
};

interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    total_found: number;
    saved_count: number;
    failed_count: number;
    price_type: string;
    markup_percentage: number;
    processing_time: number;
    products: any[];
    errors: string[];
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  const startTime = Date.now();

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed. Use POST.' 
    });
  }

  let tempFilePath = '';
  
  try {
    console.log('🚀 Enhanced pricelist processing started');

    // Parse multipart form data
    const uploadDir = path.join(process.cwd(), 'tmp');
    
    // Ensure tmp directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB limit
      filter: ({ mimetype }) => {
        return Boolean(mimetype && (
          mimetype.includes('excel') || 
          mimetype.includes('spreadsheet') ||
          mimetype.includes('application/vnd.ms-excel') ||
          mimetype.includes('application/vnd.openxmlformats')
        ));
      }
    });

    const [fields, files] = await form.parse(req);
    
    // Extract form data
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const priceType = Array.isArray(fields.priceType) ? fields.priceType[0] : fields.priceType;
    const markupPercentage = parseFloat(
      Array.isArray(fields.markupPercentage) ? fields.markupPercentage[0] : fields.markupPercentage || '30'
    );

    if (!file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded. Please select an Excel file.' 
      });
    }

    tempFilePath = file.filepath;
    const originalFilename = file.originalFilename || 'unknown.xlsx';

    // Validate file size and type
    if (file.size === 0) {
      return res.status(400).json({
        success: false,
        message: 'Uploaded file is empty. Please check your file and try again.'
      });
    }

    console.log(`📁 Processing file: ${originalFilename} (${Math.round(file.size / 1024)}KB)`);
    console.log(`💰 Price type: ${priceType || 'auto-detect'}`);
    console.log(`📊 Markup: ${markupPercentage}%`);

    // Initialize enhanced AI processor
    const processor = new EnhancedAIProcessor();
    
    // Process file with AI
    const products = await processor.processExcelFile(
      tempFilePath,
      priceType as string,
      markupPercentage
    );

    if (products.length === 0) {
      return res.status(200).json({
        success: false,
        message: 'No valid products found in the uploaded file. Please check the file format and data structure.',
        data: {
          total_found: 0,
          saved_count: 0,
          failed_count: 0,
          price_type: priceType || 'unknown',
          markup_percentage: markupPercentage,
          processing_time: Date.now() - startTime,
          products: [],
          errors: ['No products detected in Excel file']
        }
      });
    }

    // Initialize Supabase client with service role for admin operations
    const supabase = createServerSupabaseClient({ req, res });
    
    // Save products to database
    const savedProducts = [];
    const errors = [];
    let savedCount = 0;
    let failedCount = 0;

    for (const product of products) {
      try {
        // Prepare product data for database
        const dbProduct = {
          product_id: product.product_id,
          name: product.name,
          description: product.description,
          category_id: product.category_id,
          supplier: product.supplier,
          source_file: originalFilename,
          
          // Store the display price (could be retail_excl_vat or retail_incl_vat)
          price: product.prices.retail_excl_vat,
          price_type: product.prices.detected_price_type,
          original_price: product.prices.cost_excl_vat, // Store cost as original_price for compatibility
          
          // Enhanced pricing columns
          cost_excl_vat: product.prices.cost_excl_vat,
          cost_incl_vat: product.prices.cost_incl_vat,
          retail_excl_vat: product.prices.retail_excl_vat,
          retail_incl_vat: product.prices.retail_incl_vat,
          markup_percentage: product.prices.markup_percentage,
          
          // Metadata
          ai_processed: true,
          processing_notes: product.processing_notes,
          currency: 'ZAR',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Upsert to central_pricelist table
        const { data, error } = await supabase
          .from('central_pricelist')
          .upsert(dbProduct, { 
            onConflict: 'product_id',
            ignoreDuplicates: false 
          })
          .select();

        if (error) {
          console.error(`❌ Database error for ${product.name}:`, error.message);
          errors.push(`${product.name}: ${error.message}`);
          failedCount++;
        } else {
          savedProducts.push(data[0]);
          savedCount++;
          console.log(`✅ Saved: ${product.name} - R${product.prices.retail_excl_vat}`);
        }

      } catch (saveError) {
        const errorMsg = `Failed to save ${product.name}: ${saveError.message}`;
        console.error(`💥 ${errorMsg}`);
        errors.push(errorMsg);
        failedCount++;
      }
    }

    const processingTime = Date.now() - startTime;

    // Cleanup temp file
    try {
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    } catch (cleanupError) {
      console.error(`⚠️ Failed to cleanup temp file: ${cleanupError.message}`);
    }

    // Return success response
    const response: UploadResponse = {
      success: savedCount > 0,
      message: savedCount > 0 
        ? `Successfully processed ${savedCount} products from ${originalFilename}`
        : `Processing completed but no products were saved. ${failedCount} errors occurred.`,
      data: {
        total_found: products.length,
        saved_count: savedCount,
        failed_count: failedCount,
        price_type: priceType || 'auto-detected',
        markup_percentage: markupPercentage,
        processing_time: processingTime,
        products: savedProducts.slice(0, 5), // Return first 5 for preview
        errors: errors.slice(0, 10) // Limit errors to first 10
      }
    };

    console.log(`🎉 Processing complete: ${savedCount}/${products.length} saved in ${processingTime}ms`);
    
    return res.status(200).json(response);

  } catch (error) {
    console.error('💥 Enhanced processing error:', error);

    // Cleanup temp file on error
    try {
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    } catch (cleanupError) {
      console.error(`⚠️ Failed to cleanup temp file after error: ${cleanupError.message}`);
    }

    return res.status(500).json({
      success: false,
      message: 'Processing failed due to server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      data: {
        total_found: 0,
        saved_count: 0,
        failed_count: 0,
        price_type: 'unknown',
        markup_percentage: 0,
        processing_time: Date.now() - startTime,
        products: [],
        errors: [error.message]
      }
    });
  }
}