'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, Shield, CheckCircle, XCircle, CreditCard,
  Wallet, Zap, UserCheck, UserX, AlertTriangle,
  TrendingUp, Filter, Search, Send, RefreshCw,
  ChevronRight, ChevronDown, Eye, EyeOff, MoreVertical,
  BarChart3, Home, Settings, LogOut, Bell, Globe,
  Lock, Unlock, DollarSign, UserPlus, Package,
  Edit, Trash2, Archive, Eye as EyeIcon, Tag,
  Layers, FileText, Building, GraduationCap, BrainCircuit,
  Percent, Gift, Tag as TagIcon, Megaphone, Calendar,
  Target, Star, Link, Upload, Download, AlertCircle,
  Check, Clock, BarChart, TrendingDown, Activity,
  Server, Database, Smartphone, Wifi, WifiOff
} from 'lucide-react';
import HealthWidget from '@/components/HealthWidget';

interface User {
  id: string;
  phone: string;
  role: 'user' | 'agent' | 'manager' | 'super_admin';
  name: string;
  balance: number;
  status: 'active' | 'suspended' | 'pending';
  joinDate: string;
  lastActive: string;
  completedTasks: number;
  earnings: number;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  addedBy: string;
  status: 'active' | 'archived' | 'pending';
  addedDate: string;
  requirements: string[];
  deliveryTime: string;
  popular?: boolean;
}

interface Campaign {
  id: string;
  name: string;
  description: string;
  type: 'percentage_discount' | 'fixed_discount' | 'free_addon' | 'discounted_addon' | 'bundle';
  discountPercentage?: number;
  fixedAmount?: number;
  mainServiceId?: string;
  addonServiceId?: string;
  addonDiscountPercentage?: number;
  bundleServices?: string[];
  bundlePrice?: number;
  targetServices: string[];
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'scheduled' | 'ended';
  visibility: {
    showBanner: boolean;
    showPopup: boolean;
    floatingButton: boolean;
    badgeIcon: boolean;
    bannerText?: string;
    bannerColor?: string;
  };
  createdAt: string;
  createdBy: string;
}

