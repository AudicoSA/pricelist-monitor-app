// pages/api/auth/login.ts
import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return res.status(500).json({ message: 'Server configuration error' });
  }

  try {
    // In production, you should hash the admin password
    const isValid = password === adminPassword;

    if (isValid) {
      // Set session cookie
      res.setHeader('Set-Cookie', [
        `admin-session=authenticated; Path=/; HttpOnly; Max-Age=86400; ${process.env.NODE_ENV === 'production' ? 'Secure; ' : ''}SameSite=Strict`
      ]);

      return res.status(200).json({ success: true, message: 'Authenticated successfully' });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Authentication failed' });
  }
}