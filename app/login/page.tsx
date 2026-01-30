"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// Create a separate component that uses useSearchParams
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // FIX: Use both callbackUrl AND redirect parameters for compatibility
  const callbackUrl = searchParams.get("callbackUrl") || searchParams.get("redirect") || "/";

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (result.success) {
        // Store in BOTH localStorage AND sessionStorage for compatibility
        localStorage.setItem('cyberhub_token', result.token);
        localStorage.setItem('cyberhub_user', JSON.stringify(result.user));
        localStorage.setItem('cyberhub_role', result.user.role);
        localStorage.setItem('cyberhub_email', result.user.email);
        localStorage.setItem('cyberhub_phone', result.user.phone || '');
        
        // Also store in sessionStorage
        sessionStorage.setItem('cyberhub_token', result.token);
        sessionStorage.setItem('cyberhub_user', JSON.stringify(result.user));
        sessionStorage.setItem('cyberhub_role', result.user.role);
        sessionStorage.setItem('cyberhub_email', result.user.email);
        sessionStorage.setItem('cyberhub_phone', result.user.phone || '');
        
        console.log('Login successful, redirecting to:', callbackUrl);
        router.push(callbackUrl);
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          name, 
          phone: phone || undefined,
          role: 'user'
        })
      });

      const result = await response.json();

      if (result.success) {
        // Store in BOTH localStorage AND sessionStorage for compatibility
        localStorage.setItem('cyberhub_token', result.token);
        localStorage.setItem('cyberhub_user', JSON.stringify(result.user));
        localStorage.setItem('cyberhub_role', result.user.role);
        localStorage.setItem('cyberhub_email', result.user.email);
        localStorage.setItem('cyberhub_phone', result.user.phone || '');
        
        // Also store in sessionStorage
        sessionStorage.setItem('cyberhub_token', result.token);
        sessionStorage.setItem('cyberhub_user', JSON.stringify(result.user));
        sessionStorage.setItem('cyberhub_role', result.user.role);
        sessionStorage.setItem('cyberhub_email', result.user.email);
        sessionStorage.setItem('cyberhub_phone', result.user.phone || '');
        
        console.log('Signup successful, redirecting to:', callbackUrl);
        router.push(callbackUrl);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Pass both callbackUrl and redirect parameters for maximum compatibility
    const redirectUrl = callbackUrl;
    signIn("google", { 
      callbackUrl: redirectUrl,
      redirect: true 
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl font-bold text-white">V</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Veritas CyberHub</h1>
          <p className="text-blue-200">Premium digital services platform</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl">
          <div className="flex mb-6">
            <button
              onClick={() => setActiveTab("signin")}
              className={`flex-1 py-3 text-center font-semibold rounded-l-xl transition-all ${
                activeTab === "signin"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                  : "bg-white/10 text-blue-200 hover:bg-white/20"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`flex-1 py-3 text-center font-semibold rounded-r-xl transition-all ${
                activeTab === "signup"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                  : "bg-white/10 text-blue-200 hover:bg-white/20"
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg">
              <p className="text-red-200 text-center text-sm">{error}</p>
            </div>
          )}

          <div className="mb-6">
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 hover:bg-gray-100 font-medium py-3 px-4 rounded-xl transition duration-200 mb-4"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/10 text-blue-200">Or continue with email</span>
              </div>
            </div>
          </div>

          {activeTab === "signin" ? (
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-blue-200 mb-1">Email Address</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-blue-200 mb-1">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing In...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div>
                <label htmlFor="signup-name" className="block text-sm font-medium text-blue-200 mb-1">Full Name</label>
                <input
                  id="signup-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-blue-200 mb-1">Email Address</label>
                <input
                  id="signup-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="signup-phone" className="block text-sm font-medium text-blue-200 mb-1">Phone Number (Optional)</label>
                <input
                  id="signup-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="+254 712 345 678"
                />
              </div>

              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-blue-200 mb-1">Password</label>
                <input
                  id="signup-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-white/20">
            <p className="text-center text-blue-200 text-xs">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="text-orange-400 hover:text-orange-300">Terms of Service</Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-orange-400 hover:text-orange-300">Privacy Policy</Link>
            </p>
            <div className="text-center mt-4">
              <p className="text-blue-300 text-sm">
                Need help?{" "}
                <a
                  href="https://wa.me/254708949580"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-400 hover:text-orange-300 font-medium"
                >
                  WhatsApp Support
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-800/30 border border-blue-700/50 rounded-xl">
          <p className="text-blue-200 text-sm text-center">
            <span className="font-semibold">Production Ready:</span> Email authentication stores users in Firestore database.
          </p>
        </div>
      </div>
    </div>
  );
}

// Loading fallback component
function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-4 animate-pulse">
          <span className="text-3xl font-bold text-white">V</span>
        </div>
        <p className="text-white text-lg">Loading login...</p>
      </div>
    </div>
  );
}

// Main component with Suspense wrapper
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent />
    </Suspense>
  );
}