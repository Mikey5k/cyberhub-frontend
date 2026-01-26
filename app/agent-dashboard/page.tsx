"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePhoneAuth } from "@/hooks/use-phone-auth";
import { getAgentTasks, updateTask } from "@/lib/api"; // FIXED: Changed updateTaskStatus to updateTask
import { formatCurrency } from "@/lib/utils";
import { 
  Home, Briefcase, Wallet, Clock, CheckCircle, AlertCircle,
  MessageCircle, User, Settings, Bell, Search, Filter,
  ChevronRight, MoreVertical, Download, Eye, Calendar,
  CreditCard, TrendingUp, Users, Package, Target, Zap,
  ArrowRight, Plus, RefreshCw, Star, Award, BarChart3,
  Phone, Mail, MapPin, ExternalLink, Edit, Trash2
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  status: "pending" | "assigned" | "in_progress" | "completed" | "cancelled";
  assignedTo: string;
  assignedAt: string;
  completedAt?: string;
  clientPhone: string;
  requirements: string[];
}

const WORKER_COMMISSION_RATE = 0.30; // Internal calculation only

export default function AgentDashboard() {
  const router = useRouter();
  const { phone, role, loading, initializing } = usePhoneAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    completedTasks: 0,
    pendingTasks: 0,
    availableBalance: 0,
    availableJobs: 0,
  });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    console.log('Agent dashboard auth check:', { phone, role, loading, initializing });
    
    if (!initializing && !loading && (!phone || role !== "worker")) {
      console.log('Redirecting to login - missing phone or wrong role');
      router.push("/login");
      return;
    }

    if (!initializing && phone && role === "worker") {
      console.log('Loading agent tasks');
      loadTasks();
    }
  }, [phone, role, loading, initializing, router]);

  const loadTasks = async () => {
    try {
      const data = await getAgentTasks(phone!);
      setTasks(data);

      // Calculate stats
      const completed = data.filter((t: Task) => t.status === "completed");
      const pending = data.filter((t: Task) => 
        t.status === "assigned" || t.status === "in_progress"
      );
      const available = data.filter((t: Task) => t.status === "pending");
      
      const totalEarnings = completed.reduce(
        (sum: number, task: Task) => sum + (task.price * WORKER_COMMISSION_RATE),
        0
      );

      const availableBalance = completed
        .filter((t: Task) => !t.completedAt || new Date(t.completedAt) < new Date())
        .reduce((sum: number, task: Task) => sum + (task.price * WORKER_COMMISSION_RATE), 0);

      setStats({
        totalEarnings,
        completedTasks: completed.length,
        pendingTasks: pending.length,
        availableBalance,
        availableJobs: available.length,
      });
    } catch (error) {
      console.error("Failed to load tasks:", error);
    }
  };

  const handleStatusUpdate = async (taskId: string, newStatus: Task["status"]) => {
    try {
      // FIXED: Changed updateTaskStatus to updateTask
      await updateTask(taskId, newStatus);
      await loadTasks();
      setIsModalOpen(false);
      setSelectedTask(null);
      setStatusUpdate("");
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleWithdraw = () => {
    alert(`Withdrawal request submitted! Available balance: ${formatCurrency(stats.availableBalance)} will be processed on Wednesday or Sunday.`);
  };

  const handleTakeJob = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setIsModalOpen(true);
      setStatusUpdate("in_progress");
    }
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "assigned": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4" />;
      case "in_progress": return <Clock className="h-4 w-4" />;
      case "assigned": return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: Task["status"]) => {
    switch (status) {
      case "completed": return "Completed";
      case "in_progress": return "In Progress";
      case "assigned": return "Assigned";
      case "pending": return "Pending";
      case "cancelled": return "Cancelled";
    }
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

  const completedTasks = tasks.filter(t => t.status === "completed");
  const availableJobs = tasks.filter(t => t.status === "pending");
  const inProgressTasks = tasks.filter(t => t.status === "in_progress" || t.status === "assigned");

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: <Home className="h-5 w-5" /> },
    { id: "available", label: "Available Jobs", icon: <Briefcase className="h-5 w-5" />, badge: stats.availableJobs },
    { id: "inprogress", label: "In Progress", icon: <Clock className="h-5 w-5" />, badge: stats.pendingTasks },
    { id: "completed", label: "Completed", icon: <CheckCircle className="h-5 w-5" />, badge: stats.completedTasks },
    { id: "earnings", label: "Earnings", icon: <Wallet className="h-5 w-5" /> },
    { id: "messages", label: "Messages", icon: <MessageCircle className="h-5 w-5" /> },
    { id: "profile", label: "Profile", icon: <User className="h-5 w-5" /> },
    { id: "settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
  ];

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
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-gray-900">Agent Hub</h1>
                  <p className="text-sm text-gray-600">Premium task management & earnings</p>
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
                  placeholder="Search tasks..."
                  className="pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-[#ff6b35] focus:bg-white w-64"
                />
              </div>
              
              <button className="relative p-2 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 hover:from-blue-100 hover:to-blue-200">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              
              <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                <div className="h-9 w-9 bg-gradient-to-r from-[#ff6b35] to-[#ffa500] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Agent</p>
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
                          ? 'bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white shadow-lg shadow-orange-500/25'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                      {item.badge !== undefined && (
                        <span className={`ml-auto text-xs font-semibold px-2 py-1 rounded-full ${
                          activeTab === item.id
                            ? 'bg-white/20 text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      {activeTab === item.id && (
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      )}
                    </button>
                  ))}
                </nav>
              </div>
              
              <div className="mt-12 p-4 bg-gradient-to-r from-green-50 to-emerald-100 rounded-2xl border border-emerald-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Performance Score</p>
                    <p className="text-xs text-gray-600">Excellent</p>
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
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
                {/* Available Balance Card with Withdraw Button */}
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                      <Wallet className="h-6 w-6 text-white" />
                    </div>
                    <button
                      onClick={handleWithdraw}
                      className="px-4 py-2 bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white text-sm font-semibold rounded-lg hover:opacity-90"
                    >
                      Withdraw
                    </button>
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-2">{formatCurrency(stats.availableBalance)}</h3>
                  <p className="text-gray-600">Available Balance</p>
                  <div className="mt-4 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                  <p className="text-xs text-gray-500 mt-3">Next withdrawal: Wednesday</p>
                </div>

                {/* Total Earnings */}
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 bg-green-100 text-green-700 rounded-full">+8%</span>
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-2">{formatCurrency(stats.totalEarnings)}</h3>
                  <p className="text-gray-600">Total Earnings</p>
                  <div className="mt-4 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                </div>

                {/* Available Jobs */}
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
                      <Briefcase className="h-6 w-6 text-white" />
                    </div>
                    <button
                      onClick={() => setActiveTab("available")}
                      className="px-4 py-2 bg-amber-100 text-amber-700 text-sm font-semibold rounded-lg hover:bg-amber-200"
                    >
                      View All
                    </button>
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-2">{stats.availableJobs}</h3>
                  <p className="text-gray-600">Available Jobs</p>
                  <div className="mt-4 h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></div>
                </div>

                {/* Completed Tasks */}
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 bg-purple-100 text-purple-700 rounded-full">{stats.completedTasks} done</span>
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-2">{stats.completedTasks}</h3>
                  <p className="text-gray-600">Completed Tasks</p>
                  <div className="mt-4 h-2 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full"></div>
                </div>
              </div>

              {/* Available Jobs Section */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Available Jobs</h2>
                    <p className="text-gray-600">New tasks waiting for you</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab("available")}
                    className="px-6 py-3 bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white font-semibold rounded-xl hover:opacity-90"
                  >
                    View All Jobs
                  </button>
                </div>

                {availableJobs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableJobs.slice(0, 3).map((task) => (
                      <div key={task.id} className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#ff6b35]/30 transition-colors shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                            <Package className="h-6 w-6 text-blue-600" />
                          </div>
                          <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                            {formatCurrency(task.price)}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{task.title}</h3>
                        <p className="text-gray-600 text-sm mb-4">{task.description}</p>
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm text-gray-700">{task.category}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-gray-700">Earnings: {formatCurrency(task.price * WORKER_COMMISSION_RATE)}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleTakeJob(task.id)}
                          className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:opacity-90"
                        >
                          Take This Job
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-6 rounded-2xl inline-block mb-6">
                      <Briefcase className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No available jobs</h3>
                    <p className="text-gray-600">Check back soon for new opportunities</p>
                  </div>
                )}
              </div>

              {/* In Progress & Completed Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* In Progress Tasks */}
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">In Progress</h2>
                      <p className="text-gray-600">Tasks you're working on</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                      {inProgressTasks.length} active
                    </span>
                  </div>
                  <div className="space-y-4">
                    {inProgressTasks.slice(0, 3).map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg">
                            <Clock className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{task.title}</p>
                            <p className="text-sm text-gray-600">Due soon</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedTask(task);
                            setIsModalOpen(true);
                            setStatusUpdate("completed");
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-lg hover:opacity-90"
                        >
                          Mark Complete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Completed Tasks */}
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Recently Completed</h2>
                      <p className="text-gray-600">Your finished work</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab("completed")}
                      className="px-4 py-2 text-[#ff6b35] text-sm font-semibold hover:text-[#ff8c42]"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-4">
                    {completedTasks.slice(0, 3).map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{task.title}</p>
                            <p className="text-sm text-gray-600">Earned: {formatCurrency(task.price * WORKER_COMMISSION_RATE)}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                          Paid
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Available Jobs Tab */}
          {activeTab === "available" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Available Jobs</h2>
                    <p className="text-gray-600">Browse and accept new tasks</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50">
                      <Filter className="h-4 w-4 inline mr-2" />
                      Filter
                    </button>
                    <button 
                      onClick={loadTasks}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:opacity-90"
                    >
                      <RefreshCw className="h-4 w-4 inline mr-2" />
                      Refresh
                    </button>
                  </div>
                </div>

                {availableJobs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableJobs.map((task) => (
                      <div key={task.id} className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#ff6b35] hover:shadow-lg transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                            <Package className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black text-gray-900">{formatCurrency(task.price)}</p>
                            <p className="text-sm text-gray-600">Service price</p>
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{task.title}</h3>
                        <p className="text-gray-600 mb-6">{task.description}</p>
                        
                        <div className="space-y-4 mb-6">
                          <div>
                            <p className="text-sm font-semibold text-gray-900 mb-2">Requirements:</p>
                            <div className="flex flex-wrap gap-2">
                              {task.requirements.map((req, index) => (
                                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg">
                                  {req}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 bg-[#ff6b35] rounded-full"></div>
                              <span className="text-sm text-gray-700">Your Earnings</span>
                            </div>
                            <span className="text-lg font-black text-green-600">
                              {formatCurrency(task.price * WORKER_COMMISSION_RATE)}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <button
                            onClick={() => handleTakeJob(task.id)}
                            className="w-full py-3 bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white font-semibold rounded-xl hover:opacity-90"
                          >
                            Accept Job
                          </button>
                          <button
                            onClick={() => {
                              const message = `Hello, I'm interested in the "${task.title}" service. Can you provide more details?`;
                              window.open(`https://wa.me/${task.clientPhone}?text=${encodeURIComponent(message)}`, '_blank');
                            }}
                            className="w-full py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50"
                          >
                            <MessageCircle className="h-4 w-4 inline mr-2" />
                            Ask Questions
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-8 rounded-2xl inline-block mb-8">
                      <Briefcase className="h-16 w-16 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-4">No jobs available</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      All current jobs have been assigned. New jobs will appear here when available.
                    </p>
                    <button 
                      onClick={loadTasks}
                      className="px-8 py-4 bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white font-semibold rounded-xl hover:opacity-90"
                    >
                      <RefreshCw className="h-5 w-5 inline mr-2" />
                      Check for New Jobs
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* In Progress Tab */}
          {activeTab === "inprogress" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Tasks In Progress</h2>
                    <p className="text-gray-600">Manage your active assignments</p>
                  </div>
                  <span className="px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-xl">
                    {inProgressTasks.length} Active Tasks
                  </span>
                </div>

                {inProgressTasks.length > 0 ? (
                  <div className="space-y-4">
                    {inProgressTasks.map((task) => (
                      <div key={task.id} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                                <Briefcase className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-gray-900">{task.title}</h3>
                                <p className="text-gray-600">{task.description}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                              <div className="p-4 bg-blue-50 rounded-xl">
                                <p className="text-sm text-gray-600">Service Price</p>
                                <p className="text-2xl font-black text-gray-900">{formatCurrency(task.price)}</p>
                              </div>
                              <div className="p-4 bg-green-50 rounded-xl">
                                <p className="text-sm text-gray-600">Your Earnings</p>
                                <p className="text-2xl font-black text-green-600">{formatCurrency(task.price * WORKER_COMMISSION_RATE)}</p>
                              </div>
                              <div className="p-4 bg-amber-50 rounded-xl">
                                <p className="text-sm text-gray-600">Client</p>
                                <p className="font-semibold text-gray-900">{task.clientPhone}</p>
                              </div>
                            </div>

                            <div className="mb-6">
                              <p className="text-sm font-semibold text-gray-900 mb-3">Requirements:</p>
                              <div className="flex flex-wrap gap-2">
                                {task.requirements.map((req, index) => (
                                  <span key={index} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg">
                                    {req}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => {
                                const message = `Hi, I'm working on your "${task.title}" service. Just wanted to give you an update.`;
                                window.open(`https://wa.me/${task.clientPhone}?text=${encodeURIComponent(message)}`, '_blank');
                              }}
                              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:opacity-90"
                            >
                              <MessageCircle className="h-4 w-4 inline mr-2" />
                              Update Client
                            </button>
                            <button
                              onClick={() => {
                                setSelectedTask(task);
                                setIsModalOpen(true);
                                setStatusUpdate("completed");
                              }}
                              className="px-6 py-3 border-2 border-[#ff6b35] text-[#ff6b35] font-semibold rounded-xl hover:bg-orange-50"
                            >
                              Mark as Complete
                            </button>
                          </div>
                          <span className="px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-xl">
                            {getStatusText(task.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-8 rounded-2xl inline-block mb-8">
                      <Clock className="h-16 w-16 text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-4">No tasks in progress</h3>
                    <p className="text-gray-600 mb-8">Start by accepting available jobs from the Available Jobs tab</p>
                    <button 
                      onClick={() => setActiveTab("available")}
                      className="px-8 py-4 bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white font-semibold rounded-xl hover:opacity-90"
                    >
                      Browse Available Jobs
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Completed Tab */}
          {activeTab === "completed" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Completed Tasks</h2>
                    <p className="text-gray-600">Your finished work and earnings</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:opacity-90">
                      <Download className="h-4 w-4 inline mr-2" />
                      Export Report
                    </button>
                  </div>
                </div>

                {completedTasks.length > 0 ? (
                  <div className="space-y-4">
                    {completedTasks.map((task) => (
                      <div key={task.id} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                              <CheckCircle className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{task.title}</h3>
                              <p className="text-gray-600">Completed on {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : 'N/A'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black text-green-600">{formatCurrency(task.price * WORKER_COMMISSION_RATE)}</p>
                            <p className="text-sm text-gray-600">Your earnings</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
                          <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm text-gray-600">Service Price</p>
                            <p className="text-lg font-bold text-gray-900">{formatCurrency(task.price)}</p>
                          </div>
                          <div className="p-4 bg-green-50 rounded-xl">
                            <p className="text-sm text-gray-600">Commission (30%)</p>
                            <p className="text-lg font-bold text-green-600">{formatCurrency(task.price * WORKER_COMMISSION_RATE)}</p>
                          </div>
                          <div className="p-4 bg-blue-50 rounded-xl">
                            <p className="text-sm text-gray-600">Client</p>
                            <p className="text-lg font-semibold text-gray-900">{task.clientPhone}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => {
                                const message = `Hello, regarding your completed "${task.title}" service. Hope everything was satisfactory!`;
                                window.open(`https://wa.me/${task.clientPhone}?text=${encodeURIComponent(message)}`, '_blank');
                              }}
                              className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50"
                            >
                              Follow Up
                            </button>
                            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:opacity-90">
                              View Details
                            </button>
                          </div>
                          <span className="px-4 py-2 bg-green-100 text-green-700 font-semibold rounded-xl">
                            Payment Processed
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-100 p-8 rounded-2xl inline-block mb-8">
                      <CheckCircle className="h-16 w-16 text-green-400" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-4">No completed tasks yet</h3>
                    <p className="text-gray-600 mb-8">Complete your first job to see it listed here</p>
                    <button 
                      onClick={() => setActiveTab("available")}
                      className="px-8 py-4 bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white font-semibold rounded-xl hover:opacity-90"
                    >
                      Start Your First Job
                    </button>
                  </div>
                )}
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
                    <p className="text-gray-600">Track your commissions and withdrawals</p>
                  </div>
                  <button 
                    onClick={handleWithdraw}
                    className="px-8 py-4 bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white font-semibold rounded-xl hover:opacity-90"
                  >
                    <Wallet className="h-5 w-5 inline mr-2" />
                    Withdraw Funds
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-8 rounded-2xl text-white">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-white/20 rounded-xl">
                        <Wallet className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm opacity-90">Available Balance</p>
                        <p className="text-3xl font-black">{formatCurrency(stats.availableBalance)}</p>
                      </div>
                    </div>
                    <p className="text-sm opacity-90">Ready for withdrawal</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-8 rounded-2xl text-white">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-white/20 rounded-xl">
                        <TrendingUp className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm opacity-90">Total Earnings</p>
                        <p className="text-3xl font-black">{formatCurrency(stats.totalEarnings)}</p>
                      </div>
                    </div>
                    <p className="text-sm opacity-90">All-time earnings</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500 to-violet-500 p-8 rounded-2xl text-white">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-white/20 rounded-xl">
                        <Calendar className="h-6 w-6" />
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
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Earnings</h3>
                  <div className="space-y-4">
                    {completedTasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                            <CreditCard className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{task.title}</p>
                            <p className="text-sm text-gray-600">Completed on {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : 'N/A'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{formatCurrency(task.price * WORKER_COMMISSION_RATE)}</p>
                          <p className="text-sm text-gray-600">Commission earned</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Status Update Modal */}
      {isModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Update Task Status</h3>
              <p className="text-gray-600 mt-1">Update status for: {selectedTask.title}</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {["in_progress", "completed"].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(selectedTask.id, status as Task["status"])}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      statusUpdate === status
                        ? 'border-[#ff6b35] bg-orange-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {status === "in_progress" ? "Mark as In Progress" : "Mark as Completed"}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {status === "in_progress"
                            ? "You're actively working on this task"
                            : "Task is finished and ready for review"}
                        </p>
                      </div>
                      <div className={`h-6 w-6 rounded-full border-2 ${
                        statusUpdate === status ? 'border-[#ff6b35] bg-[#ff6b35]' : 'border-gray-300'
                      }`}>
                        {statusUpdate === status && (
                          <div className="h-full w-full flex items-center justify-center">
                            <div className="h-2 w-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedTask(null);
                  setStatusUpdate("");
                }}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}