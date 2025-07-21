// pages/index.tsx
import { useState, useEffect } from 'react';
import LoginForm from '../components/LoginForm';
import { useRouter } from 'next/router';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check');
        if (response.ok) {
          router.push('/admin/dashboard');
        }
      } catch (error) {
        // Not authenticated, show login
      }
    };

    checkAuth();
  }, [router]);

  if (isAuthenticated) {
    return null; // Will redirect to dashboard
  }

  return <LoginForm onLogin={() => setIsAuthenticated(true)} />;
}