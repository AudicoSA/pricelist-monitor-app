// Enhanced Upload Form with Intelligent Price Processing
import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Calculator, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface UploadResult {
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

interface PriceTypeOption {
  value: string;
  label: string;
  description: string;
  example: string;
}

export const EnhancedUploadForm: React.FC = () => {
  const [file, setFile] = useState(null);
  const [priceType, setPriceType] = useState('');
  const [markupPercentage, setMarkupPercentage] = useState(30);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const priceTypeOptions: PriceTypeOption[] = [
    {
      value: 'retail_incl_vat',
      label: 'Retail Price (including VAT)',
      description: 'Final selling price with 15% VAT already included',
      example: 'R115.00 (includes VAT)'
    },
    {
      value: 'retail_excl_vat',
      label: 'Retail Price (excluding VAT)', 
      description: 'Selling price before adding 15% VAT',
      example: 'R100.00 + VAT = R115.00'
    },
    {
      value: 'cost_excl_vat',
      label: 'Cost Price (excluding VAT)',
      description: 'Your cost price before VAT and markup',
      example: 'R70.00 → markup → retail'
    },
    {
      value: 'cost_incl_vat', 
      label: 'Cost Price (including VAT)',
      description: 'Your cost with VAT, before applying markup',
      example: 'R80.50 → markup → retail'
    }
  ];

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const excelFile = droppedFiles.find(f => 
      f.name.endsWith('.xlsx') || 
      f.name.endsWith('.xls') || 
      f.name.endsWith('.xlsm')
    );
    
    if (excelFile) {
      setFile(excelFile);
    } else {
      alert('Please drop an Excel file (.xlsx, .xls, .xlsm)');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const calculatePricePreview = (inputPrice: number = 100) => {
    if (!priceType || markupPercentage <= 0) return null;

    const markup = markupPercentage / 100;
    const VAT_RATE = 0.15;
    const markupMultiplier = 1 + markup;
    
    let preview: any = {};
    
    switch (priceType) {
      case 'retail_incl_vat':
        preview.retail_incl_vat = inputPrice;
        preview.retail_excl_vat = inputPrice / (1 + VAT_RATE);
        preview.cost_incl_vat = inputPrice / markupMultiplier;
        preview.cost_excl_vat = preview.cost_incl_vat / (1 + VAT_RATE);
        break;
      case 'retail_excl_vat':
        preview.retail_excl_vat = inputPrice;
        preview.retail_incl_vat = inputPrice * (1 + VAT_RATE);
        preview.cost_excl_vat = inputPrice / markupMultiplier;
        preview.cost_incl_vat = preview.cost_excl_vat * (1 + VAT_RATE);
        break;
      case 'cost_excl_vat':
        preview.cost_excl_vat = inputPrice;
        preview.cost_incl_vat = inputPrice * (1 + VAT_RATE);
        preview.retail_excl_vat = inputPrice * markupMultiplier;
        preview.retail_incl_vat = preview.retail_excl_vat * (1 + VAT_RATE);
        break;
      case 'cost_incl_vat':
        preview.cost_incl_vat = inputPrice;
        preview.cost_excl_vat = inputPrice / (1 + VAT_RATE);
        preview.retail_incl_vat = inputPrice * markupMultiplier;
        preview.retail_excl_vat = preview.retail_incl_vat / (1 + VAT_RATE);
        break;
    }

    // Round all values
    Object.keys(preview).forEach(key => {
      preview[key] = Math.round(preview[key] * 100) / 100;
    });

    return preview;
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select an Excel file to upload');
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      console.log('🚀 Starting upload:', file.name);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('priceType', priceType);
      formData.append('markupPercentage', markupPercentage.toString());

      const response = await fetch('/api/upload/pricelist', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('📊 Upload result:', data);
      
      setResult(data);

      // Auto-redirect on success after showing results
      if (data.success && data.data?.saved_count > 0) {
        setTimeout(() => {
          // You can redirect to dashboard or refresh the page
          window.location.href = '/dashboard?uploaded=true';
        }, 3000);
      }

    } catch (error) {
      console.error('💥 Upload error:', error);
      setResult({
        success: false,
        message: `Upload failed: ${error.message}`,
        error: error.message
      });
    } finally {
      setUploading(false);
    }
  };

  const pricePreview = calculatePricePreview();

  return (
    
      {/* Header */}
      
        
          
        
        
          Enhanced AI Pricelist Processor
        
        
          Upload Excel pricelists with intelligent price type detection and automatic markup calculations
        
      

      
        {/* Left Column - Upload & Settings */}
        
          {/* File Upload */}
          
            
              
              Upload Excel File
            
            
             { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
            >
              
              
              {file ? (
                
                  
                  {file.name}
                  
                    {Math.round(file.size / 1024)} KB
                  
                   fileInputRef.current?.click()}
                    className="mt-2 text-blue-600 hover:text-blue-700 text-sm underline"
                  >
                    Choose different file
                  
                
              ) : (
                
                  
                  Drop Excel file here
                  or
                   fileInputRef.current?.click()}
                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    Choose File
                  
                  
                    Supports .xlsx, .xls, .xlsm files up to 50MB
                  
                
              )}
            
          

          {/* Price Type Selection */}
          
            
              
              Price Type in Your Excel File
            
            
            
              
                
                  
                  
                    Let AI Auto-Detect
                    
                      Leave blank to let AI analyze your Excel file and detect the price type automatically
                    
                  
                
              

              {priceTypeOptions.map((option) => (
                
                   setPriceType(e.target.value)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  
                    {option.label}
                    {option.description}
                    
                      {option.example}
                    
                  
                
              ))}
            
          

          {/* Markup Percentage */}
          
            
              
              Markup Percentage
            
            
            
              
                 setMarkupPercentage(parseFloat(e.target.value) || 0)}
                  min="0"
                  max="1000"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              
              %
            
            
            
              Common markups: 25% (high-end), 30% (standard), 35% (accessories)
            
          
        

        {/* Right Column - Preview & Upload */}
        
          {/* Price Calculation Preview */}
          {pricePreview && (
            
              Price Calculation Preview
              
                Example: If your Excel contains R100.00 as {priceTypeOptions.find(o => o.value === priceType)?.label}
              
              
              
                
                  Cost (excl VAT):
                  R{pricePreview.cost_excl_vat.toFixed(2)}
                
                
                  Cost (incl VAT):
                  R{pricePreview.cost_incl_vat.toFixed(2)}
                
                
                  Retail (excl VAT):
                  R{pricePreview.retail_excl_vat.toFixed(2)}
                
                
                  Retail (incl VAT):
                  R{pricePreview.retail_incl_vat.toFixed(2)}
                
              
              
              
                Calculation Logic: {markupPercentage}% markup • 15% VAT rate
              
            
          )}

          {/* Upload Button */}
          
            
              {uploading ? (
                
                  
                  Processing with AI...
                
              ) : (
                
                  
                  Upload & Process Pricelist
                
              )}
            
          

          {/* Results */}
          {result && (
            
              
                {result.success ? (
                  
                ) : (
                  
                )}
                
                
                  
                    {result.success ? '✅ Processing Successful' : '❌ Processing Failed'}
                  
                  
                  
                    {result.message}
                  
                  
                  {result.data && (
                    
                      
                        
                          Products found:
                          {result.data.total_found}
                        
                        
                          Products saved:
                          {result.data.saved_count}
                        
                        
                          Price type:
                          {result.data.price_type.replace('_', ' ')}
                        
                        
                          Markup applied:
                          {result.data.markup_percentage}%
                        
                      
                      
                      
                        Processing completed in {result.data.processing_time}ms
                      
                      
                      {result.data.products && result.data.products.length > 0 && (
                        
                          Sample processed products:
                          
                            {result.data.products.slice(0, 3).map((product: any, index: number) => (
                              
                                {product.name}
                                R{product.retail_excl_vat}
                                ({product.supplier})
                              
                            ))}
                          
                        
                      )}
                      
                      {result.data.errors && result.data.errors.length > 0 && (
                        
                          Errors encountered:
                          
                            {result.data.errors.slice(0, 3).map((error: string, index: number) => (
                              
                                {error}
                              
                            ))}
                          
                        
                      )}
                    
                  )}
                  
                  {result.success && (
                    
                      Redirecting to dashboard in 3 seconds...
                    
                  )}
                
              
            
          )}
        
      
    
  );
};