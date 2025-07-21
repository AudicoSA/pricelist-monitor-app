import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if user has valid session cookie
    const sessionCookie = req.cookies.session;

    if (!sessionCookie) {
      return res.status(401).json({ 
        authenticated: false, 
        error: 'No session found' 
      });
    }

    // Simple session validation (in production, verify JWT or session store)
    const isValid = sessionCookie === 'authenticated';

    if (isValid) {
      return res.status(200).json({ 
        authenticated: true,
        user: { role: 'admin' }
      });
    } else {
      return res.status(401).json({ 
        authenticated: false, 
        error: 'Invalid session' 
      });
    }
  } catch (error) {
    console.error('Auth check error:', error);
    return res.status(500).json({ 
      authenticated: false, 
      error: 'Server error' 
    });
  }
}