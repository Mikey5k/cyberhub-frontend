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
  Server, Database, Smartphone, Wifi, WifiOff,
  Crown, BookOpen, Mail, FileEdit, MessageSquare,
  Sparkles, Users as UsersIcon, CreditCard as CreditCardIcon
} from 'lucide-react';
import HealthWidget from '@/components/HealthWidget';
import Papa from 'papaparse';

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

interface ContentItem {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'job' | 'bursary' | 'scholarship' | 'internship' | 'hostel' | 'e-citizen';
  postedDate: string;
  deadline?: string;
  location?: string;
  institution?: string;
  amount?: number;
  duration?: string;
  requirements?: string[];
  contact?: string;
  status: 'active' | 'expired' | 'draft';
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  type: 'free' | 'basic' | 'premium' | 'enterprise';
  priceMonthly: number;
  priceYearly?: number;
  features: string[];
  maxListingsAccess: number;
  maxNewListingsPerDay: number;
  canAccessNewListings: boolean;
  canAutoApply: boolean;
  maxApplicationsPerMonth: number;
  includesCVBuilder: boolean;
  includesEmailGenerator: boolean;
  includesWhatsAppSupport: boolean;
  popular?: boolean;
}

interface Bundle {
  id: string;
  name: string;
  description: string;
  services: string[];
  originalPrice: number;
  bundlePrice: number;
  discountPercentage: number;
  validityDays: number;
  status: 'active' | 'archived';
}

interface PricingConfig {
  subscriptionPlans: SubscriptionPlan[];
  bundles: Bundle[];
  individualServices: {
    assistedJobApplication: number;
    autoJobApplication: number;
    cvBuilder: number;
    emailGenerator: number;
    whatsAppInquiry: number;
    scholarshipApplication: number;
    bursaryApplication: number;
    internshipApplication: number;
    hostelBooking: number;
  };
  currency: string;
  whatsAppNumber: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [phone, setPhone] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  
  // Empty initial states - all data will come from APIs
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [pendingServices, setPendingServices] = useState<Service[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  
  // Default pricing config
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>({
    subscriptionPlans: [
      {
        id: 'free',
        name: 'Free',
        description: 'Basic access with limited features',
        type: 'free',
        priceMonthly: 0,
        features: [
          'Access to 10 older listings per day',
          'Basic job search',
          'View listing details',
          'Save favorites'
        ],
        maxListingsAccess: 10,
        maxNewListingsPerDay: 0,
        canAccessNewListings: false,
        canAutoApply: false,
        maxApplicationsPerMonth: 2,
        includesCVBuilder: false,
        includesEmailGenerator: false,
        includesWhatsAppSupport: false
      },
      {
        id: 'basic',
        name: 'Basic Monthly',
        description: 'Access newest listings and basic tools',
        type: 'basic',
        priceMonthly: 50,
        priceYearly: 500,
        features: [
          'Unlimited listings access',
          'Newest listings (within 1 hour)',
          'Assisted application (1 per month)',
          'Basic CV builder',
          'Email templates'
        ],
        maxListingsAccess: 9999,
        maxNewListingsPerDay: 50,
        canAccessNewListings: true,
        canAutoApply: false,
        maxApplicationsPerMonth: 5,
        includesCVBuilder: true,
        includesEmailGenerator: true,
        includesWhatsAppSupport: false,
        popular: true
      },
      {
        id: 'premium',
        name: 'Premium',
        description: 'Full access with auto-application',
        type: 'premium',
        priceMonthly: 300,
        priceYearly: 3000,
        features: [
          'Everything in Basic',
          'Auto-application to 10 jobs/month',
          'Priority CV review',
          'Unlimited WhatsApp support',
          'Scholarship/bursary auto-apply',
          'Internship matching'
        ],
        maxListingsAccess: 9999,
        maxNewListingsPerDay: 200,
        canAccessNewListings: true,
        canAutoApply: true,
        maxApplicationsPerMonth: 30,
        includesCVBuilder: true,
        includesEmailGenerator: true,
        includesWhatsAppSupport: true
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'For institutions and agencies',
        type: 'enterprise',
        priceMonthly: 1000,
        priceYearly: 10000,
        features: [
          'Everything in Premium',
          'Unlimited auto-applications',
          'Bulk CV processing',
          'API access',
          'Custom reporting',
          'Dedicated account manager'
        ],
        maxListingsAccess: 99999,
        maxNewListingsPerDay: 1000,
        canAccessNewListings: true,
        canAutoApply: true,
        maxApplicationsPerMonth: 999,
        includesCVBuilder: true,
        includesEmailGenerator: true,
        includesWhatsAppSupport: true
      }
    ],
    bundles: [
      {
        id: 'bundle1',
        name: 'Job Seeker Starter Pack',
        description: 'Everything you need to start applying',
        services: ['assistedJobApplication', 'cvBuilder', 'emailGenerator'],
        originalPrice: 800,
        bundlePrice: 500,
        discountPercentage: 38,
        validityDays: 30,
        status: 'active'
      },
      {
        id: 'bundle2',
        name: 'Student Success Bundle',
        description: 'Complete student support package',
        services: ['scholarshipApplication', 'bursaryApplication', 'internshipApplication'],
        originalPrice: 1200,
        bundlePrice: 800,
        discountPercentage: 33,
        validityDays: 60,
        status: 'active'
      }
    ],
    individualServices: {
      assistedJobApplication: 500,
      autoJobApplication: 3000,
      cvBuilder: 200,
      emailGenerator: 100,
      whatsAppInquiry: 50,
      scholarshipApplication: 300,
      bursaryApplication: 250,
      internshipApplication: 400,
      hostelBooking: 150
    },
    currency: 'KES',
    whatsAppNumber: '+254708949580'
  });

  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkAmount, setBulkAmount] = useState<string>('');
  const [processingBulkPayment, setProcessingBulkPayment] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'services' | 'campaigns' | 'payments' | 'health' | 'content' | 'pricing'>('users');
  
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<string>('all');
  const [serviceStatusFilter, setServiceStatusFilter] = useState<string>('all');
  
