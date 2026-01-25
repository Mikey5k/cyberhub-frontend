'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle, XCircle, UserPlus, Users, Laptop, Wifi, Clock,
  AlertCircle, ArrowLeft, Mail, Phone, FileText, Loader2, Check
} from 'lucide-react';

export default function TeamLeadApplyPage() {
  const router = useRouter();
  const [phone, setPhone] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [eligible, setEligible] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [serviceUsed, setServiceUsed] = useState<'kra_pin' | 'kra_returns'>('kra_pin');
  const [hasComputer, setHasComputer] = useState(true);
  const [hasSmartphone, setHasSmartphone] = useState(true);
  const [internetQuality, setInternetQuality] = useState<'stable' | 'good' | 'basic'>('good');
  const [availableHours, setAvailableHours] = useState<'5-10' | '10-15' | '15-20'>('5-10');
  const [agreedTerms, setAgreedTerms] = useState(false);

  useEffect(() => {
    const savedPhone = localStorage.getItem('cyberhub_phone') || sessionStorage.getItem('cyberhub_phone');
    if (savedPhone) {
      setPhone(savedPhone);
      checkEligibility(savedPhone);
    } else {
      router.push('/login?redirect=/team-lead-apply');
    }
  }, [router]);

  const checkEligibility = async (userPhone: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/support?type=checkTeamLeadEligibility&userPhone=${encodeURIComponent(userPhone)}`);
      const result = await response.json();
      
      if (result.success) {
        setEligible(result.canApply);
        if (!result.canApply) {
          setError(result.message);
        }
      } else {
        setError('Failed to check eligibility');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !email) {
      setError('Full name and email are required');
      return;
    }

    if (!agreedTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submitTeamLeadApplication',
          userPhone: phone,
          userRole: 'user',
          fullName,
          email,
          serviceUsed,
          hasComputer,
          hasSmartphone,
          internetQuality,
          availableHours,
          agreedTerms
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        // Store application status
        localStorage.setItem('cyberhub_teamLeadApplied', 'true');
      } else {
        setError(result.error || 'Application failed. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-700">Checking your eligibility...</p>
        </div>
      </div>
    );
  }

  if (!eligible && !success) {
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

          <div className="bg-white rounded-2xl border-2 border-red-200 p-8 shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-red-100 p-3 rounded-full">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Not Eligible Yet</h1>
                <p className="text-gray-600">{error}</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
              <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Requirements to Apply:
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Complete a <strong>KRA PIN Application</strong> or <strong>KRA Returns Filing</strong> service with CyberHub</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Service must be marked as <strong>completed</strong> by our agent</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Not already applied or currently a manager</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => router.push('/services')}
                className="flex-1 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700"
              >
                Browse KRA Services
              </button>
              <button
                onClick={() => checkEligibility(phone)}
                className="flex-1 border-2 border-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-50"
              >
                Check Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
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
              <h3 className="font-bold text-green-800 mb-3">What Happens Next:</h3>
              <ol className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="bg-green-100 text-green-800 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">1</div>
                  <div>
                    <p className="font-medium text-gray-900">Admin Review</p>
                    <p className="text-gray-600 text-sm">Our admin team will review your application within 48 hours</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-green-100 text-green-800 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">2</div>
                  <div>
                    <p className="font-medium text-gray-900">Email Notification</p>
                    <p className="text-gray-600 text-sm">You'll receive an email at <strong>{email}</strong> with the decision</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-green-100 text-green-800 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">3</div>
                  <div>
                    <p className="font-medium text-gray-900">If Approved</p>
                    <p className="text-gray-600 text-sm">You'll get access to recruitment tools to build your team of 20 agents</p>
                  </div>
                </li>
              </ol>
            </div>

            <div className="text-center">
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
            <div className="bg-blue-100 p-3 rounded-full">
              <UserPlus className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Apply as Team Lead</h1>
              <p className="text-gray-600">Lead 20 agents and build your team</p>
            </div>
          </div>

          {/* Important Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-800 mb-1">Important: Your First Task After Approval</p>
                <p className="text-blue-700 text-sm">
                  Once approved as Team Lead, your primary responsibility will be to <strong>recruit and train 20 agents</strong> 
                  for your team. You'll receive recruitment materials and tools to help you build your team.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
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

            {/* Service Used */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Service Completed
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setServiceUsed('kra_pin')}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    serviceUsed === 'kra_pin'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">KRA PIN Application</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setServiceUsed('kra_returns')}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    serviceUsed === 'kra_returns'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">KRA Returns Filing</div>
                </button>
              </div>
            </div>

            {/* Device & Internet */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Laptop className="h-5 w-5" />
                Device & Internet
              </h3>
              
              <div>
                <p className="text-sm text-gray-700 mb-3">Available Devices (Select all that apply):</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={hasComputer}
                      onChange={(e) => setHasComputer(e.target.checked)}
                      className="h-5 w-5 text-blue-600 rounded"
                    />
                    <span>Computer/Laptop <span className="text-blue-600">(Preferred)</span></span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={hasSmartphone}
                      onChange={(e) => setHasSmartphone(e.target.checked)}
                      className="h-5 w-5 text-blue-600 rounded"
                    />
                    <span>Smartphone</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Internet Reliability *
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {['stable', 'good', 'basic'].map((quality) => (
                    <button
                      key={quality}
                      type="button"
                      onClick={() => setInternetQuality(quality as any)}
                      className={`p-3 border-2 rounded-lg text-center transition-colors ${
                        internetQuality === quality
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <Wifi className="h-5 w-5" />
                        <div className="font-medium capitalize">{quality}</div>
                        <div className="text-xs text-gray-500">
                          {quality === 'stable' ? 'WiFi/Fiber' : 
                           quality === 'good' ? '4G+ Mobile' : 'Can work'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Weekly Availability
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hours available per week for team oversight *
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {['5-10', '10-15', '15-20'].map((hours) => (
                    <button
                      key={hours}
                      type="button"
                      onClick={() => setAvailableHours(hours as any)}
                      className={`p-4 border-2 rounded-lg text-center transition-colors ${
                        availableHours === hours
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium">{hours} hours</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Terms & Conditions</h3>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      I understand that if approved, my <strong>first responsibility will be to recruit 20 agents</strong> for my team
                    </span>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      I commit to dedicating <strong>{availableHours} hours weekly</strong> for team oversight
                    </span>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      I have experienced CyberHub's service quality through my KRA service
                    </span>
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="h-5 w-5 text-blue-600 rounded mt-1"
                  required
                />
                <span className="text-gray-700">
                  I agree to all terms and conditions above, and understand that approval is subject to admin review
                </span>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 px-6 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  Submit Team Lead Application
                </>
              )}
            </button>
          </form>
        </div>

        {/* Team Lead Responsibilities */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Lead Responsibilities
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-700 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">1</div>
              <div>
                <p className="font-medium text-gray-900">Recruit 20 Agents</p>
                <p className="text-gray-600 text-sm">Your first task after approval: Build your team of 20 agents using our recruitment materials</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-700 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">2</div>
              <div>
                <p className="font-medium text-gray-900">Train & Oversee</p>
                <p className="text-gray-600 text-sm">Guide your agents through service delivery and ensure quality standards</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-700 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">3</div>
              <div>
                <p className="font-medium text-gray-900">Earn Commissions</p>
                <p className="text-gray-600 text-sm">Earn a percentage of your team's earnings as they complete services</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}