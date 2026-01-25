"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePhoneAuth } from "@/hooks/use-phone-auth";
import { formatCurrency } from "@/lib/utils";
import {
  Users, Share2, TrendingUp, Award, DollarSign, Zap,
  Target, BarChart, Copy, MessageCircle, Gift, Star,
  CheckCircle, ArrowRight, Wallet, Globe, Clock,
  Shield, HelpCircle, ChevronRight, Sparkles,
  BookOpen, GraduationCap, Home, Smartphone,
  TrendingUp as TrendingUpIcon, Target as TargetIcon
} from "lucide-react";

const AMBASSADOR_COMMISSION_RATE = 0.10; // 10% for Form 4

interface Referral {
  id: string;
  userPhone: string;
  userName: string;
  serviceUsed: string;
  serviceAmount: number;
  commission: number;
  status: "pending" | "active" | "paid" | "processing";
  date: string;
}

interface AmbassadorStats {
  totalReferrals: number;
  pendingReferrals: number;
  paidReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  currentLevel: number;
  nextLevelProgress: number;
}

export default function Form4AmbassadorPage() {
  const router = useRouter();
  const { phone, role, loading, initializing } = usePhoneAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<AmbassadorStats>({
    totalReferrals: 0,
    pendingReferrals: 0,
    paidReferrals: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    paidEarnings: 0,
    currentLevel: 1,
    nextLevelProgress: 0
  });
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [estimatedReferrals, setEstimatedReferrals] = useState(100);
  const [estimatedEarnings, setEstimatedEarnings] = useState(0);

  useEffect(() => {
    if (!initializing && !loading && !phone) {
      router.push("/login?redirect=/form4-ambassador");
      return;
    }

    if (!initializing && phone) {
      loadAmbassadorData();
      generateReferralCode();
    }
  }, [phone, loading, initializing, router]);

  useEffect(() => {
    // Calculate estimated earnings
    const avgServiceAmount = 2000;
    const paidCount = Math.floor(estimatedReferrals * 0.7); // 70% conversion
    const earnings = paidCount * avgServiceAmount * AMBASSADOR_COMMISSION_RATE;
    setEstimatedEarnings(earnings);
  }, [estimatedReferrals]);

  const generateReferralCode = () => {
    if (phone) {
      const code = `FORM4-${phone.slice(-6)}`;
      setReferralCode(code);
    } else {
      const code = `FORM4-AMB-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      setReferralCode(code);
    }
  };

  const loadAmbassadorData = async () => {
    // Mock data for demonstration
    const mockReferrals: Referral[] = [
      {
        id: "1",
        userPhone: "+254711223344",
        userName: "John Kamau",
        serviceUsed: "KRA PIN Registration",
        serviceAmount: 1500,
        commission: 150,
        status: "paid",
        date: "2024-06-15"
      },
      {
        id: "2",
        userPhone: "+254722334455",
        userName: "Jane Muthoni",
        serviceUsed: "ID Processing",
        serviceAmount: 2000,
        commission: 200,
        status: "paid",
        date: "2024-06-20"
      },
      {
        id: "3",
        userPhone: "+254733445566",
        userName: "Mike Ochieng",
        serviceUsed: "KUCCPS Application",
        serviceAmount: 3000,
        commission: 300,
        status: "active",
        date: "2024-07-10"
      },
      {
        id: "4",
        userPhone: "+254744556677",
        userName: "Sarah Auma",
        serviceUsed: "Passport Application",
        serviceAmount: 4500,
        commission: 450,
        status: "pending",
        date: "2024-08-05"
      },
      {
        id: "5",
        userPhone: "+254755667788",
        userName: "David Mutiso",
        serviceUsed: "University Placement",
        serviceAmount: 2500,
        commission: 250,
        status: "paid",
        date: "2024-08-20"
      },
    ];

    const paidCount = mockReferrals.filter(r => r.status === "paid").length;
    const pendingCount = mockReferrals.filter(r => r.status === "pending").length;
    const totalEarnings = mockReferrals.filter(r => r.status === "paid").reduce((sum, r) => sum + r.commission, 0);
    
    // Determine current level based on paid referrals
    let currentLevel = 1;
    if (paidCount >= 100) currentLevel = 6;
    else if (paidCount >= 80) currentLevel = 5;
    else if (paidCount >= 50) currentLevel = 4;
    else if (paidCount >= 30) currentLevel = 3;
    else if (paidCount >= 20) currentLevel = 2;

    const mockStats: AmbassadorStats = {
      totalReferrals: mockReferrals.length,
      pendingReferrals: pendingCount,
      paidReferrals: paidCount,
      totalEarnings: totalEarnings,
      pendingEarnings: 750, // Mock pending
      paidEarnings: totalEarnings,
      currentLevel: currentLevel,
      nextLevelProgress: Math.min(100, (paidCount / 10) * 100) // Progress to next level
    };

    setReferrals(mockReferrals);
    setStats(mockStats);
  };

  const handleCopyReferralLink = () => {
    const link = `https://cyberhub-frontend.vercel.app/services?ref=${referralCode}&type=form4`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const message = `🚀 Form 4 Break Opportunity! 🚀

Join the CyberHub Form 4 Ambassador Program and earn 10% commissions while building your campus fund!

Use my referral code: ${referralCode}
Sign up here: https://cyberhub-frontend.vercel.app/services?ref=${referralCode}&type=form4

Don't waste your 9-month break. Start earning for campus NOW!`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const getLevelInfo = (level: number) => {
    const levels = [
      { min: 10, max: 20, title: "THE STARTER", color: "from-blue-500 to-cyan-500" },
      { min: 20, max: 30, title: "THE ACHIEVER", color: "from-green-500 to-emerald-500" },
      { min: 30, max: 50, title: "THE PERFORMER", color: "from-purple-500 to-violet-500" },
      { min: 50, max: 80, title: "THE PROFESSIONAL", color: "from-amber-500 to-orange-500" },
      { min: 80, max: 100, title: "THE EXPERT", color: "from-red-500 to-rose-500" },
      { min: 100, max: Infinity, title: "THE TEAM MEMBER", color: "from-indigo-500 to-purple-600" }
    ];
    return levels[level - 1] || levels[0];
  };

  if (loading || initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Form 4 Ambassador Program...</p>
        </div>
      </div>
    );
  }

  const levelInfo = getLevelInfo(stats.currentLevel);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-8">
              <Sparkles className="h-5 w-5" />
              <span className="font-semibold">Form 4 Exclusive Program</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6">
              Your Form 4 Break Isn't a Vacation.
              <span className="block text-blue-200 mt-2">It's Your First Business Opportunity.</span>
            </h1>
            
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-10">
              While your classmates are figuring out what to do with 9 months of free time, 
              you could be building financial independence for campus. Stop waiting for university to struggle. Start earning now.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleCopyReferralLink}
                className="inline-flex items-center justify-center gap-3 bg-white text-blue-700 font-bold px-8 py-4 rounded-xl hover:bg-gray-100"
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Link Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5" />
                    Get Your Referral Link
                  </>
                )}
              </button>
              
              <button
                onClick={handleShareWhatsApp}
                className="inline-flex items-center justify-center gap-3 bg-transparent border-2 border-white text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10"
              >
                <MessageCircle className="h-5 w-5" />
                Share on WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Campus Reality Section */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-blue-200 mb-12">
          <h2 className="text-3xl font-black text-gray-900 mb-8 text-center">
            The Campus Reality Nobody Warns You About:
          </h2>
          
          <p className="text-xl text-gray-700 mb-8 text-center">
            University isn't just about books and classes. It's about:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <DollarSign className="h-8 w-8 text-red-500" />, text: "Tuition fees that keep increasing every semester" },
              { icon: <Home className="h-8 w-8 text-amber-500" />, text: "Hostel money due at the worst possible times" },
              { icon: <BookOpen className="h-8 w-8 text-green-500" />, text: "Textbooks costing more than your monthly allowance" },
              { icon: <Smartphone className="h-8 w-8 text-blue-500" />, text: "Sending desperate texts home for emergency funds" },
              { icon: <TargetIcon className="h-8 w-8 text-purple-500" />, text: "Watching opportunities pass by because you can't afford them" },
              { icon: <GraduationCap className="h-8 w-8 text-cyan-500" />, text: "Choosing between food and photocopies before exams" },
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                {item.icon}
                <p className="text-gray-800 font-medium">{item.text}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-10 p-6 bg-gradient-to-r from-red-50 to-amber-50 rounded-xl border border-red-200">
            <h3 className="text-2xl font-black text-gray-900 mb-4 text-center">
              Here's the Truth:
            </h3>
            <p className="text-lg text-gray-700 text-center">
              A computer certificate won't pay your bills in first year.<br />
              Knowing how to code won't put food on your table when the loan delays.<br />
              <span className="font-black text-blue-600">But knowing how to earn while you learn? That changes everything.</span>
            </p>
          </div>
        </div>

        {/* Program Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-gray-900 mb-4">
            The CyberHub Form 4 Ambassador Program
          </h2>
          <p className="text-2xl text-blue-600 font-bold">
            Turn Your Social Network into Campus Survival Funds
          </p>
        </div>

        {/* How It Works Section */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-blue-200 mb-12">
          <h2 className="text-3xl font-black text-gray-900 mb-8 text-center">
            📊 How Your Earnings Actually Work:
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-4">Tracking (Starts IMMEDIATELY)</h3>
              <ul className="text-left space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>You get your unique referral link TODAY</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Share with friends, family, community</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>They click and register → Shows as "Pending Referrals"</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="font-semibold">Start tracking NOW - Build your list during the break</span>
                </li>
              </ul>
            </div>
            
            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-4">Activation (When They Actually PAY)</h3>
              <ul className="text-left space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Your referral chooses a service (KRA, KUCCPS, passport, etc.)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>They complete payment for that service</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="font-semibold">ONLY THEN does your 10% commission activate</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Moves from "Pending" to "Active & Paid"</span>
                </li>
              </ul>
            </div>
            
            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-500 to-violet-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-4">Benefits Unlock (Based on PAID Referrals)</h3>
              <ul className="text-left space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Level 1 = 10-20 friends who ACTUALLY PAID for services</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Level 2 = 20-30 PAID REFERRALS</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>All levels based on ACTUAL PAYMENTS, not just sign-ups</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="font-semibold">Withdrawal: Every Wednesday & Sunday to your M-Pesa</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Your Journey Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-black text-gray-900 mb-12 text-center">
            🎯 Your Journey to Financial Independence:
          </h2>
          
          <div className="space-y-8">
            {/* Level 1 */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-8 border-2 border-blue-300">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-black">
                      1
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-gray-900">LEVEL 1: THE STARTER</h3>
                      <p className="text-blue-600 font-semibold">(10-20 PAID Referrals)</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-gray-700"><span className="font-bold">Earn:</span> 10% commission on every paid referral</p>
                    <p className="text-gray-700"><span className="font-bold">Example:</span> 15 friends pay KES 1,500 each = <span className="font-bold text-green-600">KES 2,250 earnings</span></p>
                    <p className="text-gray-700"><span className="font-bold">Goal:</span> KES 10,000 - 25,000 before campus starts</p>
                    <div className="p-4 bg-white rounded-xl border border-blue-200 mt-4">
                      <p className="font-bold text-gray-900">Why This Matters:</p>
                      <p className="text-gray-700">This is your semester one survival fund. Books, printing, emergency money when the loan delays.</p>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-white p-6 rounded-2xl border border-blue-300 shadow-lg">
                    <p className="text-sm text-gray-600 mb-2">Current Progress</p>
                    <div className="text-4xl font-black text-blue-600 mb-2">{stats.paidReferrals}/10</div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden w-48">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                        style={{ width: `${Math.min(100, (stats.paidReferrals / 10) * 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">To unlock Level 1</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Level 2 */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-300">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-black">
                      2
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-gray-900">LEVEL 2: THE ACHIEVER</h3>
                      <p className="text-green-600 font-semibold">(20-30 PAID Referrals)</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-gray-700 font-bold">Everything Above PLUS:</p>
                    <ul className="space-y-2 pl-5">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Automated bursary and scholarship applications (we do the work for you)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Personal funding strategy for your chosen course</span>
                      </li>
                    </ul>
                    <div className="p-4 bg-white rounded-xl border border-green-200 mt-4">
                      <p className="font-bold text-gray-900">The Advantage:</p>
                      <p className="text-gray-700">While others are begging for scholarships, yours are already being processed.</p>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-white p-6 rounded-2xl border border-green-300 shadow-lg">
                    <p className="text-sm text-gray-600 mb-2">Progress to Level 2</p>
                    <div className="text-4xl font-black text-green-600 mb-2">{stats.paidReferrals}/20</div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden w-48">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                        style={{ width: `${Math.min(100, (stats.paidReferrals / 20) * 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Paid referrals needed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Level 3 */}
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-8 border-2 border-purple-300">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-gradient-to-r from-purple-500 to-violet-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-black">
                      3
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-gray-900">LEVEL 3: THE PERFORMER</h3>
                      <p className="text-purple-600 font-semibold">(30-50 PAID Referrals)</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-gray-700 font-bold">Everything Above PLUS:</p>
                    <ul className="space-y-2 pl-5">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                        <span>Remote work orientation and introduction</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                        <span>Global job opportunities that fit your campus schedule</span>
                      </li>
                    </ul>
                    <div className="p-4 bg-white rounded-xl border border-purple-200 mt-4">
                      <p className="font-bold text-gray-900">The Reality Check:</p>
                      <p className="text-gray-700">Most graduates take 2+ years to find a job. You'll have income options before you even graduate.</p>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-white p-6 rounded-2xl border border-purple-300 shadow-lg">
                    <p className="text-sm text-gray-600 mb-2">Progress to Level 3</p>
                    <div className="text-4xl font-black text-purple-600 mb-2">{stats.paidReferrals}/30</div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden w-48">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full"
                        style={{ width: `${Math.min(100, (stats.paidReferrals / 30) * 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Paid referrals needed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Level 4 */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8 border-2 border-amber-300">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-black">
                      4
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-gray-900">LEVEL 4: THE PROFESSIONAL</h3>
                      <p className="text-amber-600 font-semibold">(50-80 PAID Referrals)</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-gray-700 font-bold">Everything Above PLUS:</p>
                    <ul className="space-y-2 pl-5">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span>Actual remote work skills training</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span>Marketable skills you can list on your CV</span>
                      </li>
                    </ul>
                    <div className="p-4 bg-white rounded-xl border border-amber-200 mt-4">
                      <p className="font-bold text-gray-900">The Difference:</p>
                      <p className="text-gray-700">You won't be just another graduate with a certificate. You'll be a graduate with proven work experience.</p>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-white p-6 rounded-2xl border border-amber-300 shadow-lg">
                    <p className="text-sm text-gray-600 mb-2">Progress to Level 4</p>
                    <div className="text-4xl font-black text-amber-600 mb-2">{stats.paidReferrals}/50</div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden w-48">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                        style={{ width: `${Math.min(100, (stats.paidReferrals / 50) * 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Paid referrals needed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Level 5 */}
            <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl p-8 border-2 border-red-300">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-gradient-to-r from-red-500 to-rose-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-black">
                      5
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-gray-900">LEVEL 5: THE EXPERT</h3>
                      <p className="text-red-600 font-semibold">(80-100 PAID Referrals)</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-gray-700 font-bold">Everything Above PLUS:</p>
                    <ul className="space-y-2 pl-5">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <span>Expert handling of your remote job applications</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <span>Assessment and interview preparation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <span>Connection to hiring companies</span>
                      </li>
                    </ul>
                    <div className="p-4 bg-white rounded-xl border border-red-200 mt-4">
                      <p className="font-bold text-gray-900">The Security:</p>
                      <p className="text-gray-700">Job interviews waiting for you while your classmates are still sending out applications.</p>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-white p-6 rounded-2xl border border-red-300 shadow-lg">
                    <p className="text-sm text-gray-600 mb-2">Progress to Level 5</p>
                    <div className="text-4xl font-black text-red-600 mb-2">{stats.paidReferrals}/80</div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden w-48">
                      <div 
                        className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full"
                        style={{ width: `${Math.min(100, (stats.paidReferrals / 80) * 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Paid referrals needed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Level 6 */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 border-2 border-indigo-300">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-black">
                      6
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-gray-900">LEVEL 6: THE TEAM MEMBER</h3>
                      <p className="text-indigo-600 font-semibold">(100+ PAID Referrals)</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-gray-700 font-bold">Everything Above PLUS:</p>
                    <ul className="space-y-2 pl-5">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <span>Full absorption into our remote work team</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <span>Consistent monthly income throughout campus</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <span>Career path already established</span>
                      </li>
                    </ul>
                    <div className="p-4 bg-white rounded-xl border border-indigo-200 mt-4">
                      <p className="font-bold text-gray-900">The Ultimate Win:</p>
                      <p className="text-gray-700">You graduate with a job, experience, and savings while others graduate with debt and uncertainty.</p>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-white p-6 rounded-2xl border border-indigo-300 shadow-lg">
                    <p className="text-sm text-gray-600 mb-2">Progress to Level 6</p>
                    <div className="text-4xl font-black text-indigo-600 mb-2">{stats.paidReferrals}/100</div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden w-48">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        style={{ width: `${Math.min(100, (stats.paidReferrals / 100) * 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Paid referrals needed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-blue-200 mb-12">
          <h2 className="text-3xl font-black text-gray-900 mb-8 text-center">
            ⏳ Why Start Tracking NOW (Not Later):
          </h2>
          
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Your 9-Month Break Timeline:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { period: "Month 1-3", activity: "Everyone needs KRA PIN, IDs processed", result: "→ Immediate payments", color: "from-blue-500 to-cyan-500" },
                { period: "Month 4-6", activity: "KUCCPS placement season", result: "→ Mass payments", color: "from-green-500 to-emerald-500" },
                { period: "Month 7-9", activity: "Passport, visa, pre-campus preparations", result: "→ More payments", color: "from-amber-500 to-orange-500" },
                { period: "Start of Campus", activity: "You have actual money saved", result: "→ Not just promises", color: "from-purple-500 to-violet-500" },
              ].map((item, index) => (
                <div key={index} className={`bg-gradient-to-r ${item.color} text-white p-6 rounded-2xl`}>
                  <p className="text-lg font-black mb-2">{item.period}</p>
                  <p className="mb-2">{item.activity}</p>
                  <p className="font-bold">{item.result}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">The Strategic Advantage:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                "Maximum Reach Now: Everyone needs services during the break",
                "Payment Waves: Different people pay at different times",
                "Compound Effect: Early referrals lead to more referrals",
                "Campus Ready: Walk in with earnings already accumulated"
              ].map((advantage, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <TrendingUpIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-gray-800 font-medium">{advantage}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Earnings Scenario */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-blue-200 mb-12">
          <h2 className="text-3xl font-black text-gray-900 mb-8 text-center">
            📈 Realistic Earnings Scenario:
          </h2>
          
          <div className="text-center mb-8">
            <p className="text-xl text-gray-700 mb-6">
              If you start TODAY and share with 
              <span className="font-black text-blue-600 mx-2">{estimatedReferrals} people</span>:
            </p>
            
            <input
              type="range"
              min="10"
              max="200"
              value={estimatedReferrals}
              onChange={(e) => setEstimatedReferrals(parseInt(e.target.value))}
              className="w-full max-w-2xl h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-600 max-w-2xl mx-auto mt-2">
              <span>10</span>
              <span>50</span>
              <span>100</span>
              <span>150</span>
              <span>200</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { percent: "30%", desc: "will need services immediately (KRA, IDs)", result: `${Math.floor(estimatedReferrals * 0.3)} potential payments`, color: "bg-blue-100 text-blue-800" },
              { percent: "40%", desc: "will need services at placement time", result: `${Math.floor(estimatedReferrals * 0.4)} more potentials`, color: "bg-green-100 text-green-800" },
              { percent: "20%", desc: "will need services before campus", result: `${Math.floor(estimatedReferrals * 0.2)} more potentials`, color: "bg-amber-100 text-amber-800" },
              { percent: "10%", desc: "miscellaneous needs spread throughout", result: `${Math.floor(estimatedReferrals * 0.1)} potentials`, color: "bg-purple-100 text-purple-800" },
            ].map((item, index) => (
              <div key={index} className="p-4 rounded-xl border border-gray-200">
                <p className="text-2xl font-black mb-2">{item.percent}</p>
                <p className="text-gray-700 mb-2">{item.desc}</p>
                <p className={`font-bold ${item.color} px-3 py-1 rounded-lg inline-block`}>{item.result}</p>
              </div>
            ))}
          </div>
          
          <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-300 text-center">
            <p className="text-lg text-gray-700 mb-2">By campus reporting day:</p>
            <p className="text-3xl font-black text-green-600 mb-4">{formatCurrency(estimatedEarnings)} estimated earnings</p>
            <p className="text-gray-700">Plus benefits unlocked based on your actual paid referrals</p>
          </div>
        </div>

        {/* Campus Life Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-8 border-2 border-red-300">
            <h3 className="text-2xl font-black text-gray-900 mb-6 text-center">🎓 Without This Program:</h3>
            <ul className="space-y-4">
              {[
                "Constant financial stress",
                "Missed opportunities (internships, events, networking)",
                "Academic pressure compounded by money worries", 
                "Graduation with debt and no job",
                "Always depending on parents for everything",
                "Limited campus experiences due to costs"
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-800">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-300">
            <h3 className="text-2xl font-black text-gray-900 mb-6 text-center">🎓 With This Program:</h3>
            <ul className="space-y-4">
              {[
                "Focus on studies, not survival",
                "Ability to say YES to opportunities",
                "Work experience before graduation",
                "Job waiting upon graduation",
                "Financial confidence throughout",
                "Help your family instead of burdening them"
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-800">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Critical Understanding */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8 border-2 border-amber-300 mb-12">
          <h2 className="text-3xl font-black text-gray-900 mb-6 text-center">
            ⚠️ Critical Understanding:
          </h2>
          
          <div className="text-center mb-8">
            <p className="text-2xl font-bold text-gray-900 mb-4">
              You don't earn from sign-ups. You earn from PAYMENTS.
            </p>
            <p className="text-2xl font-bold text-gray-900">
              But you can't get payments without sign-ups.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">So:</h3>
              {[
                "Start tracking TODAY (sign-ups begin immediately)",
                "Payments happen WHENEVER they need services (now, at placement, before campus)",
                "Benefits unlock based on ACTUAL PAYMENTS",
                "The sooner you start, the more payments you can accumulate"
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="bg-amber-100 text-amber-800 font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <span className="text-gray-800">{item}</span>
                </div>
              ))}
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-amber-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Think of it like farming:</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <span className="text-green-600">🌱</span>
                  </div>
                  <div>
                    <p className="font-semibold">Today you plant seeds (share your link)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <span className="text-yellow-600">⏳</span>
                  </div>
                  <div>
                    <p className="font-semibold">Over 9 months, different crops mature at different times (payments happen)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <span className="text-blue-600">💰</span>
                  </div>
                  <div>
                    <p className="font-semibold">Harvest continuously (earnings weekly)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <span className="text-purple-600">🏆</span>
                  </div>
                  <div>
                    <p className="font-semibold">Barn gets full (benefits unlock)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Plan */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-8 border-2 border-blue-300 mb-12">
          <h2 className="text-3xl font-black text-gray-900 mb-8 text-center">
            🚀 Your Immediate Action Plan:
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { step: "1", action: "Register TODAY", detail: "2 minutes, right now", icon: "📝" },
              { step: "2", action: "Get Your Link", detail: "Unique to you, starts tracking immediately", icon: "🔗" },
              { step: "3", action: "Share EVERYWHERE", detail: "WhatsApp, Instagram, Facebook, in person", icon: "📢" },
              { step: "4", action: "Follow Up", detail: '"Need KRA PIN? Use my link"', icon: "💬" },
              { step: "5", action: "Watch Dashboard", detail: "See pending convert to paid", icon: "📊" },
              { step: "6", action: "Withdraw Weekly", detail: "Build your campus fund", icon: "💰" },
              { step: "7", action: "Level Up", detail: "Unlock more benefits as paid referrals grow", icon: "⬆️" },
            ].map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-blue-200 hover:border-blue-400 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-black">
                    {item.step}
                  </div>
                  <div className="text-3xl">{item.icon}</div>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">{item.action}</h4>
                <p className="text-gray-700">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Final Reality Check */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white mb-12">
          <h2 className="text-3xl font-black mb-8 text-center">
            💭 Final Reality Check:
          </h2>
          
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-6 text-center">Look around your Form 4 class:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { percent: "90%", text: "will start campus with empty pockets" },
                { percent: "80%", text: "will struggle financially in first year" },
                { percent: "70%", text: "will miss opportunities due to money" },
                { percent: "60%", text: "will graduate with no job experience" },
                { percent: "50%", text: "will regret not starting earlier" },
                { percent: "40%", text: "will drop out or defer due to finances" },
              ].map((item, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                  <p className="text-2xl font-black mb-2">{item.percent}</p>
                  <p className="text-gray-300">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center space-y-4">
            <p className="text-xl">
              You have a 9-month head start that they're wasting.
            </p>
            <p className="text-xl">
              Your break time is their vacation time.
            </p>
            <p className="text-xl font-bold">
              Your early hustle is their future struggle.
            </p>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-6">
            The Question Isn't Whether Campus Will Be Tough Financially.
          </h2>
          <h3 className="text-2xl font-black text-blue-600 mb-8">
            The Question Is: Will You Be Prepared or Will You Be Another Statistic?
          </h3>
          
          <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-300 mb-8">
            <p className="text-xl text-gray-700 mb-4">
              Your 9 months between Form 4 and campus aren't empty time.
            </p>
            <p className="text-xl text-gray-700 mb-4">
              They're your head start on adult life.
            </p>
            <p className="text-2xl font-black text-blue-600">
              Don't waste them waiting. Start tracking TODAY.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="inline-flex flex-col items-center gap-4">
              <span className="text-4xl">📱</span>
              <p className="text-2xl font-black text-gray-900">
                Start Building Your Campus Fund Now →
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleCopyReferralLink}
                className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold px-10 py-6 text-lg rounded-xl hover:opacity-90"
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-6 w-6" />
                    Link Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-6 w-6" />
                    Get Your Ambassador Link & Start Tracking
                  </>
                )}
              </button>
              
              <button
                onClick={() => router.push("/services")}
                className="inline-flex items-center justify-center gap-3 bg-white border-2 border-blue-600 text-blue-600 font-bold px-10 py-6 text-lg rounded-xl hover:bg-blue-50"
              >
                <Globe className="h-6 w-6" />
                Explore All Services
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// XCircle icon component
const XCircle = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);