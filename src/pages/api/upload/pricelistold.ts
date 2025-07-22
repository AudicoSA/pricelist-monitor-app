// pages/api/upload/pricelist.ts
import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { processExcelFile, processPdfFile } from '../../../lib/ai-processorold';
import { saveToSupabase } from '../../../lib/supabase';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Check authentication
  const sessionCookie = req.cookies['admin-session'];
  if (sessionCookie !== 'authenticated') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB
      uploadDir: './tmp',
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!uploadedFile) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileExtension = path.extname(uploadedFile.originalFilename || '').toLowerCase();
    let processedData;

    // AI-powered file processing
    if (['.xlsx', '.xls', '.xlsm'].includes(fileExtension)) {
      processedData = await processExcelFile(uploadedFile.filepath);
    } else if (fileExtension === '.pdf') {
      processedData = await processPdfFile(uploadedFile.filepath);
    } else {
      return res.status(400).json({ message: 'Unsupported file format' });
    }

    // Save to Supabase
    const savedData = await saveToSupabase(processedData);

    // Clean up temporary file
    fs.unlinkSync(uploadedFile.filepath);

    return res.status(200).json({
      success: true,
      message: `Processed ${processedData.length} products successfully`,
      data: {
        productsCount: processedData.length,
        fileName: uploadedFile.originalFilename,
        processingTime: Date.now(),
        savedRecords: savedData.length
      }
    });

  } catch (error) {
    console.error('Upload processing error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to process file', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}