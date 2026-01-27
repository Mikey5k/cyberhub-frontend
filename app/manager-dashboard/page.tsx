"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePhoneAuth } from "@/hooks/use-phone-auth";
import { 
  getTeamAgents, 
  getTeamTasks, 
} from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { 
  BarChart3, Users, TrendingUp, Wallet, Shield, 
  Briefcase, Home, Settings, Bell, Search, Filter,
  ChevronRight, MoreVertical, Download, Eye,
  Calendar, Clock, CheckCircle, XCircle, AlertCircle,
  MessageSquare, UserPlus, Package, CreditCard, PieChart,
  Target, Zap, Star, Award, Crown, ChartBar, Activity,
  ClipboardCheck, Plus, Phone, Mail, CheckSquare, Square
} from 'lucide-react';

interface Agent {
  id: string;
  phone: string;
  name: string;
  status: "pending" | "active" | "suspended";
  totalEarnings: number;
  completedTasks: number;
  joinedAt: string;
}

interface TeamTask {
  id: string;
  title: string;
  agentPhone: string;
  agentName: string;
  price: number;
  status: string;
  completedAt?: string;
}

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  requirements: string[];
  status: "active" | "pending_approval";
}

interface SupportRequest {
  id: string;
  userPhone: string;
  issue: string;
  status: "open" | "resolved";
  createdAt: string;
}

// NEW: Manager Application interface
interface ManagerApplication {
  id: string;
  name: string;
  phone: string;
  paymentVerified: boolean;
  hardwareChecks: {
    hasComputer: boolean;
    hasInternet: boolean;
    canUseWhatsAppWeb: boolean;
    willingToLeadAgents: boolean;
    canCommitHours: boolean;
    availability: boolean;
  };
  status: "pending" | "approved" | "rejected";
  appliedAt: string;
  paymentDate?: string;
}

const MANAGER_COMMISSION_RATE = 0.10;

// Helper functions for recruitment
const getManagerLevel = (agentCount: number): string => {
  if (agentCount >= 500) return "Chief Manager";
  if (agentCount >= 100) return "Senior Manager";
  return "Manager";
};

const calculateTeamEarnings = (agentCount: number): number => {
  const basePerAgent = 5000; // Estimated monthly earnings per agent
  return agentCount * basePerAgent;
};