  const [creatingCampaign, setCreatingCampaign] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [campaignSearch, setCampaignSearch] = useState('');
  const [campaignTypeFilter, setCampaignTypeFilter] = useState<string>('all');
  const [campaignStatusFilter, setCampaignStatusFilter] = useState<string>('all');
  
  const [selectedContentType, setSelectedContentType] = useState<'job' | 'bursary' | 'scholarship' | 'internship' | 'hostel' | 'e-citizen'>('job');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [contentSearch, setContentSearch] = useState('');
  const [contentStatusFilter, setContentStatusFilter] = useState<string>('all');
  
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);
  const [editingIndividualPrices, setEditingIndividualPrices] = useState(false);

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch users
        const usersResponse = await fetch('/api/users');
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          if (usersData.success) {
            setUsers(usersData.data || []);
          }
        }
        
        // Fetch content (jobs, bursaries, etc.)
        const contentResponse = await fetch('/api/jobs');
        if (contentResponse.ok) {
          const contentData = await contentResponse.json();
          if (contentData.success) {
            setContentItems(contentData.data || []);
          }
        }
        
        // TODO: Fetch services, campaigns, payment history from their respective APIs
        // These endpoints need to be created
        // const servicesResponse = await fetch('/api/services');
        // const campaignsResponse = await fetch('/api/campaigns');
        // const paymentsResponse = await fetch('/api/payments');
        
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    const savedPhone = localStorage.getItem('cyberhub_phone') || sessionStorage.getItem('cyberhub_phone');
    if (savedPhone) {
      setPhone(savedPhone);
      fetchData();
    } else {
      router.push('/login');
    }
  }, [router]);

  // Filter functions
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

  const filteredContent = contentItems.filter(item => {
    const matchesSearch = contentSearch === '' ||
      item.title.toLowerCase().includes(contentSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(contentSearch.toLowerCase());
    const matchesType = selectedContentType === 'all' || item.type === selectedContentType;
    const matchesStatus = contentStatusFilter === 'all' || item.status === contentStatusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Stats calculation
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
    scheduledCampaigns: campaigns.filter(c => c.status === 'scheduled').length,
    totalContent: contentItems.length,
    activeContent: contentItems.filter(c => c.status === 'active').length,
    activeSubscriptions: pricingConfig.subscriptionPlans.filter(p => p.type !== 'free').length,
    activeBundles: pricingConfig.bundles.filter(b => b.status === 'active').length
  };

  // Handler functions
  const handleUserAction = async (userId: string, action: 'suspend' | 'activate' | 'remove') => {
    try {
      // TODO: Call API to update user status
      // const response = await fetch(`/api/users/${userId}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status: action === 'suspend' ? 'suspended' : 'active' })
      // });
      
      // Update local state temporarily
      setUsers(prev => prev.map(user => {
        if (user.id === userId) {
          if (action === 'remove') return { ...user, status: 'suspended' as const };
          return { ...user, status: action === 'suspend' ? 'suspended' : 'active' };
        }
        return user;
      }));
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleServiceAction = (serviceId: string, action: 'approve' | 'reject') => {
    setPendingServices(prev => prev.filter(service => service.id !== serviceId));
  };

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

  const handleDeleteContent = async (contentId: string) => {
    if (confirm('Are you sure you want to delete this content item?')) {
      try {
        const response = await fetch(`/api/jobs?id=${contentId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setContentItems(prev => prev.filter(item => item.id !== contentId));
        }
      } catch (error) {
        console.error('Error deleting content:', error);
      }
    }
  };

  const handleUpdateSubscriptionPlan = (planId: string, updates: Partial<SubscriptionPlan>) => {
    setPricingConfig(prev => ({
      ...prev,
      subscriptionPlans: prev.subscriptionPlans.map(plan =>
        plan.id === planId ? { ...plan, ...updates } : plan
      )
    }));
  };

  const handleUpdateBundle = (bundleId: string, updates: Partial<Bundle>) => {
    setPricingConfig(prev => ({
      ...prev,
      bundles: prev.bundles.map(bundle =>
        bundle.id === bundleId ? { ...bundle, ...updates } : bundle
      )
    }));
  };

  const handleUpdateIndividualService = (serviceKey: keyof PricingConfig['individualServices'], price: number) => {
    setPricingConfig(prev => ({
      ...prev,
      individualServices: {
        ...prev.individualServices,
        [serviceKey]: price
      }
    }));
  };

  const handleSavePricingConfig = () => {
    // In production, this would save to your backend
    alert('Pricing configuration saved successfully!');
  };

  const handleCSVUpload = () => {
    if (!csvFile) {
      setUploadMessage({type: 'error', text: 'Please select a CSV file first'});
      return;
    }

    setUploading(true);
    setUploadMessage(null);

    Papa.parse(csvFile, {
      header: true,
      complete: async (results) => {
        const parsedData = results.data as any[];
        
        if (parsedData.length === 0) {
          setUploadMessage({type: 'error', text: 'CSV file is empty or invalid format'});
          setUploading(false);
          return;
        }

        try {
          const payload = parsedData
            .filter(row => row.title || row.Title)
            .map((row, index) => ({
              id: `${selectedContentType}-${Date.now()}-${index}`,
              title: row.title || row.Title || '',
              description: row.description || row.Description || row.details || '',
              category: row.category || row.Category || row.type || 'General',
              type: selectedContentType,
              postedDate: row.postedDate || row.datePosted || new Date().toISOString().split('T')[0],
              deadline: row.deadline || row.deadlineDate || row.expiry || undefined,
              location: row.location || row.Location,
              institution: row.institution || row.Institution || row.company || row.organization,
              amount: row.amount ? parseInt(row.amount) : undefined,
              duration: row.duration || row.Duration || row.period,
              requirements: row.requirements ? 
                (Array.isArray(row.requirements) ? row.requirements : row.requirements.split(',').map((r: string) => r.trim())) 
                : [],
              contact: row.contact || row.Contact || row.email || row.phone,
              status: 'active'
            }));

          const response = await fetch('/api/jobs', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `API error: ${response.status}`);
          }

          const result = await response.json();
          
          if (result.success && result.data) {
            setUploadMessage({
              type: 'success', 
              text: `Successfully uploaded ${result.data.length} ${selectedContentType}(s) from CSV`
            });
            
            // Refresh content
            const getResponse = await fetch(`/api/jobs?type=${selectedContentType}`);
            if (getResponse.ok) {
              const apiData = await getResponse.json();
              if (apiData.success) {
                setContentItems(apiData.data || []);
              }
            }
          } else {
            throw new Error(result.error || 'Upload failed');
          }
          
          setCsvFile(null);
        } catch (error: any) {
          setUploadMessage({
            type: 'error', 
            text: `Upload failed: ${error.message}`
          });
        } finally {
          setUploading(false);
        }
      },
      error: (error) => {
        setUploadMessage({type: 'error', text: `Error parsing CSV: ${error.message}`});
        setUploading(false);
      }
    });
  };

  const downloadCSVTemplate = () => {
    let headers = '';
    let exampleRow = '';
    
    switch(selectedContentType) {
      case 'job':
        headers = 'title,description,category,location,institution,amount,duration,requirements,contact,deadline';
        exampleRow = 'Software Developer,Full-stack developer needed,Technology,Nairobi,Tech Solutions Ltd,120000,Full-time,JavaScript|React|Node.js,careers@techsolutions.com,2024-02-20';
        break;
      case 'bursary':
        headers = 'title,description,category,institution,amount,requirements,contact,deadline';
        exampleRow = 'Government Bursary,Higher education bursary,Education,Ministry of Education,50000,KCSE Grade B+|Proof of need,bursary@education.go.ke,2024-02-15';
        break;
      case 'scholarship':
        headers = 'title,description,category,institution,amount,requirements,contact,deadline';
        exampleRow = 'Masters Scholarship,Full scholarship for MSc,Education,University of Nairobi,300000,Bachelors degree|Research proposal,scholarships@uon.ac.ke,2024-03-15';
        break;
      case 'internship':
        headers = 'title,description,category,location,institution,stipend,duration,requirements,contact,deadline';
        exampleRow = 'IT Internship,Software development internship,Technology,Nairobi,Safaricom PLC,25000,6 months,Computer Science student,internships@safaricom.co.ke,2024-02-28';
        break;
      case 'hostel':
        headers = 'title,description,category,location,institution,price,amenities,contact';
        exampleRow = 'University Hostel,On-campus accommodation,Accommodation,Nairobi,University of Nairobi,15000,WiFi|Study area|Security,hostels@uon.ac.ke';
        break;
      case 'e-citizen':
        headers = 'title,description,category,institution,amount,requirements,contact,deadline';
        exampleRow = 'KRA PIN Registration,Register for KRA PIN instantly,E-Citizen,Kenya Revenue Authority,500,Valid ID|Passport Photo,kra@kra.go.ke,2024-12-31';
        break;
    }
    
    const csvContent = `${headers}\n${exampleRow}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedContentType}_template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getContentTypeIcon = (type: string) => {
    switch(type) {
      case 'job': return <Building className="h-4 w-4" />;
      case 'bursary': return <Wallet className="h-4 w-4" />;
      case 'scholarship': return <GraduationCap className="h-4 w-4" />;
      case 'internship': return <BrainCircuit className="h-4 w-4" />;
      case 'hostel': return <Home className="h-4 w-4" />;
      case 'e-citizen': return <Shield className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch(type) {
      case 'job': return 'bg-blue-100 text-blue-700';
      case 'bursary': return 'bg-green-100 text-green-700';
      case 'scholarship': return 'bg-purple-100 text-purple-700';
      case 'internship': return 'bg-orange-100 text-orange-700';
      case 'hostel': return 'bg-pink-100 text-pink-700';
      case 'e-citizen': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatAmount = (amount?: number) => {
    if (!amount) return 'N/A';
    return `${pricingConfig.currency} ${amount.toLocaleString()}`;
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
      case 'expired': return 'bg-red-100 text-red-700';
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

  const getPlanIcon = (type: string) => {
    switch (type) {
      case 'free': return <Star className="h-4 w-4" />;
      case 'basic': return <Sparkles className="h-4 w-4" />;
      case 'premium': return <Crown className="h-4 w-4" />;
      case 'enterprise': return <UsersIcon className="h-4 w-4" />;
      default: return <CreditCardIcon className="h-4 w-4" />;
    }
  };

  const getPlanColor = (type: string) => {
    switch (type) {
      case 'free': return 'bg-gray-100 text-gray-700';
      case 'basic': return 'bg-blue-100 text-blue-700';
      case 'premium': return 'bg-purple-100 text-purple-700';
      case 'enterprise': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
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
                  onClick={() => setActiveTab('content')}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${activeTab === 'content' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <FileText className="h-4 w-4" />
                  Content
                </button>
                <button
                  onClick={() => setActiveTab('pricing')}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${activeTab === 'pricing' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <CreditCard className="h-4 w-4" />
                  Pricing
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
              {showBalance ? `${pricingConfig.currency} ${stats.totalBalance.toLocaleString()}` : '••••••'}
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
                <CreditCard className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                {stats.activeSubscriptions} plans
              </span>
            </div>
            <div className="text-3xl font-black text-gray-900">{stats.activeSubscriptions}</div>
            <div className="text-sm text-gray-600">Subscription Plans</div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {activeTab !== 'health' && activeTab !== 'content' && activeTab !== 'pricing' && (
            <div className="lg:w-1/3 space-y-6">
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
                      Amount per user ({pricingConfig.currency})
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
                        {pricingConfig.currency} {bulkAmount && selectedUsers.length > 0 ? (parseFloat(bulkAmount) * selectedUsers.length).toLocaleString() : '0'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {}}
                    disabled={selectedUsers.length === 0 || !bulkAmount}
                    className={`w-full py-3.5 px-6 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-3 ${
                      selectedUsers.length === 0 || !bulkAmount
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-purple-800 hover:opacity-90 hover:scale-[1.02]'
                    }`}
                  >
                    <Send className="h-5 w-5" />
                    Pay {selectedUsers.length} Users
                  </button>
                </div>
              </div>

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

          <div className={activeTab !== 'health' && activeTab !== 'content' && activeTab !== 'pricing' ? 'lg:w-2/3' : 'w-full'}>
            {activeTab === 'users' ? (
              <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">User Management</h3>
                      <p className="text-sm text-gray-600">{filteredUsers.length} users found</p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User</th>
                        <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Role</th>
                        <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Balance</th>
                        <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                          <tr key={user.id} className="hover:bg-gray-50 transition-colors">
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
                                {pricingConfig.currency} {showBalance ? user.balance.toLocaleString() : '••••'}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(user.status)}`}>
                                  {user.status}
                                </span>
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
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-500">
                            No users found. Data will appear here when users register.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : activeTab === 'services' ? (
              <div className="space-y-6">
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
                    {filteredServices.length > 0 ? (
                      filteredServices.map(service => (
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
                                  <div className="font-medium text-gray-900">{pricingConfig.currency} {service.price.toLocaleString()}</div>
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
                                  <div className="font-medium text-gray-900">{service.addedDate}</div>
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
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        No services found. Services will appear here when added to the system.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : activeTab === 'pricing' ? (
              <div className="space-y-6">
                {/* Pricing Header */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Subscription & Pricing Management</h3>
                      <p className="text-sm text-gray-600">Configure subscription plans, bundles, and individual service prices</p>
                    </div>
                    <button
                      onClick={handleSavePricingConfig}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-800 text-white font-medium rounded-lg hover:opacity-90 flex items-center gap-2"
                    >
                      <Check className="h-5 w-5" />
                      Save All Pricing
                    </button>
                  </div>

                  {/* WhatsApp Number Config */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-blue-100 to-blue-200">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900">WhatsApp Inquiry Configuration</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                        <input
                          type="text"
                          value={pricingConfig.whatsAppNumber}
                          onChange={(e) => setPricingConfig(prev => ({...prev, whatsAppNumber: e.target.value}))}
                          className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="+254708949580"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                        <select
                          value={pricingConfig.currency}
                          onChange={(e) => setPricingConfig(prev => ({...prev, currency: e.target.value}))}
                          className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="KES">Kenya Shilling (KES)</option>
                          <option value="USD">US Dollar (USD)</option>
                          <option value="EUR">Euro (EUR)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subscription Plans */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">Subscription Plans</h4>
                        <p className="text-sm text-gray-600">{pricingConfig.subscriptionPlans.length} plans available</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium px-3 py-1 rounded-full bg-green-100 text-green-700">
                          {pricingConfig.subscriptionPlans.filter(p => p.type !== 'free').length} paid plans
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
                    {pricingConfig.subscriptionPlans.map(plan => (
                      <div key={plan.id} className={`border-2 rounded-2xl p-6 ${plan.popular ? 'border-purple-300 bg-purple-50' : 'border-gray-200 bg-white'} relative`}>
                        {plan.popular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <span className="px-4 py-1 bg-gradient-to-r from-purple-600 to-purple-800 text-white text-xs font-bold rounded-full">
                              MOST POPULAR
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`p-3 rounded-lg ${getPlanColor(plan.type)}`}>
                            {getPlanIcon(plan.type)}
                          </div>
                          <div>
                            <h5 className="font-bold text-gray-900">{plan.name}</h5>
                            <p className="text-sm text-gray-600">{plan.description}</p>
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <div className="flex items-baseline gap-1 mb-2">
                            <span className="text-3xl font-black text-gray-900">{pricingConfig.currency} {plan.priceMonthly}</span>
                            <span className="text-gray-600">/month</span>
                          </div>
                          {plan.priceYearly && (
                            <div className="text-sm text-gray-600">
                              {pricingConfig.currency} {plan.priceYearly} yearly (Save {Math.round((1 - (plan.priceYearly / (plan.priceMonthly * 12))) * 100)}%)
                            </div>
                          )}
                        </div>

                        <div className="space-y-3 mb-6">
                          {plan.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Monthly Price</label>
                              <input
                                type="number"
                                value={plan.priceMonthly}
                                onChange={(e) => handleUpdateSubscriptionPlan(plan.id, {priceMonthly: parseInt(e.target.value) || 0})}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                              />
                            </div>
                            {plan.priceYearly !== undefined && (
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Yearly Price</label>
                                <input
                                  type="number"
                                  value={plan.priceYearly}
                                  onChange={(e) => handleUpdateSubscriptionPlan(plan.id, {priceYearly: parseInt(e.target.value) || 0})}
                                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                                />
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`popular-${plan.id}`}
                              checked={plan.popular || false}
                              onChange={(e) => handleUpdateSubscriptionPlan(plan.id, {popular: e.target.checked})}
                              className="h-4 w-4 text-purple-600 rounded"
                            />
                            <label htmlFor={`popular-${plan.id}`} className="text-sm text-gray-700">
                              Mark as Popular
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Individual Services Pricing */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">Individual Service Prices</h4>
                        <p className="text-sm text-gray-600">Set prices for individual services</p>
                      </div>
                      <button
                        onClick={() => setEditingIndividualPrices(!editingIndividualPrices)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium"
                      >
                        {editingIndividualPrices ? 'Done Editing' : 'Edit Prices'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {Object.entries(pricingConfig.individualServices).map(([key, price]) => (
                      <div key={key} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                          {key === 'assistedJobApplication' && <UserCheck className="h-5 w-5 text-blue-500" />}
                          {key === 'autoJobApplication' && <Zap className="h-5 w-5 text-green-500" />}
                          {key === 'cvBuilder' && <FileEdit className="h-5 w-5 text-purple-500" />}
                          {key === 'emailGenerator' && <Mail className="h-5 w-5 text-orange-500" />}
                          {key === 'whatsAppInquiry' && <MessageSquare className="h-5 w-5 text-green-500" />}
                          {key === 'scholarshipApplication' && <GraduationCap className="h-5 w-5 text-blue-500" />}
                          {key === 'bursaryApplication' && <Wallet className="h-5 w-5 text-green-500" />}
                          {key === 'internshipApplication' && <BrainCircuit className="h-5 w-5 text-orange-500" />}
                          {key === 'hostelBooking' && <Home className="h-5 w-5 text-pink-500" />}
                          <div>
                            <h6 className="font-medium text-gray-900 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </h6>
                            <p className="text-xs text-gray-600">One-time fee</p>
                          </div>
                        </div>
                        {editingIndividualPrices ? (
                          <input
                            type="number"
                            value={price}
                            onChange={(e) => handleUpdateIndividualService(key as keyof PricingConfig['individualServices'], parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                          />
                        ) : (
                          <div className="text-2xl font-black text-gray-900">
                            {pricingConfig.currency} {price.toLocaleString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bundle Pricing */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">Bundle Packages</h4>
                        <p className="text-sm text-gray-600">{pricingConfig.bundles.length} active bundles</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {pricingConfig.bundles.map(bundle => (
                      <div key={bundle.id} className="border-2 border-gray-200 rounded-2xl p-6 mb-6 last:mb-0">
                        <div className="flex items-start justify-between mb-6">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 rounded-lg bg-gradient-to-r from-orange-100 to-orange-200">
                                <Package className="h-5 w-5 text-orange-600" />
                              </div>
                              <div>
                                <h5 className="font-bold text-gray-900">{bundle.name}</h5>
                                <p className="text-sm text-gray-600">{bundle.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                                Save {bundle.discountPercentage}%
                              </div>
                              <div className="text-sm text-gray-600">
                                Valid for {bundle.validityDays} days
                              </div>
                              <div className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(bundle.status)}`}>
                                {bundle.status}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="text-2xl font-black text-gray-900">
                                {pricingConfig.currency} {bundle.bundlePrice.toLocaleString()}
                              </span>
                              <span className="text-gray-500 line-through">
                                {pricingConfig.currency} {bundle.originalPrice.toLocaleString()}
                              </span>
                            </div>
                            <button
                              onClick={() => setEditingBundle(bundle)}
                              className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-medium text-sm"
                            >
                              Edit Bundle
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h6 className="text-sm font-medium text-gray-700 mb-2">Included Services</h6>
                            <div className="space-y-2">
                              {bundle.services.map(serviceKey => {
                                const serviceName = serviceKey.replace(/([A-Z])/g, ' $1').trim();
                                const servicePrice = pricingConfig.individualServices[serviceKey as keyof typeof pricingConfig.individualServices];
                                return (
                                  <div key={serviceKey} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700 capitalize">{serviceName}</span>
                                    <span className="text-sm text-gray-600">{pricingConfig.currency} {servicePrice.toLocaleString()}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          <div>
                            <h6 className="text-sm font-medium text-gray-700 mb-2">Bundle Configuration</h6>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Bundle Price</label>
                                <input
                                  type="number"
                                  value={bundle.bundlePrice}
                                  onChange={(e) => handleUpdateBundle(bundle.id, {bundlePrice: parseInt(e.target.value) || 0})}
                                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Validity (Days)</label>
                                <input
                                  type="number"
                                  value={bundle.validityDays}
                                  onChange={(e) => handleUpdateBundle(bundle.id, {validityDays: parseInt(e.target.value) || 0})}
                                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : activeTab === 'content' ? (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Content Manager</h3>
                      <p className="text-sm text-gray-600">Upload and manage Jobs, Bursaries, Scholarships, Internships, Hostels, and E-Citizen Services</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-blue-100 to-blue-200">
                        <Upload className="h-5 w-5 text-blue-600" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900">Bulk CSV Upload</h4>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
                          <select
                            value={selectedContentType}
                            onChange={(e) => setSelectedContentType(e.target.value as any)}
                            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="job">Jobs</option>
                            <option value="bursary">Bursaries</option>
                            <option value="scholarship">Scholarships</option>
                            <option value="internship">Internships</option>
                            <option value="hostel">Hostels</option>
                            <option value="e-citizen">E-Citizen Services</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">CSV File</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="file"
                              accept=".csv"
                              onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                              className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                              onClick={downloadCSVTemplate}
                              className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-medium whitespace-nowrap"
                            >
                              <Download className="h-4 w-4" />
                              Template
                            </button>
                          </div>
                        </div>
                      </div>

                      {uploadMessage && (
                        <div className={`p-4 rounded-xl ${uploadMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          <div className="flex items-center gap-2">
                            {uploadMessage.type === 'success' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            <span className="font-medium">{uploadMessage.text}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-4">
                        <button
                          onClick={handleCSVUpload}
                          disabled={!csvFile || uploading}
                          className={`px-6 py-3 rounded-xl font-bold text-white flex items-center gap-3 ${
                            !csvFile || uploading
                              ? 'bg-gray-300 cursor-not-allowed'
                              : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:opacity-90'
                          }`}
                        >
                          {uploading ? (
                            <>
                              <RefreshCw className="h-5 w-5 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-5 w-5" />
                              Upload CSV
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 text-center">
                      <div className="text-xl font-black text-blue-700">
                        {contentItems.filter(c => c.type === 'job').length}
                      </div>
                      <div className="text-sm text-blue-600">Jobs</div>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-4 text-center">
                      <div className="text-xl font-black text-green-700">
                        {contentItems.filter(c => c.type === 'bursary').length}
                      </div>
                      <div className="text-sm text-green-600">Bursaries</div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4 text-center">
                      <div className="text-xl font-black text-purple-700">
                        {contentItems.filter(c => c.type === 'scholarship').length}
                      </div>
                      <div className="text-sm text-purple-600">Scholarships</div>
                    </div>
                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4 text-center">
                      <div className="text-xl font-black text-orange-700">
                        {contentItems.filter(c => c.type === 'internship').length}
                      </div>
                      <div className="text-sm text-orange-600">Internships</div>
                    </div>
                    <div className="bg-gradient-to-r from-pink-50 to-pink-100 border border-pink-200 rounded-xl p-4 text-center">
                      <div className="text-xl font-black text-pink-700">
                        {contentItems.filter(c => c.type === 'hostel').length}
                      </div>
                      <div className="text-sm text-pink-600">Hostels</div>
                    </div>
                    <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-4 text-center">
                      <div className="text-xl font-black text-red-700">
                        {contentItems.filter(c => c.type === 'e-citizen').length}
                      </div>
                      <div className="text-sm text-red-600">E-Citizen</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg">
                  <div className="p-6 border-b border-gray-200">
                    <h4 className="text-lg font-bold text-gray-900">
                      {selectedContentType.charAt(0).toUpperCase() + selectedContentType.slice(1)} List
                    </h4>
                    <p className="text-sm text-gray-600">{filteredContent.length} items found</p>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {filteredContent.length > 0 ? (
                      filteredContent.map(item => (
                        <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className={`p-2 rounded-lg ${getContentTypeColor(item.type)}`}>
                                  {getContentTypeIcon(item.type)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-gray-900">{item.title}</h4>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getContentTypeColor(item.type)}`}>
                                      {item.type}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(item.status)}`}>
                                      {item.status}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                <div>
                                  <div className="text-xs text-gray-500">Category</div>
                                  <div className="font-medium text-gray-900">{item.category}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Posted</div>
                                  <div className="font-medium text-gray-900">{item.postedDate}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">
                                    {item.type === 'job' || item.type === 'internship' || item.type === 'e-citizen' ? 'Location' : 'Institution'}
                                  </div>
                                  <div className="font-medium text-gray-900">{item.location || item.institution || 'N/A'}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">
                                    {item.type === 'hostel' ? 'Price' : 'Amount'}
                                  </div>
                                  <div className="font-medium text-gray-900">{formatAmount(item.amount)}</div>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 ml-4">
                              <button
                                onClick={() => handleDeleteContent(item.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        No content found. Upload CSV data or content will appear here when added via the system.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : activeTab === 'health' ? (
              <HealthWidget />
            ) : (
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 text-center shadow-lg">
                <div className="text-gray-500 mb-4">
                  {activeTab === 'campaigns' && <Megaphone className="h-12 w-12 mx-auto" />}
                  {activeTab === 'payments' && <CreditCard className="h-12 w-12 mx-auto" />}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {activeTab === 'campaigns' ? 'Campaigns Management' : 'Payment History'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {activeTab === 'campaigns' 
                    ? 'Campaign management functionality will be available in the next update.'
                    : 'Payment history will appear here when transactions occur.'}
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Coming Soon</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price ({pricingConfig.currency})</label>
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
                  </select>
                </div>
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

      {editingBundle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Edit Bundle</h3>
              <button
                onClick={() => setEditingBundle(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bundle Name</label>
                <input
                  type="text"
                  value={editingBundle.name}
                  onChange={(e) => setEditingBundle({...editingBundle, name: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editingBundle.description}
                  onChange={(e) => setEditingBundle({...editingBundle, description: e.target.value})}
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bundle Price ({pricingConfig.currency})</label>
                  <input
                    type="number"
                    value={editingBundle.bundlePrice}
                    onChange={(e) => setEditingBundle({...editingBundle, bundlePrice: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Original Price ({pricingConfig.currency})</label>
                  <input
                    type="number"
                    value={editingBundle.originalPrice}
                    onChange={(e) => setEditingBundle({...editingBundle, originalPrice: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Validity (Days)</label>
                  <input
                    type="number"
                    value={editingBundle.validityDays}
                    onChange={(e) => setEditingBundle({...editingBundle, validityDays: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={editingBundle.status}
                    onChange={(e) => setEditingBundle({...editingBundle, status: e.target.value as 'active' | 'archived'})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setEditingBundle(null)}
                  className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleUpdateBundle(editingBundle.id, editingBundle);
                    setEditingBundle(null);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-medium rounded-lg hover:opacity-90"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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