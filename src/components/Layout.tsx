// components/Layout.tsx
import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: 'dashboard' },
    { name: 'Upload Files', href: '/admin/upload', icon: 'upload' },
    { name: 'View Pricelists', href: '/admin/pricelists', icon: 'list' },
    { name: 'Export Data', href: '/admin/export', icon: 'download' },
  ];

  const handleLogout = async () => {
    // Clear session
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  return (
    <div className="opencart-admin">
      {/* Header */}
      <header className="admin-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">AI Pricelist Monitor</h1>
              <span className="ml-3 text-sm opacity-75">OpenCart Integration</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm hover:text-gray-300 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="admin-sidebar w-64 min-h-screen p-4">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    router.pathname === item.href
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main content */}
        <main className="flex-1 p-8">
          <div className="admin-content">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}