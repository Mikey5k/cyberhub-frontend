'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield, Upload, Download, FileText, Edit, Trash2,
  Search, CheckCircle, XCircle, Clock, AlertCircle,
  BarChart, PieChart, DollarSign, MapPin, Calendar,
  MessageCircle, Phone, Mail, User, Database as DatabaseIcon,
  Settings, RefreshCw, Loader, Tag, Building, Megaphone,
  CreditCard, Package, Layers, Users, UserPlus, UserCheck,
  UserX, Wallet, Banknote, TrendingUp, Eye, Filter,
  ChevronDown, ChevronUp, Crown, Key, Shield as ShieldIcon,
  Check, X, MoreVertical, Download as DownloadIcon,
  AlertTriangle, Info, Smartphone, MessageSquare, ShieldCheck
} from 'lucide-react';

interface User {
  id: string;
  phone: string;
  role: 'admin' | 'manager' | 'agent' | 'worker' | 'user';
  name?: string;
  email?: string;
  balance?: number;
  totalEarnings?: number;
  status: 'active' | 'pending' | 'suspended' | 'inactive' | 'whatsapp-pending';
  referralCode?: string;
  referredBy?: string;
  joinDate: string;
  lastActive?: string;
  whatsappVerified?: boolean; // New: Track WhatsApp verification
  transactions?: any[];
  withdrawalRequests?: any[];
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  category: string;
  company: string;
  startDate?: string;
  endDate?: string;
  discount?: string;
  contactEmail?: string;
  status: 'active' | 'expired' | 'draft';
  approved: boolean;
  createdAt?: string;
}

interface WithdrawalRequest {
  id: string;
  userId: string;
  userPhone: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  method: 'mpesa' | 'bank';
  accountDetails: string;
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
}

