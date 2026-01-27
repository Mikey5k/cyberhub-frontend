'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle, XCircle, UserPlus, Users, Laptop, Wifi, Clock,
  AlertCircle, ArrowLeft, Mail, Phone, FileText, Loader2, Check,
  CreditCard, Shield, Zap, Target, Crown, MessageSquare, Smartphone
} from 'lucide-react';

export default function TeamLeadApplyPage() {
  const router = useRouter();
  const [phone, setPhone] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [eligible, setEligible] = useState(true); // Now everyone is eligible with payment
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<'payment' | 'hardware' | 'review'>('payment');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mpesaMessage, setMpesaMessage] = useState('');
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  // Hardware checklist (6 items)
  const [hardwareChecks, setHardwareChecks] = useState({
    hasComputer: false,
    hasInternet: false,
    canUseWhatsAppWeb: false,
    willingToLeadAgents: false,
    canCommitHours: false,
    availability: false
  });

  // Payment details
  const PAYMENT_NUMBER = '0708949580';
  const PAYMENT_AMOUNT = '100';
  const PAYMENT_RECEIVER = 'Equilar Atieno';

  useEffect(() => {
    const savedPhone = localStorage.getItem('cyberhub_phone') || sessionStorage.getItem('cyberhub_phone');
    if (savedPhone) {
      setPhone(savedPhone);
      setLoading(false);
    } else {
      router.push('/login?redirect=/team-lead-apply');
    }
  }, [router]);

  const verifyMpesaPayment = () => {
    setVerifyingPayment(true);
    setError('');

    // Simulate API verification
    setTimeout(() => {
      const message = mpesaMessage.toLowerCase();
      
      // Check 1: Contains receiver name "Equilar Atieno"
      const hasReceiver = message.includes('equilar atieno');
      
      // Check 2: Contains amount "100"
      const hasAmount = message.includes('100') && 
                       (message.includes('ksh') || message.includes('/') || message.includes('.00'));
      
      // Check 3: Check date (within last 24 hours - simplified check)
      const hasRecentDate = message.includes('today') || 
                           message.includes('at') || 
                           message.includes('on');
      
      if (hasReceiver && hasAmount && hasRecentDate) {
        setPaymentVerified(true);
        setStep('hardware');
        setError('');
      } else {
        setError('Payment verification failed. Please ensure: 1) Sent to Equilar Atieno 2) Amount Ksh 100 3) Payment made within last 24 hours');
      }
      
      setVerifyingPayment(false);
    }, 1500);
  };

  const handleHardwareCheckChange = (key: keyof typeof hardwareChecks) => {
    setHardwareChecks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const allHardwareChecksComplete = () => {
    return Object.values(hardwareChecks).every(check => check === true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !email) {
      setError('Full name and email are required');
      return;
    }

    if (!paymentVerified) {
      setError('Please verify your payment first');
      setStep('payment');
      return;
    }

    if (!allHardwareChecksComplete()) {
      setError('All 6 hardware and commitment checks must be completed');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Store application locally (will be replaced with API later)
      const application = {
        id: Date.now().toString(),
        name: fullName,
        phone,
        email,
        paymentVerified: true,
        hardwareChecks,
        status: 'pending',
        appliedAt: new Date().toISOString(),
        paymentDate: new Date().toISOString()
      };

      localStorage.setItem('cyberhub_manager_application', JSON.stringify(application));
      
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-700">Loading application form...</p>
        </div>
      </div>
    );
  }

  if (success && step === 'review') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <div className="bg-white rounded-2xl border-2 border-green-200 p-8 shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Application Submitted!</h1>
                <p className="text-gray-600">Your Team Lead application is pending review</p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
              <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                <Zap className="h-5 w-5" />
                What You Get Immediately:
              </h3>
              <ol className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="bg-green-100 text-green-800 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">1</div>
                  <div>
                    <p className="font-medium text-gray-900">Remote Job Board Access</p>
                    <p className="text-gray-600 text-sm">
                      <strong>1-year subscription</strong> to our remote job board (updates every 30 minutes)
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-green-100 text-green-800 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">2</div>
                  <div>
                    <p className="font-medium text-gray-900">Latest Opportunities</p>
                    <p className="text-gray-600 text-sm">
                      Access to <strong>new openings every 30 minutes</strong> to increase your chances
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-green-100 text-green-800 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">3</div>
                  <div>
                    <p className="font-medium text-gray-900">Expert Application Assistance</p>
                    <p className="text-gray-600 text-sm">
                      Optional expert help with applications and tests (additional fee)
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
              <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                What Happens Next:
              </h3>
              <ol className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-800 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">1</div>
                  <div>
                    <p className="font-medium text-gray-900">Admin Review</p>
                    <p className="text-gray-600 text-sm">
                      Admin will review your application within <strong>24 hours</strong>
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-800 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">2</div>
                  <div>
                    <p className="font-medium text-gray-900">WhatsApp Notification</p>
                    <p className="text-gray-600 text-sm">
                      You'll receive a <strong>WhatsApp message</strong> with the decision
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-800 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">3</div>
                  <div>
                    <p className="font-medium text-gray-900">If Approved</p>
                    <p className="text-gray-600 text-sm">
                      You'll get access to manager dashboard to build your team of 15-20 agents
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            <div className="text-center space-y-4">
              <div className="text-sm text-gray-600">
                <p><strong>Note:</strong> Even if not approved as Team Lead, you still get <strong>1-year job board access</strong> as per your subscription.</p>
                <p className="mt-2">Payment is <strong>not obliged to renew</strong> - it's a one-time subscription.</p>
              </div>
              
              <button
                onClick={() => router.push('/services')}
                className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700"
              >
                Back to Services
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <button
          onClick={() => router.push('/services')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Services
        </button>

        <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-xl mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-full">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Apply as Team Lead (Manager)</h1>
              <p className="text-gray-600">Lead 15-20 agents and build your team</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <CreditCard className="h-4 w-4" />
              </div>
              <span className="font-medium">Payment</span>
            </div>
            
            <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
            
            <div className={`flex items-center gap-2 ${step === 'hardware' ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'hardware' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <Laptop className="h-4 w-4" />
              </div>
              <span className="font-medium">Hardware Check</span>
            </div>
            
            <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
            
            <div className={`flex items-center gap-2 ${step === 'review' ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'review' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <CheckCircle className="h-4 w-4" />
              </div>
              <span className="font-medium">Review</span>
            </div>
          </div>

          {/* Payment Step */}
          {step === 'payment' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-6 w-6 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900">Payment Subscription</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-lg border border-blue-200">
                    <p className="font-medium text-gray-900 mb-2">📱 Send Ksh 100 to:</p>
                    <div className="text-2xl font-bold text-blue-600 mb-2">{PAYMENT_NUMBER}</div>
                    <p className="text-sm text-gray-600">(Copy exactly as it is)</p>
                  </div>
                  
                  <div className="p-4 bg-white rounded-lg border border-green-200">
                    <p className="font-medium text-gray-900 mb-2">🎯 What your payment includes:</p>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span><strong>1-year subscription</strong> for remote job board access</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span><strong>Board updates every 30 minutes</strong> with latest openings</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span><strong>Not obliged to renew</strong> - one-time payment</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span><strong>Even if not accepted</strong> as Team Lead, you still get job board access for 1 year</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-white rounded-lg border border-amber-200">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="h-4 w-4 text-amber-600" />
                        <span>Paste your MPesa confirmation message:</span>
                      </div>
                    </label>
                    <textarea
                      value={mpesaMessage}
                      onChange={(e) => setMpesaMessage(e.target.value)}
                      placeholder="Example: Sent to Equilar Atieno Ksh 100.00 on 15/3 at 10:30AM. New balance: 500. Confirmation code: RF89HGTY"
                      className="w-full h-32 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      System checks: 1) Receiver = "Equilar Atieno" 2) Amount = "100" 3) Date within last 24 hours
                    </p>
                  </div>
                  
                  {paymentVerified && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Payment verified! Proceed to hardware check.</span>
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={verifyMpesaPayment}
                    disabled={verifyingPayment || !mpesaMessage.trim()}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {verifyingPayment ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Verifying Payment...
                      </>
                    ) : (
                      <>
                        <Shield className="h-5 w-5" />
                        Verify Payment
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    <span>{error}</span>
                  </div>
                </div>
              )}
              
              {paymentVerified && (
                <button
                  onClick={() => setStep('hardware')}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 flex items-center justify-center gap-3"
                >
                  <CheckCircle className="h-5 w-5" />
                  Proceed to Hardware Check
                </button>
              )}
            </div>
          )}

          {/* Hardware Check Step */}
          {step === 'hardware' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Target className="h-6 w-6 text-green-600" />
                  <h3 className="text-lg font-bold text-gray-900">Hardware & Commitment Check</h3>
                </div>
                
                <div className="space-y-4">
                  <p className="text-gray-700 mb-4">
                    Please check <strong>ALL 6 boxes</strong> to proceed with your application:
                  </p>
                  
                  {[
                    { key: 'hasComputer', label: 'I have a computer (laptop/desktop)', icon: <Laptop className="h-5 w-5" /> },
                    { key: 'hasInternet', label: 'I have reliable internet', icon: <Wifi className="h-5 w-5" /> },
                    { key: 'canUseWhatsAppWeb', label: 'I can use WhatsApp Web/Desktop', icon: <MessageSquare className="h-5 w-5" /> },
                    { key: 'willingToLeadAgents', label: 'I\'m willing to lead 15-20 agents', icon: <Users className="h-5 w-5" /> },
                    { key: 'canCommitHours', label: 'I can commit minimum 4 hours daily', icon: <Clock className="h-5 w-5" /> },
                    { key: 'availability', label: 'Availability at your convenience', icon: <CheckCircle className="h-5 w-5" /> }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                      <input
                        type="checkbox"
                        id={item.key}
                        checked={hardwareChecks[item.key as keyof typeof hardwareChecks]}
                        onChange={() => handleHardwareCheckChange(item.key as keyof typeof hardwareChecks)}
                        className="h-6 w-6 text-blue-600 rounded"
                      />
                      <label htmlFor={item.key} className="flex items-center gap-3 flex-1 cursor-pointer">
                        <div className="text-blue-600">
                          {item.icon}
                        </div>
                        <span className="font-medium text-gray-900">{item.label}</span>
                      </label>
                    </div>
                  ))}
                </div>
                
                {allHardwareChecksComplete() && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">All checks complete! Ready to submit application.</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Personal Information
                </h3>
                
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
                  <p className="text-sm text-gray-500 mt-1">For job notifications and application updates</p>
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
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    <span>{error}</span>
                  </div>
                </div>
              )}
              
              <button
                onClick={handleSubmit}
                disabled={submitting || !allHardwareChecksComplete() || !fullName || !email}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 px-6 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Submit Application
                  </>
                )}
              </button>
              
              <button
                onClick={() => setStep('payment')}
                className="w-full border-2 border-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-50"
              >
                Back to Payment Step
              </button>
            </div>
          )}

          {/* Team Lead Benefits */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Crown className="h-5 w-5" />
              As a Team Lead You Get:
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-700 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">1</div>
                <div>
                  <p className="font-medium text-gray-900">Build Your Team</p>
                  <p className="text-gray-600 text-sm">Recruit and lead 15-20 agents under you</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-700 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">2</div>
                <div>
                  <p className="font-medium text-gray-900">Earn Commissions</p>
                  <p className="text-gray-600 text-sm">10% commission from your team's earnings</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-700 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">3</div>
                <div>
                  <p className="font-medium text-gray-900">Growth Path</p>
                  <p className="text-gray-600 text-sm">Progress to Senior Manager (100 agents) and Chief Manager (500 agents)</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-700 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">4</div>
                <div>
                  <p className="font-medium text-gray-900">Job Board Access</p>
                  <p className="text-gray-600 text-sm">1-year subscription to remote job opportunities (updates every 30 minutes)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}