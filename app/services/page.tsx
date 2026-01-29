'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, Briefcase, GraduationCap, Building, BookOpen, 
  BrainCircuit, PiggyBank, MessageCircle, Zap, ChevronRight,
  Phone, Check, Star, Users, Clock, Home, FileText, Laptop, Wallet,
  ArrowRight, ExternalLink, Search, Filter, CreditCard, Loader,
  UserCheck, AlertCircle, Calendar, Target, Lock, Sparkles,
  Mail, FileEdit, DollarSign, Crown, Users as UsersIcon,
  MapPin, Award, Clock as ClockIcon, Tag, Eye, EyeOff, TrendingUp,
  Heart, Wifi, Shield as ShieldIcon, Book, Coffee, Monitor,
  DollarSign as DollarIcon, Globe, Building as BuildingIcon,
  School, GraduationCap as GraduationCapIcon, Bed,
  Map, Star as StarIcon, CheckCircle, XCircle, Bell,
  PieChart, BarChart, TrendingDown, Users as UsersIcon2,
  Smartphone, Tablet, Cpu, Code, Palette, Music, Camera,
  Stethoscope, BriefcaseMedical, Truck, Factory, Utensils,
  Square
} from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'job' | 'bursary' | 'scholarship' | 'internship' | 'hostel' | 'government';
  postedDate: string;
  deadline?: string;
  location?: string;
  institution?: string;
  amount?: number;
  duration?: string;
  requirements?: string[];
  contact?: string;
  status: 'active' | 'expired' | 'draft';
  specificType?: string;
  amenities?: string[];
  salaryRange?: string;
  jobType?: string;
  fieldOfStudy?: string;
  academicLevel?: string;
  distanceFromCampus?: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  requirements: string[];
  icon: React.ReactNode;
  painPoints: string[];
  solution: string;
  whatsappMessage: string;
  specificType?: string;
}

interface Task {
  id: string;
  service: string;
  userId: string;
  workerPhone?: string;
  workerName?: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  amount: number;
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
}

