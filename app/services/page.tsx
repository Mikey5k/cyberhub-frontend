'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, FileText, CreditCard, ChevronDown, ChevronRight, Shield, GraduationCap, Briefcase, Phone, HelpCircle, Sparkles, Crown, Zap, Star, CheckCircle, Clock, MapPin, Building, Users, Loader, Lock, Smartphone, UserCheck, AlertTriangle } from 'lucide-react';

interface Service {
  id: string;
  title: string;
  provider: string;
  category: 'e-citizen' | 'student' | 'remote';
  subcategory: string;
  price: number;
  requirements: string[];
  description?: string;
  type: 'direct' | 'whatsapp';
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  company: string;
  category: string;
}

interface Job {
  id?: string;
  serviceId: string;
  serviceTitle: string;
  customerPhone?: string;
  customerName?: string;
  amount: number;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  assignedWorkerId?: string;
  assignedWorkerPhone?: string;
  assignedWorkerName?: string;
  createdAt?: string;
}

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [otherServiceText, setOtherServiceText] = useState('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState({
    'e-citizen': true,
    'student': false,
    'remote': false
  });
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [sentToWhatsApp, setSentToWhatsApp] = useState(false);
  const [createdJob, setCreatedJob] = useState<Job | null>(null);
  const [checkingAssignment, setCheckingAssignment] = useState(false);
  const [assignmentStatus, setAssignmentStatus] = useState<'unassigned' | 'assigned' | 'checking'>('unassigned');
  const [creatingJob, setCreatingJob] = useState(false);

  // Premium Services Data Structure
  const premiumServices: Service[] = [
    // ========== E-CITIZEN SERVICES ==========
    { id: 'ec-1', title: 'National ID Card (First time)', provider: 'NRB', category: 'e-citizen', subcategory: 'ID Services', price: 100, requirements: ['Birth certificate', 'Parent\'s IDs', 'School leaving certificate'], type: 'direct' },
    { id: 'ec-2', title: 'ID Replacement/Duplicate', provider: 'NRB', category: 'e-citizen', subcategory: 'ID Services', price: 100, requirements: ['Copy of old ID', 'Police abstract (if lost)', 'Payment fee'], type: 'direct' },
    { id: 'ec-3', title: 'New Birth Certificate', provider: 'CRS', category: 'e-citizen', subcategory: 'Civil Registration', price: 100, requirements: ['Birth notification slip', 'Parents\' IDs', 'Hospital confirmation'], type: 'direct' },
    { id: 'ec-4', title: 'Death Certificate', provider: 'CRS', category: 'e-citizen', subcategory: 'Civil Registration', price: 100, requirements: ['Death notification form', 'ID of deceased/informant'], type: 'direct' },
    { id: 'ec-5', title: 'Certificate Replacement', provider: 'CRS', category: 'e-citizen', subcategory: 'Civil Registration', price: 100, requirements: ['Affidavit/Police abstract', 'Copy of old certificate'], type: 'direct' },
    { id: 'ec-6', title: 'Passport Application', provider: 'Immigration', category: 'e-citizen', subcategory: 'Immigration', price: 100, requirements: ['Birth certificate', 'National ID', 'Form 19', 'Parents IDs (minors)'], type: 'direct' },
    { id: 'ec-7', title: 'KRA PIN Registration', provider: 'KRA', category: 'e-citizen', subcategory: 'Tax Services', price: 100, requirements: ['National ID', 'Employer PIN (if employed)', 'Business certificate'], type: 'direct' },
    { id: 'ec-8', title: 'Individual Tax Returns', provider: 'KRA', category: 'e-citizen', subcategory: 'Tax Services', price: 100, requirements: ['KRA PIN', 'iTax password', 'P9 form', 'Financial records'], type: 'direct' },
    { id: 'ec-9', title: 'Tax Compliance Certificate', provider: 'KRA', category: 'e-citizen', subcategory: 'Tax Services', price: 100, requirements: ['Compliance with tax obligations'], type: 'direct' },
    { id: 'ec-10', title: 'Police Clearance Certificate', provider: 'DCI', category: 'e-citizen', subcategory: 'Security', price: 100, requirements: ['Original ID', 'C24 fingerprint form', 'Fingerprints at DCI'], type: 'direct' },
    { id: 'ec-11', title: 'Driving License Renewal', provider: 'NTSA', category: 'e-citizen', subcategory: 'Transport', price: 100, requirements: ['eCitizen account', 'KRA PIN', 'Valid ID'], type: 'direct' },
    { id: 'ec-12', title: 'Provisional Driving License', provider: 'NTSA', category: 'e-citizen', subcategory: 'Transport', price: 100, requirements: ['ID details', 'KRA PIN', 'Passport photo'], type: 'direct' },
    { id: 'ec-13', title: 'Motor Vehicle Registration', provider: 'NTSA', category: 'e-citizen', subcategory: 'Transport', price: 100, requirements: ['Import documents', 'KRA PIN', 'ID', 'NTSA account'], type: 'direct' },
    { id: 'ec-14', title: 'Vehicle Ownership Transfer', provider: 'NTSA', category: 'e-citizen', subcategory: 'Transport', price: 100, requirements: ['Logbook details', 'Buyer/seller KRA PINs', 'IDs', 'Transfer fees'], type: 'direct' },
    { id: 'ec-15', title: 'Business Name Registration', provider: 'BRS', category: 'e-citizen', subcategory: 'Business', price: 1000, requirements: ['Business name', 'Activity description', 'IDs & KRA PINs', 'Photos', 'Address'], type: 'direct' },
    { id: 'ec-16', title: 'Annual Returns Filing', provider: 'BRS', category: 'e-citizen', subcategory: 'Business', price: 200, requirements: ['Business registration number', 'Updated details', 'KRA PIN', 'Payment fee'], type: 'direct' },
    { id: 'ec-17', title: 'Student Loan Application', provider: 'HELB', category: 'e-citizen', subcategory: 'Education', price: 100, requirements: ['National ID', 'KRA PIN', 'Admission letter', 'Parents IDs'], type: 'direct' },
    { id: 'ec-18', title: 'Member Registration', provider: 'NSSF', category: 'e-citizen', subcategory: 'Social Security', price: 100, requirements: ['National ID', 'KRA PIN', 'Employer details'], type: 'direct' },
    { id: 'ec-19', title: 'Member Registration', provider: 'SHA', category: 'e-citizen', subcategory: 'Health', price: 100, requirements: ['National ID', 'Photos', 'KRA PIN', 'Marriage certificate'], type: 'direct' },
    { id: 'ec-20', title: 'Official Land Search', provider: 'Lands Ministry', category: 'e-citizen', subcategory: 'Land Services', price: 100, requirements: ['Title deed number', 'ID copy', 'KRA PIN'], type: 'direct' },
    { id: 'ec-27', title: 'Limited Company Registration', provider: 'BRS', category: 'e-citizen', subcategory: 'Business', price: 1000, requirements: ['Company name search', 'Directors IDs/KRA PINs', 'Memorandum', 'Share capital'], type: 'direct' },
    { id: 'ec-47', title: 'Employer Registration', provider: 'NSSF', category: 'e-citizen', subcategory: 'Social Security', price: 100, requirements: ['Company registration', 'KRA PIN for directors'], type: 'direct' },
    { id: 'ec-48', title: 'Employer Registration', provider: 'SHA', category: 'e-citizen', subcategory: 'Health', price: 100, requirements: ['Company registration', 'KRA PIN', 'NSSF registration'], type: 'direct' },
    { id: 'ec-50', title: 'Work/Residence Permit', provider: 'Immigration', category: 'e-citizen', subcategory: 'Immigration', price: 100, requirements: ['Valid passport', 'KRA PIN', 'Police clearance', 'Job contract', 'Medical reports'], type: 'direct' },

    // ========== STUDENT JOURNEY ==========
    { id: 'sj-1', title: 'KUCCPS Registration Bundle', provider: 'KUCCPS + Partners', category: 'student', subcategory: 'Admissions', price: 400, requirements: [
      'KCSE certificate',
      'National ID',
      'School leaving certificate',
      'Parents/Guardian IDs',
      'Career interest information'
    ], description: 'Complete package: KUCCPS Registration + KRA PIN + Bursaries Assistance + Remote Training', type: 'direct' },
    { id: 'sj-2', title: 'KRA PIN Application', provider: 'KRA', category: 'student', subcategory: 'Documents', price: 100, requirements: ['Student ID', 'National ID', 'Admission letter'], type: 'direct' },
    { id: 'sj-3', title: 'Bursaries and Scholarships', provider: 'Various', category: 'student', subcategory: 'Funding', price: 0, requirements: [], description: 'Contact our experts for personalized scholarship matching', type: 'whatsapp' },
    { id: 'sj-4', title: 'Private Hostels & Accommodation', provider: 'Verified Partners', category: 'student', subcategory: 'Housing', price: 0, requirements: [], description: 'Contact our experts to find perfect student accommodation', type: 'whatsapp' },
    { id: 'sj-5', title: 'Internship Opportunities', provider: 'Corporate Partners', category: 'student', subcategory: 'Career', price: 0, requirements: [], description: 'Contact our experts for internship placement and guidance', type: 'whatsapp' },

    // ========== REMOTE WORK ==========
    { id: 'rw-1', title: 'Bulk Account Application', provider: 'Digital Solutions', category: 'remote', subcategory: 'Accounts', price: 100, requirements: ['Company registration', 'Employee list', 'Business email domain', 'Admin contact'], type: 'direct' },
    { id: 'rw-2', title: 'Gmail Personal Account', provider: 'Google', category: 'remote', subcategory: 'Accounts', price: 100, requirements: ['Phone number', 'Backup email', 'Personal details'], type: 'direct' },
    { id: 'rw-3', title: 'Accounts Tests', provider: 'Security Experts', category: 'remote', subcategory: 'Testing', price: 0, requirements: [], description: 'Contact our experts for account security assessment', type: 'whatsapp' },
    { id: 'rw-4', title: 'Remote Work Training', provider: 'Training Academy', category: 'remote', subcategory: 'Training', price: 0, requirements: [], description: 'Contact our experts for personalized remote work training', type: 'whatsapp' },
    { id: 'rw-5', title: 'Bulk Gmail Account Creation', provider: 'Google Partners', category: 'remote', subcategory: 'Accounts', price: 0, requirements: [], description: 'Contact our experts for bulk email setup', type: 'whatsapp' },
  ];

  // Category configuration
  const categories = [
    {
      id: 'e-citizen',
      name: 'E-Citizen Navigator',
      icon: <Shield className="h-5 w-5" />,
      color: 'from-orange-500 to-amber-500',
      count: premiumServices.filter(s => s.category === 'e-citizen').length,
      description: 'Government services - Fixed pricing'
    },
    {
      id: 'student',
      name: 'Student Journey',
      icon: <GraduationCap className="h-5 w-5" />,
      color: 'from-blue-500 to-cyan-500',
      count: premiumServices.filter(s => s.category === 'student').length,
      description: 'Academic and student services'
    },
    {
      id: 'remote',
      name: 'Remote Work',
      icon: <Briefcase className="h-5 w-5" />,
      color: 'from-emerald-500 to-green-500',
      count: premiumServices.filter(s => s.category === 'remote').length,
      description: 'Digital skills and remote opportunities'
    }
  ];

  // Fetch campaigns
  useEffect(() => {
    fetchCampaigns();
  }, []);

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

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId as keyof typeof prev]
    }));
  };

  // Filter services by category
  const getServicesByCategory = (category: string) => {
    return premiumServices.filter(service => service.category === category);
  };

  // Handle payment initiation for all services
  const handlePaymentInitiation = (service: Service) => {
    setSelectedService(service);
    if (service.type === 'direct') {
      setShowMpesaModal(true);
      setSentToWhatsApp(false);
      setCreatedJob(null);
      setAssignmentStatus('unassigned');
    } else {
      handleWhatsAppQuote(service);
    }
  };

  // ========== NEW JOB CREATION LOGIC ==========

  // Create a job when user starts service request
  const createJobInDatabase = async (service: Service): Promise<Job | null> => {
    setCreatingJob(true);
    try {
      const jobData: Job = {
        serviceId: service.id,
        serviceTitle: service.title,
        amount: service.price,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Get customer info from localStorage if available
      const customerPhone = localStorage.getItem('cyberhub_phone') || '';
      const customerName = localStorage.getItem('cyberhub_user') ? 
        JSON.parse(localStorage.getItem('cyberhub_user')!).name : '';

      if (customerPhone) {
        jobData.customerPhone = customerPhone;
      }
      if (customerName) {
        jobData.customerName = customerName;
      }

      // Save job to database via API
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...jobData,
          contentType: 'job',
          postedBy: customerPhone || 'customer',
          category: service.category,
          description: `Service request: ${service.title}`,
          requirements: service.requirements.join(', ')
        })
      });

      const result = await response.json();
      
      if (result.success) {
        const savedJob = { ...jobData, id: result.jobId };
        setCreatedJob(savedJob);
        return savedJob;
      } else {
        console.error('Failed to create job:', result.error);
        return null;
      }
    } catch (error) {
      console.error('Error creating job:', error);
      return null;
    } finally {
      setCreatingJob(false);
    }
  };

  // Check if job has been assigned to a worker
  const checkJobAssignment = async (jobId: string) => {
    setCheckingAssignment(true);
    try {
      const response = await fetch(`/api/jobs?id=${jobId}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        const job = result.data;
        if (job.assignedWorkerPhone) {
          setAssignmentStatus('assigned');
          setCreatedJob(job);
          return job.assignedWorkerPhone;
        }
      }
      return null;
    } catch (error) {
      console.error('Error checking job assignment:', error);
      return null;
    } finally {
      setCheckingAssignment(false);
    }
  };

  // Open WhatsApp with assigned worker OR admin
  const openWhatsAppWithMpesaProof = async () => {
    if (!selectedService) return;
    
    // Create job first
    const job = await createJobInDatabase(selectedService);
    
    if (!job) {
      alert('Could not create service request. Please try again.');
      return;
    }

    // Prepare WhatsApp message
    let whatsappNumber = "254708949580"; // Default to admin
    let message = `Hello Veritas CyberHub,\n\nI have made payment for:\n\nService: ${selectedService.title}\nAmount: Ksh ${selectedService.price}\nJob ID: ${job.id}\n\nPlease find my M-Pesa payment proof below.`;

    // Check if job is already assigned (rare but possible)
    const assignedWorkerPhone = await checkJobAssignment(job.id!);
    
    if (assignedWorkerPhone) {
      whatsappNumber = assignedWorkerPhone.replace('+', '');
      message = `Hello,\n\nI have made payment for:\n\nService: ${selectedService.title}\nAmount: Ksh ${selectedService.price}\nJob ID: ${job.id}\n\nPlease assist me with this service.`;
    }

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setSentToWhatsApp(true);
    
    // Start polling for assignment if not already assigned
    if (!assignedWorkerPhone) {
      startAssignmentPolling(job.id!);
    }
  };

  // Poll for worker assignment
  const startAssignmentPolling = (jobId: string) => {
    setAssignmentStatus('checking');
    const pollInterval = setInterval(async () => {
      const assignedWorkerPhone = await checkJobAssignment(jobId);
      if (assignedWorkerPhone) {
        clearInterval(pollInterval);
        setAssignmentStatus('assigned');
        
        // Notify user that worker has been assigned
        alert(`✅ Worker assigned! A service agent has been assigned to your request. You can now contact them directly via WhatsApp.`);
      }
    }, 10000); // Check every 10 seconds

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (assignmentStatus === 'checking') {
        setAssignmentStatus('unassigned');
        alert('No worker has accepted the job yet. Our admin will assign one shortly. You can still message admin for updates.');
      }
    }, 300000); // 5 minutes
  };

  // Handle WhatsApp for quote services
  const handleWhatsAppQuote = (service: Service) => {
    const message = `Hello Veritas CyberHub,\n\nI need a quote for: ${service.title}\n\nPlease provide me with pricing and requirements.`;
    const whatsappUrl = `https://wa.me/254708949580?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Check status button - shows assigned worker's WhatsApp if available
  const handleCheckStatus = async () => {
    if (!createdJob) {
      alert('No service request found. Please start a service request first.');
      return;
    }

    const assignedWorkerPhone = await checkJobAssignment(createdJob.id!);
    
    if (assignedWorkerPhone) {
      const message = `Hello,\n\nI would like to follow up on my service request:\n\nService: ${createdJob.serviceTitle}\nJob ID: ${createdJob.id}\n\nCan you please update me on the progress?`;
      const whatsappUrl = `https://wa.me/${assignedWorkerPhone.replace('+', '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } else {
      const message = `Hello Veritas CyberHub,\n\nI would like to check the status of my service request:\n\nService: ${createdJob.serviceTitle}\nJob ID: ${createdJob.id}\nAmount: Ksh ${createdJob.amount}\n\nWhen will a worker be assigned?`;
      const whatsappUrl = `https://wa.me/254708949580?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  // Handle other service request
  const handleOtherServiceSubmit = () => {
    if (!otherServiceText.trim()) {
      alert('Please describe the service you need.');
      return;
    }
    
    const message = `Hello Veritas CyberHub,\n\nI need assistance with: ${otherServiceText}\n\nPlease advise on pricing and requirements.`;
    const whatsappUrl = `https://wa.me/254708949580?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setOtherServiceText('');
  };

  // Get subcategories for a category
  const getSubcategories = (category: string) => {
    const services = getServicesByCategory(category);
    const subcats = [...new Set(services.map(s => s.subcategory))];
    return subcats;
  };

  // Copy M-Pesa details to clipboard
  const copyMpesaDetails = () => {
    const mpesaDetails = `Paybill: 247247\nAccount: VERITAS001\nAmount: Ksh ${selectedService?.price}\nName: Veritas CyberHub`;
    navigator.clipboard.writeText(mpesaDetails);
    alert('M-Pesa details copied to clipboard!');
  };

  // Keep all the existing JSX return structure the same, but update the button text and add status indicators

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-2 rounded-xl shadow-lg">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Veritas CyberHub
                </h1>
                <p className="text-xs text-gray-600 font-medium">Premium Digital Services</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl">
                <Sparkles className="h-4 w-4" />
                Premium Access
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  U
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Left Panel - Categories & Services */}
          <div className="w-1/3">
            {/* Categories Section */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 mb-6">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="h-5 w-5 text-orange-500" />
                <h2 className="text-xl font-bold text-gray-900">Service Categories</h2>
              </div>
              
              <div className="space-y-4">
                {categories.map(category => (
                  <div key={category.id} className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${category.color} shadow-sm`}>
                          {category.icon}
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-gray-900">{category.name}</h3>
                          <p className="text-xs text-gray-600">{category.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                          {category.count} services
                        </span>
                        {expandedCategories[category.id as keyof typeof expandedCategories] ? (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                    </button>
                    
                    {/* Subcategories Dropdown */}
                    {expandedCategories[category.id as keyof typeof expandedCategories] && (
                      <div className="border-t border-gray-200 p-4 bg-gray-50">
                        <div className="space-y-3">
                          {getSubcategories(category.id).map((subcategory, index) => (
                            <div key={index} className="space-y-2">
                              <h4 className="text-sm font-semibold text-gray-700 px-2">{subcategory}</h4>
                              <div className="space-y-1">
                                {getServicesByCategory(category.id)
                                  .filter(s => s.subcategory === subcategory)
                                  .map(service => (
                                    <button
                                      key={service.id}
                                      onClick={() => {
                                        setSelectedService(service);
                                        if (service.type === 'whatsapp') {
                                          handleWhatsAppQuote(service);
                                        }
                                      }}
                                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                                        selectedService?.id === service.id
                                          ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-amber-50 shadow-sm'
                                          : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                                      }`}
                                    >
                                      <div className="flex justify-between items-center">
                                        <div className="flex-1">
                                          <h4 className="font-medium text-gray-900 text-sm">{service.title}</h4>
                                          <p className="text-xs text-gray-500 mt-1">{service.provider}</p>
                                        </div>
                                        <div className={`text-right ${
                                          service.price === 1000 ? 'text-red-600' : 
                                          service.price === 400 ? 'text-purple-600' : 
                                          'text-orange-600'
                                        }`}>
                                          <div className="font-bold">
                                            {service.type === 'direct' ? `Ksh ${service.price}` : 'Quote'}
                                          </div>
                                        </div>
                                      </div>
                                    </button>
                                  ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Other Services Request */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <HelpCircle className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-gray-900">Need a Different Service?</h3>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                Don't see what you need? Describe it below and our experts will assist you.
              </p>
              <textarea
                value={otherServiceText}
                onChange={(e) => setOtherServiceText(e.target.value)}
                placeholder="Describe the service you need assistance with..."
                className="w-full px-4 py-3 bg-white border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4 resize-none"
                rows={3}
              />
              <button
                onClick={handleOtherServiceSubmit}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:opacity-90 flex items-center justify-center gap-2 shadow-lg"
              >
                <MessageCircle className="h-5 w-5" />
                Contact Support
              </button>
            </div>
          </div>

          {/* Right Panel - Service Details */}
          <div className="w-2/3">
            {selectedService ? (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
                {/* Premium Service Header */}
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${
                        selectedService.category === 'e-citizen' ? 'from-orange-500 to-amber-500' :
                        selectedService.category === 'student' ? 'from-blue-500 to-cyan-500' :
                        'from-emerald-500 to-green-500'
                      } shadow-lg`}>
                        {selectedService.category === 'e-citizen' ? <Shield className="h-6 w-6 text-white" /> :
                         selectedService.category === 'student' ? <GraduationCap className="h-6 w-6 text-white" /> :
                         <Briefcase className="h-6 w-6 text-white" />}
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-gray-900">{selectedService.title}</h2>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Building className="h-4 w-4" />
                            <span className="font-medium">{selectedService.provider}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <MapPin className="h-4 w-4" />
                            <span>Online Service</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {selectedService.description && (
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 mb-6">
                        <p className="text-gray-700">{selectedService.description}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-4xl font-black ${
                      selectedService.price === 1000 ? 'text-red-600' : 
                      selectedService.price === 400 ? 'text-purple-600' : 
                      'text-orange-600'
                    }`}>
                      {selectedService.type === 'direct' ? `Ksh ${selectedService.price}` : 'Custom Quote'}
                    </div>
                    <div className="flex items-center gap-2 mt-2 justify-end">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Processing: 24-48 hours</span>
                    </div>
                  </div>
                </div>

                {/* Requirements Section */}
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-6">
                    <FileText className="h-6 w-6 text-orange-600" />
                    <h3 className="text-2xl font-bold text-gray-900">Service Requirements</h3>
                  </div>
                  
                  {selectedService.requirements && selectedService.requirements.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedService.requirements.map((req, index) => (
                        <div key={index} className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:border-orange-300 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="text-gray-900 font-medium">{req}</p>
                              <p className="text-xs text-gray-600 mt-1">Required document/information</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-gray-700">Contact our experts for specific requirements</p>
                    </div>
                  )}
                </div>

                {/* Action Section */}
                <div className="border-t border-gray-200 pt-8">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Ready to proceed?</h4>
                      <p className="text-gray-600">
                        {selectedService.type === 'direct' 
                          ? 'Click "Proceed to Payment" to get M-Pesa details'
                          : 'Click "Get Quote" for personalized pricing and assistance'}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handlePaymentInitiation(selectedService)}
                      className={`px-8 py-4 text-white font-bold rounded-xl shadow-lg flex items-center gap-3 ${
                        selectedService.type === 'direct'
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90'
                          : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90'
                      }`}
                    >
                      {selectedService.type === 'direct' ? (
                        <>
                          <CreditCard className="h-6 w-6" />
                          Proceed to Payment
                        </>
                      ) : (
                        <>
                          <MessageCircle className="h-6 w-6" />
                          Get Quote on WhatsApp
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-16 text-center">
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-6 rounded-2xl inline-block mb-6">
                  <Sparkles className="h-16 w-16 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Select a Premium Service</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                  Choose a service from the categories to view detailed requirements and proceed with payment or quotation.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-orange-300 rounded-full"></div>
                </div>
              </div>
            )}

            {/* Campaigns Section */}
            <div className="mt-8">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Star className="h-6 w-6 text-purple-600" />
                    <h3 className="text-xl font-bold text-gray-900">Featured Campaigns & Offers</h3>
                  </div>
                  <button
                    onClick={fetchCampaigns}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Refresh
                  </button>
                </div>

                {loadingCampaigns ? (
                  <div className="text-center py-8">
                    <Loader className="h-8 w-8 text-purple-600 animate-spin mx-auto" />
                    <p className="text-gray-600 mt-2">Loading special offers...</p>
                  </div>
                ) : campaigns.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {campaigns.map(campaign => (
                      <div key={campaign.id} className="bg-white rounded-xl border border-purple-100 p-4 hover:border-purple-300 transition-colors">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-gray-900">{campaign.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>
                          </div>
                          <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 text-xs font-bold rounded-full">
                            OFFER
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-xs text-gray-500">{campaign.company}</span>
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {campaign.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No active campaigns at the moment.</p>
                    <p className="text-sm text-gray-500 mt-2">Check back later for special offers!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* M-Pesa Payment Modal */}
      {showMpesaModal && selectedService && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-300 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="h-6 w-6 text-white" />
                  <h3 className="text-xl font-bold text-white">Complete Payment</h3>
                </div>
                <button 
                  onClick={() => setShowMpesaModal(false)}
                  className="text-white hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{selectedService.title}</h4>
                    <p className="text-sm text-gray-600">Amount: <span className="font-bold text-orange-600">Ksh {selectedService.price}</span></p>
                  </div>
                </div>

                {/* M-Pesa Payment Details */}
                <div className="bg-gradient-to-r from-gray-50 to-white border-2 border-green-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <h5 className="font-bold text-gray-900">M-PESA PAYMENT DETAILS</h5>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Paybill:</span>
                      <span className="font-bold text-gray-900">247247</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Account:</span>
                      <span className="font-bold text-gray-900">VERITAS001</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Amount:</span>
                      <span className="font-bold text-orange-600">Ksh {selectedService.price}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Name:</span>
                      <span className="font-bold text-gray-900">Veritas CyberHub</span>
                    </div>
                  </div>

                  <button
                    onClick={copyMpesaDetails}
                    className="w-full mt-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    Copy M-Pesa Details
                  </button>
                </div>

                {/* WhatsApp Instructions */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                    <h5 className="font-bold text-gray-900">START SERVICE REQUEST</h5>
                  </div>
                  
                  <ol className="space-y-3 text-sm text-gray-700 mb-4">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-gray-900">1.</span>
                      <span>Make payment using the M-Pesa details above</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-gray-900">2.</span>
                      <span>You'll receive an M-Pesa confirmation SMS</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-gray-900">3.</span>
                      <span>Screenshot or copy the M-Pesa message</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-gray-900">4.</span>
                      <span>Click the button below to start service request</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-gray-900">5.</span>
                      <span>Send the M-Pesa proof to the WhatsApp that opens</span>
                    </li>
                  </ol>

                  <div className="bg-white border border-blue-300 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Smartphone className="h-4 w-4 text-green-600" />
                      <span className="text-gray-700">A service agent will be assigned to handle your request</span>
                    </div>
                  </div>

                  <button
                    onClick={openWhatsAppWithMpesaProof}
                    disabled={creatingJob}
                    className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {creatingJob ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin" />
                        Creating Service Request...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="h-5 w-5" />
                        I've Paid - Start Service Request
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-600 text-center mt-3">
                    This creates a job that agents can accept. You'll message the assigned agent directly.
                  </p>
                </div>

                {/* Status Check Section */}
                {sentToWhatsApp && (
                  <div className="border-t border-gray-200 pt-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                      
                      {createdJob && (
                        <div className="mb-4">
                          <h4 className="font-bold text-gray-900 mb-1">Service Request Created!</h4>
                          <p className="text-sm text-gray-600 mb-2">Job ID: <span className="font-mono">{createdJob.id}</span></p>
                          
                          {assignmentStatus === 'checking' && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                              <div className="flex items-center gap-2">
                                <Loader className="h-4 w-4 animate-spin text-blue-600" />
                                <span className="text-sm text-blue-700">Waiting for agent assignment...</span>
                              </div>
                            </div>
                          )}
                          
                          {assignmentStatus === 'assigned' && createdJob.assignedWorkerPhone && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                              <div className="flex items-center gap-2">
                                <UserCheck className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-green-700">Agent assigned: {createdJob.assignedWorkerPhone}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="space-y-3">
                        <button
                          onClick={handleCheckStatus}
                          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:opacity-90 flex items-center justify-center gap-2"
                        >
                          <MessageCircle className="h-5 w-5" />
                          Check Assignment Status
                        </button>
                        <button
                          onClick={() => setShowMpesaModal(false)}
                          className="w-full py-2 text-gray-600 hover:text-gray-900 font-medium"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Support Button */}
      <a
        href="https://wa.me/254708949580"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105"
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="h-6 w-6" />
          <span className="font-bold hidden sm:inline">Support</span>
        </div>
      </a>
    </div>
  );
}