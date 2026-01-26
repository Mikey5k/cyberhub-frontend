'use client';

import Link from "next/link";
import { 
  Shield, Briefcase, GraduationCap, Check, 
  Zap, Users, ArrowRight, Play, Sparkles, 
  Globe, ShieldCheck, MessageCircle, Target,
  Award, Lock, Phone, ChevronRight,
  FileText, Home, Laptop, Wallet, BookOpen, Building, BrainCircuit
} from "lucide-react";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* ===== 1. PREMIUM NAVIGATION ===== */}
      <nav className="sticky top-0 z-50 bg-white/98 backdrop-blur-sm border-b border-gray-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-[#ff6b35] to-[#ffa500] p-2.5 rounded-xl shadow-lg">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900">Veritas</h1>
                <p className="text-xs text-gray-700 font-medium tracking-wide">CYBERHUB</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-10">
              <a href="#how-it-works" className="text-sm font-semibold text-gray-800 hover:text-gray-900 transition-colors">How It Works</a>
              <a href="#services" className="text-sm font-semibold text-gray-800 hover:text-gray-900 transition-colors">Services</a>
              <a href="#why-us" className="text-sm font-semibold text-gray-800 hover:text-gray-900 transition-colors">Why Us</a>
              <Link href="/careers" className="text-sm font-semibold text-gray-800 hover:text-gray-900 transition-colors">We're Hiring</Link>
              <Link href="/form4-ambassador" className="text-sm font-semibold text-gray-800 hover:text-gray-900 transition-colors">Form 4 Ambassador</Link>
              <a href="#contact" className="text-sm font-semibold text-gray-800 hover:text-gray-900 transition-colors">Contact</a>
              <Link href="/services">
                <button className="rounded-lg bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white font-bold px-7 py-2.5 hover:opacity-90 transition-all shadow-lg hover:shadow-orange-500/25">
                  Go to App
                </button>
              </Link>
            </div>

            {/* Mobile Menu */}
            <div className="lg:hidden">
              <Link href="/services">
                <button className="rounded-lg bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white font-semibold px-4 py-2">
                  App
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ===== 2. PREMIUM HERO SECTION ===== */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden px-4 sm:px-6 lg:px-8">
        {/* Background Effects - Reduced opacity */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,107,53,0.08)_0%,_transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,165,0,0.06)_0%,_transparent_50%)]"></div>
        
        <div className="max-w-7xl mx-auto w-full py-12 lg:py-0">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Content */}
            <div className="relative z-10">
              {/* Premium Badge */}
              <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full px-5 py-2.5 mb-8 border border-blue-300">
                <div className="flex items-center gap-2">
                  <div className="bg-gradient-to-r from-[#ff6b35] to-[#ffa500] p-1.5 rounded-full">
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-sm font-bold text-[#ff6b35]">AI-Led. Expert-Assisted.</span>
                </div>
              </div>

              {/* Headline */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-8 leading-tight">
                The Intelligent Platform
                <span className="block bg-gradient-to-r from-[#ff6b35] via-[#ff8c42] to-[#ffa500] bg-clip-text text-transparent mt-4">
                  Built for the Next Generation
                </span>
              </h1>

              {/* Sub-headline */}
              <p className="text-xl text-gray-700 mb-12 max-w-2xl leading-relaxed">
                Our AI guides you step-by-step, confirms payment securely, and connects you with a verified expert to complete the service — fast, accurate, and stress-free.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-5">
                <Link href="/services" className="inline-flex">
                  <button className="rounded-lg bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white font-bold px-10 py-6 text-lg hover:opacity-90 transition-all hover:scale-105 shadow-2xl shadow-orange-500/30">
                    Go to App
                  </button>
                </Link>
                <a href="#how-it-works" className="inline-flex">
                  <button className="rounded-lg border-2 border-gray-400 text-gray-800 font-bold px-10 py-6 text-lg hover:bg-gray-100 flex items-center justify-center">
                    <Play className="h-5 w-5 mr-3" />
                    See How It Works
                  </button>
                </a>
              </div>

              {/* Trust Badges */}
              <div className="mt-16 flex flex-wrap gap-8">
                <div className="flex items-center gap-3">
                  <div className="bg-green-200 p-2 rounded-full">
                    <Check className="h-4 w-4 text-green-700" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">No Hidden Fees</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-200 p-2 rounded-full">
                    <ShieldCheck className="h-4 w-4 text-blue-700" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Secure Process</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-purple-200 p-2 rounded-full">
                    <Users className="h-4 w-4 text-purple-700" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Verified Experts</span>
                </div>
              </div>
            </div>

            {/* Right: Glassmorphism Dashboard */}
            <div className="relative">
              <div className="bg-gradient-to-br from-white to-gray-50 backdrop-blur-sm rounded-3xl p-8 w-full max-w-lg border-2 border-gray-300 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Connecting You to an Expert Agent...</h2>
                
                {/* Process Steps */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between bg-gradient-to-r from-green-100 to-green-200 rounded-xl px-6 py-4 border border-green-300">
                    <span className="font-semibold text-gray-900">Payment Confirmed</span>
                    <span className="text-green-700 font-bold text-xl">✓</span>
                  </div>
                  
                  <div className={`flex items-center justify-between bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl px-6 py-4 border border-blue-300 ${step >= 0 ? 'animate-pulse' : ''}`}>
                    <span className="font-semibold text-gray-900">Assigning Agent...</span>
                    <div className="h-5 w-5 border-2 border-[#ff6b35] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  
                  <div className={`flex items-center justify-between bg-gradient-to-r from-amber-100 to-amber-200 rounded-xl px-6 py-4 border border-amber-300 ${step >= 1 ? 'animate-pulse' : ''}`}>
                    <span className="font-semibold text-gray-900">Finding Available Expert...</span>
                    <div className="h-5 w-5 border-2 border-[#ff6b35] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  
                  <div className={`flex items-center justify-between bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl px-6 py-4 border border-purple-300 ${step >= 2 ? 'animate-pulse' : ''}`}>
                    <span className="font-semibold text-gray-900">Connecting...</span>
                    <div className="h-5 w-5 border-2 border-[#ff6b35] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </div>

                {/* Service Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-4 text-center hover:from-blue-200 hover:to-blue-300 transition-all cursor-pointer border border-blue-300">
                    <div className="text-2xl mb-2">🎓</div>
                    <h3 className="font-bold text-gray-900">Student Journey</h3>
                    <p className="text-sm text-gray-700 mt-1">KUCCPS & More</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl p-4 text-center hover:from-emerald-200 hover:to-emerald-300 transition-all cursor-pointer border border-emerald-300">
                    <div className="text-2xl mb-2">🏛️</div>
                    <h3 className="font-bold text-gray-900">E-Citizen</h3>
                    <p className="text-sm text-gray-700 mt-1">Gov Services</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl p-4 text-center hover:from-amber-200 hover:to-amber-300 transition-all cursor-pointer border border-amber-300">
                    <div className="text-2xl mb-2">💼</div>
                    <h3 className="font-bold text-gray-900">Remote Work</h3>
                    <p className="text-sm text-gray-700 mt-1">Jobs & Training</p>
                  </div>
                </div>
              </div>
              
              {/* Floating Connection Status */}
              <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-2xl">
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5" />
                  <span>Agent Connected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 3. WHAT WE DO SECTION ===== */}
      <section id="services" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16 text-gray-900">
            One Platform. Multiple Life Systems.
          </h2>
          <p className="text-xl text-gray-700 text-center mb-16 max-w-3xl mx-auto">
            Guided by AI. Executed by Experts.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Student Journey */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
              <div className="relative bg-white rounded-3xl border-2 border-gray-300 p-10 text-center hover:border-blue-400 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-5 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-8">
                  <GraduationCap className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-6">Student Journey</h3>
                <ul className="space-y-4 mb-8">
                  {['KUCCPS & University Applications', 'Bursaries & Scholarships', 'Student Housing', 'Remote Work for Students'].map((item, idx) => (
                    <li key={idx} className="flex items-center justify-center gap-3">
                      <Check className="h-5 w-5 text-green-600" />
                      <span className="text-gray-800 font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-gray-700">
                  Complete academic and career support for students at every stage.
                </p>
              </div>
            </div>

            {/* E-Citizen Navigator */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-green-600 rounded-3xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
              <div className="relative bg-white rounded-3xl border-2 border-gray-300 p-10 text-center hover:border-emerald-400 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                <div className="bg-gradient-to-br from-emerald-600 to-green-600 p-5 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-8">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-6">E-Citizen Navigator</h3>
                <ul className="space-y-4 mb-8">
                  {['Business Permits & Licensing', 'KRA PIN & Tax Services', 'Passport & Immigration', 'Government Compliance'].map((item, idx) => (
                    <li key={idx} className="flex items-center justify-center gap-3">
                      <Check className="h-5 w-5 text-green-600" />
                      <span className="text-gray-800 font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-gray-700">
                  Government services simplified with expert handling and clear guidance.
                </p>
              </div>
            </div>

            {/* Remote Work Hub */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
              <div className="relative bg-white rounded-3xl border-2 border-gray-300 p-10 text-center hover:border-amber-400 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                <div className="bg-gradient-to-br from-amber-600 to-orange-600 p-5 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-8">
                  <Briefcase className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-6">Remote Work Hub</h3>
                <ul className="space-y-4 mb-8">
                  {['Verified Remote Jobs', 'CV & LinkedIn Optimization', 'Interview Preparation', 'Compliance Support'].map((item, idx) => (
                    <li key={idx} className="flex items-center justify-center gap-3">
                      <Check className="h-5 w-5 text-green-600" />
                      <span className="text-gray-800 font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-gray-700">
                  Global remote work opportunities with complete application support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 4. HOW IT WORKS SECTION ===== */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-100 to-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16 text-gray-900">
            How It Works
          </h2>
          <p className="text-xl text-gray-700 text-center mb-16 max-w-3xl mx-auto">
            Our exact operational flow designed for certainty and trust
          </p>
          
          <div className="grid md:grid-cols-4 gap-8 mb-20">
            {[
              { number: "1", title: "Choose a Service", desc: "Select from education, compliance, or remote work services.", color: "from-blue-600 to-cyan-600" },
              { number: "2", title: "AI Guidance", desc: "AI explains the process and confirms requirements.", color: "from-emerald-600 to-green-600" },
              { number: "3", title: "Secure Payment", desc: "Payment triggers automatic expert assignment.", color: "from-amber-600 to-orange-600" },
              { number: "4", title: "Expert Connection", desc: "Connect directly with a verified expert.", color: "from-purple-600 to-violet-600" },
            ].map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="relative mb-8">
                  <div className={`absolute -inset-4 bg-gradient-to-r ${step.color} rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition duration-500`}></div>
                  <div className={`relative bg-gradient-to-br ${step.color} w-24 h-24 rounded-2xl flex items-center justify-center mx-auto shadow-2xl`}>
                    <div className="text-white text-3xl font-black">{step.number}</div>
                  </div>
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-700">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Process Visualization */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl border-2 border-gray-300 p-8 shadow-xl">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-8">
                <div className="flex items-center gap-6">
                  <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-4 rounded-2xl">
                    <MessageCircle className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-gray-900">Connected to Expert Agent</h4>
                    <p className="text-gray-700">Your service is now being completed by an assigned professional</p>
                  </div>
                </div>
                <button className="bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold px-8 py-4 rounded-lg hover:opacity-90 flex items-center">
                  <MessageCircle className="h-5 w-5 mr-3" />
                  Continue on WhatsApp
                </button>
              </div>
              <div className="h-2 bg-gradient-to-r from-blue-600 via-green-600 to-emerald-700 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 5. WHY CHOOSE US ===== */}
      <section id="why-us" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16 text-gray-900">
            Why Choose Us
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 text-center mb-16">
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-6 rounded-2xl inline-block">
                <Sparkles className="h-12 w-12 text-blue-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">AI Removes Confusion</h3>
              <p className="text-gray-700">Clear guidance at every step ensures perfect submissions.</p>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 p-6 rounded-2xl inline-block">
                <Users className="h-12 w-12 text-emerald-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Experts Handle Execution</h3>
              <p className="text-gray-700">Certified agents complete tasks accurately and securely.</p>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-amber-100 to-amber-200 p-6 rounded-2xl inline-block">
                <Zap className="h-12 w-12 text-amber-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Fast & Reliable</h3>
              <p className="text-gray-700">Seamless process from AI guidance to expert execution.</p>
            </div>
          </div>
          
          {/* Trust Line */}
          <div className="text-center">
            <div className="inline-flex items-center gap-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full px-8 py-4 border border-gray-300">
              <ShieldCheck className="h-6 w-6 text-gray-700" />
              <span className="text-lg font-semibold text-gray-800">
                Automation where possible. Human expertise where it matters.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 6. JOIN OUR MISSION ===== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Hiring */}
            <div className="bg-white rounded-3xl border-2 border-gray-300 p-10 hover:border-blue-400 transition-all hover:shadow-2xl">
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-5 rounded-2xl w-20 h-20 flex items-center justify-center mb-10">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-4">We're Growing — Join Us</h3>
              <p className="text-gray-700 text-lg mb-10">
                We're hiring passionate people to help build the future of guided AI services.
              </p>
              <Link href="/careers" className="inline-flex">
                <button className="border-2 border-gray-400 text-gray-800 font-bold px-8 py-4 rounded-lg hover:bg-gray-100 flex items-center">
                  View Open Roles
                  <ArrowRight className="h-5 w-5 ml-3" />
                </button>
              </Link>
            </div>

            {/* Form 4 Ambassador Program */}
            <div className="bg-white rounded-3xl border-2 border-gray-300 p-10 hover:border-emerald-400 transition-all hover:shadow-2xl">
              <div className="bg-gradient-to-br from-green-600 to-emerald-700 p-5 rounded-2xl w-20 h-20 flex items-center justify-center mb-10">
                <Award className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-4">Form 4 Ambassador Program</h3>
              <p className="text-gray-700 text-lg mb-10">
                Earn 10% commissions during your break. Build your campus fund before university starts.
              </p>
              <Link href="/form4-ambassador" className="inline-flex">
                <button className="border-2 border-gray-400 text-gray-800 font-bold px-8 py-4 rounded-lg hover:bg-gray-100 flex items-center">
                  Learn About the Program
                  <ArrowRight className="h-5 w-5 ml-3" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 7. FINAL CTA ===== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-8">
            Let AI Handle the Complexity.
            <span className="block mt-4">Let Experts Handle the Work.</span>
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Start your service in minutes with guided precision and expert execution.
          </p>
          <Link href="/services" className="inline-flex">
            <button className="rounded-lg bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white font-bold px-14 py-8 text-xl hover:opacity-90 transition-all hover:scale-105 shadow-2xl shadow-orange-500/30">
              Go to App
            </button>
          </Link>
          <p className="text-gray-300 mt-8 text-lg">No queues. No confusion. Just results.</p>
        </div>
      </section>

      {/* ===== 8. FOOTER ===== */}
      <footer id="contact" className="bg-white border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-5 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-gradient-to-r from-[#ff6b35] to-[#ffa500] p-3 rounded-xl">
                  <Zap className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">Veritas Cyberhub</h3>
                  <p className="text-sm text-gray-700 font-medium">AI-led. Expert-assisted.</p>
                </div>
              </div>
              <p className="text-gray-700 max-w-md">
                The intelligent platform built for the next generation of education, compliance, and global remote work.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-900 mb-6">Company</h4>
              <ul className="space-y-4">
                <li><a href="#services" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Services</a></li>
                <li><a href="#how-it-works" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">How It Works</a></li>
                <li><a href="#why-us" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Why Us</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-900 mb-6">Opportunities</h4>
              <ul className="space-y-4">
                <li><Link href="/careers" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">We're Hiring</Link></li>
                <li><Link href="/form4-ambassador" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Form 4 Ambassador Program</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-900 mb-6">Legal</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Terms of Service</a></li>
                <li><a href="#contact" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-300 mt-12 pt-8 text-center text-gray-700">
            <p className="font-medium">© {new Date().getFullYear()} Veritas Cyberhub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}