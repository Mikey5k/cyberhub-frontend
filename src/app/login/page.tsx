"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Phone, Lock, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { getUserRole } from "@/lib/api";
import styles from "./login.module.css";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Check for redirect parameter
  const redirect = searchParams.get("redirect");

  useEffect(() => {
    // Check for existing phone in localStorage or sessionStorage
    const savedPhone = localStorage.getItem("cyberhub_phone") || sessionStorage.getItem("cyberhub_phone");
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

    try {
      // Format phone to E.164
      const formattedPhone = phone.startsWith("+") ? phone : `+${phone.replace(/\D/g, "")}`;

      // Get user role from API
      const roleData = await getUserRole(formattedPhone);

      // Store phone for future use
      localStorage.setItem("cyberhub_phone", formattedPhone);
      localStorage.setItem("cyberhub_role", roleData.role);

      setSuccess(`Welcome! Redirecting to ${roleData.role} dashboard...`);

      // Redirect based on role
      setTimeout(() => {
        switch (roleData.role) {
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
            if (redirect) {
              router.push(redirect);
            } else {
              router.push("/services");
            }
            break;
          default:
            router.push("/");
        }
      }, 1500);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Failed to login. Please check your phone number.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleRedirect = (role: string) => {
    switch (role) {
      case "user":
        router.push("/signup");
        break;
      case "worker":
        router.push("/agent-signup");
        break;
      case "manager":
        router.push("/manager-signup");
        break;
      default:
        router.push("/");
    }
  };

  return (
    <div className={styles.container}>
      {/* Left side - Form */}
      <div className={styles.formSection}>
        <div className={styles.logo}>
          <Image
            src="/logo.png"
            alt="CyberHub Logo"
            width={60}
            height={60}
            priority
          />
          <h1>CyberHub</h1>
          <p className={styles.tagline}>Access Your Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.error}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className={styles.success}>
              <CheckCircle size={18} />
              <span>{success}</span>
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="phone" className={styles.label}>
              <Phone size={18} />
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+254712345678"
              className={styles.input}
              required
              disabled={loading}
            />
            <p className={styles.helperText}>
              Enter the phone number registered with CyberHub
            </p>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? (
              <div className={styles.spinner}></div>
            ) : (
              <>
                Sign In <ArrowRight size={18} />
              </>
            )}
          </button>

          <div className={styles.divider}>
            <span>New to CyberHub?</span>
          </div>

          <div className={styles.roleButtons}>
            <button
              type="button"
              onClick={() => handleRoleRedirect("user")}
              className={`${styles.roleButton} ${styles.userButton}`}
            >
              <div className={styles.roleIcon}>👤</div>
              <div className={styles.roleContent}>
                <h3>Client</h3>
                <p>Get services done</p>
              </div>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => handleRoleRedirect("worker")}
              className={`${styles.roleButton} ${styles.workerButton}`}
            >
              <div className={styles.roleIcon}>🛠️</div>
              <div className={styles.roleContent}>
                <h3>Agent</h3>
                <p>Earn commissions</p>
              </div>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => handleRoleRedirect("manager")}
              className={`${styles.roleButton} ${styles.managerButton}`}
            >
              <div className={styles.roleIcon}>👔</div>
              <div className={styles.roleContent}>
                <h3>Manager</h3>
                <p>Lead a team</p>
              </div>
              <ArrowRight size={16} />
            </button>
          </div>

          <p className={styles.disclaimer}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </form>
      </div>

      {/* Right side - Hero */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <Lock size={20} />
            <span>Secure Login</span>
          </div>
          <h2 className={styles.heroTitle}>
            Access Your
            <span className={styles.heroHighlight}> Digital Services</span>
            Hub
          </h2>
          <p className={styles.heroDescription}>
            Manage your KRA services, track agent progress, oversee your team,
            or get administrative access—all in one secure dashboard.
          </p>

          <div className={styles.features}>
            <div className={styles.feature}>
              <CheckCircle size={20} className={styles.featureIcon} />
              <span>Phone-based authentication</span>
            </div>
            <div className={styles.feature}>
              <CheckCircle size={20} className={styles.featureIcon} />
              <span>Real-time WhatsApp updates</span>
            </div>
            <div className={styles.feature}>
              <CheckCircle size={20} className={styles.featureIcon} />
              <span>Role-specific dashboards</span>
            </div>
            <div className={styles.feature}>
              <CheckCircle size={20} className={styles.featureIcon} />
              <span>Secure commission tracking</span>
            </div>
          </div>

          <div className={styles.testCredentials}>
            <h4>Test Credentials:</h4>
            <div className={styles.credentialsGrid}>
              <div className={styles.credential}>
                <span className={styles.credentialRole}>Admin:</span>
                <code>+254733445566</code>
              </div>
              <div className={styles.credential}>
                <span className={styles.credentialRole}>Manager:</span>
                <code>+254715554444</code>
              </div>
              <div className={styles.credential}>
                <span className={styles.credentialRole}>Agent:</span>
                <code>+254722334455</code>
              </div>
              <div className={styles.credential}>
                <span className={styles.credentialRole}>User:</span>
                <code>+254712345678</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.formSection}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b35] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading login...</p>
          </div>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}