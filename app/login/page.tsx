"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Phone, ArrowRight, CheckCircle, AlertCircle, 
  Zap, UserPlus, LogIn, Briefcase, Users, Sparkles
} from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");

  // Check for redirect parameter
  const redirect = searchParams.get("redirect");

  useEffect(() => {
    // Check for existing phone in localStorage or sessionStorage
    const savedPhone = localStorage.getItem("cyberhub_phone");
    if (savedPhone) {
      setPhone(savedPhone);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!phone.match(/^\+?[0-9\s\-\(\)]{10,}$/)) {
      setError("Please enter a valid phone number (e.g., +254712345678)");
      setLoading(false);
      return;
    }

    if (isSignUp && !name.trim()) {
      setError("Please enter your full name");
      setLoading(false);
      return;
    }

    try {
      const formattedPhone = phone.startsWith("+") ? phone : `+${phone.replace(/\D/g, "")}`;

      if (isSignUp) {
        // Sign up logic
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: formattedPhone,
            name: name.trim(),
            role: 'user'
          }),
        });

        const data = await response.json();

        if (data.success) {
          setSuccess("Account created successfully! Redirecting to login...");
          setTimeout(() => {
            setIsSignUp(false);
            setSuccess("");
          }, 2000);
        } else {
          throw new Error(data.error || "Sign up failed");
        }
      } else {
        // Login logic
        const response = await fetch(`/api/users?phone=${encodeURIComponent(formattedPhone)}`);
        const data = await response.json();

        if (data.success) {
          // Store user data
          localStorage.setItem("cyberhub_phone", formattedPhone);
          localStorage.setItem("cyberhub_role", data.user.role || "user");
          localStorage.setItem("cyberhub_name", data.user.name || "");

          setSuccess(`Welcome back! Redirecting to ${data.user.role || 'user'} dashboard...`);

          setTimeout(() => {
            switch (data.user.role) {
              case "admin":
                router.push("/admin-dashboard");
                break;
              case "manager":
                router.push("/manager-dashboard");
                break;
              case "worker":
                router.push("/agent-dashboard");
                break;
              case "user":
              default:
                if (redirect) {
                  router.push(redirect);
                } else {
                  router.push("/services");
                }
                break;
            }
          }, 1500);
        } else {
          throw new Error(data.error || "User not found");
        }
      }
    } catch (err: any) {
      console.error("Authentication error:", err);
      setError(err.message || `Failed to ${isSignUp ? 'sign up' : 'login'}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-300 p-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-[#ff6b35] to-[#ffa500] p-3 rounded-xl shadow-lg">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900">Veritas</h1>
                <p className="text-sm text-gray-700 font-medium">CYBERHUB</p>
              </div>
            </div>
            
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all ${
                  !isSignUp 
                    ? 'bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-center gap-3">
                  <LogIn className="h-5 w-5" />
                  Sign In
                </div>
              </button>
              <button
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all ${
                  isSignUp 
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-center gap-3">
                  <UserPlus className="h-5 w-5" />
                  Sign Up
                </div>
              </button>
            </div>

            <h2 className="text-2xl font-black text-gray-900 mb-2">
              {isSignUp ? 'Create Your Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-600">
              {isSignUp 
                ? 'Join thousands who trust Veritas for their digital services' 
                : 'Sign in to access your dashboard and services'}
            </p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div>
                <label className="block text-gray-900 font-semibold mb-2 flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-gray-900 font-semibold mb-2 flex items-center gap-2">
                <Phone className="h-5 w-5 text-gray-500" />
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+254712345678"
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                required
              />
              <p className="text-gray-500 text-sm mt-2">
                Enter your Kenyan phone number
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                isSignUp
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90'
                  : 'bg-gradient-to-r from-[#ff6b35] to-[#ffa500] hover:opacity-90'
              } text-white shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="h-5 w-5" />
                </div>
              )}
            </button>
          </form>

          {/* Additional Options */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-gray-600 text-center mb-4">
              {isSignUp ? 'Already have an account?' : 'New to Veritas?'}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="ml-2 font-bold text-[#ff6b35] hover:text-[#ff8c42]"
              >
                {isSignUp ? 'Sign In' : 'Create Account'}
              </button>
            </p>

            <div className="grid grid-cols-3 gap-3 mt-6">
              <Link href="/agent-signup" className="block">
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-3 text-center hover:shadow-md transition-shadow">
                  <div className="bg-emerald-100 p-2 rounded-lg inline-block mb-2">
                    <Briefcase className="h-5 w-5 text-emerald-600" />
                  </div>
                  <p className="text-xs font-semibold text-gray-900">Become Agent</p>
                </div>
              </Link>
              <Link href="/manager-signup" className="block">
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-3 text-center hover:shadow-md transition-shadow">
                  <div className="bg-purple-100 p-2 rounded-lg inline-block mb-2">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <p className="text-xs font-semibold text-gray-900">Become Manager</p>
                </div>
              </Link>
              <Link href="/careers" className="block">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-3 text-center hover:shadow-md transition-shadow">
                  <div className="bg-blue-100 p-2 rounded-lg inline-block mb-2">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-xs font-semibold text-gray-900">We're Hiring</p>
                </div>
              </Link>
            </div>
          </div>

          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-600 text-sm">
              By continuing, you agree to our{' '}
              <a href="#" className="text-[#ff6b35] font-semibold hover:underline">Terms</a>{' '}
              and{' '}
              <a href="#" className="text-[#ff6b35] font-semibold hover:underline">Privacy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b35] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}