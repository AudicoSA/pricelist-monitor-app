import { NextApiRequest, NextApiResponse } from 'next';

interface UploadStatus {
  id: string;
  filename: string;
  status: 'processing' | 'completed' | 'error';
  progress: number;
  productsProcessed: number;
  totalProducts: number;
  error?: string;
  aiEnhancementsApplied: number;
}

// In-memory storage for upload statuses (in production, use Redis or database)
const uploadStatuses: Map<string, UploadStatus> = new Map();

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  const sessionCookie = req.cookies.session;
  if (!sessionCookie || sessionCookie !== 'authenticated') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const { id } = req.query;

    if (id) {
      // Get specific upload status
      const status = uploadStatuses.get(id as string);
      if (!status) {
        return res.status(404).json({ error: 'Upload not found' });
      }
      return res.status(200).json(status);
    } else {
      // Get all recent uploads
      const recentUploads = Array.from(uploadStatuses.values())
        .sort((a, b) => b.progress - a.progress)
        .slice(0, 10);

      return res.status(200).json(recentUploads);
    }
  }

  if (req.method === 'POST') {
    // Create new upload status
    const { filename, totalProducts } = req.body;

    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const status: UploadStatus = {
      id,
      filename,
      status: 'processing',
      progress: 0,
      productsProcessed: 0,
      totalProducts: totalProducts || 0,
      aiEnhancementsApplied: 0
    };

    uploadStatuses.set(id, status);
    return res.status(200).json({ id, status });
  }

  if (req.method === 'PUT') {
    // Update upload status
    const { id } = req.query;
    const updates = req.body;

    const status = uploadStatuses.get(id as string);
    if (!status) {
      return res.status(404).json({ error: 'Upload not found' });
    }

    Object.assign(status, updates);
    uploadStatuses.set(id as string, status);

    return res.status(200).json(status);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}