interface PaymentBatch {
  id: string;
  amount: number;
  recipientCount: number;
  status: 'pending' | 'processing' | 'completed';
  date: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [phone, setPhone] = useState<string>('');
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      phone: '+254722334455',
      role: 'agent',
      name: 'Mike Omondi',
      balance: 15000,
      status: 'active',
      joinDate: '2024-01-15',
      lastActive: '2 mins ago',
      completedTasks: 45,
      earnings: 45000
    },
    {
      id: '2',
      phone: '+254733445566',
      role: 'manager',
      name: 'Sarah Johnson',
      balance: 25000,
      status: 'active',
      joinDate: '2024-01-10',
      lastActive: '5 mins ago',
      completedTasks: 0,
      earnings: 7500
    },
    {
      id: '3',
      phone: '+254712345678',
      role: 'user',
      name: 'John Doe',
      balance: 0,
      status: 'active',
      joinDate: '2024-01-20',
      lastActive: '1 hour ago',
      completedTasks: 0,
      earnings: 0
    },
    {
      id: '4',
      phone: '+254700987654',
      role: 'agent',
      name: 'Jane Smith',
      balance: 8000,
      status: 'suspended',
      joinDate: '2024-01-05',
      lastActive: '2 days ago',
      completedTasks: 22,
      earnings: 22000
    },
    {
      id: '5',
      phone: '+254711223344',
      role: 'agent',
      name: 'Peter Kamau',
      balance: 12000,
      status: 'active',
      joinDate: '2024-01-12',
      lastActive: '30 mins ago',
      completedTasks: 33,
      earnings: 33000
    },
    {
      id: '6',
      phone: '+254755667788',
      role: 'manager',
      name: 'David Njoroge',
      balance: 0,
      status: 'pending',
      joinDate: '2024-01-22',
      lastActive: 'Just now',
      completedTasks: 0,
      earnings: 0
    }
  ]);

  const [services, setServices] = useState<Service[]>([
    {
      id: 'ecitizen-main',
      name: 'E-Citizen Navigator',
      description: 'Complete government services handling with expert precision',
      price: 2000,
      category: 'E-Citizen',
      addedBy: 'System',
      status: 'active',
      addedDate: '2024-01-10',
      requirements: ['Valid ID', 'Required documents', 'Service details'],
      deliveryTime: 'Instant',
      popular: true
    },
    {
      id: 'kra-pin',
      name: 'KRA PIN Registration',
      description: 'New KRA PIN application and tax compliance',
      price: 1500,
      category: 'E-Citizen',
      addedBy: 'System',
      status: 'active',
      addedDate: '2024-01-10',
      requirements: ['ID Copy', 'Passport Photo', 'Contact Details'],
      deliveryTime: 'Instant',
      popular: true
    },
    {
      id: 'kuccps',
      name: 'KUCCPS & University Applications',
      description: 'Complete university placement and course selection assistance',
      price: 1500,
      category: 'Education',
      addedBy: 'System',
      status: 'active',
      addedDate: '2024-01-12',
      requirements: ['KCSE results', 'Course preferences', 'University choices'],
      deliveryTime: 'Instant',
      popular: true
    },
    {
      id: 'work',
      name: 'Work From Home Solutions',
      description: 'AI-powered job matching and automated applications',
      price: 2500,
      category: 'Employment',
      addedBy: 'System',
      status: 'active',
      addedDate: '2024-01-15',
      requirements: ['CV/Resume', 'Career goals', 'Desired industries'],
      deliveryTime: 'Instant',
      popular: true
    },
    {
      id: 'business-search',
      name: 'Business Name Search',
      description: 'Business name availability search and reservation',
      price: 500,
      category: 'E-Citizen',
      addedBy: 'System',
      status: 'active',
      addedDate: '2024-01-10',
      requirements: ['Preferred business name', 'Business type'],
      deliveryTime: 'Instant',
      popular: false
    },
    {
      id: 'remote-training',
      name: 'Remote Work Training',
      description: 'Training for remote work skills and job readiness',
      price: 1800,
      category: 'Training',
      addedBy: 'System',
      status: 'active',
      addedDate: '2024-01-15',
      requirements: ['Basic computer skills', 'Internet access'],
      deliveryTime: 'Instant',
      popular: false
    },
    {
      id: 'passport-old',
      name: 'Old Passport Service',
      description: 'Outdated passport service',
      price: 3500,
      category: 'E-Citizen',
      addedBy: 'Sarah Johnson',
      status: 'archived',
      addedDate: '2023-12-01',
      requirements: ['Old documents'],
      deliveryTime: '2-3 weeks',
      popular: false
    }
  ]);

  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: 'c1',
      name: 'Tax Season Special',
      description: '20% off all government services during tax season',
      type: 'percentage_discount',
      discountPercentage: 20,
      targetServices: ['ecitizen-main', 'kra-pin', 'business-search'],
      startDate: '2024-06-01',
      endDate: '2024-06-30',
      status: 'scheduled',
      visibility: {
        showBanner: true,
        showPopup: true,
        floatingButton: true,
        badgeIcon: true,
        bannerText: '🏷️ Tax Season - 20% OFF Government Services!',
        bannerColor: '#ff6b35'
      },
      createdAt: '2024-01-20',
      createdBy: 'Super Admin'
    },
    {
      id: 'c2',
      name: 'KRA PIN + Business Search Bundle',
      description: 'Get Business Name Search FREE with KRA PIN Registration',
      type: 'free_addon',
      mainServiceId: 'kra-pin',
      addonServiceId: 'business-search',
      targetServices: ['kra-pin'],
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      status: 'active',
      visibility: {
        showBanner: true,
        showPopup: false,
        floatingButton: true,
        badgeIcon: false,
        bannerText: '🎁 FREE Business Search with KRA PIN!',
        bannerColor: '#4CAF50'
      },
      createdAt: '2024-01-15',
      createdBy: 'Super Admin'
    },
    {
      id: 'c3',
      name: 'Student Welcome Offer',
      description: 'KES 500 off first service for students',
      type: 'fixed_discount',
      fixedAmount: 500,
      targetServices: ['kuccps', 'work', 'remote-training'],
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'active',
      visibility: {
        showBanner: true,
        showPopup: true,
        floatingButton: false,
        badgeIcon: true,
        bannerText: '🎓 Student Special - KES 500 OFF!',
        bannerColor: '#2196F3'
      },
      createdAt: '2024-01-01',
      createdBy: 'Super Admin'
    },
    {
      id: 'c4',
      name: 'Work & Learn Bundle',
      description: 'Get Remote Work Training at 50% off with Work From Home Solutions',
      type: 'discounted_addon',
      mainServiceId: 'work',
      addonServiceId: 'remote-training',
      addonDiscountPercentage: 50,
      targetServices: ['work'],
      startDate: '2024-02-01',
      endDate: '2024-02-29',
      status: 'scheduled',
      visibility: {
        showBanner: true,
        showPopup: false,
        floatingButton: true,
        badgeIcon: false,
        bannerText: '💼 Work + Training = 50% OFF!',
        bannerColor: '#9C27B0'
      },
      createdAt: '2024-01-18',
      createdBy: 'Super Admin'
    }
  ]);

  const [pendingServices, setPendingServices] = useState<Service[]>([
    {
      id: 's1',
      name: 'Driving License Renewal',
      description: 'Driving license renewal service',
      price: 3000,
      category: 'E-Citizen',
      addedBy: 'Sarah Johnson',
      status: 'pending',
      addedDate: '2024-01-23',
      requirements: ['Valid ID', 'Current License'],
      deliveryTime: 'Instant'
    },
    {
      id: 's2',
      name: 'Professional CV Writing',
      description: 'Professional CV writing service',
      price: 1200,
      category: 'Employment',
      addedBy: 'David Njoroge',
      status: 'pending',
      addedDate: '2024-01-22',
      requirements: ['Current CV', 'Job Targets'],
      deliveryTime: 'Instant'
    },
    {
      id: 's3',
      name: 'Company Registration',
      description: 'Company registration service',
      price: 5000,
      category: 'E-Citizen',
      addedBy: 'Sarah Johnson',
      status: 'pending',
      addedDate: '2024-01-21',
      requirements: ['Business Name', 'Owner Details'],
      deliveryTime: 'Instant'
    }
  ]);

  const [paymentHistory, setPaymentHistory] = useState<PaymentBatch[]>([
    {
      id: 'p1',
      amount: 75000,
      recipientCount: 15,
      status: 'completed',
      date: '2024-01-22'
    },
    {
      id: 'p2',
      amount: 45000,
      recipientCount: 9,
      status: 'completed',
      date: '2024-01-15'
    },
    {
      id: 'p3',
      amount: 60000,
      recipientCount: 12,
      status: 'processing',
      date: '2024-01-23'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkAmount, setBulkAmount] = useState<string>('');
  const [processingBulkPayment, setProcessingBulkPayment] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'services' | 'campaigns' | 'payments' | 'health'>('users');
  
  // Service management states
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<string>('all');
  const [serviceStatusFilter, setServiceStatusFilter] = useState<string>('all');
  
  // Campaign management states
  const [creatingCampaign, setCreatingCampaign] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [campaignSearch, setCampaignSearch] = useState('');
  const [campaignTypeFilter, setCampaignTypeFilter] = useState<string>('all');
  const [campaignStatusFilter, setCampaignStatusFilter] = useState<string>('all');
  
  // New campaign form state
  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    name: '',
    description: '',
    type: 'percentage_discount',
    discountPercentage: 10,
    fixedAmount: 500,
    targetServices: [],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'draft',
    visibility: {
      showBanner: true,
      showPopup: true,
      floatingButton: false,
      badgeIcon: false,
      bannerText: '',
      bannerColor: '#ff6b35'
    },
    createdBy: 'Super Admin'
  });

  useEffect(() => {
    const savedPhone = localStorage.getItem('cyberhub_phone') || sessionStorage.getItem('cyberhub_phone');
    if (savedPhone) {
      setPhone(savedPhone);
    } else {
      router.push('/login');
    }
  }, [router]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const filteredServices = services.filter(service => {
    const matchesSearch = serviceSearch === '' ||
      service.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
      service.description.toLowerCase().includes(serviceSearch.toLowerCase());
    const matchesCategory = serviceCategoryFilter === 'all' || service.category === serviceCategoryFilter;
    const matchesStatus = serviceStatusFilter === 'all' || service.status === serviceStatusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaignSearch === '' ||
      campaign.name.toLowerCase().includes(campaignSearch.toLowerCase()) ||
      campaign.description.toLowerCase().includes(campaignSearch.toLowerCase());
    const matchesType = campaignTypeFilter === 'all' || campaign.type === campaignTypeFilter;
    const matchesStatus = campaignStatusFilter === 'all' || campaign.status === campaignStatusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    totalUsers: users.length,
    activeAgents: users.filter(u => u.role === 'agent' && u.status === 'active').length,
    pendingManagers: users.filter(u => u.role === 'manager' && u.status === 'pending').length,
    totalBalance: users.reduce((sum, user) => sum + user.balance, 0),
    pendingServices: pendingServices.length,
    suspendedUsers: users.filter(u => u.status === 'suspended').length,
    activeServices: services.filter(s => s.status === 'active').length,
    archivedServices: services.filter(s => s.status === 'archived').length,
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    scheduledCampaigns: campaigns.filter(c => c.status === 'scheduled').length
  };

  const handleUserAction = (userId: string, action: 'suspend' | 'activate' | 'remove') => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        if (action === 'remove') return { ...user, status: 'suspended' as const };
        return { ...user, status: action === 'suspend' ? 'suspended' : 'active' };
      }
      return user;
    }));
  };

  const handleServiceAction = (serviceId: string, action: 'approve' | 'reject') => {
    setPendingServices(prev => prev.filter(service => service.id !== serviceId));
  };

  // Service management functions
  const handleArchiveService = (serviceId: string) => {
    setServices(prev => prev.map(service => {
      if (service.id === serviceId) {
        return { ...service, status: 'archived' as const };
      }
      return service;
    }));
  };

  const handleRestoreService = (serviceId: string) => {
    setServices(prev => prev.map(service => {
      if (service.id === serviceId) {
        return { ...service, status: 'active' as const };
      }
      return service;
    }));
  };

  const handleDeleteService = (serviceId: string) => {
    if (confirm('Are you sure you want to permanently delete this service? This action cannot be undone.')) {
      setServices(prev => prev.filter(service => service.id !== serviceId));
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
  };

  const handleSaveService = () => {
    if (!editingService) return;
    
    setServices(prev => prev.map(service => {
      if (service.id === editingService.id) {
        return editingService;
      }
      return service;
    }));
    
    setEditingService(null);
  };

  // Campaign management functions
  const handleCreateCampaign = () => {
    if (!newCampaign.name || !newCampaign.description) {
      alert('Please fill in campaign name and description');
      return;
    }

    const campaign: Campaign = {
      id: `c${campaigns.length + 1}`,
      name: newCampaign.name || '',
      description: newCampaign.description || '',
      type: newCampaign.type || 'percentage_discount',
      discountPercentage: newCampaign.discountPercentage,
      fixedAmount: newCampaign.fixedAmount,
      mainServiceId: newCampaign.mainServiceId,
      addonServiceId: newCampaign.addonServiceId,
      addonDiscountPercentage: newCampaign.addonDiscountPercentage,
      bundleServices: newCampaign.bundleServices,
      bundlePrice: newCampaign.bundlePrice,
      targetServices: newCampaign.targetServices || [],
      startDate: newCampaign.startDate || new Date().toISOString().split('T')[0],
      endDate: newCampaign.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'draft',
      visibility: newCampaign.visibility || {
        showBanner: true,
        showPopup: false,
        floatingButton: false,
        badgeIcon: false
      },
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: 'Super Admin'
    };

    setCampaigns(prev => [...prev, campaign]);
    setCreatingCampaign(false);
    setNewCampaign({
      name: '',
      description: '',
      type: 'percentage_discount',
      discountPercentage: 10,
      fixedAmount: 500,
      targetServices: [],
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'draft',
      visibility: {
        showBanner: true,
        showPopup: false,
        floatingButton: false,
        badgeIcon: false,
        bannerText: '',
        bannerColor: '#ff6b35'
      },
      createdBy: 'Super Admin'
    });
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
  };

  const handleSaveCampaign = () => {
    if (!editingCampaign) return;
    
    setCampaigns(prev => prev.map(campaign => {
      if (campaign.id === editingCampaign.id) {
        return editingCampaign;
      }
      return campaign;
    }));
    
    setEditingCampaign(null);
  };

  const handleDeleteCampaign = (campaignId: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      setCampaigns(prev => prev.filter(campaign => campaign.id !== campaignId));
    }
  };

  const handleActivateCampaign = (campaignId: string) => {
    setCampaigns(prev => prev.map(campaign => {
      if (campaign.id === campaignId) {
        return { ...campaign, status: 'active' as const };
      }
      return campaign;
    }));
  };

  const handleDeactivateCampaign = (campaignId: string) => {
    setCampaigns(prev => prev.map(campaign => {
      if (campaign.id === campaignId) {
        return { ...campaign, status: 'ended' as const };
      }
      return campaign;
    }));
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    const selectableUsers = filteredUsers.filter(u => u.role !== 'user' && u.balance > 0);
    if (selectedUsers.length === selectableUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(selectableUsers.map(u => u.id));
    }
  };

  const handleBulkPayment = () => {
    if (selectedUsers.length === 0 || !bulkAmount || parseFloat(bulkAmount) <= 0) return;

    setProcessingBulkPayment(true);
    const amount = parseFloat(bulkAmount);
    const totalAmount = amount * selectedUsers.length;

    // Create new payment batch
    const newBatch: PaymentBatch = {
      id: `p${paymentHistory.length + 1}`,
      amount: totalAmount,
      recipientCount: selectedUsers.length,
      status: 'processing',
      date: new Date().toISOString().split('T')[0]
    };

    // Simulate payment processing
    setTimeout(() => {
      // Update user balances
      setUsers(prev => prev.map(user => {
        if (selectedUsers.includes(user.id) && user.balance >= amount) {
          return { ...user, balance: user.balance - amount };
        }
        return user;
      }));

      // Update payment batch status
      newBatch.status = 'completed';
      setPaymentHistory(prev => [newBatch, ...prev]);

      // Reset
      setSelectedUsers([]);
      setBulkAmount('');
      setProcessingBulkPayment(false);
    }, 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('cyberhub_phone');
    localStorage.removeItem('cyberhub_role');
    sessionStorage.removeItem('cyberhub_phone');
    sessionStorage.removeItem('cyberhub_role');
    router.push('/login');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-700';
      case 'manager': return 'bg-blue-100 text-blue-700';
      case 'agent': return 'bg-green-100 text-green-700';
      case 'user': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'suspended': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'archived': return 'bg-gray-100 text-gray-700';
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'ended': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCampaignTypeColor = (type: string) => {
    switch (type) {
      case 'percentage_discount': return 'bg-green-100 text-green-700';
      case 'fixed_discount': return 'bg-blue-100 text-blue-700';
      case 'free_addon': return 'bg-purple-100 text-purple-700';
      case 'discounted_addon': return 'bg-orange-100 text-orange-700';
      case 'bundle': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCampaignTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage_discount': return <Percent className="h-4 w-4" />;
      case 'fixed_discount': return <TagIcon className="h-4 w-4" />;
      case 'free_addon': return <Gift className="h-4 w-4" />;
      case 'discounted_addon': return <Percent className="h-4 w-4" />;
      case 'bundle': return <Package className="h-4 w-4" />;
      default: return <TagIcon className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'E-Citizen': return <Shield className="h-4 w-4" />;
      case 'Education': return <GraduationCap className="h-4 w-4" />;
      case 'Employment': return <Building className="h-4 w-4" />;
      case 'Training': return <BrainCircuit className="h-4 w-4" />;
      default: return <Layers className="h-4 w-4" />;
    }
  };

  const getServiceName = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service ? service.name : 'Unknown Service';
  };

  const getCampaignDetails = (campaign: Campaign) => {
    switch (campaign.type) {
      case 'percentage_discount':
        return `${campaign.discountPercentage}% off selected services`;
      case 'fixed_discount':
        return `KES ${campaign.fixedAmount} off selected services`;
      case 'free_addon':
        return `Buy ${getServiceName(campaign.mainServiceId || '')}, get ${getServiceName(campaign.addonServiceId || '')} FREE`;
      case 'discounted_addon':
        return `Buy ${getServiceName(campaign.mainServiceId || '')}, get ${getServiceName(campaign.addonServiceId || '')} at ${campaign.addonDiscountPercentage}% off`;
      case 'bundle':
        return `${campaign.bundleServices?.length || 0} services bundle at KES ${campaign.bundlePrice}`;
      default:
        return 'Campaign';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-2 rounded-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-black bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                  Veritas Super Admin
                </span>
              </div>
              <div className="hidden md:flex items-center gap-4">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'users' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Users
                </button>
                <button
                  onClick={() => setActiveTab('services')}
                  className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'services' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Services
                </button>
                <button
                  onClick={() => setActiveTab('campaigns')}
                  className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'campaigns' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Campaigns
                </button>
                <button
                  onClick={() => setActiveTab('payments')}
                  className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'payments' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Payments
                </button>
                <button
                  onClick={() => setActiveTab('health')}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${activeTab === 'health' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Activity className="h-4 w-4" />
                  Health
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {phone && (
                <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">{phone}</span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-100 to-purple-200">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-green-100 text-green-700">
                Live
              </span>
            </div>
            <div className="text-3xl font-black text-gray-900">{stats.totalUsers}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>

          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-green-100 to-green-200">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
              <button onClick={() => setShowBalance(!showBalance)}>
                {showBalance ? <Eye className="h-4 w-4 text-gray-500" /> : <EyeOff className="h-4 w-4 text-gray-500" />}
              </button>
            </div>
            <div className="text-3xl font-black text-gray-900">
              {showBalance ? `KES ${stats.totalBalance.toLocaleString()}` : '••••••'}
            </div>
            <div className="text-sm text-gray-600">Total Platform Balance</div>
          </div>

          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-100 to-blue-200">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-green-100 text-green-700">
                {stats.activeServices} active
              </span>
            </div>
            <div className="text-3xl font-black text-gray-900">{stats.activeServices}</div>
            <div className="text-sm text-gray-600">Active Services</div>
          </div>

          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-orange-100 to-orange-200">
                <Megaphone className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                {stats.activeCampaigns} active
              </span>
            </div>
            <div className="text-3xl font-black text-gray-900">{stats.activeCampaigns}</div>
            <div className="text-sm text-gray-600">Active Campaigns</div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Panel - Bulk Actions & Filters */}
          {activeTab !== 'health' && (
            <div className="lg:w-1/3 space-y-6">
              {/* Bulk Payment Card */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-purple-100 to-purple-200">
                    <Send className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Bulk Payment</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Selected Users</span>
                    <span className="font-bold text-gray-900">{selectedUsers.length} users</span>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Amount per user (KES)
                    </label>
                    <input
                      type="number"
                      value={bulkAmount}
                      onChange={(e) => setBulkAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Amount</span>
                      <span className="font-bold text-gray-900">
                        KES {bulkAmount && selectedUsers.length > 0 ? (parseFloat(bulkAmount) * selectedUsers.length).toLocaleString() : '0'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleBulkPayment}
                    disabled={selectedUsers.length === 0 || !bulkAmount || processingBulkPayment}
                    className={`w-full py-3.5 px-6 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-3 ${
                      selectedUsers.length === 0 || !bulkAmount || processingBulkPayment
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-purple-800 hover:opacity-90 hover:scale-[1.02]'
                    }`}
                  >
                    {processingBulkPayment ? (
                      <>
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Pay {selectedUsers.length} Users
                      </>
                    )}
                  </button>

                  <button
                    onClick={selectAllUsers}
                    className="w-full py-2.5 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg"
                  >
                    {selectedUsers.length === filteredUsers.filter(u => u.role !== 'user' && u.balance > 0).length
                      ? 'Deselect All'
                      : 'Select All With Balance'}
                  </button>
                </div>
              </div>

              {/* Filters Card */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-100 to-blue-200">
                    <Filter className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Search</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search by name or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <div className="flex flex-wrap gap-2">
                      {['all', 'user', 'agent', 'manager'].map(role => (
                        <button
                          key={role}
                          onClick={() => setRoleFilter(role)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${
                            roleFilter === role
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {role === 'all' ? 'All Roles' : role}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="flex flex-wrap gap-2">
                      {['all', 'active', 'suspended', 'pending'].map(status => (
                        <button
                          key={status}
                          onClick={() => setStatusFilter(status)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${
                            statusFilter === status
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {status === 'all' ? 'All Status' : status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Right Panel - Content based on active tab */}
          <div className={activeTab !== 'health' ? 'lg:w-2/3' : 'w-full'}>
            {activeTab === 'users' ? (
              <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">User Management</h3>
                      <p className="text-sm text-gray-600">{filteredUsers.length} users found</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-green-100 text-green-700">
                        Real-time
                      </span>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <RefreshCw className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-6 text-left">
                          <input
                            type="checkbox"
                            checked={selectedUsers.length === filteredUsers.filter(u => u.role !== 'user' && u.balance > 0).length && filteredUsers.filter(u => u.role !== 'user' && u.balance > 0).length > 0}
                            onChange={selectAllUsers}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User</th>
                        <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Role</th>
                        <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Balance</th>
                        <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredUsers.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => toggleUserSelection(user.id)}
                              disabled={user.role === 'user' || user.balance <= 0}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 disabled:opacity-50"
                            />
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${getRoleColor(user.role)}`}>
                                {user.role === 'agent' ? <UserCheck className="h-4 w-4" /> :
                                  user.role === 'manager' ? <Shield className="h-4 w-4" /> :
                                  <Users className="h-4 w-4" />}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.phone}</div>
                                <div className="text-xs text-gray-400">Joined {user.joinDate}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getRoleColor(user.role)}`}>
                              {user.role.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-bold text-gray-900">
                              KES {showBalance ? user.balance.toLocaleString() : '••••'}
                            </div>
                            {user.role === 'agent' && (
                              <div className="text-xs text-gray-500">{user.completedTasks} tasks</div>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(user.status)}`}>
                                {user.status}
                              </span>
                              <span className="text-xs text-gray-500">{user.lastActive}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              {user.status === 'active' ? (
                                <button
                                  onClick={() => handleUserAction(user.id, 'suspend')}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                                >
                                  <UserX className="h-3 w-3" />
                                  Suspend
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUserAction(user.id, 'activate')}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg"
                                >
                                  <UserCheck className="h-3 w-3" />
                                  Activate
                                </button>
                              )}
                              {user.role === 'manager' && user.status === 'pending' && (
                                <button
                                  onClick={() => handleUserAction(user.id, 'activate')}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                  Approve
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredUsers.length === 0 && (
                    <div className="p-12 text-center">
                      <div className="bg-gray-100 p-4 rounded-2xl inline-block mb-4">
                        <Search className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600">No users found</p>
                      <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
                    </div>
                  )}
                </div>
              </div>
            ) : activeTab === 'services' ? (
              <div className="space-y-6">
                {/* Service Management Card */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Service Management</h3>
                        <p className="text-sm text-gray-600">{filteredServices.length} services found</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <Search className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            placeholder="Search services..."
                            value={serviceSearch}
                            onChange={(e) => setServiceSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-gray-50 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Service Filters */}
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex flex-wrap gap-2">
                        <span className="text-sm font-medium text-gray-700">Category:</span>
                        {['all', 'E-Citizen', 'Education', 'Employment', 'Training'].map(category => (
                          <button
                            key={category}
                            onClick={() => setServiceCategoryFilter(category)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium ${
                              serviceCategoryFilter === category
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {category === 'all' ? 'All' : category}
                          </button>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-sm font-medium text-gray-700">Status:</span>
                        {['all', 'active', 'archived'].map(status => (
                          <button
                            key={status}
                            onClick={() => setServiceStatusFilter(status)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium capitalize ${
                              serviceStatusFilter === status
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {status === 'all' ? 'All' : status}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {filteredServices.map(service => (
                      <div key={service.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`p-2 rounded-lg ${service.status === 'archived' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-600'}`}>
                                {getCategoryIcon(service.category)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-gray-900">{service.name}</h4>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                                    {service.status}
                                  </span>
                                  {service.popular && (
                                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                                      Popular
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                              <div>
                                <div className="text-xs text-gray-500">Price</div>
                                <div className="font-medium text-gray-900">KES {service.price.toLocaleString()}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Category</div>
                                <div className="font-medium text-gray-900">{service.category}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Delivery</div>
                                <div className="font-medium text-gray-900">{service.deliveryTime}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Added</div>
                                <div className="font-medium text-gray-900">{service.addedDate} by {service.addedBy}</div>
                              </div>
                            </div>
                            <div className="mt-3">
                              <div className="text-xs text-gray-500">Requirements:</div>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {service.requirements.map((req, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                    {req}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            <button
                              onClick={() => handleEditService(service)}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-medium"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </button>
                            {service.status === 'active' ? (
                              <button
                                onClick={() => handleArchiveService(service.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium"
                              >
                                <Archive className="h-4 w-4" />
                                Archive
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRestoreService(service.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg font-medium"
                              >
                                <EyeIcon className="h-4 w-4" />
                                Restore
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteService(service.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredServices.length === 0 && (
                      <div className="p-12 text-center">
                        <div className="bg-gray-100 p-4 rounded-2xl inline-block mb-4">
                          <Search className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600">No services found</p>
                        <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pending Services Section */}
                {pendingServices.length > 0 && (
                  <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Pending Service Approvals</h3>
                          <p className="text-sm text-gray-600">{pendingServices.length} services pending approval</p>
                        </div>
                      </div>
                    </div>

                    <div className="divide-y divide-gray-200">
                      {pendingServices.map(service => (
                        <div key={service.id} className="p-6 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-bold text-gray-900">{service.name}</h4>
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                                  {service.category}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <div className="text-xs text-gray-500">Price</div>
                                  <div className="font-medium text-gray-900">KES {service.price.toLocaleString()}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Added By</div>
                                  <div className="font-medium text-gray-900">{service.addedBy}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Added Date</div>
                                  <div className="font-medium text-gray-900">{service.addedDate}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Status</div>
                                  <div className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded inline-block">
                                    Pending
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={() => handleServiceAction(service.id, 'approve')}
                                className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg font-medium"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleServiceAction(service.id, 'reject')}
                                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium"
                              >
                                <XCircle className="h-4 w-4" />
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : activeTab === 'campaigns' ? (
              <div className="space-y-6">
                {/* Campaign Management Header */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Campaign Management</h3>
                      <p className="text-sm text-gray-600">Create and manage marketing campaigns</p>
                    </div>
                    <button
                      onClick={() => setCreatingCampaign(true)}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-medium rounded-lg hover:opacity-90 flex items-center gap-2"
                    >
                      <Megaphone className="h-5 w-5" />
                      Create Campaign
                    </button>
                  </div>

                  {/* Campaign Filters */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          placeholder="Search campaigns..."
                          value={campaignSearch}
                          onChange={(e) => setCampaignSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-gray-50 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm font-medium text-gray-700">Type:</span>
                      {['all', 'percentage_discount', 'fixed_discount', 'free_addon', 'discounted_addon', 'bundle'].map(type => (
                        <button
                          key={type}
                          onClick={() => setCampaignTypeFilter(type)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium capitalize ${
                            campaignTypeFilter === type
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {type === 'all' ? 'All' : type.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm font-medium text-gray-700">Status:</span>
                      {['all', 'draft', 'active', 'scheduled', 'ended'].map(status => (
                        <button
                          key={status}
                          onClick={() => setCampaignStatusFilter(status)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium capitalize ${
                            campaignStatusFilter === status
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Campaign Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-4 text-center">
                      <div className="text-xl font-black text-green-700">
                        {campaigns.filter(c => c.status === 'active').length}
                      </div>
                      <div className="text-sm text-green-600">Active</div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 text-center">
                      <div className="text-xl font-black text-blue-700">
                        {campaigns.filter(c => c.status === 'scheduled').length}
                      </div>
                      <div className="text-sm text-blue-600">Scheduled</div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4 text-center">
                      <div className="text-xl font-black text-purple-700">
                        {campaigns.filter(c => c.type === 'free_addon').length}
                      </div>
                      <div className="text-sm text-purple-600">Add-on Deals</div>
                    </div>
                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4 text-center">
                      <div className="text-xl font-black text-orange-700">{campaigns.length}</div>
                      <div className="text-sm text-orange-600">Total Campaigns</div>
                    </div>
                  </div>
                </div>

                {/* Campaigns List */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg">
                  <div className="p-6 border-b border-gray-200">
                    <h4 className="text-lg font-bold text-gray-900">All Campaigns</h4>
                    <p className="text-sm text-gray-600">{filteredCampaigns.length} campaigns found</p>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {filteredCampaigns.map(campaign => (
                      <div key={campaign.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`p-2 rounded-lg ${getCampaignTypeColor(campaign.type)}`}>
                                {getCampaignTypeIcon(campaign.type)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-gray-900">{campaign.name}</h4>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(campaign.status)}`}>
                                    {campaign.status}
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getCampaignTypeColor(campaign.type)}`}>
                                    {campaign.type.replace('_', ' ')}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>
                                <p className="text-sm text-gray-700 mt-2 font-medium">{getCampaignDetails(campaign)}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                              <div>
                                <div className="text-xs text-gray-500">Duration</div>
                                <div className="font-medium text-gray-900">
                                  {campaign.startDate} to {campaign.endDate}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Target Services</div>
                                <div className="font-medium text-gray-900">
                                  {campaign.targetServices.length} services
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Visibility</div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {campaign.visibility.showBanner && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Banner</span>
                                  )}
                                  {campaign.visibility.showPopup && (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Popup</span>
                                  )}
                                  {campaign.visibility.floatingButton && (
                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">Button</span>
                                  )}
                                  {campaign.visibility.badgeIcon && (
                                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">Badge</span>
                                  )}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Created</div>
                                <div className="font-medium text-gray-900">
                                  {campaign.createdAt} by {campaign.createdBy}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            <button
                              onClick={() => handleEditCampaign(campaign)}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-medium"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </button>
                            {campaign.status === 'active' ? (
                              <button
                                onClick={() => handleDeactivateCampaign(campaign.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium"
                              >
                                <XCircle className="h-4 w-4" />
                                Deactivate
                              </button>
                            ) : campaign.status === 'draft' || campaign.status === 'scheduled' ? (
                              <button
                                onClick={() => handleActivateCampaign(campaign.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg font-medium"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Activate
                              </button>
                            ) : null}
                            <button
                              onClick={() => handleDeleteCampaign(campaign.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredCampaigns.length === 0 && (
                      <div className="p-12 text-center">
                        <div className="bg-gray-100 p-4 rounded-2xl inline-block mb-4">
                          <Megaphone className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600">No campaigns found</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {campaignSearch ? 'Try a different search term' : 'Create your first campaign'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : activeTab === 'payments' ? (
              <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900">Payment History</h3>
                  <p className="text-sm text-gray-600">Recent bulk payments processed</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                        <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                        <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Recipients</th>
                        <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paymentHistory.map(payment => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="py-4 px-6 font-medium text-gray-900">{payment.date}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-green-500" />
                              <span className="font-bold text-gray-900">KES {payment.amount.toLocaleString()}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-blue-500" />
                              <span className="text-gray-700">{payment.recipientCount} users</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              payment.status === 'completed' 
                                ? 'bg-green-100 text-green-700'
                                : payment.status === 'processing'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : activeTab === 'health' ? (
              <HealthWidget />
            ) : null}
          </div>
        </div>
      </main>

      {/* Edit Service Modal */}
      {editingService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Edit Service</h3>
              <button
                onClick={() => setEditingService(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Name</label>
                <input
                  type="text"
                  value={editingService.name}
                  onChange={(e) => setEditingService({...editingService, name: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editingService.description}
                  onChange={(e) => setEditingService({...editingService, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (KES)</label>
                  <input
                    type="number"
                    value={editingService.price}
                    onChange={(e) => setEditingService({...editingService, price: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={editingService.category}
                    onChange={(e) => setEditingService({...editingService, category: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="E-Citizen">E-Citizen</option>
                    <option value="Education">Education</option>
                    <option value="Employment">Employment</option>
                    <option value="Training">Training</option>
                    <option value="Lifestyle">Lifestyle</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Time</label>
                <input
                  type="text"
                  value={editingService.deliveryTime}
                  onChange={(e) => setEditingService({...editingService, deliveryTime: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Instant, 24 hours, 3-5 days"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Requirements (comma separated)</label>
                <input
                  type="text"
                  value={editingService.requirements.join(', ')}
                  onChange={(e) => setEditingService({...editingService, requirements: e.target.value.split(',').map(r => r.trim())})}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Valid ID, Passport Photo, Contact Details"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="popular"
                  checked={editingService.popular}
                  onChange={(e) => setEditingService({...editingService, popular: e.target.checked})}
                  className="h-4 w-4 text-purple-600 rounded"
                />
                <label htmlFor="popular" className="text-sm font-medium text-gray-700">
                  Mark as Popular Service
                </label>
              </div>

              <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setEditingService(null)}
                  className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveService}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-medium rounded-lg hover:opacity-90"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {creatingCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Create New Campaign</h3>
              <button
                onClick={() => setCreatingCampaign(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Campaign Basics */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name *</label>
                  <input
                    type="text"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                    placeholder="e.g., Tax Season Special"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Type *</label>
                  <select
                    value={newCampaign.type}
                    onChange={(e) => setNewCampaign({...newCampaign, type: e.target.value as any})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="percentage_discount">Percentage Discount</option>
                    <option value="fixed_discount">Fixed Amount Off</option>
                    <option value="free_addon">Free Service Add-on</option>
                    <option value="discounted_addon">Discounted Add-on</option>
                    <option value="bundle">Bundle Deal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                  rows={2}
                  placeholder="Describe your campaign..."
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Campaign Type Specific Fields */}
              {newCampaign.type === 'percentage_discount' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount Percentage *</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="5"
                      max="50"
                      step="5"
                      value={newCampaign.discountPercentage || 10}
                      onChange={(e) => setNewCampaign({...newCampaign, discountPercentage: parseInt(e.target.value)})}
                      className="flex-1"
                    />
                    <span className="text-lg font-bold text-gray-900">{newCampaign.discountPercentage || 10}%</span>
                  </div>
                </div>
              )}

              {newCampaign.type === 'fixed_discount' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fixed Amount Off (KES) *</label>
                  <input
                    type="number"
                    value={newCampaign.fixedAmount || 500}
                    onChange={(e) => setNewCampaign({...newCampaign, fixedAmount: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              )}

              {(newCampaign.type === 'free_addon' || newCampaign.type === 'discounted_addon') && (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Main Service *</label>
                    <select
                      value={newCampaign.mainServiceId}
                      onChange={(e) => setNewCampaign({...newCampaign, mainServiceId: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select main service</option>
                      {services.filter(s => s.status === 'active').map(service => (
                        <option key={service.id} value={service.id}>{service.name} (KES {service.price})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {newCampaign.type === 'free_addon' ? 'Free Add-on Service *' : 'Add-on Service *'}
                    </label>
                    <select
                      value={newCampaign.addonServiceId}
                      onChange={(e) => setNewCampaign({...newCampaign, addonServiceId: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select add-on service</option>
                      {services.filter(s => s.status === 'active').map(service => (
                        <option key={service.id} value={service.id}>{service.name} (KES {service.price})</option>
                      ))}
                    </select>
                  </div>
                  {newCampaign.type === 'discounted_addon' && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Add-on Discount Percentage *</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="10"
                          max="90"
                          step="5"
                          value={newCampaign.addonDiscountPercentage || 50}
                          onChange={(e) => setNewCampaign({...newCampaign, addonDiscountPercentage: parseInt(e.target.value)})}
                          className="flex-1"
                        />
                        <span className="text-lg font-bold text-gray-900">{newCampaign.addonDiscountPercentage || 50}%</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {newCampaign.type === 'bundle' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Services for Bundle *</label>
                    <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto p-3 bg-gray-50 rounded-lg">
                      {services.filter(s => s.status === 'active').map(service => (
                        <div key={service.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`service-${service.id}`}
                            checked={newCampaign.bundleServices?.includes(service.id) || false}
                            onChange={(e) => {
                              const updatedServices = e.target.checked
                                ? [...(newCampaign.bundleServices || []), service.id]
                                : (newCampaign.bundleServices || []).filter(id => id !== service.id);
                              setNewCampaign({...newCampaign, bundleServices: updatedServices});
                            }}
                            className="h-4 w-4 text-purple-600 rounded"
                          />
                          <label htmlFor={`service-${service.id}`} className="text-sm text-gray-700">
                            {service.name} (KES {service.price})
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bundle Price (KES) *</label>
                    <input
                      type="number"
                      value={newCampaign.bundlePrice}
                      onChange={(e) => setNewCampaign({...newCampaign, bundlePrice: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter bundle price"
                    />
                  </div>
                </div>
              )}

              {/* Target Services */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Services *</label>
                <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto p-3 bg-gray-50 rounded-lg">
                  {services.filter(s => s.status === 'active').map(service => (
                    <div key={service.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`target-${service.id}`}
                        checked={newCampaign.targetServices?.includes(service.id) || false}
                        onChange={(e) => {
                          const updatedServices = e.target.checked
                            ? [...(newCampaign.targetServices || []), service.id]
                            : (newCampaign.targetServices || []).filter(id => id !== service.id);
                          setNewCampaign({...newCampaign, targetServices: updatedServices});
                        }}
                        className="h-4 w-4 text-purple-600 rounded"
                      />
                      <label htmlFor={`target-${service.id}`} className="text-sm text-gray-700">
                        {service.name} ({service.category})
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                  <input
                    type="date"
                    value={newCampaign.startDate}
                    onChange={(e) => setNewCampaign({...newCampaign, startDate: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                  <input
                    type="date"
                    value={newCampaign.endDate}
                    onChange={(e) => setNewCampaign({...newCampaign, endDate: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Visibility Options */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Visibility Options</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="showBanner"
                      checked={newCampaign.visibility?.showBanner || false}
                      onChange={(e) => setNewCampaign({
                        ...newCampaign,
                        visibility: {...newCampaign.visibility!, showBanner: e.target.checked}
                      })}
                      className="h-4 w-4 text-purple-600 rounded"
                    />
                    <label htmlFor="showBanner" className="text-sm font-medium text-gray-700">
                      Show Banner on all pages
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="showPopup"
                      checked={newCampaign.visibility?.showPopup || false}
                      onChange={(e) => setNewCampaign({
                        ...newCampaign,
                        visibility: {...newCampaign.visibility!, showPopup: e.target.checked}
                      })}
                      className="h-4 w-4 text-purple-600 rounded"
                    />
                    <label htmlFor="showPopup" className="text-sm font-medium text-gray-700">
                      Show Popup on first visit
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="floatingButton"
                      checked={newCampaign.visibility?.floatingButton || false}
                      onChange={(e) => setNewCampaign({
                        ...newCampaign,
                        visibility: {...newCampaign.visibility!, floatingButton: e.target.checked}
                      })}
                      className="h-4 w-4 text-purple-600 rounded"
                    />
                    <label htmlFor="floatingButton" className="text-sm font-medium text-gray-700">
                      Show Floating Button
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="badgeIcon"
                      checked={newCampaign.visibility?.badgeIcon || false}
                      onChange={(e) => setNewCampaign({
                        ...newCampaign,
                        visibility: {...newCampaign.visibility!, badgeIcon: e.target.checked}
                      })}
                      className="h-4 w-4 text-purple-600 rounded"
                    />
                    <label htmlFor="badgeIcon" className="text-sm font-medium text-gray-700">
                      Show Badge on App Icon
                    </label>
                  </div>
                </div>

                {newCampaign.visibility?.showBanner && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Banner Text</label>
                      <input
                        type="text"
                        value={newCampaign.visibility?.bannerText || ''}
                        onChange={(e) => setNewCampaign({
                          ...newCampaign,
                          visibility: {...newCampaign.visibility!, bannerText: e.target.value}
                        })}
                        placeholder="e.g., 🎉 Special Offer - 20% OFF!"
                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Banner Color</label>
                      <input
                        type="color"
                        value={newCampaign.visibility?.bannerColor || '#ff6b35'}
                        onChange={(e) => setNewCampaign({
                          ...newCampaign,
                          visibility: {...newCampaign.visibility!, bannerColor: e.target.value}
                        })}
                        className="w-full h-12 cursor-pointer rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setCreatingCampaign(false)}
                  className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCampaign}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-medium rounded-lg hover:opacity-90"
                >
                  Create Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Campaign Modal */}
      {editingCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Edit Campaign</h3>
              <button
                onClick={() => setEditingCampaign(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
                  <input
                    type="text"
                    value={editingCampaign.name}
                    onChange={(e) => setEditingCampaign({...editingCampaign, name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={editingCampaign.status}
                    onChange={(e) => setEditingCampaign({...editingCampaign, status: e.target.value as any})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="ended">Ended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editingCampaign.description}
                  onChange={(e) => setEditingCampaign({...editingCampaign, description: e.target.value})}
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Campaign Type Specific Fields */}
              {editingCampaign.type === 'percentage_discount' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount Percentage</label>
                  <input
                    type="number"
                    value={editingCampaign.discountPercentage || 10}
                    onChange={(e) => setEditingCampaign({...editingCampaign, discountPercentage: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              )}

              {editingCampaign.type === 'fixed_discount' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fixed Amount Off (KES)</label>
                  <input
                    type="number"
                    value={editingCampaign.fixedAmount || 500}
                    onChange={(e) => setEditingCampaign({...editingCampaign, fixedAmount: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={editingCampaign.startDate}
                    onChange={(e) => setEditingCampaign({...editingCampaign, startDate: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={editingCampaign.endDate}
                    onChange={(e) => setEditingCampaign({...editingCampaign, endDate: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setEditingCampaign(null)}
                  className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCampaign}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-medium rounded-lg hover:opacity-90"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-2 rounded-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-black bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                  Veritas Super Admin
                </span>
                <p className="text-xs text-gray-600">Full platform control & management</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-green-500" />
                <span>System Status: Operational</span>
              </div>
              <div className="h-4 w-px bg-gray-300"></div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-blue-500" />
                <span>{stats.totalUsers} Active Users</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}