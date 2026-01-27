"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Zap, Users, TrendingUp, CheckCircle,
  ArrowRight, Target, Award, Sparkles,
  Briefcase, Globe, Shield, Clock,
  DollarSign, Gift, Rocket, Star,
  MessageCircle, Share2, Link as LinkIcon,
  Smartphone, Laptop, BookOpen, BrainCircuit
} from "lucide-react";

export default function Form4AmbassadorPage() {
  const [referralCount, setReferralCount] = useState(3); // Example: 3 referrals

  const levels = [
    {
      minReferrals: 5,
      maxReferrals: 10,
      title: "THE STARTER",
      commission: "10% commission",
      description: "Build your campus fund with direct earnings",
      icon: <Sparkles className="h-6 w-6" />,
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50",
      borderColor: "border-blue-200",
      benefits: [
        "10% commission on every paid referral",
        "Weekly withdrawals (Wednesdays & Sundays)",
        "Track referrals in real-time dashboard"
      ],
      progress: 3,
      total: 5
    },
    {
      minReferrals: 10,
      maxReferrals: 20,
      title: "THE TRAINEE",
      commission: "10% commission + Online Training",
      description: "Add valuable skills to your earnings",
      icon: <BookOpen className="h-6 w-6" />,
      color: "from-emerald-500 to-green-500",
      bgColor: "from-emerald-50 to-green-50",
      borderColor: "border-emerald-200",
      benefits: [
        "Everything from Level 1",
        "Exclusive online training access",
        "Remote work fundamentals course",
        "Digital skills certification"
      ],
      progress: 3,
      total: 10
    },
    {
      minReferrals: 20,
      title: "THE PROFESSIONAL",
      commission: "10% commission + Job Application Handling",
      description: "We apply for remote jobs on your behalf",
      icon: <Briefcase className="h-6 w-6" />,
      color: "from-purple-500 to-violet-500",
      bgColor: "from-purple-50 to-violet-50",
      borderColor: "border-purple-200",
      benefits: [
        "Everything from Level 2",
        "Guaranteed expert job application handling",
        "Personalized remote job assessments",
        "Interview preparation coaching",
        "Direct company connections"
      ],
      progress: 3,
      total: 20
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-300 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-[#ff6b35] to-[#ffa500] p-2 rounded-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900">Veritas</h1>
              <p className="text-xs text-gray-700 font-medium">FORM 4 AMBASSADOR</p>
            </div>
          </div>
          <Link href="/services">
            <button className="bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white font-bold px-6 py-2.5 rounded-lg hover:opacity-90">
              Back to Services
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full px-6 py-2 mb-6 border border-amber-300">
              <Sparkles className="h-5 w-5 text-amber-600" />
              <span className="font-bold text-amber-700">FORM 4 EXCLUSIVE PROGRAM</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6">
              Your Form 4 Break Isn't a Vacation.
              <span className="block mt-4 bg-gradient-to-r from-[#ff6b35] via-[#ff8c42] to-[#ffa500] bg-clip-text text-transparent">
                It's Your First Career Launchpad.
              </span>
            </h1>
            
            <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-10">
              While others are taking computer packages that won't pay the bills, 
              you could be building real digital skills and earning your campus fund.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white font-bold px-10 py-4 rounded-xl text-lg hover:opacity-90 flex items-center justify-center gap-3">
                <LinkIcon className="h-5 w-5" />
                Get Your Referral Link
              </button>
              <button className="bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold px-10 py-4 rounded-xl text-lg hover:opacity-90 flex items-center justify-center gap-3">
                <Share2 className="h-5 w-5" />
                Share on WhatsApp
              </button>
            </div>
          </div>

          {/* The Reality Check */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-3xl p-8 mb-16">
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <BrainCircuit className="h-7 w-7 text-blue-600" />
              The Modern Career Reality
            </h2>
            <p className="text-gray-700 text-lg mb-6">
              In today's digital economy, <span className="font-bold text-blue-700">remote work skills matter more than traditional certificates</span>. 
              While computer packages teach you software, remote work teaches you how to earn from anywhere in the world.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-red-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Traditional Path</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="mt-1">
                      <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                    </div>
                    <span className="text-gray-700">Learn outdated software packages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1">
                      <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                    </div>
                    <span className="text-gray-700">Graduate with certificate but no job</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1">
                      <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                    </div>
                    <span className="text-gray-700">Struggle to find work in saturated market</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Rocket className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Our Program Path</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="mt-1">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-gray-700">Earn while learning marketable skills</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-gray-700">Build remote work experience before campus</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-gray-700">Graduate with job offers and savings</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* The Ambassador Program */}
          <div className="mb-16">
            <h2 className="text-3xl font-black text-gray-900 mb-10 text-center">
              Your Clear Path to Financial Independence
            </h2>
            
            <div className="space-y-8">
              {levels.map((level, index) => (
                <div key={index} className={`bg-gradient-to-br ${level.bgColor} border-2 ${level.borderColor} rounded-3xl p-8`}>
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`bg-gradient-to-br ${level.color} p-4 rounded-2xl`}>
                        {level.icon}
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-gray-900">{level.title}</h3>
                        <p className="text-gray-700">{level.description}</p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl px-6 py-3 border border-gray-300">
                      <div className="text-center">
                        <div className="text-2xl font-black text-gray-900">{level.commission}</div>
                        <div className="text-sm text-gray-600">
                          {level.maxReferrals 
                            ? `${level.minReferrals}-${level.maxReferrals} Paid Referrals`
                            : `${level.minReferrals}+ Paid Referrals`
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Benefits Unlocked:</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {level.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          <span className="text-gray-800">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Your Progress</span>
                      <span className="text-sm font-bold text-gray-900">
                        {level.progress}/{level.total} Paid Referrals
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${level.color} rounded-full`}
                        style={{ width: `${(level.progress / level.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* The Strategic Advantage */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-3xl p-8 mb-16">
            <h2 className="text-2xl font-black mb-6 text-center">
              Why Digital Skills Beat Traditional Certificates
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-4 rounded-2xl inline-block mb-4">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">Global Opportunities</h3>
                <p className="text-gray-300">
                  Remote work isn't limited by location. Earn from companies worldwide.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-br from-emerald-500 to-green-500 p-4 rounded-2xl inline-block mb-4">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">Higher Earning Potential</h3>
                <p className="text-gray-300">
                  Digital skills pay 3-5x more than traditional entry-level jobs.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-br from-purple-500 to-violet-500 p-4 rounded-2xl inline-block mb-4">
                  <Laptop className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">Future-Proof Career</h3>
                <p className="text-gray-300">
                  The world is going digital. These skills will be in demand for decades.
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full px-6 py-3 mb-8 border border-amber-300">
              <Target className="h-5 w-5 text-amber-600" />
              <span className="font-bold text-amber-700">YOUR 9-MONTH ADVANTAGE STARTS NOW</span>
            </div>
            
            <h2 className="text-3xl font-black text-gray-900 mb-6">
              Don't Learn Software. Learn How to Earn.
            </h2>
            
            <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-10">
              Your break time is the perfect opportunity to build the digital career foundation 
              that will support you through campus and beyond.
            </p>

            <button className="bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white font-bold px-12 py-5 rounded-xl text-xl hover:opacity-90 flex items-center gap-3 mx-auto">
              <Rocket className="h-6 w-6" />
              Start Building Your Future Today
            </button>
            
            <p className="text-gray-600 mt-8">
              Your campus self will thank you.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="bg-gradient-to-r from-[#ff6b35] to-[#ffa500] p-2 rounded-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-[#ff6b35] to-[#ffa500] bg-clip-text text-transparent">
              Veritas CyberHub
            </span>
          </div>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Building the next generation of digitally skilled professionals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/services" className="font-bold text-[#ff6b35] hover:text-[#ff8c42]">
              Explore All Services
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/careers" className="font-bold text-[#ff6b35] hover:text-[#ff8c42]">
              We're Hiring
            </Link>
            <span className="text-gray-400">•</span>
            <a href="#" className="font-bold text-[#ff6b35] hover:text-[#ff8c42]">
              Contact Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}