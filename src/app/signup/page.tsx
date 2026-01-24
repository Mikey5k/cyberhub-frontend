"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    phone: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://cyberhub-veritas.vercel.app/api/createUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({...formData, role: 'user'}),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to login with the new phone number
        router.push(`/login?phone=${formData.phone}&role=user`);
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Client Account</h1>
          <p className="text-blue-200">Book services and get assistance</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white mb-2 text-sm font-medium">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-white mb-2 text-sm font-medium">
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="0712345678"
            />
            <p className="text-blue-200 text-xs mt-1">Enter your Kenyan phone number</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? 'Creating Account...' : 'Sign Up as Client'}
          </button>

          <div className="text-center pt-4 border-t border-white/20">
            <p className="text-blue-200">
              Want to work with us?{' '}
              <Link 
                href="/agent-signup" 
                className="text-orange-300 hover:text-orange-200 font-semibold underline"
              >
                Become an Agent
              </Link>
            </p>
            <p className="text-blue-200 mt-2">
              Manage a team?{' '}
              <Link 
                href="/manager-signup" 
                className="text-orange-300 hover:text-orange-200 font-semibold underline"
              >
                Become a Manager
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}