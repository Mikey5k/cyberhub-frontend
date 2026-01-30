'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle, XCircle, UserPlus, Users, Laptop, Wifi, Clock,
  AlertCircle, ArrowLeft, Mail, Phone, FileText, Loader2, Check,
  CreditCard, Shield, Zap, Target, Crown, MessageSquare, Smartphone,
  Home, Heart, Rocket, TrendingUp, Star, Globe, Smartphone as WhatsAppIcon,
  Copy, CheckCheck
} from 'lucide-react';

export default function TeamLeadApplyPage() {
  const router = useRouter();
  const [phone, setPhone] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [eligible, setEligible] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [path, setPath] = useState<'choice' | 'solo' | 'team'>('choice');
  const [step, setStep] = useState<'payment' | 'details' | 'review'>('payment');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mpesaMessage, setMpesaMessage] = useState('');
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [copied, setCopied] = useState(false);

  // For team leads only
  const [hasManagementSkills, setHasManagementSkills] = useState(false);
  const [canLeadTeam, setCanLeadTeam] = useState(false);

  useEffect(() => {
    const savedPhone = localStorage.getItem('cyberhub_phone') || sessionStorage.getItem('cyberhub_phone');
    if (savedPhone) {
      setPhone(savedPhone);
      setLoading(false);
    } else {
      router.push('/login?redirect=/team-lead-apply');
    }
  }, [router]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !email) {
      setError('Full name and email are required');
      return;
    }

    // Team lead specific checks
    if (path === 'team' && (!hasManagementSkills || !canLeadTeam)) {
      setError('For team lead position, you must confirm both management requirements');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Store application based on path
      const application = {
        id: Date.now().toString(),
        name: fullName,
        phone,
        email,
        path: path === 'solo' ? 'agent' : 'team_lead',
        paymentVerified: true,
        managementSkills: path === 'team' ? { hasManagementSkills, canLeadTeam } : null,
        status: 'pending',
        appliedAt: new Date().toISOString(),
        paymentDate: new Date().toISOString()
      };

      localStorage.setItem('cyberhub_application', JSON.stringify(application));
      
      setSuccess(true);
      
      // Auto-advance to review
      setTimeout(() => {
        setStep('review');
      }, 1000);

    } catch (error) {
      setError('Application failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-700">Loading your opportunity...</p>
        </div>
      </div>
    );
  }

  if (success && step === 'review') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-gray-100 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <div className="bg-white rounded-2xl border-2 border-green-200 p-8 shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-full">
                <Rocket className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Application Submitted! 📱</h1>
                <p className="text-gray-600">Admin will review via WhatsApp</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-6">
              <h3 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                <CheckCheck className="h-5 w-5" />
                Application Status: Pending WhatsApp Verification
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-white/70 rounded-lg">
                  <WhatsAppIcon className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">WhatsApp Verification in Progress</p>
                    <p className="text-gray-600 text-sm">Admin will verify your M-Pesa payment via WhatsApp</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-white/70 rounded-lg">
                  <Mail className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">You'll Receive WhatsApp Notification</p>
                    <p className="text-gray-600 text-sm">Once verified, you'll get a WhatsApp message with next steps</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-white/70 rounded-lg">
                  <Clock className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Typical Review Time: 24 Hours</p>
                    <p className="text-gray-600 text-sm">Admin processes applications daily</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
              <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                What Happens Next:
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-800 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">1</div>
                  <div>
                    <p className="font-medium text-gray-900">Admin WhatsApp Verification</p>
                    <p className="text-gray-600 text-sm">Admin checks your M-Pesa message sent to WhatsApp</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-800 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">2</div>
                  <div>
                    <p className="font-medium text-gray-900">WhatsApp Approval Message</p>
                    <p className="text-gray-600 text-sm">You'll receive approval/instructions via WhatsApp</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-800 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">3</div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {path === 'solo' ? 'Agent Dashboard Access' : 'Team Lead Onboarding'}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {path === 'solo' 
                        ? 'Start working on remote opportunities immediately' 
                        : 'Begin building your team of 15-20 agents'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center space-y-4">
              <div className="text-sm text-gray-600 italic">
                <p>"Remote work isn't just a trend - it's the foundation for building the peaceful, productive life you deserve."</p>
              </div>
              
              <button
                onClick={() => router.push('/services')}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold py-3 px-8 rounded-lg hover:opacity-90 shadow-lg"
              >
                Explore More Services
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CHOICE SCREEN - Welcome/Path Selection
  if (path === 'choice') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto pt-8">
          <button
            onClick={() => router.push('/services')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Services
          </button>

          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-4">
              <Home className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Build Your Foundation for <span className="text-blue-600">Peaceful Work-From-Home</span>
            </h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-6">
              Remote work is more than a trend - it's your opportunity to build a career that fits your life, 
              not the other way around. Let's build that foundation together.
            </p>
            
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-200 rounded-2xl p-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Zap className="h-5 w-5 text-blue-600" />
                <span className="font-bold text-blue-800">What You'll Gain:</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/80 rounded-xl p-4">
                  <div className="text-blue-600 font-bold mb-2">🚀 Skill Training</div>
                  <p className="text-sm text-gray-700">AI Training, Data Annotation, Chat Moderation & More</p>
                </div>
                <div className="bg-white/80 rounded-xl p-4">
                  <div className="text-blue-600 font-bold mb-2">💼 Professional Tools</div>
                  <p className="text-sm text-gray-700">Everything you need to succeed in remote work</p>
                </div>
                <div className="bg-white/80 rounded-xl p-4">
                  <div className="text-blue-600 font-bold mb-2">🌍 Global Opportunities</div>
                  <p className="text-sm text-gray-700">Work with international clients from the comfort of home</p>
                </div>
              </div>
            </div>
          </div>

          {/* Path Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Solo Path */}
            <div className="bg-white rounded-2xl border-2 border-blue-200 p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-400 to-cyan-400 p-3 rounded-xl">
                  <UserPlus className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Work Solo</h2>
                  <p className="text-gray-600">Be your own boss, set your own pace</p>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Flexible Hours</p>
                    <p className="text-sm text-gray-600">Work whenever you want, from anywhere</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Direct Earnings</p>
                    <p className="text-sm text-gray-600">Keep 100% of what you earn</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">No Management Required</p>
                    <p className="text-sm text-gray-600">Focus solely on your work</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setPath('solo');
                  setStep('payment');
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-4 rounded-xl hover:opacity-90 flex items-center justify-center gap-3"
              >
                <UserPlus className="h-5 w-5" />
                Start as Solo Agent
              </button>
            </div>

            {/* Team Lead Path */}
            <div className="bg-white rounded-2xl border-2 border-purple-200 p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Build Your Team</h2>
                  <p className="text-gray-600">Lead 15-20 agents, multiply your impact</p>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Team Commissions</p>
                    <p className="text-sm text-gray-600">Earn from your team's success</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Leadership Growth</p>
                    <p className="text-sm text-gray-600">Develop management & team-building skills</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Scale Your Income</p>
                    <p className="text-sm text-gray-600">Grow beyond individual limitations</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setPath('team');
                  setStep('payment');
                }}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-xl hover:opacity-90 flex items-center justify-center gap-3"
              >
                <Crown className="h-5 w-5" />
                Apply as Team Lead
              </button>
            </div>
          </div>

          {/* Next Steps Info */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200 rounded-2xl p-8 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-4">How It Works:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="bg-blue-100 text-blue-800 font-bold rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">1</div>
                <p className="font-medium text-gray-900">Choose Your Path</p>
                <p className="text-sm text-gray-600">Solo agent or team lead</p>
              </div>
              <div className="space-y-2">
                <div className="bg-blue-100 text-blue-800 font-bold rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">2</div>
                <p className="font-medium text-gray-900">WhatsApp Payment</p>
                <p className="text-sm text-gray-600">Send M-Pesa to WhatsApp for verification</p>
              </div>
              <div className="space-y-2">
                <div className="bg-blue-100 text-blue-800 font-bold rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">3</div>
                <p className="font-medium text-gray-900">Complete Application</p>
                <p className="text-sm text-gray-600">Submit your details</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PAYMENT & APPLICATION STEPS (common for both paths)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <button
          onClick={() => {
            setPath('choice');
            setStep('payment');
          }}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Path Selection
        </button>

        <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-xl mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className={`p-3 rounded-full ${path === 'solo' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}>
              {path === 'solo' ? <UserPlus className="h-8 w-8 text-white" /> : <Crown className="h-8 w-8 text-white" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {path === 'solo' ? 'Become a Solo Agent' : 'Apply as Team Lead'}
              </h1>
              <p className="text-gray-600">
                {path === 'solo' 
                  ? 'Your journey to peaceful remote work starts here' 
                  : 'Lead 15-20 agents and build your remote work empire'
                }
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <CreditCard className="h-4 w-4" />
              </div>
              <span className="font-medium">WhatsApp Payment</span>
            </div>
            
            <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
            
            <div className={`flex items-center gap-2 ${step === 'details' ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'details' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <FileText className="h-4 w-4" />
              </div>
              <span className="font-medium">Your Details</span>
            </div>
            
            <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
            
            <div className={`flex items-center gap-2 ${step === 'review' ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'review' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <CheckCircle className="h-4 w-4" />
              </div>
              <span className="font-medium">Submit</span>
            </div>
          </div>

          {/* Payment Step */}
          {step === 'payment' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <WhatsAppIcon className="h-6 w-6 text-green-600" />
                  <h3 className="text-lg font-bold text-gray-900">Step 1: WhatsApp Payment Verification</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="p-4 bg-white rounded-lg border-2 border-blue-200">
                    <p className="font-medium text-gray-900 mb-3">📱 WhatsApp Payment Process:</p>
                    <ol className="space-y-3 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <div className="bg-blue-100 text-blue-800 font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">1</div>
                        <span>Go to <strong className="text-blue-600 cursor-pointer" onClick={() => router.push('/services')}>Services Page</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="bg-blue-100 text-blue-800 font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">2</div>
                        <span>Choose <strong>Remote Work Foundation</strong> or <strong>Student Journey</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="bg-blue-100 text-blue-800 font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">3</div>
                        <span>Make payment via <strong>WhatsApp +254708949580</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="bg-blue-100 text-blue-800 font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">4</div>
                        <span><strong>Send M-Pesa message</strong> to same WhatsApp number</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="bg-blue-100 text-blue-800 font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">5</div>
                        <span>Return here and proceed to Step 2</span>
                      </li>
                    </ol>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Smartphone className="h-5 w-5 text-green-600" />
                      <h4 className="font-bold text-gray-900">WhatsApp Payment Details:</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white/80 rounded-lg">
                        <div className="flex items-center gap-2">
                          <WhatsAppIcon className="h-5 w-5 text-green-600" />
                          <span className="font-medium">WhatsApp Number:</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard('+254708949580')}
                          className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-lg hover:bg-green-200"
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          <span className="font-mono">+254708949580</span>
                        </button>
                      </div>
                      
                      <div className="p-3 bg-white/80 rounded-lg">
                        <p className="font-medium text-gray-900 mb-2">💬 Message to send:</p>
                        <div className="bg-gray-50 p-3 rounded border border-gray-200">
                          <p className="text-sm text-gray-700">
                            "Hi, I want to purchase {path === 'solo' ? 'Remote Work Foundation' : 'Team Lead Application'} service. 
                            Please send me payment details. My name is [Your Name] and phone is {phone}"
                          </p>
                          <button
                            onClick={() => copyToClipboard(`Hi, I want to purchase ${path === 'solo' ? 'Remote Work Foundation' : 'Team Lead Application'} service. Please send me payment details. My name is [Your Name] and phone is ${phone}`)}
                            className="mt-2 text-blue-600 text-sm flex items-center gap-1 hover:text-blue-800"
                          >
                            <Copy className="h-3 w-3" />
                            Copy message template
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-800">
                      <AlertCircle className="h-5 w-5" />
                      <h4 className="font-bold">Important:</h4>
                    </div>
                    <p className="text-sm text-amber-700 mt-2">
                      You <strong>must complete payment via WhatsApp</strong> before proceeding. 
                      Admin will verify your payment manually before approving your application.
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setStep('details')}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 flex items-center justify-center gap-3 shadow-lg"
                  >
                    <WhatsAppIcon className="h-5 w-5" />
                    I've Sent Payment via WhatsApp - Continue
                  </button>
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    <span>{error}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Details Step */}
          {step === 'details' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <UserPlus className="h-6 w-6 text-green-600" />
                  <h3 className="text-lg font-bold text-gray-900">Step 2: Your Application Details</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">For remote work opportunities and updates</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={phone}
                        disabled
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg text-gray-600"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">This is your registered CyberHub number</p>
                  </div>

                  {/* Team Lead Specific Requirements */}
                  {path === 'team' && (
                    <div className="space-y-4 mt-6">
                      <h4 className="font-bold text-gray-900 flex items-center gap-2">
                        <Crown className="h-5 w-5 text-purple-600" />
                        Team Lead Requirements:
                      </h4>
                      
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-200">
                        <input
                          type="checkbox"
                          id="managementSkills"
                          checked={hasManagementSkills}
                          onChange={() => setHasManagementSkills(!hasManagementSkills)}
                          className="h-6 w-6 text-purple-600 rounded"
                        />
                        <label htmlFor="managementSkills" className="flex-1 cursor-pointer">
                          <span className="font-medium text-gray-900">I have management/leadership experience or skills</span>
                          <p className="text-sm text-gray-600">Ability to guide and support a team</p>
                        </label>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-200">
                        <input
                          type="checkbox"
                          id="canLeadTeam"
                          checked={canLeadTeam}
                          onChange={() => setCanLeadTeam(!canLeadTeam)}
                          className="h-6 w-6 text-purple-600 rounded"
                        />
                        <label htmlFor="canLeadTeam" className="flex-1 cursor-pointer">
                          <span className="font-medium text-gray-900">I can commit to leading 15-20 agents</span>
                          <p className="text-sm text-gray-600">Dedication to team building and growth</p>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    <span>{error}</span>
                  </div>
                </div>
              )}
              
              <div className="flex gap-4">
                <button
                  onClick={() => setStep('payment')}
                  className="flex-1 border-2 border-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-50"
                >
                  Back to Payment
                </button>
                
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !fullName || !email || (path === 'team' && (!hasManagementSkills || !canLeadTeam))}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Submit Application
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}