interface PricingConfig {
  subscriptionPlans: Array<{
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
  }>;
  bundles: Array<{
    id: string;
    name: string;
    description: string;
    services: string[];
    originalPrice: number;
    bundlePrice: number;
    discountPercentage: number;
    validityDays: number;
    status: 'active' | 'archived';
  }>;
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

interface FilterState {
  category: string;
  type: string;
  location: string;
  minAmount: string;
  maxAmount: string;
  dateRange: string;
  amenities: string[];
  jobType: string[];
  fieldOfStudy: string;
  academicLevel: string;
  duration: string;
  distance: string;
}

export default function ServicesPage() {
  console.log('🏁 ServicesPage: Component rendering');
  const router = useRouter();
  const [phone, setPhone] = useState<string>('');
  const [selectedMajorCategory, setSelectedMajorCategory] = useState<'e-citizen' | 'student' | 'remote'>('e-citizen');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedServiceForPayment, setSelectedServiceForPayment] = useState<string>('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskStatusModal, setShowTaskStatusModal] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    type: 'all',
    location: 'all',
    minAmount: '',
    maxAmount: '',
    dateRange: 'all',
    amenities: [],
    jobType: [],
    fieldOfStudy: 'all',
    academicLevel: 'all',
    duration: 'all',
    distance: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Job categories for Remote Work section
  const jobCategories = [
    { id: 'technology', name: 'Technology', icon: <Code className="h-4 w-4" /> },
    { id: 'business', name: 'Business', icon: <Briefcase className="h-4 w-4" /> },
    { id: 'healthcare', name: 'Healthcare', icon: <Stethoscope className="h-4 w-4" /> },
    { id: 'education', name: 'Education', icon: <GraduationCap className="h-4 w-4" /> },
    { id: 'marketing', name: 'Marketing', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'customer-service', name: 'Customer Service', icon: <UsersIcon2 className="h-4 w-4" /> },
    { id: 'design', name: 'Design', icon: <Palette className="h-4 w-4" /> },
    { id: 'finance', name: 'Finance', icon: <DollarIcon className="h-4 w-4" /> },
    { id: 'sales', name: 'Sales', icon: <PieChart className="h-4 w-4" /> },
    { id: 'logistics', name: 'Logistics', icon: <Truck className="h-4 w-4" /> },
    { id: 'manufacturing', name: 'Manufacturing', icon: <Factory className="h-4 w-4" /> },
    { id: 'hospitality', name: 'Hospitality', icon: <Utensils className="h-4 w-4" /> },
  ];

  // Student Journey subcategories (removed KUCCPS, KRA-PIN, HELB)
  const studentSubCategories = [
    { id: 'hostels', name: 'Hostels', icon: <Bed className="h-4 w-4" /> },
    { id: 'internships', name: 'Internship Opportunities', icon: <BrainCircuit className="h-4 w-4" /> },
    { id: 'bursaries', name: 'Bursaries', icon: <PiggyBank className="h-4 w-4" /> },
    { id: 'scholarships', name: 'Scholarships', icon: <Award className="h-4 w-4" /> },
  ];

  // Hostel amenities
  const hostelAmenities = [
    { id: 'wifi', name: 'WiFi', icon: <Wifi className="h-4 w-4" /> },
    { id: 'study-area', name: 'Study Area', icon: <Book className="h-4 w-4" /> },
    { id: 'security', name: '24/7 Security', icon: <ShieldIcon className="h-4 w-4" /> },
    { id: 'laundry', name: 'Laundry', icon: <Coffee className="h-4 w-4" /> },
    { id: 'cafeteria', name: 'Cafeteria', icon: <Utensils className="h-4 w-4" /> },
    { id: 'gym', name: 'Gym', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'parking', name: 'Parking', icon: <Square className="h-4 w-4" /> },
  ];

  // Job types
  const jobTypes = [
    { id: 'full-time', name: 'Full-time' },
    { id: 'part-time', name: 'Part-time' },
    { id: 'contract', name: 'Contract' },
    { id: 'remote', name: 'Remote' },
    { id: 'hybrid', name: 'Hybrid' },
    { id: 'internship', name: 'Internship' },
  ];

  // Academic levels for bursaries/scholarships
  const academicLevels = [
    { id: 'all', name: 'All Levels' },
    { id: 'certificate', name: 'Certificate' },
    { id: 'diploma', name: 'Diploma' },
    { id: 'undergraduate', name: 'Undergraduate' },
    { id: 'postgraduate', name: 'Postgraduate' },
    { id: 'masters', name: 'Masters' },
    { id: 'phd', name: 'PhD' },
  ];

  // Get phone from localStorage
  useEffect(() => {
    const savedPhone = localStorage.getItem('cyberhub_phone') || sessionStorage.getItem('cyberhub_phone');
    if (savedPhone) setPhone(savedPhone);
    
    // Load tasks from localStorage
    const savedTasks = localStorage.getItem('cyberhub_tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Fetch content from API
  useEffect(() => {
    console.log('🚀 useEffect: Starting data fetch');
    fetchContent();
    fetchPricingConfig();
    fetchServices();
  }, []);

  const fetchContent = async () => {
    console.log('📞 fetchContent: Function called');
    try {
      setLoading(true);
      console.log('🌐 fetchContent: Making API request to /api/jobs');
      const response = await fetch('/api/jobs');
      console.log('📨 fetchContent: Response status', response.status);
      const result = await response.json();
      console.log('📊 fetchContent: API result', result);

      if (result.success) {
        console.log('✅ fetchContent: Setting content items');
        setContentItems(result.data || []);
      } else {
        console.log('❌ fetchContent: API error', result.error);
        setError(result.error || 'Failed to load content');
        setContentItems([]);
      }
    } catch (error) {
      console.error('💥 fetchContent: Error caught', error);
      setError('Network error. Please try again.');
      setContentItems([]);
    } finally {
      console.log('🏁 fetchContent: Completed');
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      const result = await response.json();
      
      if (result.success) {
        const transformedServices = result.services.map((service: any) => ({
          id: service.id,
          name: service.name,
          description: service.description,
          category: service.category,
          price: service.price || 3000,
          requirements: service.requirements || ['Valid ID', 'Required documents'],
          icon: getServiceIcon(service.category),
          painPoints: [
            'Complex paperwork and requirements',
            'Time-consuming processes',
            'Unclear documentation needs',
            'Multiple follow-ups required'
          ],
          solution: `Expert handling of ${service.name.toLowerCase()} with complete document preparation and submission`,
          whatsappMessage: `Hello Veritas Expert, I need ${service.name} assistance. I've made payment and ready to proceed.`
        }));
        setServices(transformedServices);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchPricingConfig = async () => {
    try {
      const defaultPricing: PricingConfig = {
        subscriptionPlans: [
          {
            id: 'free',
            name: 'Free',
            description: 'Basic access with limited features',
            type: 'free',
            priceMonthly: 0,
            features: [
              'Access to 10 older listings per day',
              'Basic search',
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
          }
        ],
        bundles: [],
        individualServices: {
          assistedJobApplication: 500,
          autoJobApplication: 3000,
          cvBuilder: 200,
          emailGenerator: 100,
          whatsAppInquiry: 0,
          scholarshipApplication: 300,
          bursaryApplication: 250,
          internshipApplication: 400,
          hostelBooking: 150
        },
        currency: 'KES',
        whatsAppNumber: '+254708949580'
      };
      setPricingConfig(defaultPricing);
    } catch (error) {
      console.error('Error fetching pricing config:', error);
    }
  };

  const getServiceIcon = (category: string) => {
    switch (category) {
      case 'Government':
      case 'E-Citizen':
        return <Shield className="h-5 w-5" />;
      case 'Education':
        return <BookOpen className="h-5 w-5" />;
      case 'Employment':
        return <Briefcase className="h-5 w-5" />;
      case 'Training':
        return <BrainCircuit className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  // Filter content based on selected major category and filters
  const getFilteredContent = () => {
    let filtered = contentItems;

    // Filter by major category
    if (selectedMajorCategory === 'e-citizen') {
      filtered = filtered.filter(item => item.type === 'government');
    } else if (selectedMajorCategory === 'student') {
      filtered = filtered.filter(item => 
        ['bursary', 'scholarship', 'internship', 'hostel'].includes(item.type)
      );
    } else if (selectedMajorCategory === 'remote') {
      filtered = filtered.filter(item => item.type === 'job');
    }

    // Filter by subcategory
    if (selectedSubCategory !== 'all') {
      if (selectedMajorCategory === 'student') {
        if (selectedSubCategory === 'hostels') {
          filtered = filtered.filter(item => item.type === 'hostel');
        } else if (selectedSubCategory === 'internships') {
          filtered = filtered.filter(item => item.type === 'internship');
        } else if (selectedSubCategory === 'bursaries') {
          filtered = filtered.filter(item => item.type === 'bursary');
        } else if (selectedSubCategory === 'scholarships') {
          filtered = filtered.filter(item => item.type === 'scholarship');
        }
      } else if (selectedMajorCategory === 'remote') {
        filtered = filtered.filter(item => item.category.toLowerCase() === selectedSubCategory);
      }
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.institution?.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower)
      );
    }

    // Apply additional filters
    if (filters.location !== 'all') {
      filtered = filtered.filter(item => 
        item.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.minAmount) {
      filtered = filtered.filter(item => 
        item.amount && item.amount >= parseInt(filters.minAmount)
      );
    }

    if (filters.maxAmount) {
      filtered = filtered.filter(item => 
        item.amount && item.amount <= parseInt(filters.maxAmount)
      );
    }

    if (filters.jobType.length > 0) {
      filtered = filtered.filter(item =>
        item.jobType && filters.jobType.includes(item.jobType)
      );
    }

    if (filters.fieldOfStudy !== 'all') {
      filtered = filtered.filter(item =>
        item.fieldOfStudy === filters.fieldOfStudy
      );
    }

    if (filters.academicLevel !== 'all') {
      filtered = filtered.filter(item =>
        item.academicLevel === filters.academicLevel
      );
    }

    if (filters.duration !== 'all') {
      filtered = filtered.filter(item =>
        item.duration?.toLowerCase().includes(filters.duration.toLowerCase())
      );
    }

    if (filters.amenities.length > 0) {
      filtered = filtered.filter(item =>
        item.amenities?.some(amenity => filters.amenities.includes(amenity))
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());

    // Limit free users to 10 results
    const isFreeUser = true;
    if (isFreeUser) {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oldListings = filtered.filter(item => new Date(item.postedDate) < oneHourAgo);
      return oldListings.slice(0, 10);
    }

    return filtered;
  };

  const filteredContent = getFilteredContent();

  const formatAmount = (amount?: number) => {
    if (!amount) return 'Negotiable';
    return `${pricingConfig?.currency || 'KES'} ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffHours < 1.5) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffHours < 48) return 'Yesterday';
    return `${Math.floor(diffHours / 24)} days ago`;
  };

  const isNewListing = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours < 1;
  };

  const handleItemSelect = (item: ContentItem) => {
    setSelectedItem(item);
    setShowDetails(true);
  };

  const handlePayment = (serviceName: string) => {
    setSelectedServiceForPayment(serviceName);
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = async () => {
    if (selectedServiceForPayment) {
      // Create a task in the system
      const newTask: Task = {
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        service: selectedServiceForPayment,
        userId: phone,
        status: 'pending',
        amount: 3000,
        createdAt: new Date().toISOString()
      };
      
      // Save task to localStorage
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      localStorage.setItem('cyberhub_tasks', JSON.stringify(updatedTasks));
      
      // Also send to API (simulated)
      try {
        await fetch('/api/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'task',
            service: selectedServiceForPayment,
            userPhone: phone,
            status: 'pending',
            amount: 3000
          })
        });
      } catch (error) {
        console.log('Task saved locally, API call failed');
      }
      
      setShowPaymentModal(false);
      setCurrentTask(newTask);
      setShowTaskStatusModal(true);
      
      alert(`Payment confirmed! Task created for ${selectedServiceForPayment}. A worker will accept it soon.`);
    }
  };

  const checkTaskStatus = (serviceName: string): Task | undefined => {
    return tasks.find(task => task.service === serviceName);
  };

  const getTaskButton = (item: ContentItem) => {
    const task = checkTaskStatus(item.title);
    
    if (!task) {
      // No task exists - show payment button
      return (
        <button
          onClick={() => handlePayment(item.title)}
          className="flex-1 py-3 bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white font-bold rounded-xl hover:opacity-90 flex items-center justify-center gap-2"
        >
          <CreditCard className="h-4 w-4" />
          <span className="text-sm sm:text-base">Make Payment (KES {item.amount || 3000})</span>
        </button>
      );
    }
    
    if (task.status === 'pending') {
      return (
        <button
          onClick={() => {
            setCurrentTask(task);
            setShowTaskStatusModal(true);
          }}
          className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold rounded-xl hover:opacity-90 flex items-center justify-center gap-2"
        >
          <Clock className="h-4 w-4" />
          <span className="text-sm sm:text-base">Waiting for Worker</span>
        </button>
      );
    }
    
    if (task.status === 'accepted' && task.workerPhone) {
      return (
        <button
          onClick={() => {
            if (!task.workerPhone) return;
            const message = `Hello, I'm contacting you about the ${task.service} task.`;
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${task.workerPhone.replace('+', '')}?text=${encodedMessage}`;
            window.open(whatsappUrl, '_blank');
          }}
          className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:opacity-90 flex items-center justify-center gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm sm:text-base">Contact Worker</span>
        </button>
      );
    }
    
    if (task.status === 'completed') {
      return (
        <button
          className="flex-1 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold rounded-xl flex items-center justify-center gap-2"
          disabled
        >
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm sm:text-base">Task Completed</span>
        </button>
      );
    }
    
    return null;
  };

  const handleAssistedApplication = () => {
    if (!phone) {
      router.push('/login?redirect=/services');
      return;
    }
    
    const price = pricingConfig?.individualServices.assistedJobApplication || 500;
    alert(`Assisted Application Service\nPrice: ${pricingConfig?.currency} ${price}\n\nPlease proceed to payment.`);
  };

  const handleAutoApplication = () => {
    if (!phone) {
      router.push('/login?redirect=/services');
      return;
    }
    
    const price = pricingConfig?.individualServices.autoJobApplication || 3000;
    alert(`Auto Application Service\nPrice: ${pricingConfig?.currency} ${price}/month\n\nAvailable from March 2024.`);
  };

  const handleCVBuilder = () => {
    const price = pricingConfig?.individualServices.cvBuilder || 200;
    alert(`CV Builder Service\nPrice: ${pricingConfig?.currency} ${price}\n\nProfessional CV creation and optimization.`);
  };

  const handleEmailGenerator = () => {
    const price = pricingConfig?.individualServices.emailGenerator || 100;
    alert(`Email Generator Service\nPrice: ${pricingConfig?.currency} ${price}\n\nProfessional email templates and writing.`);
  };

  const handleLogout = () => {
    localStorage.removeItem('cyberhub_phone');
    localStorage.removeItem('cyberhub_role');
    sessionStorage.removeItem('cyberhub_phone');
    sessionStorage.removeItem('cyberhub_role');
    router.push('/login');
  };

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleAmenity = (amenity: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const toggleJobType = (jobType: string) => {
    setFilters(prev => ({
      ...prev,
      jobType: prev.jobType.includes(jobType)
        ? prev.jobType.filter(j => j !== jobType)
        : [...prev.jobType, jobType]
    }));
  };

  const resetFilters = () => {
    setFilters({
      category: 'all',
      type: 'all',
      location: 'all',
      minAmount: '',
      maxAmount: '',
      dateRange: 'all',
      amenities: [],
      jobType: [],
      fieldOfStudy: 'all',
      academicLevel: 'all',
      duration: 'all',
      distance: 'all'
    });
    setSelectedSubCategory('all');
    setSearchTerm('');
  };

  // Render different filter panels based on major category
  const renderFilters = () => {
    if (selectedMajorCategory === 'e-citizen') {
      return null;
    }

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-gray-900">Filters</h4>
          <button
            onClick={resetFilters}
            className="text-sm text-[#ff6b35] hover:text-[#ff8552]"
          >
            Reset All
          </button>
        </div>

        {selectedMajorCategory === 'remote' && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
              <div className="flex flex-wrap gap-2">
                {jobTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => toggleJobType(type.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      filters.jobType.includes(type.id)
                        ? 'bg-[#ff6b35] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range ({pricingConfig?.currency})</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minAmount}
                  onChange={(e) => updateFilter('minAmount', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxAmount}
                  onChange={(e) => updateFilter('maxAmount', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </>
        )}

        {selectedMajorCategory === 'student' && selectedSubCategory === 'hostels' && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {hostelAmenities.map(amenity => (
                  <button
                    key={amenity.id}
                    onClick={() => toggleAmenity(amenity.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                      filters.amenities.includes(amenity.id)
                        ? 'bg-[#ff6b35] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {amenity.icon}
                    {amenity.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Distance from Campus</label>
              <select
                value={filters.distance}
                onChange={(e) => updateFilter('distance', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
              >
                <option value="all">Any Distance</option>
                <option value="on-campus">On Campus</option>
                <option value="walking">Walking Distance</option>
                <option value="nearby">Nearby (1-2km)</option>
                <option value="far">Far (&gt;2km)</option>
              </select>
            </div>
          </>
        )}

        {(selectedMajorCategory === 'student' && (selectedSubCategory === 'bursaries' || selectedSubCategory === 'scholarships')) && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Academic Level</label>
              <select
                value={filters.academicLevel}
                onChange={(e) => updateFilter('academicLevel', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
              >
                {academicLevels.map(level => (
                  <option key={level.id} value={level.id}>{level.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Field of Study</label>
              <input
                type="text"
                placeholder="e.g., Computer Science, Medicine, Business"
                value={filters.fieldOfStudy}
                onChange={(e) => updateFilter('fieldOfStudy', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
              />
            </div>
          </>
        )}

        {selectedMajorCategory === 'student' && selectedSubCategory === 'internships' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
            <select
              value={filters.duration}
              onChange={(e) => updateFilter('duration', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
            >
              <option value="all">Any Duration</option>
              <option value="3 months">3 months</option>
              <option value="6 months">6 months</option>
              <option value="1 year">1 year</option>
            </select>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input
            type="text"
            placeholder="e.g., Nairobi, Remote, Mombasa"
            value={filters.location === 'all' ? '' : filters.location}
            onChange={(e) => updateFilter('location', e.target.value || 'all')}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
          />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-700">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-[#ff6b35] to-[#ffa500] p-2 rounded-lg">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-black bg-gradient-to-r from-[#ff6b35] to-[#ffa500] bg-clip-text text-transparent">
                  Veritas
                </span>
              </div>
              <span className="ml-2 text-gray-700 font-semibold">Services</span>
            </div>
            
            <div className="flex items-center gap-4">
              {phone && (
                <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                  <Phone className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{phone}</span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchContent}
              className="mt-2 text-red-700 font-semibold hover:text-red-800"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Panel - Categories & Filters */}
          <div className="lg:w-1/3">
            {/* Major Categories */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Select Category</h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setSelectedMajorCategory('e-citizen');
                    setSelectedSubCategory('all');
                    resetFilters();
                  }}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl transition-colors ${
                    selectedMajorCategory === 'e-citizen'
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300'
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  <div className={`p-3 rounded-lg ${
                    selectedMajorCategory === 'e-citizen' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'
                  }`}>
                    <Shield className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-gray-900">E-Citizen Navigator</h4>
                    <p className="text-sm text-gray-600">Government services search</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setSelectedMajorCategory('student');
                    setSelectedSubCategory('all');
                    resetFilters();
                  }}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl transition-colors ${
                    selectedMajorCategory === 'student'
                      ? 'bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300'
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  <div className={`p-3 rounded-lg ${
                    selectedMajorCategory === 'student' ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-600'
                  }`}>
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-gray-900">Student Journey</h4>
                    <p className="text-sm text-gray-600">Academic & accommodation services</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setSelectedMajorCategory('remote');
                    setSelectedSubCategory('all');
                    resetFilters();
                  }}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl transition-colors ${
                    selectedMajorCategory === 'remote'
                      ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-300'
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  <div className={`p-3 rounded-lg ${
                    selectedMajorCategory === 'remote' ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-gray-600'
                  }`}>
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-gray-900">Remote Work</h4>
                    <p className="text-sm text-gray-600">Jobs & career services</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Subcategories */}
            {selectedMajorCategory === 'student' && (
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Student Services</h3>
                <div className="grid grid-cols-2 gap-3">
                  {studentSubCategories.map(subCat => (
                    <button
                      key={subCat.id}
                      onClick={() => setSelectedSubCategory(subCat.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
                        selectedSubCategory === subCat.id
                          ? 'bg-gradient-to-r from-green-100 to-green-200 border-2 border-green-300'
                          : 'bg-gray-50 hover:bg-gray-100 border border-gray-300'
                      }`}
                    >
                      <div className={`p-2 rounded-lg mb-2 ${
                        selectedSubCategory === subCat.id ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {subCat.icon}
                      </div>
                      <span className="text-xs font-medium text-gray-700 text-center">{subCat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedMajorCategory === 'remote' && (
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Job Categories</h3>
                <div className="grid grid-cols-2 gap-3">
                  {jobCategories.slice(0, 8).map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedSubCategory(category.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
                        selectedSubCategory === category.id
                          ? 'bg-gradient-to-r from-orange-100 to-orange-200 border-2 border-orange-300'
                          : 'bg-gray-50 hover:bg-gray-100 border border-gray-300'
                      }`}
                    >
                      <div className={`p-2 rounded-lg mb-2 ${
                        selectedSubCategory === category.id ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {category.icon}
                      </div>
                      <span className="text-xs font-medium text-gray-700 text-center">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Filters Panel */}
            {renderFilters()}

            {/* Quick Tools for Remote Work */}
            {selectedMajorCategory === 'remote' && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Tools</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleCVBuilder}
                    className="w-full flex items-center justify-between p-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-100">
                        <FileEdit className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-900">CV Builder</div>
                        <div className="text-xs text-gray-600">Professional CV creation</div>
                      </div>
                    </div>
                    <div className="font-bold text-gray-900">
                      {pricingConfig?.currency} {pricingConfig?.individualServices.cvBuilder}
                    </div>
                  </button>

                  <button
                    onClick={handleEmailGenerator}
                    className="w-full flex items-center justify-between p-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-100">
                        <Mail className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-900">Email Generator</div>
                        <div className="text-xs text-gray-600">Professional email writing</div>
                      </div>
                    </div>
                    <div className="font-bold text-gray-900">
                      {pricingConfig?.currency} {pricingConfig?.individualServices.emailGenerator}
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Content & Search */}
          <div className="lg:w-2/3">
            {/* Search Header */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">
                    {selectedMajorCategory === 'e-citizen' && 'E-Citizen Navigator'}
                    {selectedMajorCategory === 'student' && 'Student Journey'}
                    {selectedMajorCategory === 'remote' && 'Remote Work'}
                  </h2>
                  <p className="text-gray-600">
                    {selectedMajorCategory === 'e-citizen' && 'Search for government services'}
                    {selectedMajorCategory === 'student' && 'Academic and accommodation services'}
                    {selectedMajorCategory === 'remote' && 'Job opportunities and career tools'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                  </button>
                </div>
              </div>

              {/* Search Box */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder={
                    selectedMajorCategory === 'e-citizen'
                      ? 'Search government services (e.g., passport, ID, driving license, KRA)...'
                      : selectedMajorCategory === 'student'
                      ? 'Search student services...'
                      : 'Search job opportunities...'
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                />
              </div>

              {/* Free vs Premium Notice */}
              <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-100">
                    {filteredContent.length > 10 ? <Lock className="h-4 w-4 text-green-600" /> : <Eye className="h-4 w-4 text-green-600" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Showing {Math.min(10, filteredContent.length)} of {filteredContent.length} results
                    </p>
                    <p className="text-sm text-gray-600">
                      {filteredContent.length > 10 ? (
                        <>
                          Unlock all {filteredContent.length} listings and newest opportunities for{' '}
                          <span className="font-bold text-[#ff6b35]">
                            {pricingConfig?.currency} 50/month
                          </span>
                        </>
                      ) : (
                        'You have access to all available listings'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Show Filters Panel if toggled */}
            {showFilters && renderFilters()}

            {/* Content Listings */}
            <div className="space-y-4">
              {filteredContent.slice(0, 10).map(item => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2.5 rounded-lg ${
                          item.type === 'job' ? 'bg-blue-100 text-blue-600' :
                          item.type === 'internship' ? 'bg-orange-100 text-orange-600' :
                          item.type === 'bursary' ? 'bg-green-100 text-green-600' :
                          item.type === 'scholarship' ? 'bg-purple-100 text-purple-600' :
                          item.type === 'hostel' ? 'bg-pink-100 text-pink-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {item.type === 'job' ? <Briefcase className="h-4 w-4" /> :
                           item.type === 'internship' ? <BrainCircuit className="h-4 w-4" /> :
                           item.type === 'bursary' ? <PiggyBank className="h-4 w-4" /> :
                           item.type === 'scholarship' ? <Award className="h-4 w-4" /> :
                           item.type === 'hostel' ? <Home className="h-4 w-4" /> :
                           <Shield className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                            <div className="flex items-center gap-2">
                              {isNewListing(item.postedDate) && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                  NEW
                                </span>
                              )}
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                item.type === 'job' ? 'bg-blue-100 text-blue-700' :
                                item.type === 'internship' ? 'bg-orange-100 text-orange-700' :
                                item.type === 'bursary' ? 'bg-green-100 text-green-700' :
                                item.type === 'scholarship' ? 'bg-purple-100 text-purple-700' :
                                item.type === 'hostel' ? 'bg-pink-100 text-pink-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-600 mt-1">{item.description}</p>
                          <div className="flex items-center gap-4 mt-2">
                            {item.institution && (
                              <div className="flex items-center gap-1 text-sm text-gray-700">
                                <Building className="h-3 w-3" />
                                {item.institution}
                              </div>
                            )}
                            {item.location && (
                              <div className="flex items-center gap-1 text-sm text-gray-700">
                                <MapPin className="h-3 w-3" />
                                {item.location}
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-sm text-gray-700">
                              <ClockIcon className="h-3 w-3" />
                              {getTimeSince(item.postedDate)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        {item.amount && (
                          <div>
                            <div className="text-xs text-gray-500">
                              {item.type === 'job' ? 'Salary' :
                               item.type === 'internship' ? 'Stipend' :
                               item.type === 'hostel' ? 'Price' : 'Amount'}
                            </div>
                            <div className="font-medium text-gray-900">{formatAmount(item.amount)}</div>
                          </div>
                        )}
                        {item.duration && (
                          <div>
                            <div className="text-xs text-gray-500">Duration</div>
                            <div className="font-medium text-gray-900">{item.duration}</div>
                          </div>
                        )}
                        {item.jobType && (
                          <div>
                            <div className="text-xs text-gray-500">Job Type</div>
                            <div className="font-medium text-gray-900">{item.jobType}</div>
                          </div>
                        )}
                        {item.deadline && (
                          <div>
                            <div className="text-xs text-gray-500">Deadline</div>
                            <div className="font-medium text-red-600">{formatDate(item.deadline)}</div>
                          </div>
                        )}
                      </div>

                      {item.amenities && item.amenities.length > 0 && (
                        <div className="mt-4">
                          <div className="text-xs text-gray-500 mb-2">Amenities</div>
                          <div className="flex flex-wrap gap-2">
                            {item.amenities.map(amenityId => {
                              const amenity = hostelAmenities.find(a => a.id === amenityId);
                              return amenity ? (
                                <span key={amenityId} className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                  {amenity.icon}
                                  {amenity.name}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons - NOW USING TASK SYSTEM */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6 pt-6 border-t border-gray-200">
                    {selectedMajorCategory === 'remote' && (
                      <>
                        <button
                          onClick={handleAssistedApplication}
                          className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:opacity-90 flex items-center justify-center gap-2"
                        >
                          <UserCheck className="h-4 w-4" />
                          <span className="text-sm sm:text-base">Assisted Application ({pricingConfig?.currency} {pricingConfig?.individualServices.assistedJobApplication})</span>
                        </button>
                        <button
                          onClick={handleAutoApplication}
                          className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:opacity-90 flex items-center justify-center gap-2"
                        >
                          <Zap className="h-4 w-4" />
                          <span className="text-sm sm:text-base">Auto Apply ({pricingConfig?.currency} {pricingConfig?.individualServices.autoJobApplication}/month)</span>
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">March</span>
                        </button>
                      </>
                    )}
                    {(selectedMajorCategory === 'student' || selectedMajorCategory === 'e-citizen') && (
                      <>
                        {getTaskButton(item)}
                      </>
                    )}
                    <button
                      onClick={() => handleItemSelect(item)}
                      className="px-4 sm:px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 flex items-center justify-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="text-sm sm:text-base">
                        {item.type === 'government' ? 'Requirements' : 'Details'}
                      </span>
                    </button>
                  </div>
                </div>
              ))}

              {filteredContent.length > 10 && (
                <div className="bg-gradient-to-r from-[#ff6b35]/10 to-[#ffa500]/10 border-2 border-[#ff6b35]/20 rounded-2xl p-8 text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Lock className="h-8 w-8 text-[#ff6b35]" />
                    <Crown className="h-8 w-8 text-[#ff6b35]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Unlock {filteredContent.length - 10} More Opportunities
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Get access to all {filteredContent.length} listings including newest opportunities posted within the last hour
                  </p>
                  <button
                    onClick={() => setShowSubscriptionModal(true)}
                    className="px-8 py-3 bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white font-bold rounded-xl hover:opacity-90"
                  >
                    Subscribe Now ({pricingConfig?.currency} 50/month)
                  </button>
                </div>
              )}

              {filteredContent.length === 0 && (
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center">
                  <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-2xl inline-block mb-6">
                    <Clock className="h-12 w-12 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-4">
                    New Opportunities Coming Soon!
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    We're actively adding new opportunities. Check back in 30 minutes or try different search terms.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      resetFilters();
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white font-bold rounded-xl hover:opacity-90"
                  >
                    Reset Search
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Complete Payment</h3>
            <p className="text-gray-600 mb-2">Service: <span className="font-bold">{selectedServiceForPayment}</span></p>
            <p className="text-gray-600 mb-6">Amount: <span className="font-bold">KES 3,000</span></p>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-2">Payment Instructions:</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">1. Send KES 3,000 to MPesa:</p>
                <p className="font-bold text-lg">0708 949 580</p>
                <p className="text-sm text-gray-600 mt-2">2. Use service name as reference</p>
                <p className="text-sm text-gray-600">3. Click "Payment Done" below</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentComplete}
                className="flex-1 py-3 bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white font-bold rounded-xl hover:opacity-90"
              >
                Payment Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Status Modal */}
      {showTaskStatusModal && currentTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Task Status</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600">Service:</p>
                <p className="font-bold">{currentTask.service}</p>
              </div>
              <div>
                <p className="text-gray-600">Status:</p>
                <div className={`px-3 py-1 rounded-full inline-block ${
                  currentTask.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  currentTask.status === 'accepted' ? 'bg-green-100 text-green-700' :
                  currentTask.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {currentTask.status.charAt(0).toUpperCase() + currentTask.status.slice(1)}
                </div>
              </div>
              {currentTask.workerName && (
                <div>
                  <p className="text-gray-600">Worker:</p>
                  <p className="font-bold">{currentTask.workerName}</p>
                </div>
              )}
              {currentTask.workerPhone && (
                <div>
                  <p className="text-gray-600">Worker WhatsApp:</p>
                  <p className="font-bold text-green-600">{currentTask.workerPhone}</p>
                  <p className="text-sm text-gray-500 mt-1">Click "Contact Worker" on the service to message them</p>
                </div>
              )}
              <div>
                <p className="text-gray-600">Created:</p>
                <p>{new Date(currentTask.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowTaskStatusModal(false)}
                className="w-full py-3 bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white font-bold rounded-xl hover:opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-gray-900">{selectedItem.title}</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-gray-700 mb-2">Description</h4>
                <p className="text-gray-600">{selectedItem.description}</p>
              </div>

              <div>
                <h4 className="font-bold text-gray-700 mb-2">
                  {selectedItem.type === 'government' ? 'Requirements' : 'Details'}
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {selectedItem.type === 'government' ? (
                    <ul className="space-y-2">
                      {selectedItem.requirements?.map((req, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span className="text-gray-700">{req}</span>
                        </li>
                      )) || (
                        <li className="text-gray-600">No specific requirements listed</li>
                      )}
                    </ul>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {selectedItem.institution && (
                        <div>
                          <div className="text-sm text-gray-500">Institution</div>
                          <div className="font-medium">{selectedItem.institution}</div>
                        </div>
                      )}
                      {selectedItem.location && (
                        <div>
                          <div className="text-sm text-gray-500">Location</div>
                          <div className="font-medium">{selectedItem.location}</div>
                        </div>
                      )}
                      {selectedItem.amount && (
                        <div>
                          <div className="text-sm text-gray-500">
                            {selectedItem.type === 'job' ? 'Salary' :
                             selectedItem.type === 'internship' ? 'Stipend' :
                             selectedItem.type === 'hostel' ? 'Price' : 'Amount'}
                          </div>
                          <div className="font-medium">{formatAmount(selectedItem.amount)}</div>
                        </div>
                      )}
                      {selectedItem.duration && (
                        <div>
                          <div className="text-sm text-gray-500">Duration</div>
                          <div className="font-medium">{selectedItem.duration}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {(selectedItem.deadline || selectedItem.contact) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedItem.deadline && (
                    <div>
                      <h4 className="font-bold text-gray-700 mb-1">Deadline</h4>
                      <p className="text-red-600 font-medium">{formatDate(selectedItem.deadline)}</p>
                    </div>
                  )}
                  {selectedItem.contact && (
                    <div>
                      <h4 className="font-bold text-gray-700 mb-1">Contact</h4>
                      <p className="text-blue-600 font-medium">{selectedItem.contact}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowDetails(false)}
                className="w-full py-3 bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white font-bold rounded-xl hover:opacity-90"
              >
                Close
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
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-[#ff6b35] to-[#ffa500] bg-clip-text text-transparent">
              Veritas Cyberhub
            </span>
          </div>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Premium digital services delivered with expertise. Instant processing, expert handling, guaranteed results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowSubscriptionModal(true)}
              className="font-bold px-8 py-3 bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white rounded-lg hover:opacity-90"
            >
              View Subscription Plans
            </button>
            <a
              href="/login"
              className="bg-white border-2 border-gray-300 text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-gray-50"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}