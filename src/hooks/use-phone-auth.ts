'use client';

import { useState, useCallback, useEffect } from 'react';
import { getUserRole } from '@/lib/api';

export const usePhoneAuth = () => {
  const [phone, setPhoneState] = useState<string>('');
  const [role, setRoleState] = useState<'user' | 'worker' | 'admin'>('user');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedPhone = localStorage.getItem('cyberhub_phone');
    const savedRole = localStorage.getItem('cyberhub_role') as 'user' | 'worker' | 'admin';
    
    console.log('Initializing auth from localStorage:', { savedPhone, savedRole });
    
    if (savedPhone) {
      setPhoneState(savedPhone);
    }
    
    if (savedRole && ['user', 'worker', 'admin'].includes(savedRole)) {
      setRoleState(savedRole);
    }
    
    setInitializing(false);
  }, []);

  const setPhone = useCallback((phoneNumber: string) => {
    setPhoneState(phoneNumber);
  }, []);

  const setRole = useCallback((newRole: 'user' | 'worker' | 'admin') => {
    setRoleState(newRole);
  }, []);

  const login = useCallback(async (): Promise<boolean> => {
    if (!phone || !phone.startsWith('+')) {
      setError('Please enter a valid phone number with country code');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Call our Vercel API to get role
      const userData = await getUserRole(phone);
      const userRole = userData.role;
      
      if (userRole && ['user', 'worker', 'admin'].includes(userRole)) {
        setRole(userRole as 'user' | 'worker' | 'admin');
        
        // Store in localStorage for session
        localStorage.setItem('cyberhub_phone', phone);
        localStorage.setItem('cyberhub_role', userRole);
        
        // Also store in sessionStorage for immediate use
        sessionStorage.setItem('cyberhub_phone', phone);
        sessionStorage.setItem('cyberhub_role', userRole);
        
        console.log('Login successful:', { phone, role: userRole });
        return true;
      } else {
        setError('Unable to determine your role. Please contact support.');
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, [phone, setRole]);

  const logout = useCallback(() => {
    console.log('Logging out');
    localStorage.removeItem('cyberhub_phone');
    localStorage.removeItem('cyberhub_role');
    sessionStorage.removeItem('cyberhub_phone');
    sessionStorage.removeItem('cyberhub_role');
    setPhoneState('');
    setRoleState('user');
  }, []);

  return {
    phone,
    setPhone,
    role,
    setRole,
    loading,
    initializing,
    error,
    login,
    logout
  };
};