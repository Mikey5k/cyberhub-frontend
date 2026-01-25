'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Zap, UserPlus, Shield, CheckCircle, Phone, Lock, 
  Users, Banknote, Calendar, ArrowRight, Loader,
  AlertCircle, Copy, Star
} from 'lucide-react';
import { createUser } from '@/lib/api';

// Content component that uses useSearchParams
function AgentSignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const managerPhone = searchParams.get('manager');
  
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [managerInfo, setManagerInfo] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (managerPhone) {
      // Fetch manager info using our internal API
      fetch(`/api/users?phone=${encodeURIComponent(managerPhone)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && (data.user?.role === 'admin' || data.user?.role === 'manager')) {
            setManagerInfo({ 
              phone: managerPhone, 
              name: data.user?.name || (data.user?.role === 'admin' ? 'Admin' : 'Manager'), 
              role: data.user?.role 
            });
          } else {
            setError('Invalid manager link. Manager must be admin or manager role.');
          }
        })
        .catch(() => setError('Invalid manager link'));
    } else {
      setError('Missing manager referral. Please use a valid invitation link.');
    }
  }, [managerPhone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.startsWith('+254')) {
      setError('Please use a valid Kenyan phone number starting with +254');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create agent user with manager link using our API utility
      const result = await createUser(phone, 'worker', name, managerPhone || undefined);
      
      if (result.success) {
        // Manager-agent relationship is already handled in createUser function
        // through the managerPhone parameter in the API
        
        setSuccess(true);
        
        // Auto login after 2 seconds
        setTimeout(() => {
          localStorage.setItem('cyberhub_phone', phone);
          localStorage.setItem('cyberhub_role', 'worker');
          sessionStorage.setItem('cyberhub_phone', phone);
          sessionStorage.setItem('cyberhub_role', 'worker');
          router.push('/agent-dashboard');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = () => {
    if (managerInfo) {
      const link = `${window.location.origin}/agent-signup?manager=${encodeURIComponent(managerInfo.phone)}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!managerPhone) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border-2 border-gray-200 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-gray-900 mb-2">Invalid Invitation</h2>
          <p className="text-gray-600 mb-6">This invitation link is invalid. Please contact your manager for a new link.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white font-bold px-6 py-3 rounded-lg hover:opacity-90"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border-2 border-gray-200 p-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-gray-900 mb-2">Welcome to Veritas!</h2>
          <p className="text-gray-600 mb-4">Your agent account has been created successfully.</p>
          <p className="text-gray-600 mb-2">You are now linked to manager: {managerInfo?.name}</p>
          <p className="text-gray-600 mb-6">You will be redirected to your dashboard shortly.</p>
          <Loader className="h-8 w-8 animate-spin text-[#ff6b35] mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-[#ff6b35] to-[#ffa500] p-2 rounded-lg">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-black bg-gradient-to-r from-[#ff6b35] to-[#ffa500] bg-clip-text text-transparent">
                  Veritas Agent Signup
                </span>
              </div>
            </div>
            <button
              onClick={() => router.push('/')}
              className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100"
            >
              Back to Home
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Signup Form */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-xl">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900">Join as Agent</h1>
                <p className="text-gray-600">Recruited by {managerInfo?.name || 'Super Agent'}</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                    placeholder="+254712345678"
                    required
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">Use your WhatsApp number for communication</p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-700">Your Manager</span>
                </div>
                <p className="text-gray-700">
                  You will be working under <span className="font-bold">{managerInfo?.name || 'Super Agent'}</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">Phone: {managerPhone}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Your manager earns 10% commission from your earnings
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white font-bold py-4 rounded-xl hover:opacity-90 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <Loader className="h-5 w-5 animate-spin" />
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <UserPlus className="h-5 w-5" />
                    Become an Agent
                  </div>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                Already have an account?{' '}
                <button
                  onClick={() => router.push('/login')}
                  className="text-[#ff6b35] font-semibold hover:underline"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>

          {/* Right Column - Benefits */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-100 p-3 rounded-xl">
                  <Banknote className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">Earn 30% Commission</h3>
                  <p className="text-gray-600">On every completed service</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Service Price</span>
                  <span className="font-bold text-gray-900">KES 2,500</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Your Commission (30%)</span>
                  <span className="font-bold text-emerald-600">KES 750</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Manager Commission (10%)</span>
                  <span className="font-bold text-blue-600">KES 75</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-emerald-200">
                  <span className="text-gray-700 font-semibold">Your Net Earnings</span>
                  <span className="font-bold text-green-700">KES 675</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-xl">
              <h3 className="text-xl font-black text-gray-900 mb-6">Agent Benefits</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <span className="text-gray-700">Flexible work hours - work anytime</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <span className="text-gray-700">Direct WhatsApp communication with clients</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <span className="text-gray-700">Manager support for complex cases</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <span className="text-gray-700">Weekly withdrawals (Wednesday & Sunday)</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <span className="text-gray-700">Performance bonuses and incentives</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">Invite Other Agents</h3>
                  <p className="text-gray-600">Earn 5% of their earnings</p>
                </div>
              </div>

              <div className="bg-white/80 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-700 mb-2">Your referral link after signup:</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 text-sm truncate">
                    {managerPhone ? `${window.location.origin}/agent-signup?manager=${encodeURIComponent(managerPhone)}` : 'Sign up to get your link'}
                  </div>
                  <button
                    onClick={copyInviteLink}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold px-4 py-2 rounded-lg hover:opacity-90 flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                Share your link with friends. You earn 5% of every KES they make as agents.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-12 py-8 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="bg-gradient-to-r from-[#ff6b35] to-[#ffa500] p-2 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-[#ff6b35] to-[#ffa500] bg-clip-text text-transparent">
              Veritas CyberHub
            </span>
          </div>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Professional service delivery platform. Verified agents, guaranteed quality, secure payments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/services')}
              className="bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white font-bold px-8 py-3 rounded-lg hover:opacity-90"
            >
              View Services
            </button>
            <button
              onClick={() => router.push('/login')}
              className="bg-white border-2 border-gray-300 text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-gray-50"
            >
              Agent Login
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Main component with Suspense wrapper
export default function AgentSignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-[#ff6b35] mx-auto mb-4" />
          <p className="text-gray-600">Loading signup form...</p>
        </div>
      </div>
    }>
      <AgentSignupContent />
    </Suspense>
  );
}