const calculateDaysRemaining = (): number => {
  const startDate = new Date();
  const deadline = new Date(startDate.getTime() + (45 * 24 * 60 * 60 * 1000)); // 45 days
  const today = new Date();
  return Math.max(0, Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
};

// NEW: Function to generate WhatsApp link for manager applicants
const generateWhatsAppLink = (phone: string, name: string, status: "approved" | "rejected") => {
  const message = status === "approved" 
    ? `Hi ${name}! Congratulations! Your manager application has been APPROVED. Welcome to CyberHub Manager Team! Please login with your phone number to access your dashboard.`
    : `Hi ${name}! We appreciate your application. Unfortunately, your manager application has been REJECTED at this time. However, you still get access to our remote job boards for 1 year as per your subscription.`;
  
  const cleanedPhone = phone.replace(/\D/g, '');
  const formattedPhone = cleanedPhone.startsWith('0') ? `254${cleanedPhone.substring(1)}` : cleanedPhone;
  
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
};

export default function ManagerDashboard() {
  const router = useRouter();
  const { phone, role, loading, initializing } = usePhoneAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<TeamTask[]>([]);
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  // NEW: Manager applications state
  const [managerApplications, setManagerApplications] = useState<ManagerApplication[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [newService, setNewService] = useState({
    title: "",
    description: "",
    category: "",
    price: 0,
    requirements: [""]
  });
  const [recruitmentData, setRecruitmentData] = useState({
    pendingApplications: 3,
    referralCode: phone ? phone.slice(-6) : "CYBHUB",
    daysRemaining: calculateDaysRemaining(),
    managerRank: Math.floor(Math.random() * 50) + 1
  });

  // Stats calculations
  const totalTeamEarnings = tasks
    .filter(task => task.status === "completed")
    .reduce((sum, task) => sum + task.price, 0);

  const managerEarnings = tasks
    .filter(task => task.status === "completed")
    .reduce((sum, task) => sum + (task.price * MANAGER_COMMISSION_RATE), 0);

  const pendingAgents = agents.filter(a => a.status === "pending").length;
  const activeAgents = agents.filter(a => a.status === "active").length;
  const openSupportRequests = supportRequests.filter(r => r.status === "open").length;
  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const pendingTasks = tasks.filter(t => t.status === "in_progress" || t.status === "pending").length;
  const currentAgentsCount = agents.length;
  const recruitmentPercentage = Math.round((currentAgentsCount / 20) * 100);
  const currentPhase = currentAgentsCount < 10 ? 1 : currentAgentsCount < 20 ? 2 : 3;
  
  // NEW: Manager applications stats
  const pendingManagerApps = managerApplications.filter(app => app.status === "pending").length;
  const approvedManagerApps = managerApplications.filter(app => app.status === "approved").length;
  const rejectedManagerApps = managerApplications.filter(app => app.status === "rejected").length;

  useEffect(() => {
    // FIX: Allow both admin AND manager roles to access dashboard
    if (!initializing && !loading && (!phone || (role !== "admin" && role !== "manager"))) {
      router.push("/login");
      return;
    }

    if (!initializing && phone && (role === "admin" || role === "manager")) {
      loadDashboardData();
    }
  }, [phone, role, loading, initializing, router]);

  const loadDashboardData = async () => {
    try {
      // Mock data
      const mockAgents: Agent[] = [
        { id: "1", phone: "+254722334455", name: "John Agent", status: "active", totalEarnings: 15000, completedTasks: 12, joinedAt: "2024-01-15" },
        { id: "2", phone: "+254733556677", name: "Jane Worker", status: "pending", totalEarnings: 0, completedTasks: 0, joinedAt: "2024-02-01" },
        { id: "3", phone: "+254744667788", name: "Mike Assistant", status: "active", totalEarnings: 8500, completedTasks: 7, joinedAt: "2024-01-20" },
        { id: "4", phone: "+254755889900", name: "Sarah Expert", status: "active", totalEarnings: 12000, completedTasks: 9, joinedAt: "2024-01-25" },
        { id: "5", phone: "+254766990011", name: "David Specialist", status: "active", totalEarnings: 9500, completedTasks: 8, joinedAt: "2024-02-05" },
      ];

      const mockTasks: TeamTask[] = [
        { id: "1", title: "KRA PIN Registration", agentPhone: "+254722334455", agentName: "John Agent", price: 1500, status: "completed", completedAt: "2024-02-10" },
        { id: "2", title: "NTSA License Renewal", agentPhone: "+254722334455", agentName: "John Agent", price: 2500, status: "in_progress" },
        { id: "3", title: "University Application", agentPhone: "+254744667788", agentName: "Mike Assistant", price: 3000, status: "completed", completedAt: "2024-02-12" },
        { id: "4", title: "Business Registration", agentPhone: "+254755889900", agentName: "Sarah Expert", price: 5000, status: "completed", completedAt: "2024-02-14" },
      ];

      const mockServices: Service[] = [
        { id: "1", title: "KRA PIN Registration", description: "Apply for new KRA PIN", category: "E-Citizen", price: 1500, requirements: ["ID Copy", "Passport Photo"], status: "active" },
        { id: "2", title: "NTSA License Renewal", description: "Renew driving license", category: "E-Citizen", price: 2500, requirements: ["Old License", "ID Copy"], status: "active" },
        { id: "3", title: "University Applications", description: "KUCCPS and private university applications", category: "Education", price: 3000, requirements: ["KCSE Certificate", "ID Copy"], status: "active" },
      ];

      const mockSupport: SupportRequest[] = [
        { id: "1", userPhone: "+254711223344", issue: "Payment not reflecting", status: "open", createdAt: "2024-02-10" },
        { id: "2", userPhone: "+254722334455", issue: "Service delay query", status: "resolved", createdAt: "2024-02-08" },
      ];
      
      // NEW: Mock manager applications data
      const mockManagerApps: ManagerApplication[] = [
        {
          id: "1",
          name: "John Doe",
          phone: "+254712345678",
          paymentVerified: true,
          hardwareChecks: {
            hasComputer: true,
            hasInternet: true,
            canUseWhatsAppWeb: true,
            willingToLeadAgents: true,
            canCommitHours: true,
            availability: true
          },
          status: "pending",
          appliedAt: "2024-02-15",
          paymentDate: "2024-02-15"
        },
        {
          id: "2",
          name: "Jane Smith",
          phone: "+254723456789",
          paymentVerified: true,
          hardwareChecks: {
            hasComputer: true,
            hasInternet: true,
            canUseWhatsAppWeb: true,
            willingToLeadAgents: true,
            canCommitHours: true,
            availability: true
          },
          status: "approved",
          appliedAt: "2024-02-14",
          paymentDate: "2024-02-14"
        }
      ];

      setAgents(mockAgents);
      setTasks(mockTasks);
      setServices(mockServices);
      setSupportRequests(mockSupport);
      setManagerApplications(mockManagerApps); // NEW: Set manager applications
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    }
  };

  const handleApproveAgent = async (agentId: string) => {
    try {
      console.log("Approve agent:", agentId);
      // Mock approval
      setAgents(prev => prev.map(agent => 
        agent.id === agentId ? { ...agent, status: "active" } : agent
      ));
    } catch (error) {
      console.error("Failed to approve agent:", error);
    }
  };
  
  // NEW: Handle approve manager application
  const handleApproveManager = async (applicationId: string) => {
    try {
      const app = managerApplications.find(a => a.id === applicationId);
      if (!app) return;
      
      // Generate WhatsApp link for approval notification
      const whatsappLink = generateWhatsAppLink(app.phone, app.name, "approved");
      window.open(whatsappLink, '_blank');
      
      // Update status
      setManagerApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status: "approved" } : app
      ));
      
      alert(`Approved manager application for ${app.name}. WhatsApp notification sent.`);
    } catch (error) {
      console.error("Failed to approve manager:", error);
    }
  };
  
  // NEW: Handle reject manager application
  const handleRejectManager = async (applicationId: string) => {
    try {
      const app = managerApplications.find(a => a.id === applicationId);
      if (!app) return;
      
      // Generate WhatsApp link for rejection notification
      const whatsappLink = generateWhatsAppLink(app.phone, app.name, "rejected");
      window.open(whatsappLink, '_blank');
      
      // Update status
      setManagerApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status: "rejected" } : app
      ));
      
      alert(`Rejected manager application for ${app.name}. WhatsApp notification sent.`);
    } catch (error) {
      console.error("Failed to reject manager:", error);
    }
  };

  const handleAddService = async () => {
    try {
      console.log("Add service:", newService);
      // Mock add service
      const newServiceObj: Service = {
        id: Date.now().toString(),
        ...newService,
        status: "pending_approval"
      };
      setServices(prev => [...prev, newServiceObj]);
      setNewService({ title: "", description: "", category: "", price: 0, requirements: [""] });
      setActiveTab("services");
    } catch (error) {
      console.error("Failed to add service:", error);
    }
  };

  const handleCopyReferralLink = () => {
    const link = `https://cyberhub-frontend.vercel.app/agent-signup?ref=${recruitmentData.referralCode}&manager=${phone}`;
    navigator.clipboard.writeText(link);
    alert("Referral link copied to clipboard!");
  };

  const handleGenerateWhatsAppInvite = () => {
    const message = `Join CyberHub as an agent under my team! Use my referral link: https://cyberhub-frontend.vercel.app/agent-signup?ref=${recruitmentData.referralCode}&manager=${phone}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading || initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b35] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading premium dashboard...</p>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: <BarChart3 className="h-5 w-5" /> },
    { id: "recruitment", label: "Recruitment Hub", icon: <Target className="h-5 w-5" /> },
    { id: "agents", label: "Team Agents", icon: <Users className="h-5 w-5" /> },
    { id: "services", label: "Services", icon: <Package className="h-5 w-5" /> },
    { id: "earnings", label: "Earnings", icon: <Wallet className="h-5 w-5" /> },
    { id: "support", label: "Support", icon: <MessageSquare className="h-5 w-5" /> },
    { id: "analytics", label: "Analytics", icon: <TrendingUp className="h-5 w-5" /> },
    // NEW: Manager Applications tab (only for admin)
    ...(role === "admin" ? [{ id: "manager-apps", label: "Manager Applications", icon: <ClipboardCheck className="h-5 w-5" /> }] : []),
    { id: "settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
  ];

  // NEW: Display role-appropriate title
  const userTitle = role === "admin" ? "Super Admin" : "Manager";
  const userRoleDisplay = role === "admin" ? "Super Admin" : "Manager";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                <div className="h-5 w-5">
                  {sidebarOpen ? "←" : "→"}
                </div>
              </button>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-[#ff6b35] to-[#ffa500] p-2.5 rounded-xl shadow-lg">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-gray-900">{userTitle} Hub</h1>
                  <p className="text-sm text-gray-600">Premium analytics & team management</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search dashboard..."
                  className="pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-[#ff6b35] focus:bg-white w-64"
                />
              </div>
              
              <button className="relative p-2 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 hover:from-blue-100 hover:to-blue-200">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              
              <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                <div className="h-9 w-9 bg-gradient-to-r from-[#ff6b35] to-[#ffa500] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{userRoleDisplay.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{userRoleDisplay}</p>
                  <p className="text-xs text-gray-600">{phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Modern Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 bg-white/90 backdrop-blur-sm border-r border-gray-200/50 min-h-[calc(100vh-80px)] sticky top-20">
            <div className="p-6">
              <div className="mb-8">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Dashboard</h3>
                <nav className="space-y-2">
                  {sidebarItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        activeTab === item.id
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                      {activeTab === item.id && (
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      )}
                    </button>
                  ))}
                </nav>
              </div>
              
              <div className="mt-12 p-4 bg-gradient-to-r from-[#ff6b35]/10 to-[#ffa500]/10 rounded-2xl border border-[#ff6b35]/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-r from-[#ff6b35] to-[#ffa500] rounded-lg">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Withdrawal Schedule</p>
                    <p className="text-xs text-gray-600">Wed & Sun</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600">Next: Wednesday</p>
              </div>

              {/* Recruitment Progress Mini */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900">Recruitment Progress</span>
                  <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {currentAgentsCount}/20
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                    style={{ width: `${recruitmentPercentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600">{recruitmentPercentage}% complete • {recruitmentData.daysRemaining} days left</p>
              </div>
              
              {/* NEW: Manager Applications Mini Stats (Admin only) */}
              {role === "admin" && pendingManagerApps > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-900">Manager Apps Pending</span>
                    <span className="text-xs font-bold bg-amber-500 text-white px-2 py-1 rounded-full">
                      {pendingManagerApps}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">Require review & WhatsApp notification</p>
                  <button
                    onClick={() => setActiveTab("manager-apps")}
                    className="w-full mt-3 text-xs font-semibold text-amber-700 hover:text-amber-800"
                  >
                    Review Now →
                  </button>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                      <Wallet className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 bg-green-100 text-green-700 rounded-full">+12%</span>
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-2">{formatCurrency(managerEarnings)}</h3>
                  <p className="text-gray-600">Your Earnings</p>
                  <div className="mt-4 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                </div>

                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-700 rounded-full">{activeAgents} active</span>
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-2">{activeAgents + pendingAgents}</h3>
                  <p className="text-gray-600">Team Agents</p>
                  <div className="mt-4 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                </div>

                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 bg-purple-100 text-purple-700 rounded-full">{completedTasks} done</span>
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-2">{completedTasks}</h3>
                  <p className="text-gray-600">Completed Tasks</p>
                  <div className="mt-4 h-2 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full"></div>
                </div>

                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                    {/* NEW: Show manager apps pending for admin, support requests for manager */}
                    {role === "admin" ? (
                      <span className="text-xs font-semibold px-3 py-1 bg-amber-100 text-amber-700 rounded-full">{pendingManagerApps} pending</span>
                    ) : (
                      <span className="text-xs font-semibold px-3 py-1 bg-amber-100 text-amber-700 rounded-full">{openSupportRequests} open</span>
                    )}
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-2">
                    {role === "admin" ? pendingManagerApps : openSupportRequests}
                  </h3>
                  <p className="text-gray-600">{role === "admin" ? "Manager Apps" : "Support Requests"}</p>
                  <div className="mt-4 h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></div>
                </div>
              </div>

              {/* Charts & Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Chart */}
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Performance Trends</h3>
                      <p className="text-gray-600">Last 30 days</p>
                    </div>
                    <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold">
                      View Details
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                        <span className="text-gray-700">Team Earnings</span>
                      </div>
                      <span className="font-bold text-gray-900">{formatCurrency(totalTeamEarnings)}</span>
                    </div>
                    <div className="h-2 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 rounded-full"></div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 bg-gradient-to-r from-[#ff6b35] to-[#ffa500] rounded-full"></div>
                        <span className="text-gray-700">Your Commission</span>
                      </div>
                      <span className="font-bold text-gray-900">{formatCurrency(managerEarnings)}</span>
                    </div>
                    <div className="h-2 bg-gradient-to-r from-[#ff6b35] via-[#ff8c42] to-[#ffa500] rounded-full"></div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
                      <p className="text-gray-600">Latest team actions</p>
                    </div>
                    <button className="px-4 py-2 bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white rounded-xl text-sm font-semibold hover:opacity-90">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {tasks.slice(0, 3).map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            task.status === "completed" 
                              ? "bg-green-100 text-green-600" 
                              : "bg-blue-100 text-blue-600"
                          }`}>
                            {task.status === "completed" ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{task.title}</p>
                            <p className="text-xs text-gray-500">by {task.agentName}</p>
                          </div>
                        </div>
                        <span className="font-bold text-gray-900">{formatCurrency(task.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab("recruitment")}
                    className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 text-left hover:from-blue-100 hover:to-blue-200 transition-all hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl group-hover:scale-110 transition-transform">
                        <Target className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Recruitment Hub</h4>
                        <p className="text-sm text-gray-600 mt-1">{currentAgentsCount}/20 agents hired</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab("agents")}
                    className="group p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl border border-emerald-200 text-left hover:from-green-100 hover:to-emerald-200 transition-all hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                        <UserPlus className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Approve Agents</h4>
                        <p className="text-sm text-gray-600 mt-1">{pendingAgents} waiting</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => role === "admin" ? setActiveTab("manager-apps") : setActiveTab("add-service")}
                    className="group p-6 bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl border border-amber-200 text-left hover:from-amber-100 hover:to-orange-200 transition-all hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl group-hover:scale-110 transition-transform">
                        {role === "admin" ? <ClipboardCheck className="h-6 w-6 text-white" /> : <Package className="h-6 w-6 text-white" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">
                          {role === "admin" ? "Review Manager Apps" : "Add Service"}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {role === "admin" ? `${pendingManagerApps} pending review` : "Expand offerings"}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Recruitment Hub Tab */}
          {activeTab === "recruitment" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Recruitment Hub</h2>
                    <p className="text-gray-600">Build and manage your agent team</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold rounded-full">
                      Manager Level: {getManagerLevel(currentAgentsCount)}
                    </span>
                  </div>
                </div>

                {/* Recruitment Progress Card */}
                <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">🎯 RECRUITMENT GOAL: 20 AGENTS</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-4xl font-black text-gray-900 mb-2">{currentAgentsCount}/20</div>
                      <p className="text-gray-700">Agents Hired</p>
                      <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                          style={{ width: `${recruitmentPercentage}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{recruitmentPercentage}% Complete</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-4xl font-black text-gray-900 mb-2">{recruitmentData.daysRemaining}</div>
                      <p className="text-gray-700">Days Remaining</p>
                      <div className="mt-2 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" 
                          style={{ width: `${Math.min(100, (100 - (recruitmentData.daysRemaining / 45) * 100))}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Deadline: {new Date(Date.now() + (recruitmentData.daysRemaining * 24 * 60 * 60 * 1000)).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-4xl font-black text-gray-900 mb-2">KES {formatCurrency(calculateTeamEarnings(currentAgentsCount))}</div>
                      <p className="text-gray-700">Current Team Earnings/Month</p>
                      <div className="mt-2 flex items-center justify-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-semibold text-green-600">+12% this month</span>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-4xl font-black text-gray-900 mb-2">KES {formatCurrency(calculateTeamEarnings(20))}</div>
                      <p className="text-gray-700">Projected at Full Team</p>
                      <div className="mt-2 flex items-center justify-center gap-2">
                        <Target className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-semibold text-blue-600">Potential growth</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Escalation Path */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl border border-gray-300">
                    <h4 className="font-bold text-gray-900 mb-3">📈 ESCALATION PATH:</h4>
                    <div className="flex items-center justify-between">
                      <div className={`text-center ${currentAgentsCount >= 20 ? 'opacity-100' : 'opacity-60'}`}>
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-2 ${currentAgentsCount >= 20 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-gray-300'}`}>
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <p className="font-semibold">Manager</p>
                        <p className="text-sm text-gray-600">20 agents</p>
                      </div>
                      
                      <div className="flex-1 h-1 bg-gray-300 mx-4"></div>
                      
                      <div className={`text-center ${currentAgentsCount >= 100 ? 'opacity-100' : 'opacity-60'}`}>
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-2 ${currentAgentsCount >= 100 ? 'bg-gradient-to-r from-purple-500 to-violet-500' : 'bg-gray-300'}`}>
                          <Award className="h-6 w-6 text-white" />
                        </div>
                        <p className="font-semibold">Senior Manager</p>
                        <p className="text-sm text-gray-600">100 agents</p>
                      </div>
                      
                      <div className="flex-1 h-1 bg-gray-300 mx-4"></div>
                      
                      <div className={`text-center ${currentAgentsCount >= 500 ? 'opacity-100' : 'opacity-60'}`}>
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-2 ${currentAgentsCount >= 500 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gray-300'}`}>
                          <Crown className="h-6 w-6 text-white" />
                        </div>
                        <p className="font-semibold">Chief Manager</p>
                        <p className="text-sm text-gray-600">500 agents</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recruitment Tools Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                        <UserPlus className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Share Recruitment Link</h3>
                        <p className="text-gray-600">Invite agents to join your team</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                        <p className="text-sm text-gray-700 mb-2">Your unique referral link:</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 px-3 py-2 bg-white rounded-lg border border-gray-300 text-sm font-mono truncate">
                            https://cyberhub-frontend.vercel.app/agent-signup?ref={recruitmentData.referralCode}&manager={phone}
                          </code>
                          <button 
                            onClick={handleCopyReferralLink}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold rounded-lg hover:opacity-90"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                      
                      <button 
                        onClick={handleGenerateWhatsAppInvite}
                        className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:opacity-90"
                      >
                        <UserPlus className="h-5 w-5 inline mr-2" />
                        Generate WhatsApp Invite
                      </button>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
                        <ClipboardCheck className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Track Applications</h3>
                        <p className="text-gray-600">Review pending agent applications</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl border border-amber-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-gray-900">Pending Applications</p>
                          <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                            {recruitmentData.pendingApplications}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">Review and approve new agent requests</p>
                      </div>
                      
                      <div className="space-y-3">
                        {[...Array(recruitmentData.pendingApplications)].map((_, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">Applicant #{i + 1}</p>
                              <p className="text-xs text-gray-600">Applied {i + 2} days ago</p>
                            </div>
                            <div className="flex gap-2">
                              <button className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-lg hover:opacity-90">
                                Approve
                              </button>
                              <button className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-semibold rounded-lg hover:opacity-90">
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team Performance Preview */}
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Team Performance Preview</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-gray-900">Current Team Size</span>
                        <span className="text-2xl font-black text-blue-600">{currentAgentsCount}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-gray-600">Target: 20 agents</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-gray-900">Monthly Earnings</span>
                        <span className="text-2xl font-black text-green-600">KES {formatCurrency(calculateTeamEarnings(currentAgentsCount))}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600">At full team: KES {formatCurrency(calculateTeamEarnings(20))}</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-gray-900">Manager Rank</span>
                        <span className="text-2xl font-black text-purple-600">#{recruitmentData.managerRank}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChartBar className="h-4 w-4 text-purple-500" />
                        <span className="text-sm text-gray-600">Among all managers</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Phase-based Access */}
                  <div className="mt-8 p-6 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl border border-gray-300">
                    <h4 className="font-bold text-gray-900 mb-4">Phase-based Access System</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className={`p-4 rounded-xl border-2 ${currentPhase === 1 ? 'border-blue-300 bg-blue-50' : 'border-gray-300 bg-gray-100'}`}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${currentPhase === 1 ? 'bg-blue-500' : 'bg-gray-400'}`}>
                            <span className="text-white font-bold">1</span>
                          </div>
                          <span className="font-semibold">Phase 1: Basic</span>
                        </div>
                        <p className="text-sm text-gray-600">0-10 agents: Limited analytics</p>
                        <div className="mt-2 text-xs font-medium">
                          {currentPhase === 1 ? '🔓 Current Phase' : '✓ Completed'}
                        </div>
                      </div>
                      
                      <div className={`p-4 rounded-xl border-2 ${currentPhase === 2 ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-100'}`}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${currentPhase === 2 ? 'bg-green-500' : 'bg-gray-400'}`}>
                            <span className="text-white font-bold">2</span>
                          </div>
                          <span className="font-semibold">Phase 2: Advanced</span>
                        </div>
                        <p className="text-sm text-gray-600">11-19 agents: More features</p>
                        <div className="mt-2 text-xs font-medium">
                          {currentPhase === 2 ? '🔓 Current Phase' : currentPhase > 2 ? '✓ Completed' : '🔒 Locked'}
                        </div>
                      </div>
                      
                      <div className={`p-4 rounded-xl border-2 ${currentPhase === 3 ? 'border-amber-300 bg-amber-50' : 'border-gray-300 bg-gray-100'}`}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${currentPhase === 3 ? 'bg-amber-500' : 'bg-gray-400'}`}>
                            <span className="text-white font-bold">3</span>
                          </div>
                          <span className="font-semibold">Phase 3: Full Access</span>
                        </div>
                        <p className="text-sm text-gray-600">20+ agents: All features</p>
                        <div className="mt-2 text-xs font-medium">
                          {currentPhase === 3 ? '🔓 Current Phase' : '🔒 Locked'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Agents Tab */}
          {activeTab === "agents" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Team Management</h2>
                    <p className="text-gray-600">Manage your team agents and performance</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab("recruitment")}
                    className="px-6 py-3 bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white font-semibold rounded-xl hover:opacity-90"
                  >
                    <UserPlus className="h-5 w-5 inline mr-2" />
                    Recruit Agent
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-xl">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-3xl font-black text-gray-900">{activeAgents}</p>
                        <p className="text-gray-600">Active Agents</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-6 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-xl">
                        <Clock className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-3xl font-black text-gray-900">{pendingAgents}</p>
                        <p className="text-gray-600">Pending Approval</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-xl">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-3xl font-black text-gray-900">{completedTasks}</p>
                        <p className="text-gray-600">Team Completions</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-gray-200">
                  <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Agent</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Earnings</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tasks</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {agents.map((agent) => (
                        <tr key={agent.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                                {agent.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">{agent.name}</p>
                                <p className="text-sm text-gray-600">{agent.phone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
                              agent.status === "active"
                                ? "bg-green-100 text-green-700"
                                : agent.status === "pending"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                            }`}>
                              {agent.status === "active" && <CheckCircle className="h-3 w-3" />}
                              {agent.status === "pending" && <Clock className="h-3 w-3" />}
                              {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-gray-900">{formatCurrency(agent.totalEarnings)}</p>
                            <p className="text-xs text-gray-600">Total earned</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                                  style={{ width: `${Math.min(100, (agent.completedTasks / 20) * 100)}%` }}
                                ></div>
                              </div>
                              <span className="font-semibold text-gray-900">{agent.completedTasks}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {agent.status === "pending" && (
                                <button
                                  onClick={() => handleApproveAgent(agent.id)}
                                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-lg hover:opacity-90"
                                >
                                  Approve
                                </button>
                              )}
                              <button className="p-2 text-gray-600 hover:text-gray-900">
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Services Tab */}
          {activeTab === "services" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Service Catalog</h2>
                    <p className="text-gray-600">Manage and add new service offerings</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("add-service")}
                    className="px-6 py-3 bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white font-semibold rounded-xl hover:opacity-90"
                  >
                    <Package className="h-5 w-5 inline mr-2" />
                    Add New Service
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <div key={service.id} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                          <Package className="h-6 w-6 text-white" />
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          service.status === "active" 
                            ? "bg-green-100 text-green-700" 
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {service.status === "active" ? "Active" : "Pending"}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{service.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Price</span>
                          <span className="font-bold text-gray-900">{formatCurrency(service.price)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Category</span>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                            {service.category}
                          </span>
                        </div>
                        <div className="pt-4 border-t border-gray-200">
                          <p className="text-sm font-semibold text-gray-900 mb-2">Requirements:</p>
                          <div className="flex flex-wrap gap-2">
                            {service.requirements.map((req, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {req}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Add Service Form */}
          {activeTab === "add-service" && (
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 border border-gray-200/50 shadow-lg max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-gradient-to-r from-[#ff6b35] to-[#ffa500] rounded-xl">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Add New Service</h2>
                  <p className="text-gray-600">Create new service offerings for your team</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Service Title
                    </label>
                    <input
                      type="text"
                      value={newService.title}
                      onChange={(e) => setNewService({...newService, title: e.target.value})}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                      placeholder="e.g., KRA PIN Registration"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Category
                    </label>
                    <select
                      value={newService.category}
                      onChange={(e) => setNewService({...newService, category: e.target.value})}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                    >
                      <option value="">Select Category</option>
                      <option value="E-Citizen">E-Citizen</option>
                      <option value="Education">Education</option>
                      <option value="Employment">Employment</option>
                      <option value="Lifestyle">Lifestyle</option>
                      <option value="Training">Training</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newService.description}
                    onChange={(e) => setNewService({...newService, description: e.target.value})}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                    rows={3}
                    placeholder="Describe the service in detail..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Price (KES)
                    </label>
                    <input
                      type="number"
                      value={newService.price || ""}
                      onChange={(e) => setNewService({...newService, price: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                      placeholder="1500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Status
                    </label>
                    <div className="px-4 py-3 bg-gray-100 rounded-xl">
                      <span className="text-amber-600 font-semibold">Pending Super Admin Approval</span>
                      <p className="text-xs text-gray-600 mt-1">New services require final approval</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Requirements (one per line)
                  </label>
                  <textarea
                    value={newService.requirements.join("\n")}
                    onChange={(e) => setNewService({
                      ...newService,
                      requirements: e.target.value.split("\n").filter(r => r.trim())
                    })}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                    rows={4}
                    placeholder="ID Copy\nPassport Photo\n..."
                  />
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setActiveTab("services")}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddService}
                    className="px-8 py-3 bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white font-semibold rounded-xl hover:opacity-90"
                  >
                    Submit for Approval
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Support Tab */}
          {activeTab === "support" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Support Center</h2>
                    <p className="text-gray-600">Handle customer and agent support requests</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:opacity-90">
                      <MessageSquare className="h-5 w-5 inline mr-2" />
                      Bulk Actions
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-6 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-xl">
                        <AlertCircle className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-3xl font-black text-gray-900">{openSupportRequests}</p>
                        <p className="text-gray-600">Open Requests</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-xl">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-3xl font-black text-gray-900">
                          {supportRequests.length - openSupportRequests}
                        </p>
                        <p className="text-gray-600">Resolved</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-xl">
                        <Clock className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-3xl font-black text-gray-900">24h</p>
                        <p className="text-gray-600">Avg. Response Time</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {supportRequests.map((request) => (
                    <div key={request.id} className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-[#ff6b35]/30 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                              {request.userPhone.slice(-2)}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{request.userPhone}</p>
                              <p className="text-sm text-gray-600">{formatDate(request.createdAt)}</p>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-4">{request.issue}</p>
                        </div>
                        <div className="ml-4">
                          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                            request.status === "open"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-green-100 text-green-700"
                          }`}>
                            {request.status === "open" ? <AlertCircle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                            {request.status === "open" ? "Open" : "Resolved"}
                          </span>
                        </div>
                      </div>
                      {request.status === "open" && (
                        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                          <button className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50">
                            Mark as Resolved
                          </button>
                          <button className="px-5 py-2.5 bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white font-semibold rounded-xl hover:opacity-90">
                            Contact User
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Earnings Tab */}
          {activeTab === "earnings" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Earnings Dashboard</h2>
                    <p className="text-gray-600">Track your commissions and team performance</p>
                  </div>
                  <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:opacity-90">
                    <Download className="h-5 w-5 inline mr-2" />
                    Export Report
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-8 rounded-2xl text-white">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-white/20 rounded-xl">
                        <Wallet className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm opacity-90">Your Earnings</p>
                        <p className="text-3xl font-black">{formatCurrency(managerEarnings)}</p>
                      </div>
                    </div>
                    <p className="text-sm opacity-90">10% commission on team earnings</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-8 rounded-2xl text-white">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-white/20 rounded-xl">
                        <TrendingUp className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm opacity-90">Team Earnings</p>
                        <p className="text-3xl font-black">{formatCurrency(totalTeamEarnings)}</p>
                      </div>
                    </div>
                    <p className="text-sm opacity-90">Total revenue generated by team</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500 to-violet-500 p-8 rounded-2xl text-white">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-white/20 rounded-xl">
                        <Target className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm opacity-90">Next Withdrawal</p>
                        <p className="text-3xl font-black">Wednesday</p>
                      </div>
                    </div>
                    <p className="text-sm opacity-90">Processing days: Wed & Sun</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Earnings Breakdown</h3>
                  <div className="space-y-4">
                    {tasks.filter(t => t.status === "completed").map((task) => {
                      const agentEarnings = task.price * 0.30; // Agent gets 30%
                      const managerEarning = agentEarnings * 0.10; // Manager gets 10% of agent earnings
                      
                      return (
                        <div key={task.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                              <CreditCard className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{task.title}</p>
                              <p className="text-sm text-gray-600">Completed by {task.agentName}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{formatCurrency(managerEarning)}</p>
                            <p className="text-sm text-gray-600">Your commission</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Analytics Hub</h2>
                    <p className="text-gray-600">Deep insights into team performance and trends</p>
                  </div>
                  <select className="px-4 py-2 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-2xl border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Performance Metrics</h3>
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-700">Task Completion Rate</span>
                          <span className="font-bold text-gray-900">92%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-700">Agent Satisfaction</span>
                          <span className="font-bold text-gray-900">88%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: '88%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-700">Revenue Growth</span>
                          <span className="font-bold text-gray-900">+24%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#ff6b35] to-[#ffa500] rounded-full" style={{ width: '24%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Top Performing Agents</h3>
                    <div className="space-y-4">
                      {agents.sort((a, b) => b.totalEarnings - a.totalEarnings).map((agent, index) => (
                        <div key={agent.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-bold ${
                              index === 0 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                              index === 1 ? 'bg-gradient-to-r from-gray-500 to-gray-700' :
                              index === 2 ? 'bg-gradient-to-r from-amber-700 to-amber-900' :
                              'bg-gradient-to-r from-blue-500 to-cyan-500'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{agent.name}</p>
                              <p className="text-xs text-gray-600">{agent.completedTasks} tasks</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{formatCurrency(agent.totalEarnings)}</p>
                            <p className="text-xs text-gray-600">Earnings</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NEW: Manager Applications Tab (Admin only) */}
          {activeTab === "manager-apps" && role === "admin" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Manager Applications</h2>
                    <p className="text-gray-600">Review and approve new manager applicants</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-full">
                      {pendingManagerApps} Pending Review
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-6 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-xl">
                        <Clock className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-3xl font-black text-gray-900">{pendingManagerApps}</p>
                        <p className="text-gray-600">Pending</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-xl">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-3xl font-black text-gray-900">{approvedManagerApps}</p>
                        <p className="text-gray-600">Approved</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-xl">
                        <XCircle className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <p className="text-3xl font-black text-gray-900">{rejectedManagerApps}</p>
                        <p className="text-gray-600">Rejected</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-900">Application Review Process</h3>
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
                    <h4 className="font-bold text-gray-900 mb-4">📋 REVIEW CHECKLIST:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <CheckSquare className="h-5 w-5 text-green-500" />
                        <span className="text-gray-700">Payment verified (Equilar Atieno + Ksh 100)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckSquare className="h-5 w-5 text-green-500" />
                        <span className="text-gray-700">All 6 hardware checkboxes checked</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckSquare className="h-5 w-5 text-green-500" />
                        <span className="text-gray-700">Payment within last 24 hours</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckSquare className="h-5 w-5 text-green-500" />
                        <span className="text-gray-700">WhatsApp notification sent on action</span>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-gray-600">
                      <strong>Note:</strong> Clicking Approve/Reject will automatically send a WhatsApp message to the applicant.
                      Approved applicants get manager account access. Rejected applicants still get 1-year job board access.
                    </p>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-gray-200">
                    <table className="min-w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Applicant</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Phone</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Payment Status</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Applied On</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {managerApplications.map((app) => (
                          <tr key={app.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                                  {app.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900">{app.name}</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {Object.entries(app.hardwareChecks).map(([key, value]) => (
                                      <span key={key} className={`text-xs px-2 py-0.5 rounded-full ${
                                        value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                      }`}>
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-500" />
                                <a 
                                  href={`tel:${app.phone}`}
                                  className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  {app.phone}
                                </a>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
                                app.paymentVerified
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}>
                                {app.paymentVerified ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                {app.paymentVerified ? "Verified" : "Not Verified"}
                              </span>
                              {app.paymentDate && (
                                <p className="text-xs text-gray-600 mt-1">{formatDate(app.paymentDate)}</p>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-medium text-gray-900">{formatDate(app.appliedAt)}</p>
                              <p className="text-xs text-gray-600">
                                {Math.floor((new Date().getTime() - new Date(app.appliedAt).getTime()) / (1000 * 60 * 60 * 24))} days ago
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
                                app.status === "approved"
                                  ? "bg-green-100 text-green-700"
                                  : app.status === "pending"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-red-100 text-red-700"
                              }`}>
                                {app.status === "approved" && <CheckCircle className="h-3 w-3" />}
                                {app.status === "pending" && <Clock className="h-3 w-3" />}
                                {app.status === "rejected" && <XCircle className="h-3 w-3" />}
                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {app.status === "pending" ? (
                                  <>
                                    <button
                                      onClick={() => handleApproveManager(app.id)}
                                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-lg hover:opacity-90"
                                    >
                                      Approve & Notify
                                    </button>
                                    <button
                                      onClick={() => handleRejectManager(app.id)}
                                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-semibold rounded-lg hover:opacity-90"
                                    >
                                      Reject & Notify
                                    </button>
                                  </>
                                ) : (
                                  <div className="text-sm text-gray-600">
                                    {app.status === "approved" ? "Already approved" : "Already rejected"}
                                  </div>
                                )}
                                <button 
                                  className="p-2 text-gray-600 hover:text-gray-900"
                                  onClick={() => {
                                    const whatsappLink = generateWhatsAppLink(
                                      app.phone, 
                                      app.name, 
                                      app.status === "approved" ? "approved" : "rejected"
                                    );
                                    window.open(whatsappLink, '_blank');
                                  }}
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {managerApplications.length === 0 && (
                    <div className="text-center py-12">
                      <ClipboardCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900">No manager applications yet</h3>
                      <p className="text-gray-600 mt-2">Applications will appear here once users apply through the manager application page.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-gradient-to-r from-gray-500 to-gray-700 rounded-xl">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Dashboard Settings</h2>
                    <p className="text-gray-600">Customize your {userTitle.toLowerCase()} dashboard experience</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Commission Settings</h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl">
                          <p className="font-semibold text-gray-900">Agent Commission Rate</p>
                          <p className="text-2xl font-black text-blue-600">30%</p>
                          <p className="text-sm text-gray-600">Of service price</p>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl">
                          <p className="font-semibold text-gray-900">Your Commission Rate</p>
                          <p className="text-2xl font-black text-green-600">10%</p>
                          <p className="text-sm text-gray-600">Of agent earnings</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Withdrawal Settings</h3>
                      <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl">
                        <p className="font-semibold text-gray-900">Processing Days</p>
                        <p className="text-2xl font-black text-amber-600">Wed & Sun</p>
                        <p className="text-sm text-gray-600">Weekly withdrawal schedule</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Notification Preferences</h3>
                      <div className="space-y-3">
                        {[
                          'New agent applications', 
                          'High-priority support requests', 
                          'Withdrawal requests', 
                          'Service approval needed',
                          ...(role === "admin" ? ['New manager applications'] : [])
                        ].map((item) => (
                          <div key={item} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl">
                            <span className="text-gray-700">{item}</span>
                            <div className="h-6 w-11 bg-gradient-to-r from-[#ff6b35] to-[#ffa500] rounded-full relative">
                              <div className="h-5 w-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Dashboard Theme</h3>
                      <div className="flex gap-3">
                        <button className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white font-semibold">
                          Blue Theme
                        </button>
                        <button className="p-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl text-white font-semibold">
                          Dark Theme
                        </button>
                        <button className="p-4 bg-gradient-to-r from-[#ff6b35] to-[#ffa500] rounded-xl text-white font-semibold">
                          Orange Accent
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}