interface UploadResult {
  success: boolean;
  message: string;
  count?: number;
  error?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [phone, setPhone] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'users' | 'campaigns' | 'withdrawals'>('users');
  const [csvData, setCsvData] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  
  // User Management State
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  
  // Campaigns State
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  
  // Withdrawals State
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBalance: 0,
    pendingUsers: 0,
    whatsappPending: 0, // New: Users pending WhatsApp verification
    activeUsers: 0,
    totalWithdrawals: 0,
    pendingWithdrawals: 0
  });

  // Get phone and role from localStorage
  useEffect(() => {
    const savedPhone = localStorage.getItem('cyberhub_phone') || sessionStorage.getItem('cyberhub_phone');
    const savedRole = localStorage.getItem('cyberhub_role') || sessionStorage.getItem('cyberhub_role');
    
    if (savedPhone) setPhone(savedPhone);
    if (savedRole) setRole(savedRole);
    
    // Redirect non-admin users
    if (savedRole !== 'admin') {
      router.push('/login?redirect=/admin-dashboard');
    }
    
    // Load initial data
    fetchUsers();
    fetchCampaigns();
    fetchWithdrawals();
  }, []);

  // ================= USER MANAGEMENT =================
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await fetch('/api/users');
      const result = await response.json();
      
      if (result.success) {
        const usersData = result.data || [];
        setUsers(usersData);
        setFilteredUsers(usersData);
        updateStats(usersData, withdrawals);
      } else {
        console.error('Failed to fetch users:', result.error);
        setUsers([]);
        setFilteredUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const updateStats = (usersList: User[], withdrawalsList: WithdrawalRequest[]) => {
    const totalBalance = usersList.reduce((sum, user) => sum + (user.balance || 0), 0);
    const pendingUsers = usersList.filter(u => u.status === 'pending').length;
    const whatsappPending = usersList.filter(u => u.status === 'whatsapp-pending' || (u.status === 'pending' && !u.whatsappVerified)).length;
    const activeUsers = usersList.filter(u => u.status === 'active').length;
    const pendingWithdrawals = withdrawalsList.filter(w => w.status === 'pending').length;
    const totalWithdrawals = withdrawalsList.reduce((sum, w) => sum + w.amount, 0);
    
    setStats({
      totalUsers: usersList.length,
      totalBalance,
      pendingUsers,
      whatsappPending,
      activeUsers,
      totalWithdrawals,
      pendingWithdrawals
    });
  };

  const filterUsers = () => {
    let filtered = users;
    
    // Apply role filter
    if (userFilter !== 'all') {
      if (userFilter === 'whatsapp-pending') {
        filtered = filtered.filter(user => user.status === 'whatsapp-pending' || (user.status === 'pending' && !user.whatsappVerified));
      } else {
        filtered = filtered.filter(user => user.role === userFilter || user.status === userFilter);
      }
    }
    
    // Apply search
    if (userSearch) {
      const search = userSearch.toLowerCase();
      filtered = filtered.filter(user => 
        user.phone.toLowerCase().includes(search) ||
        (user.name && user.name.toLowerCase().includes(search)) ||
        (user.email && user.email.toLowerCase().includes(search))
      );
    }
    
    setFilteredUsers(filtered);
  };

  useEffect(() => {
    filterUsers();
  }, [userSearch, userFilter, users]);

  // NEW: WhatsApp Verification Approval
  const handleWhatsAppApprove = async (userId: string) => {
    if (!confirm('Approve user after WhatsApp verification?\n\nMake sure you have:\n1. Received WhatsApp message\n2. Verified M-Pesa payment\n3. Checked the payment details')) return;
    
    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'active', 
          approved: true,
          whatsappVerified: true,
          whatsappVerifiedAt: new Date().toISOString(),
          whatsappVerifiedBy: phone || 'Admin'
        })
      });
      
      const result = await response.json();
      if (result.success) {
        fetchUsers();
        alert('✅ User approved! User has been activated.');
        
        // Optional: Send WhatsApp notification to user
        const user = users.find(u => u.id === userId);
        if (user) {
          // You can add WhatsApp notification logic here
          console.log(`User ${user.phone} approved via WhatsApp verification`);
        }
      } else {
        alert('Failed to approve user: ' + result.error);
      }
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Error approving user');
    }
  };

  const handleRejectUser = async (userId: string) => {
    if (!confirm('Reject this user application?\n\nUser will need to reapply.')) return;
    
    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'inactive', 
          approved: false,
          rejectionReason: 'Application rejected after review'
        })
      });
      
      const result = await response.json();
      if (result.success) {
        fetchUsers();
        alert('User application rejected!');
      } else {
        alert('Failed to reject user: ' + result.error);
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('Error rejecting user');
    }
  };

  const handleSuspendUser = async (userId: string) => {
    if (!confirm('Suspend this user?\n\nUser will not be able to access services.')) return;
    
    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'suspended' })
      });
      
      const result = await response.json();
      if (result.success) {
        fetchUsers();
        alert('User suspended!');
      } else {
        alert('Failed to suspend user: ' + result.error);
      }
    } catch (error) {
      console.error('Error suspending user:', error);
      alert('Error suspending user');
    }
  };

  // ================= CAMPAIGNS =================
  const fetchCampaigns = async () => {
    try {
      setLoadingCampaigns(true);
      const response = await fetch('/api/jobs?contentType=campaign');
      const result = await response.json();
      
      if (result.success) {
        setCampaigns(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  // CSV template for campaigns
  const getCsvTemplate = () => {
    return `title,description,category,company,startDate,endDate,discount,contactEmail
Student Welcome Campaign,Special offers for new students,student-offer,Veritas CyberHub,2024-01-01,2024-03-31,15%,offers@veritascyberhub.com
Government Services Promotion,Discount on bulk government services,government-promo,Veritas CyberHub,2024-02-01,2024-02-29,10%,gov@veritascyberhub.com`;
  };

  const handleCsvUpload = async () => {
    if (!csvData.trim()) {
      setUploadResult({ success: false, message: 'Please paste CSV data' });
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      const processedCampaigns = rows.map((row, index) => {
        const campaign: any = {
          title: row.title || `Campaign ${Date.now() + index}`,
          description: row.description || 'No description',
          category: row.category || 'general',
          company: row.company || 'Veritas CyberHub',
          startDate: row.startDate || new Date().toISOString().split('T')[0],
          endDate: row.endDate || '',
          discount: row.discount || '',
          contactEmail: row.contactEmail || 'support@veritascyberhub.com',
          contentType: 'campaign',
          approved: true,
          status: 'active',
          postedBy: phone || 'Admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        Object.keys(campaign).forEach(key => {
          if (campaign[key] === undefined || campaign[key] === null || campaign[key] === '') {
            delete campaign[key];
          }
        });

        return campaign;
      });

      const createdCampaigns = [];
      for (const campaign of processedCampaigns) {
        try {
          const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          const response = await fetch('/api/jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(campaign)
          });

          const result = await response.json();
          
          if (result.success) {
            createdCampaigns.push({ id: result.jobId || campaignId, ...campaign });
          }
        } catch (error) {
          console.error('Error creating campaign:', error);
        }
      }

      setUploadResult({
        success: true,
        message: `Successfully uploaded ${createdCampaigns.length} campaigns`,
        count: createdCampaigns.length
      });

      setCsvData('');
      setTimeout(() => {
        fetchCampaigns();
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult({
        success: false,
        message: 'Failed to process CSV data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setUploading(false);
    }
  };

  // ================= WITHDRAWALS =================
  const fetchWithdrawals = async () => {
    try {
      setLoadingWithdrawals(true);
      // This would call a withdrawals API endpoint
      // For now, we'll simulate data
      const mockWithdrawals: WithdrawalRequest[] = [
        {
          id: '1',
          userId: 'user1',
          userPhone: '+254712345678',
          amount: 5000,
          status: 'pending',
          method: 'mpesa',
          accountDetails: '254712345678',
          requestedAt: new Date().toISOString()
        },
        {
          id: '2',
          userId: 'user2',
          userPhone: '+254723456789',
          amount: 3000,
          status: 'approved',
          method: 'mpesa',
          accountDetails: '254723456789',
          requestedAt: new Date(Date.now() - 86400000).toISOString(),
          processedAt: new Date().toISOString(),
          processedBy: 'Admin'
        }
      ];
      setWithdrawals(mockWithdrawals);
      updateStats(users, mockWithdrawals);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setLoadingWithdrawals(false);
    }
  };

  const handleProcessWithdrawal = async (withdrawalId: string) => {
    if (!confirm('Mark this withdrawal as processed?\n\nMake sure you have sent the payment via M-Pesa/Bank.')) return;
    
    try {
      // API call to update withdrawal status
      alert('Withdrawal marked as processed (manual processing required)');
      fetchWithdrawals();
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      alert('Error processing withdrawal');
    }
  };

  // ================= UI HELPERS =================
  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'agent': return 'bg-blue-100 text-blue-800';
      case 'worker': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'whatsapp-pending': return 'bg-blue-100 text-blue-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-[#ff6b35] to-[#ffa500] p-2 rounded-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-black bg-gradient-to-r from-[#ff6b35] to-[#ffa500] bg-clip-text text-transparent">
                  Veritas
                </span>
              </div>
              <span className="ml-2 text-gray-700 font-semibold">Admin Dashboard</span>
            </div>
            
            <div className="flex items-center gap-4">
              {phone && (
                <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                  <Phone className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{phone}</span>
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                    Admin
                  </span>
                </div>
              )}
              
              <button
                onClick={() => {
                  localStorage.removeItem('cyberhub_phone');
                  localStorage.removeItem('cyberhub_role');
                  sessionStorage.removeItem('cyberhub_phone');
                  sessionStorage.removeItem('cyberhub_role');
                  router.push('/login');
                }}
                className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* WhatsApp Alert */}
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                <strong>WhatsApp Payment Verification:</strong> Users now send M-Pesa proof to WhatsApp (+254708949580). Verify payment there first, then approve here.
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Look for messages with M-Pesa screenshots, then use "Approve (WhatsApp Verified)" button below.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-[#ff6b35] text-[#ff6b35]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="h-4 w-4" />
            User Management
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'withdrawals'
                ? 'border-[#ff6b35] text-[#ff6b35]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Wallet className="h-4 w-4" />
            Withdrawals
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'campaigns'
                ? 'border-[#ff6b35] text-[#ff6b35]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Megaphone className="h-4 w-4" />
            Campaigns
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {stats.activeUsers} active • {stats.whatsappPending} WhatsApp pending
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">WhatsApp Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.whatsappPending}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Awaiting WhatsApp verification
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Withdrawals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingWithdrawals}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Awaiting processing
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Withdrawn</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalWithdrawals)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              All-time total
            </div>
          </div>
        </div>

        {/* USER MANAGEMENT TAB */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900">User Management</h2>
                <p className="text-gray-600">Manage users - Verify WhatsApp payments then approve</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                  />
                </div>
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                >
                  <option value="all">All Users</option>
                  <option value="whatsapp-pending">WhatsApp Pending</option>
                  <option value="pending">All Pending</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="admin">Admins</option>
                  <option value="manager">Managers</option>
                  <option value="agent">Agents</option>
                  <option value="worker">Workers</option>
                </select>
                <button
                  onClick={fetchUsers}
                  className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {loadingUsers ? (
              <div className="text-center py-12">
                <Loader className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading users...</p>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Role</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Balance</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Join Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{user.phone}</div>
                            {user.name && (
                              <div className="text-sm text-gray-600">{user.name}</div>
                            )}
                            {user.email && (
                              <div className="text-xs text-gray-500">{user.email}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                            {user.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-gray-900">
                            {formatCurrency(user.balance || 0)}
                          </div>
                          {user.totalEarnings && (
                            <div className="text-xs text-gray-500">
                              Total: {formatCurrency(user.totalEarnings)}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                              {user.status === 'whatsapp-pending' ? 'WHATSAPP PENDING' : user.status.toUpperCase()}
                            </span>
                            {user.whatsappVerified && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1">
                                <Check className="h-3 w-3" />
                                WhatsApp
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(user.joinDate)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {(user.status === 'pending' || user.status === 'whatsapp-pending') && (
                              <>
                                <button
                                  onClick={() => handleWhatsAppApprove(user.id)}
                                  className="p-2 bg-green-600 text-white hover:bg-green-700 rounded-lg flex items-center gap-1 text-sm font-medium"
                                  title="Approve (WhatsApp Verified)"
                                >
                                  <ShieldCheck className="h-3 w-3" />
                                  <span className="hidden sm:inline">Approve</span>
                                </button>
                                <button
                                  onClick={() => handleRejectUser(user.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                  title="Reject Application"
                                >
                                  <UserX className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            {user.status === 'active' && (
                              <button
                                onClick={() => handleSuspendUser(user.id)}
                                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                                title="Suspend User"
                              >
                                <UserX className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserDetails(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-4 rounded-2xl inline-block mb-4">
                  <Users className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Users Found</h3>
                <p className="text-gray-600">Try adjusting your search or filter</p>
              </div>
            )}
          </div>
        )}

        {/* WITHDRAWALS TAB */}
        {activeTab === 'withdrawals' && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Withdrawal Requests</h2>
                <p className="text-gray-600">Process user withdrawal requests manually</p>
              </div>
              <button
                onClick={fetchWithdrawals}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>

            {loadingWithdrawals ? (
              <div className="text-center py-12">
                <Loader className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading withdrawals...</p>
              </div>
            ) : withdrawals.length > 0 ? (
              <div className="space-y-4">
                {withdrawals.map(withdrawal => (
                  <div key={withdrawal.id} className="border border-gray-200 rounded-xl p-4 hover:border-gray-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="font-bold text-gray-900">{withdrawal.userPhone}</div>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            withdrawal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            withdrawal.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {withdrawal.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Amount: <span className="font-bold text-gray-900">{formatCurrency(withdrawal.amount)}</span>
                          <span className="mx-2">•</span>
                          Method: {withdrawal.method.toUpperCase()}
                          <span className="mx-2">•</span>
                          Account: {withdrawal.accountDetails}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Requested: {formatDate(withdrawal.requestedAt)}
                          {withdrawal.processedAt && (
                            <>
                              <span className="mx-2">•</span>
                              Processed: {formatDate(withdrawal.processedAt)}
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {withdrawal.status === 'pending' && (
                          <button
                            onClick={() => handleProcessWithdrawal(withdrawal.id)}
                            className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
                          >
                            Mark as Processed
                          </button>
                        )}
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-4 rounded-2xl inline-block mb-4">
                  <Wallet className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Withdrawal Requests</h3>
                <p className="text-gray-600">No pending withdrawal requests at the moment</p>
              </div>
            )}
            
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Withdrawals are processed manually. Click "Mark as Processed" after completing the M-Pesa/Bank transfer, then update the user's balance accordingly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CAMPAIGNS TAB */}
        {activeTab === 'campaigns' && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Campaign Management</h2>
                <p className="text-gray-600">Upload and manage promotional campaigns</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={copyTemplate}
                  className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium"
                >
                  Copy Template
                </button>
                <button
                  onClick={downloadTemplate}
                  className="px-3 py-1.5 text-sm bg-green-50 text-green-600 hover:bg-green-100 rounded-lg font-medium"
                >
                  Download CSV
                </button>
              </div>
            </div>

            {/* CSV Upload Area */}
            <div className="mb-8">
              <div className="mb-4">
                <textarea
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  placeholder="Paste your campaign CSV data here (with headers)..."
                  className="w-full h-64 px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent font-mono text-sm"
                  spellCheck={false}
                />
              </div>

              {/* Upload Button */}
              <button
                onClick={handleCsvUpload}
                disabled={uploading || !csvData.trim()}
                className="w-full py-4 bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                {uploading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Uploading Campaigns...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    Upload Campaigns
                  </>
                )}
              </button>

              {/* Upload Result */}
              {uploadResult && (
                <div className={`mt-6 p-4 rounded-xl ${
                  uploadResult.success 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-start gap-3">
                    {uploadResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    )}
                    <div>
                      <p className={`font-medium ${
                        uploadResult.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {uploadResult.message}
                      </p>
                      {uploadResult.count !== undefined && (
                        <p className="text-sm text-green-700 mt-1">
                          Successfully uploaded {uploadResult.count} campaigns
                        </p>
                      )}
                      {uploadResult.error && (
                        <p className="text-sm text-red-700 mt-1 font-mono">
                          Error: {uploadResult.error}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Campaigns List */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Campaigns</h3>
              {loadingCampaigns ? (
                <div className="text-center py-8">
                  <Loader className="h-6 w-6 text-blue-600 animate-spin mx-auto" />
                </div>
              ) : campaigns.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {campaigns.map(campaign => (
                    <div key={campaign.id} className="border border-gray-200 rounded-xl p-4 hover:border-gray-300">
                      <h4 className="font-bold text-gray-900">{campaign.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {campaign.category}
                        </span>
                        <span className="text-xs text-gray-500">{campaign.company}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No campaigns uploaded yet.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">User Details</h3>
              <button
                onClick={() => setShowUserDetails(false)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <p className="text-gray-900 font-medium">{selectedUser.phone}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleColor(selectedUser.role)}`}>
                    {selectedUser.role.toUpperCase()}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedUser.status)}`}>
                    {selectedUser.status.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Balance</label>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedUser.balance || 0)}</p>
              </div>
              
              {selectedUser.totalEarnings && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Earnings</label>
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(selectedUser.totalEarnings)}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Joined On</label>
                <p className="text-gray-900">{formatDate(selectedUser.joinDate)}</p>
              </div>
              
              {selectedUser.referralCode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Referral Code</label>
                  <p className="text-gray-900 font-mono">{selectedUser.referralCode}</p>
                </div>
              )}
              
              {selectedUser.whatsappVerified && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">WhatsApp Verified</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowUserDetails(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const message = `User: ${selectedUser.phone}\nBalance: ${selectedUser.balance}\nRole: ${selectedUser.role}`;
                  navigator.clipboard.writeText(message);
                  alert('User details copied to clipboard!');
                }}
                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
              >
                Copy Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 py-8 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="bg-gradient-to-r from-[#ff6b35] to-[#ffa500] p-2 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-[#ff6b35] to-[#ffa500] bg-clip-text text-transparent">
              Veritas CyberHub Admin
            </span>
          </div>
          <div className="text-sm text-gray-500">
            <p>Logged in as: {phone} | Role: {role} | Total Users: {stats.totalUsers}</p>
            <p className="mt-2">Total System Balance: {formatCurrency(stats.totalBalance)} | WhatsApp Pending: {stats.whatsappPending}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper functions for CSV operations
function copyTemplate() {
  const template = `title,description,category,company,startDate,endDate,discount,contactEmail
Student Welcome Campaign,Special offers for new students,student-offer,Veritas CyberHub,2024-01-01,2024-03-31,15%,offers@veritascyberhub.com`;
  navigator.clipboard.writeText(template);
  alert('Campaign CSV template copied to clipboard!');
}

function downloadTemplate() {
  const template = `title,description,category,company,startDate,endDate,discount,contactEmail
Student Welcome Campaign,Special offers for new students,student-offer,Veritas CyberHub,2024-01-01,2024-03-31,15%,offers@veritascyberhub.com`;
  const blob = new Blob([template], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'campaigns-template.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}