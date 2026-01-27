'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Check, Users, MessageSquare, Briefcase, ArrowRight, Zap, Clock, Shield } from 'lucide-react';

const CareersPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userPhone, setUserPhone] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    const phone = localStorage.getItem('userPhone');
    const role = localStorage.getItem('userRole');
    
    if (phone) {
      setUserPhone(phone);
    }
    
    setLoading(false);
  }, []);

  const handleApplyNow = () => {
    if (userPhone) {
      // User is authenticated, go directly to application
      router.push('/team-lead-apply');
    } else {
      // User not authenticated, redirect to login with redirect parameter
      router.push('/login?redirect=/team-lead-apply');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading careers information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Join Our <span className="text-orange-400">Elite</span> Team
            </h1>
            <p className="text-xl text-blue-200 mb-8">
              Build your career while helping businesses thrive in the digital age. 
              Earn competitive commissions and grow with us.
            </p>
            <button
              onClick={handleApplyNow}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all transform hover:scale-105 shadow-2xl"
            >
              Apply Now <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {/* 3-Step Process */}
        <div className="max-w-6xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">
            Simple 3-Step Journey to Success
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Follow these steps to start your career as a Team Lead at Veritas CyberHub
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Create Your Account</h3>
              <p className="text-gray-600 mb-6">
                Sign up for a free account to access our platform and begin your journey.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Quick registration</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Instant access</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">No upfront costs</span>
                </li>
              </ul>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Complete Training</h3>
              <p className="text-gray-600 mb-6">
                Go through our comprehensive training program to master our systems and processes.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Video tutorials</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Live sessions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Certification</span>
                </li>
              </ul>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Start Earning</h3>
              <p className="text-gray-600 mb-6">
                Begin managing your team and earning commissions from day one.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Daily commissions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Performance bonuses</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Residual income</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">
            Why Join Veritas CyberHub?
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            We provide everything you need to build a successful career in tech management
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">Team Building</h3>
              <p className="text-gray-600">Recruit and manage your own team of agents</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">Real-time Support</h3>
              <p className="text-gray-600">24/7 WhatsApp support for you and your team</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">Fast Commissions</h3>
              <p className="text-gray-600">Daily commission payments directly to your M-Pesa</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">Secure Platform</h3>
              <p className="text-gray-600">Enterprise-grade security for all transactions</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Join hundreds of successful team leads who are building their futures with Veritas CyberHub
          </p>
          <button
            onClick={handleApplyNow}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all transform hover:scale-105 shadow-2xl"
          >
            Begin Application Process <ArrowRight className="h-5 w-5" />
          </button>
          <p className="text-blue-200 text-sm mt-4">
            No hidden fees • No experience required • Full training provided
          </p>
        </div>
      </div>
    </div>
  );
};

export default CareersPage;