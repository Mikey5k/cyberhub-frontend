"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Crown, Users, Target, Zap, CheckCircle, Award, TrendingUp,
  Shield, Briefcase, Globe, Clock, DollarSign, UserPlus,
  ArrowRight, ChevronRight, Star, Home, Phone, Mail,
  AlertCircle, Loader2, ExternalLink
} from 'lucide-react';

export default function CareersPage() {
  const router = useRouter();
  const [phone, setPhone] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [eligible, setEligible] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const savedPhone = localStorage.getItem('cyberhub_phone') || sessionStorage.getItem('cyberhub_phone');
    if (savedPhone) {
      setPhone(savedPhone);
      checkEligibility(savedPhone);
    } else {
      setLoading(false);
    }
  }, []);

  const checkEligibility = async (userPhone: string) => {
    try {
      setCheckingEligibility(true);
      const response = await fetch(`https://cyberhub-veritas.vercel.app/api/supportOperations?type=checkTeamLeadEligibility&userPhone=${encodeURIComponent(userPhone)}`);
      const result = await response.json();
      
      if (result.success) {
        setEligible(result.canApply);
      }
    } catch (error) {
      console.error('Failed to check eligibility:', error);
    } finally {
      setLoading(false);
      setCheckingEligibility(false);
    }
  };

  const handleApplyNow = () => {
    if (phone) {
      router.push('/team-lead-apply');
    } else {
      router.push('/login?redirect=/team-lead-apply');
    }
  };

  const handleExploreServices = () => {
    router.push('/services');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-700">Loading careers information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Crown className="h-5 w-5" />
                <span className="text-sm font-semibold">Leadership Opportunity</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-6">
                Become a CyberHub Team Lead
                <span className="block text-blue-200 mt-2">Lead, Earn, Grow!</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl">
                Oversee Kenya's digital workforce and transform service delivery across multiple high-demand fields.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {phone ? (
                  eligible ? (
                    <button
                      onClick={handleApplyNow}
                      disabled={checkingEligibility}
                      className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white font-bold py-4 px-8 rounded-xl hover:opacity-90 transition-opacity"
                    >
                      {checkingEligibility ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Checking Eligibility...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-5 w-5" />
                          Apply as Team Lead
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                      <p className="text-white font-semibold mb-2">Complete a KRA Service First</p>
                      <p className="text-blue-100 text-sm mb-3">Experience our service quality to qualify for leadership</p>
                      <button
                        onClick={handleExploreServices}
                        className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold py-2 px-6 rounded-lg hover:bg-gray-100"
                      >
                        Explore Services <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  )
                ) : (
                  <button
                    onClick={() => router.push('/login?redirect=/careers')}
                    className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white font-bold py-4 px-8 rounded-xl hover:opacity-90"
                  >
                    <UserPlus className="h-5 w-5" />
                    Sign In to Check Eligibility
                  </button>
                )}
                
                <button
                  onClick={() => router.push('/services')}
                  className="inline-flex items-center justify-center gap-3 bg-transparent border-2 border-white text-white font-bold py-4 px-8 rounded-xl hover:bg-white/10"
                >
                  <Briefcase className="h-5 w-5" />
                  Browse Our Services
                </button>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="bg-white/20 p-3 rounded-full inline-block mb-3">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-2xl font-black">15-20</p>
                  <p className="text-sm text-blue-100">Agents to Lead</p>
                </div>
                <div className="text-center">
                  <div className="bg-white/20 p-3 rounded-full inline-block mb-3">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-2xl font-black">Multiple</p>
                  <p className="text-sm text-blue-100">Service Streams</p>
                </div>
                <div className="text-center">
                  <div className="bg-white/20 p-3 rounded-full inline-block mb-3">
                    <DollarSign className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-2xl font-black">% Based</p>
                  <p className="text-sm text-blue-100">Earnings</p>
                </div>
                <div className="text-center">
                  <div className="bg-white/20 p-3 rounded-full inline-block mb-3">
                    <Globe className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-2xl font-black">Nationwide</p>
                  <p className="text-sm text-blue-100">Remote Leadership</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Recruitment Text Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="prose prose-lg max-w-none">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-gradient-to-r from-blue-100 to-blue-50 p-3 rounded-xl">
                <Crown className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">
                  CyberHub Team Lead Opportunity - Lead, Earn, Grow!
                </h2>
                <p className="text-gray-600">Oversee Kenya's Digital Workforce!</p>
              </div>
            </div>

            {/* Your full recruitment text goes here */}
            <div className="space-y-8">
              {/* Who We Are */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Who We Are & What We Do
                </h3>
                <p className="text-gray-700 mb-4">
                  CyberHub delivers essential digital services across Kenya through specialized teams in:
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {[
                    'Data Entry & Processing - Corporate and organizational data management',
                    'Remote Job Placement - Connecting Kenyans to global work opportunities',
                    'Local Compliance Services - KRA, NTSA, business registration, and government compliance',
                    'E-Citizen Navigation - Simplifying government digital services',
                    'AI Training & Data Annotation - Preparing data for artificial intelligence systems',
                    'Digital Service Delivery - Comprehensive online service solutions'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Primary Opportunity */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-[#ff6b35]" />
                  Primary Opportunity
                </h3>
                <p className="text-gray-800">
                  Kenya's digital service demand is overwhelming. We're managing massive volumes across multiple high-demand fields and need capable leaders to oversee our specialized teams. The work exists, the systems are proven, and the clients are waiting. We just need leaders to ensure quality delivery.
                </p>
              </div>

              {/* We Handle Everything Technical */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  We Handle Everything Technical So You Can Focus On Leading
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { title: 'Client Acquisition & Marketing', desc: 'We bring continuous work flow' },
                    { title: 'Technical Infrastructure', desc: 'Our platform manages all operations' },
                    { title: 'Government Compliance Systems', desc: 'E-Citizen and regulatory expertise' },
                    { title: 'Quality Assurance Protocols', desc: 'Automated and manual quality checks' },
                    { title: 'Secure Payment Processing', desc: 'Fully managed financial systems' },
                    { title: '24/7 Technical Support', desc: 'Backup and troubleshooting always available' }
                  ].map((item, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Your Role */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Your Role Is Pure Leadership
                </h3>
                <div className="space-y-4">
                  {[
                    'Experience Our Service First (Complete KRA PIN Application or KRA Returns filing with us)',
                    'Oversee 15-20 Specialized Agents (Data entry, remote work, compliance, AI training teams)',
                    'Ensure Timely Quality Delivery (Monitor progress and maintain standards)',
                    'Team Development & Motivation (Keep agents productive, skilled, and engaged)'
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="bg-blue-100 text-blue-700 font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Qualification Process */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-600" />
                  The CyberHub Qualification Process
                </h3>
                <p className="text-gray-800 mb-4">
                  We believe effective leaders must understand what they oversee from the user's perspective. You must complete one CyberHub service before qualifying for leadership.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-amber-200">
                    <h4 className="font-bold text-gray-900 mb-2">KRA PIN Application Service</h4>
                    <p className="text-sm text-gray-600">Experience our compliance precision</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-amber-200">
                    <h4 className="font-bold text-gray-900 mb-2">KRA Returns Filing Service</h4>
                    <p className="text-sm text-gray-600">Understand our systematic approach</p>
                  </div>
                </div>
              </div>

              {/* Add more sections here with the rest of your recruitment text... */}

            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Lead?</h3>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Begin your leadership journey by experiencing our service quality first, then develop into overseeing multiple specialized teams.
              </p>
              
              {phone ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {eligible ? (
                    <button
                      onClick={handleApplyNow}
                      className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white font-bold py-4 px-8 rounded-xl hover:opacity-90"
                    >
                      <UserPlus className="h-5 w-5" />
                      Apply as Team Lead
                    </button>
                  ) : (
                    <div className="text-center">
                      <p className="text-gray-700 mb-4">Complete a KRA service first to qualify for leadership</p>
                      <button
                        onClick={handleExploreServices}
                        className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 px-8 rounded-xl hover:opacity-90"
                      >
                        <Briefcase className="h-5 w-5" />
                        Browse KRA Services
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-700 mb-4">Sign in to check your eligibility and apply</p>
                  <button
                    onClick={() => router.push('/login?redirect=/careers')}
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white font-bold py-4 px-8 rounded-xl hover:opacity-90"
                  >
                    <UserPlus className="h-5 w-5" />
                    Sign In to Apply
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}