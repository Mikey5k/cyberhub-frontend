'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const NavBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [phone, setPhone] = useState<string | null>(null);

  useEffect(() => {
    // Check for phone in URL parameters
    const params = new URLSearchParams(window.location.search);
    const urlPhone = params.get('phone');
    
    if (urlPhone) {
      localStorage.setItem('userPhone', urlPhone);
      setPhone(urlPhone);
    } else {
      // Get phone from localStorage
      const storedPhone = localStorage.getItem('userPhone');
      setPhone(storedPhone);
    }
  }, []);

  // Don't show NavBar on landing page or login page
  if (pathname === '/' || pathname === '/login') {
    return null;
  }

  const handleSignOut = () => {
    localStorage.removeItem('userPhone');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    router.push('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white shadow-lg z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo/Home Link */}
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => router.push('/')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
              <span className="font-bold text-lg">V</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Veritas Cyberhub</h1>
              <p className="text-xs text-blue-200">Premium Tech Solutions</p>
            </div>
          </div>

          {/* Right side: User info and Sign Out */}
          <div className="flex items-center space-x-4">
            {phone && (
              <div className="hidden md:flex items-center space-x-2 bg-blue-800/50 px-3 py-1 rounded-lg">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">{phone}</span>
              </div>
            )}
            
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;