**Replace the entire file content with this fixed version (I've corrected the API call on line 144):**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, Briefcase, GraduationCap, Building, BookOpen, 
  BrainCircuit, PiggyBank, MessageCircle, Zap, ChevronRight,
  Phone, Check, Star, Users, Clock, Home, FileText, Laptop, Wallet,
  ArrowRight, ExternalLink, Search, Filter, CreditCard, Loader,
  UserCheck, AlertCircle, Calendar, Target, Lock, Sparkles,
  ChevronDown, ChevronUp, Tag, Layers, Grid, List, Crown, Target as TargetIcon
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  painPoints: string[];
  solution: string;
  requirements: string[];
  whatsappMessage: string;
  price?: number;
  deliveryTime?: string;
  popular?: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  services: Service[];
}

interface ProgressStep {
  id: number;
  title: string;
  status: 'pending' | 'current' | 'completed';
  description: string;
}

export default function ServicesPage() {
  const router = useRouter();
  const [phone, setPhone] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [agentConnected, setAgentConnected] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<string | null>(null);
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([
    { id: 1, title: 'Inquiry', status: 'pending', description: 'Service selected' },
    { id: 2, title: 'Payment', status: 'pending', description: 'Awaiting payment' },
    { id: 3, title: 'Agent Connected', status: 'pending', description: 'Expert assignment' },
    { id: 4, title: 'In Progress', status: 'pending', description: 'Service execution' },
    { id: 5, title: 'Finished', status: 'pending', description: 'Completion & review' },
  ]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['all']));
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [teamLeadEligible, setTeamLeadEligible] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [teamLeadApplied, setTeamLeadApplied] = useState(false);
  const [teamLeadStatus, setTeamLeadStatus] = useState<string>('');

  useEffect(() => {
    const savedPhone = localStorage.getItem('cyberhub_phone') || sessionStorage.getItem('cyberhub_phone');
    if (savedPhone) setPhone(savedPhone);
  }, []);

  // Check Team Lead eligibility
  useEffect(() => {
    const checkTeamLeadStatus = async () => {
      if (!phone) return;
      
      setCheckingEligibility(true);
      try {
        const response = await fetch(
          `/api/support?type=checkTeamLeadEligibility&userPhone=${encodeURIComponent(phone)}`
        );
        const result = await response.json();
        
        if (result.success) {
          setTeamLeadEligible(result.canApply);
          setTeamLeadApplied(result.hasApplied);
          setTeamLeadStatus(result.currentStatus || '');
        }
      } catch (error) {
        console.error('Failed to check Team Lead eligibility:', error);
      } finally {
        setCheckingEligibility(false);
      }
    };

    if (phone) {
      checkTeamLeadStatus();
    }
  }, [phone]);

  // Define service categories
  const categories: Category[] = [
    {
      id: 'ecitizen',
      name: 'E-Citizen Services',
      description: 'Government digital services and compliance',
      icon: <Shield className="h-5 w-5" />,
      services: [
        {
          id: 'ecitizen-main',
          name: 'E-Citizen Navigator',
          description: 'Complete government services handling with expert precision',
          category: 'E-Citizen',
          icon: <Shield className="h-5 w-5" />,
          painPoints: ['Long queues', 'Complex paperwork', 'Multiple visits', 'Unclear requirements'],
          solution: 'Instant expert assignment with complete document handling',
          requirements: ['Valid ID', 'Required documents', 'Service details'],
          whatsappMessage: 'Hello Veritas Expert, I need E-Citizen Navigator assistance.',
          price: 2000,
          deliveryTime: 'Instant',
          popular: true
        },
        {
          id: 'kra-pin',
          name: 'KRA PIN Registration',
          description: 'New KRA PIN application and tax compliance',
          category: 'E-Citizen',
          icon: <FileText className="h-5 w-5" />,
          painPoints: ['Long processing time', 'Document rejection', 'Multiple submissions'],
          solution: 'Expert-assisted application with guaranteed approval',
          requirements: ['ID Copy', 'Passport Photo', 'Contact Details'],
          whatsappMessage: 'Hello Veritas Expert, I need KRA PIN Registration.',
          price: 1500,
          deliveryTime: 'Instant',
          popular: true
        },
        {
          id: 'business-permit',
          name: 'Business Permit & Licensing',
          description: 'Business registration and licensing services',
          category: 'E-Citizen',
          icon: <Building className="h-5 w-5" />,
          painPoints: ['Complex requirements', 'Department visits', 'Delayed approvals'],
          solution: 'Complete business registration package',
          requirements: ['Business Name', 'Owner Details', 'Location Information'],
          whatsappMessage: 'Hello Veritas Expert, I need Business Permit assistance.',
          price: 2500,
          deliveryTime: 'Instant',
          popular: false
        },
        {
          id: 'passport',
          name: 'Passport Application',
          description: 'New passport and renewal services',
          category: 'E-Citizen',
          icon: <Shield className="h-5 w-5" />,
          painPoints: ['Booking delays', 'Document issues', 'Long waiting periods'],
          solution: 'Streamlined passport application process',
          requirements: ['ID Copy', 'Birth Certificate', 'Passport Photos'],
          whatsappMessage: 'Hello Veritas Expert, I need Passport Application assistance.',
          price: 3500,
          deliveryTime: 'Instant',
          popular: false
        }
      ]
    },
    {
      id: 'education',
      name: 'Education Services',
      description: 'Academic placements and funding solutions',
      icon: <GraduationCap className="h-5 w-5" />,
      services: [
        {
          id: 'kuccps',
          name: 'KUCCPS & University Applications',
          description: 'Complete university placement and course selection assistance',
          category: 'Education',
          icon: <BookOpen className="h-5 w-5" />,
          painPoints: ['Confusing portal', 'Missed deadlines', 'Wrong course choices'],
          solution: 'Instant guidance through optimal course selection',
          requirements: ['KCSE results', 'Course preferences', 'University choices'],
          whatsappMessage: 'Hello Veritas Expert, I need KUCCPS assistance.',
          price: 1500,
          deliveryTime: 'Instant',
          popular: true
        },
        {
          id: 'bursaries',
          name: 'Bursaries & Scholarships',
          description: 'Funding discovery and professional application support',
          category: 'Education',
          icon: <Wallet className="h-5 w-5" />,
          painPoints: ['Missed opportunities', 'Poor essay quality', 'Incomplete submissions'],
          solution: 'Quick turnaround on funding discovery',
          requirements: ['Academic records', 'Financial need', 'Personal statement'],
          whatsappMessage: 'Hello Veritas Expert, I need Bursaries assistance.',
          price: 1200,
          deliveryTime: 'Instant',
          popular: true
        },
        {
          id: 'helb',
          name: 'HELB Loan Application',
          description: 'Student loan application and processing',
          category: 'Education',
          icon: <Wallet className="h-5 w-5" />,
          painPoints: ['Complex forms', 'Guarantor issues', 'Processing delays'],
          solution: 'Expert-guided HELB application',
          requirements: ['Admission Letter', 'ID Copies', 'Parents Details'],
          whatsappMessage: 'Hello Veritas Expert, I need HELB Loan assistance.',
          price: 1000,
          deliveryTime: 'Instant',
          popular: false
        }
      ]
    },
    {
      id: 'employment',
      name: 'Employment Services',
      description: 'Job placement and career development',
      icon: <Briefcase className="h-5 w-5" />,
      services: [
        {
          id: 'work',
          name: 'Work From Home Solutions',
          description: 'AI-powered job matching and automated applications',
          category: 'Employment',
          icon: <Briefcase className="h-5 w-5" />,
          painPoints: ['Gatekept opportunities', 'Time-consuming applications', 'Poor interview success'],
          solution: 'On-demand job matching with professional handling',
          requirements: ['CV/Resume', 'Career goals', 'Desired industries'],
          whatsappMessage: 'Hello Veritas Expert, I need Work From Home assistance.',
          price: 2500,
          deliveryTime: 'Instant',
          popular: true
        },
        {
          id: 'internships',
          name: 'Internship Placement',
          description: 'Internship discovery and professional application services',
          category: 'Employment',
          icon: <Building className="h-5 w-5" />,
          painPoints: ['Fierce competition', 'Poor applications', 'No responses'],
          solution: 'Immediate processing of internship matching',
          requirements: ['Academic level', 'Field of study', 'Location preference'],
          whatsappMessage: 'Hello Veritas Expert, I need Internship Placement.',
          price: 1000,
          deliveryTime: 'Instant',
          popular: false
        },
        {
          id: 'cv',
          name: 'CV & LinkedIn Optimization',
          description: 'Professional resume and profile enhancement',
          category: 'Employment',
          icon: <FileText className="h-5 w-5" />,
          painPoints: ['Poor CV format', 'Missing keywords', 'Unprofessional profiles'],
          solution: 'Expert CV writing and LinkedIn optimization',
          requirements: ['Current CV', 'Job Targets', 'Career History'],
          whatsappMessage: 'Hello Veritas Expert, I need CV Optimization.',
          price: 800,
          deliveryTime: 'Instant',
          popular: false
        }
      ]
    },
    {
      id: 'lifestyle',
      name: 'Lifestyle Services',
      description: 'Personal and accommodation solutions',
      icon: <Home className="h-5 w-5" />,
      services: [
        {
          id: 'housing',
          name: 'Student Housing',
          description: 'Verified accommodation booking and housing assistance',
          category: 'Lifestyle',
          icon: <Home className="h-5 w-5" />,
          painPoints: ['Scam listings', 'Poor conditions', 'Price exploitation'],
          solution: 'On-demand housing verification',
          requirements: ['Budget range', 'Location preference', 'Roommate preferences'],
          whatsappMessage: 'Hello Veritas Expert, I need Student Housing.',
          price: 800,
          deliveryTime: 'Instant',
          popular: false
        }
      ]
    },
    {
      id: 'training',
      name: 'Training Services',
      description: 'Skills development and digital training',
      icon: <BrainCircuit className="h-5 w-5" />,
      services: [
        {
          id: 'earn',
          name: 'Earn While You Learn',
          description: 'Online job access and skills training during studies',
          category: 'Training',
          icon: <BrainCircuit className="h-5 w-5" />,
          painPoints: ['Time management', 'Low-paying gigs', 'Academic conflict'],
          solution: 'Instant access to flexible online work',
          requirements: ['Skills assessment', 'Time availability', 'Income goals'],
          whatsappMessage: 'Hello Veritas Expert, I need Earn While You Learn.',
          price: 1800,
          deliveryTime: 'Instant',
          popular: true
        },
        {
          id: 'form4',
          name: 'Form 4 Freedom Program',
          description: 'Pre-university digital skills training and income generation',
          category: 'Training',
          icon: <PiggyBank className="h-5 w-5" />,
          painPoints: ['Idle waiting period', 'No income source', 'Career uncertainty'],
          solution: 'Quick start digital skills training',
          requirements: ['Form 4 completion', 'Interest areas', 'Device availability'],
          whatsappMessage: 'Hello Veritas Expert, I need Form 4 Freedom Program.',
          price: 2200,
          deliveryTime: 'Instant',
          popular: false
        }
      ]
    }
  ];

  // Create category list for filter
  const categoryList = [
    { id: 'all', name: 'All Services', icon: <Grid className="h-4 w-4" /> },
    ...categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon
    }))
  ];

  // Filter services based on selection and search
  const filteredCategories = categories.filter(category => {
    if (selectedCategory === 'all') return true;
    return category.id === selectedCategory;
  }).map(category => {
    const filteredServices = category.services.filter(service => {
      const matchesSearch = searchTerm === '' || 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
    
    return {
      ...category,
      services: filteredServices
    };
  }).filter(category => category.services.length > 0);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setProgressSteps([
      { id: 1, title: 'Inquiry', status: 'current', description: 'Service selected' },
      { id: 2, title: 'Payment', status: 'pending', description: 'Awaiting payment' },
      { id: 3, title: 'Agent Connected', status: 'pending', description: 'Expert assignment' },
      { id: 4, title: 'In Progress', status: 'pending', description: 'Service execution' },
      { id: 5, title: 'Finished', status: 'pending', description: 'Completion & review' },
    ]);
    setAgentConnected(false);
    setCurrentAgent(null);
  };

  const handlePayment = () => {
    if (!selectedService) return;
    
    setPaymentProcessing(true);
    
    setTimeout(() => {
      setPaymentProcessing(false);
      
      const updatedSteps = [...progressSteps];
      updatedSteps[0].status = 'completed';
      updatedSteps[1].status = 'completed';
      updatedSteps[2].status = 'current';
      setProgressSteps(updatedSteps);
      
      setTimeout(() => {
        setAgentConnected(true);
        setCurrentAgent('Mike Omondi');
        
        const updatedSteps2 = [...updatedSteps];
        updatedSteps2[2].status = 'completed';
        updatedSteps2[3].status = 'current';
        setProgressSteps(updatedSteps2);
      }, 1500);
    }, 2000);
  };

  const handleWhatsAppConnect = () => {
    if (!selectedService || !currentAgent) return;
    
    const message = `${selectedService.whatsappMessage} I've been connected with ${currentAgent}.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/254712345678?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const handleMarkComplete = () => {
    const updatedSteps = [...progressSteps];
    updatedSteps[3].status = 'completed';
    updatedSteps[4].status = 'completed';
    setProgressSteps(updatedSteps);
  };

  const handleLogout = () => {
    localStorage.removeItem('cyberhub_phone');
    localStorage.removeItem('cyberhub_role');
    sessionStorage.removeItem('cyberhub_phone');
    sessionStorage.removeItem('cyberhub_role');
    router.push('/login');
  };

  const handleTeamLeadApply = () => {
    router.push('/team-lead-apply');
  };

  // Function to check if service qualifies for Team Lead
  const isTeamLeadQualifyingService = (serviceId: string) => {
    return serviceId === 'kra-pin' || serviceId === 'business-permit'; // KRA services
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
              
              {/* Team Lead Application Button */}
              {teamLeadEligible && !teamLeadApplied && (
                <button
                  onClick={handleTeamLeadApply}
                  className="hidden md:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold px-4 py-2 rounded-lg hover:opacity-90"
                >
                  <Crown className="h-4 w-4" />
                  Apply as Team Lead
                </button>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Panel - Services List */}
          <div className="lg:w-1/3">
            {/* Search and Filter */}
            <div className="mb-8">
              <div className="relative mb-6">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-gray-700">Filter by Category:</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categoryList.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    {category.icon}
                    <span className="text-sm font-medium">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Team Lead Status Card */}
            {phone && !checkingEligibility && (
              <div className="mb-6">
                {teamLeadEligible && !teamLeadApplied ? (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <TargetIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-blue-800">Team Lead Opportunity</h4>
                        <p className="text-sm text-blue-600">You qualify to lead 20 agents</p>
                      </div>
                    </div>
                    <button
                      onClick={handleTeamLeadApply}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-2.5 px-4 rounded-lg hover:opacity-90 flex items-center justify-center gap-2"
                    >
                      <Crown className="h-4 w-4" />
                      Apply Now
                    </button>
                  </div>
                ) : teamLeadApplied ? (
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-yellow-100 p-2 rounded-full">
                        <Clock className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-yellow-800">Application Submitted</h4>
                        <p className="text-sm text-yellow-600">Team Lead application under review</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <TargetIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">Become a Team Lead</h4>
                        <p className="text-sm text-gray-600">Complete a KRA service to qualify</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Categories List */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-bold text-gray-900">Service Categories</h3>
                <p className="text-sm text-gray-600">{filteredCategories.length} categories available</p>
              </div>
              
              <div className="max-h-[500px] overflow-y-auto">
                {filteredCategories.map(category => {
                  const isExpanded = expandedCategories.has(category.id);
                  const Icon = () => category.icon as React.ReactElement;
                  
                  return (
                    <div key={category.id} className="border-b border-gray-200 last:border-b-0">
                      {/* Category Header */}
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100">
                            <Icon />
                          </div>
                          <div className="text-left">
                            <h4 className="font-bold text-gray-900">{category.name}</h4>
                            <p className="text-xs text-gray-600">{category.services.length} services</p>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                      
                      {/* Services in Category */}
                      {isExpanded && (
                        <div className="pl-4 pr-4 pb-4">
                          <div className="space-y-2">
                            {category.services.map(service => {
                              const ServiceIcon = () => service.icon as React.ReactElement;
                              const qualifiesForTeamLead = isTeamLeadQualifyingService(service.id);
                              
                              return (
                                <div
                                  key={service.id}
                                  className={`border rounded-lg p-3 transition-colors cursor-pointer ${
                                    selectedService?.id === service.id 
                                      ? 'border-[#ff6b35] bg-orange-50' 
                                      : 'border-gray-300 hover:bg-gray-50'
                                  }`}
                                  onClick={() => handleServiceSelect(service)}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${
                                      selectedService?.id === service.id 
                                        ? 'bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}>
                                      <ServiceIcon />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-start justify-between">
                                        <h5 className="font-bold text-gray-900 text-sm">{service.name}</h5>
                                        <div className="flex items-center gap-1">
                                          {qualifiesForTeamLead && (
                                            <div className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                                              <TargetIcon className="h-3 w-3" />
                                              Qualifies
                                            </div>
                                          )}
                                          {selectedService?.id === service.id && (
                                            <div className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
                                              Selected
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <p className="text-xs text-gray-600 mt-1">{service.description}</p>
                                      <div className="flex items-center justify-between mt-2">
                                        <span className="text-xs font-bold text-gray-900">
                                          KES {service.price?.toLocaleString()}
                                        </span>
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                          <Zap className="h-3 w-3" />
                                          {service.deliveryTime}
                                        </div>
                                      </div>
                                      
                                      {/* Team Lead Qualification Note */}
                                      {qualifiesForTeamLead && !teamLeadEligible && !teamLeadApplied && (
                                        <div className="mt-2 pt-2 border-t border-gray-200">
                                          <p className="text-xs text-blue-600 flex items-center gap-1">
                                            <TargetIcon className="h-3 w-3" />
                                            Complete this service to qualify for Team Lead position
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {filteredCategories.length === 0 && (
                  <div className="p-8 text-center">
                    <div className="bg-gray-100 p-4 rounded-2xl inline-block mb-4">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600">No services found</p>
                    <p className="text-sm text-gray-500 mt-1">Try a different search term</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-blue-700">
                  {categories.reduce((total, cat) => total + cat.services.length, 0)}
                </div>
                <div className="text-sm text-blue-600">Total Services</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-green-700">99%</div>
                <div className="text-sm text-green-600">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Right Panel - Service Details & Progress */}
          <div className="lg:w-2/3">
            {selectedService ? (
              <div className="space-y-8">
                {/* Service Details Card */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-xl">
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-r from-[#ff6b35] to-[#ffa500] p-3 rounded-xl">
                        {selectedService.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-2xl font-black text-gray-900">{selectedService.name}</h2>
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                            {selectedService.category}
                          </span>
                          {isTeamLeadQualifyingService(selectedService.id) && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full flex items-center gap-1">
                              <TargetIcon className="h-3 w-3" />
                              Qualifies for Team Lead
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600">{selectedService.description}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-gray-500" />
                            <span className="text-lg font-bold text-gray-900">
                              KES {selectedService.price?.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700">{selectedService.deliveryTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg px-4 py-2">
                      <span className="text-sm font-semibold text-green-700">On-demand service</span>
                    </div>
                  </div>

                  {/* Team Lead Qualification Banner */}
                  {isTeamLeadQualifyingService(selectedService.id) && !teamLeadEligible && !teamLeadApplied && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Crown className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-blue-800 mb-1">Team Lead Qualification Service</h4>
                          <p className="text-blue-700 text-sm">
                            Complete this service to qualify for our Team Lead program. Team Leads oversee 20 agents and earn commissions from their team's work.
                          </p>
                          {!teamLeadEligible && (
                            <p className="text-blue-600 text-xs mt-2">
                              ✅ Complete this service → Qualify to apply → Lead 20 agents
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        Common Challenges
                      </h3>
                      <ul className="space-y-3">
                        {selectedService.painPoints.map((point, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="mt-1">
                              <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                            </div>
                            <span className="text-gray-700">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-[#ff6b35]" />
                        Our Solution
                      </h3>
                      <p className="text-gray-700 bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                        {selectedService.solution}
                      </p>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-500" />
                      Requirements
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedService.requirements.map((req, index) => (
                        <div key={index} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-gray-700">{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Button */}
                  <button
                    onClick={handlePayment}
                    disabled={paymentProcessing || agentConnected}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all flex items-center justify-center ${
                      paymentProcessing || agentConnected
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#ff6b35] to-[#ffa500] hover:opacity-90 hover:scale-[1.02] text-white'
                    }`}
                  >
                    {paymentProcessing ? (
                      <div className="flex items-center justify-center gap-3">
                        <Loader className="h-5 w-5 animate-spin" />
                        Processing Payment...
                      </div>
                    ) : agentConnected ? (
                      'Payment Completed ✓'
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <CreditCard className="h-6 w-6" />
                        Make Payment (KES {selectedService.price?.toLocaleString()})
                      </div>
                    )}
                  </button>

                  {/* Team Lead CTA after payment */}
                  {isTeamLeadQualifyingService(selectedService.id) && agentConnected && !teamLeadEligible && !teamLeadApplied && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-100 p-2 rounded-full">
                            <Crown className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-bold text-green-800">Ready for Leadership?</p>
                            <p className="text-sm text-green-700">You can now apply to become a Team Lead</p>
                          </div>
                        </div>
                        <button
                          onClick={handleTeamLeadApply}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold px-4 py-2 rounded-lg hover:opacity-90"
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-xl">
                  <h3 className="text-xl font-black text-gray-900 mb-6">Service Progress</h3>
                  
                  <div className="relative">
                    <div className="absolute left-8 top-4 h-full w-0.5 bg-gray-200 -z-10"></div>
                    
                    {progressSteps.map((step) => (
                      <div key={step.id} className="flex items-start gap-6 mb-8 last:mb-0">
                        <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center ${
                          step.status === 'completed'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                            : step.status === 'current'
                            ? 'bg-gradient-to-r from-[#ff6b35] to-[#ffa500]'
                            : 'bg-gray-200'
                        }`}>
                          {step.status === 'completed' ? (
                            <Check className="h-6 w-6 text-white" />
                          ) : (
                            <span className="text-white font-bold text-lg">{step.id}</span>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className={`text-lg font-bold ${
                              step.status === 'completed' ? 'text-green-600' :
                              step.status === 'current' ? 'text-[#ff6b35]' : 'text-gray-400'
                            }`}>
                              {step.title}
                            </h4>
                            <span className={`text-sm px-3 py-1 rounded-full ${
                              step.status === 'completed' ? 'bg-green-100 text-green-700' :
                              step.status === 'current' ? 'bg-orange-100 text-[#ff6b35]' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {step.status === 'completed' ? 'Completed' :
                               step.status === 'current' ? 'In Progress' : 'Pending'}
                            </span>
                          </div>
                          <p className="text-gray-600">{step.description}</p>
                          
                          {step.id === 3 && step.status === 'completed' && currentAgent && (
                            <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="bg-green-100 p-2 rounded-full">
                                    <UserCheck className="h-5 w-5 text-green-600" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-900">Connected to Agent</p>
                                    <p className="text-sm text-gray-600">{currentAgent} is handling your service</p>
                                  </div>
                                </div>
                                <button
                                  onClick={handleWhatsAppConnect}
                                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold px-6 py-2.5 rounded-lg hover:opacity-90 flex items-center gap-2"
                                >
                                  <MessageCircle className="h-5 w-5" />
                                  WhatsApp Agent
                                </button>
                              </div>
                            </div>
                          )}
                          
                          {step.id === 4 && step.status === 'current' && (
                            <div className="mt-4">
                              <button
                                onClick={handleMarkComplete}
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-lg hover:opacity-90"
                              >
                                Mark as Complete (Worker Action)
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center shadow-xl">
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-6 rounded-2xl inline-block mb-6">
                  <Layers className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4">Browse Services by Category</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Select a service category from the left panel to view available services, requirements, and pricing.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">Categorized services for easy navigation</span>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Tag className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-gray-700">Clear pricing and requirements listed</span>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <MessageCircle className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-gray-700">Direct WhatsApp connection with agents</span>
                  </div>
                </div>
                
                {/* Team Lead Promotion */}
                {!teamLeadEligible && !teamLeadApplied && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Crown className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold text-blue-800">Become a Team Lead</h4>
                        <p className="text-blue-700">Complete a KRA service to qualify</p>
                      </div>
                    </div>
                    <div className="text-left space-y-2">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-700">Lead 20 agents</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-700">Earn from team commissions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-700">Build your own business</span>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-4">
                      Select a KRA service above to get started
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

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
              onClick={() => selectedService ? handlePayment() : {}}
              disabled={!selectedService}
              className={`bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white font-bold px-8 py-3 rounded-lg hover:opacity-90 ${!selectedService ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Start Your Service
            </button>
            
            {/* Team Lead CTA in footer */}
            {teamLeadEligible && !teamLeadApplied && (
              <button
                onClick={handleTeamLeadApply}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold px-8 py-3 rounded-lg hover:opacity-90 flex items-center justify-center gap-2"
              >
                <Crown className="h-5 w-5" />
                Apply as Team Lead
              </button>
            )}
            
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