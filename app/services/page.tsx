'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, Briefcase, GraduationCap, Building, BookOpen, 
  BrainCircuit, PiggyBank, MessageCircle, Zap, ChevronRight,
  Phone, Check, Star, Users, Clock, Home, FileText, Laptop, Wallet,
  ArrowRight, ExternalLink, Search, Filter, CreditCard, Loader,
  UserCheck, AlertCircle, Calendar, Target, Lock, Sparkles
} from 'lucide-react';

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
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([
    { id: 1, title: 'Inquiry', status: 'pending', description: 'Service selected' },
    { id: 2, title: 'Payment', status: 'pending', description: 'Awaiting payment' },
    { id: 3, title: 'Agent Connected', status: 'pending', description: 'Expert assignment' },
    { id: 4, title: 'In Progress', status: 'pending', description: 'Service execution' },
    { id: 5, title: 'Finished', status: 'pending', description: 'Completion & review' },
  ]);

  // Get phone from localStorage
  useEffect(() => {
    const savedPhone = localStorage.getItem('cyberhub_phone') || sessionStorage.getItem('cyberhub_phone');
    if (savedPhone) setPhone(savedPhone);
  }, []);

  // Fetch services from API
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/services');
      const result = await response.json();

      if (result.success) {
        // Transform API data to match Service interface
        const transformedServices = result.services.map((service: any) => {
          // Map category to icon
          let icon = <Briefcase className="h-5 w-5" />;
          if (service.category.includes('Government') || service.category.includes('E-Citizen')) {
            icon = <Shield className="h-5 w-5" />;
          } else if (service.category.includes('Education')) {
            icon = <BookOpen className="h-5 w-5" />;
          }

          // Common pain points based on category
          const painPoints = [
            'Complex paperwork and requirements',
            'Time-consuming processes',
            'Unclear documentation needs',
            'Multiple follow-ups required'
          ];

          // Solution based on category
          const solution = `Expert handling of ${service.name.toLowerCase()} with complete document preparation and submission`;

          return {
            id: service.id,
            name: service.name,
            description: service.description,
            category: service.category,
            price: service.price || 3000,
            requirements: service.requirements || ['Valid ID', 'Required documents'],
            icon,
            painPoints,
            solution,
            whatsappMessage: `Hello Veritas Expert, I need ${service.name} assistance. I've made payment and ready to proceed.`
          };
        });

        setServices(transformedServices);
      } else {
        setError(result.error || 'Failed to load services');
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Network error. Please try again.');
      // Fallback to sample data if API fails
      setServices(getSampleServices());
    } finally {
      setLoading(false);
    }
  };

  // Sample data fallback
  const getSampleServices = (): Service[] => [
    {
      id: 'ecitizen',
      name: 'E-Citizen Navigator',
      description: 'Government services handled with expert precision',
      category: 'Government',
      price: 3000,
      icon: <Shield className="h-5 w-5" />,
      painPoints: ['Long queues at government offices', 'Complex paperwork', 'Multiple visits required', 'Unclear requirements'],
      solution: 'Instant expert assignment with complete document handling and digital submission',
      requirements: ['Valid ID', 'Required documents', 'Service details'],
      whatsappMessage: 'Hello Veritas Expert, I need E-Citizen Navigator assistance with government services.'
    },
    {
      id: 'kuccps',
      name: 'KUCCPS & University Applications',
      description: 'Complete university placement and course selection assistance',
      category: 'Education',
      price: 2500,
      icon: <BookOpen className="h-5 w-5" />,
      painPoints: ['Confusing portal navigation', 'Missed deadlines', 'Wrong course choices', 'Payment system failures'],
      solution: 'Instant guidance through optimal course selection with expert verification',
      requirements: ['KCSE results', 'Course preferences', 'University choices'],
      whatsappMessage: 'Hello Veritas Expert, I need KUCCPS & University Applications assistance.'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Services', icon: <Zap className="h-4 w-4" /> },
    { id: 'Government', name: 'Government', icon: <Shield className="h-4 w-4" /> },
    { id: 'E-Citizen', name: 'E-Citizen', icon: <Shield className="h-4 w-4" /> },
    { id: 'Education', name: 'Education', icon: <BookOpen className="h-4 w-4" /> },
  ];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    // Reset progress for new service
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

  const handlePayment = async () => {
    if (!selectedService || !phone) return;
    
    setPaymentProcessing(true);
    
    try {
      // Create task via API
      const taskResponse = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'create',
          phone: phone,
          title: selectedService.name,
          description: selectedService.description,
          price: selectedService.price
        })
      });

      const taskResult = await taskResponse.json();

      if (taskResult.success) {
        setPaymentProcessing(false);
        
        // Update progress steps
        const updatedSteps = [...progressSteps];
        updatedSteps[0].status = 'completed'; // Inquiry completed
        updatedSteps[1].status = 'completed'; // Payment completed
        updatedSteps[2].status = 'current';   // Agent Connected current
        setProgressSteps(updatedSteps);
        
        // Simulate agent assignment (in real app, this would be from API)
        setTimeout(() => {
          setAgentConnected(true);
          setCurrentAgent('Available Expert');
          
          const updatedSteps2 = [...updatedSteps];
          updatedSteps2[2].status = 'completed'; // Agent Connected completed
          updatedSteps2[3].status = 'current';   // In Progress current
          setProgressSteps(updatedSteps2);
        }, 1500);
      } else {
        throw new Error(taskResult.error || 'Failed to create task');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentProcessing(false);
      setError('Payment failed. Please try again.');
    }
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
    updatedSteps[3].status = 'completed'; // In Progress completed
    updatedSteps[4].status = 'completed'; // Finished completed
    setProgressSteps(updatedSteps);
  };

  const handleLogout = () => {
    localStorage.removeItem('cyberhub_phone');
    localStorage.removeItem('cyberhub_role');
    sessionStorage.removeItem('cyberhub_phone');
    sessionStorage.removeItem('cyberhub_role');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-700">Loading services...</p>
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
              onClick={fetchServices}
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
              
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map(category => (
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

            {/* Services List */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-bold text-gray-900">Available Services ({filteredServices.length})</h3>
                <p className="text-sm text-gray-600">Select a service to begin</p>
              </div>
              
              <div className="max-h-[500px] overflow-y-auto">
                {filteredServices.map(service => (
                  <div
                    key={service.id}
                    className={`border-b border-gray-200 last:border-b-0 transition-colors cursor-pointer ${
                      selectedService?.id === service.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleServiceSelect(service)}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-2.5 rounded-lg ${
                          selectedService?.id === service.id 
                            ? 'bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {service.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h4 className="font-bold text-gray-900">{service.name}</h4>
                            {selectedService?.id === service.id && (
                              <div className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
                                Selected
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full">
                              {service.category}
                            </span>
                            <div className="text-sm font-bold text-gray-900">
                              KSh {service.price}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                              <span>4.8</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-blue-700">{services.length}+</div>
                <div className="text-sm text-blue-600">Services Available</div>
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
                        <h2 className="text-2xl font-black text-gray-900">{selectedService.name}</h2>
                        <p className="text-gray-600">{selectedService.description}</p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg px-4 py-2">
                      <span className="text-sm font-semibold text-green-700">KSh {selectedService.price}</span>
                    </div>
                  </div>

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
                    <div className="flex flex-wrap gap-3">
                      {selectedService.requirements.map((req, index) => (
                        <span key={index} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Payment Button */}
                  <button
                    onClick={handlePayment}
                    disabled={paymentProcessing || agentConnected || !phone}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all ${
                      paymentProcessing || agentConnected || !phone
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#ff6b35] to-[#ffa500] hover:opacity-90 hover:scale-[1.02]'
                    }`}
                  >
                    {!phone ? (
                      'Please sign in to make payment'
                    ) : paymentProcessing ? (
                      <div className="flex items-center justify-center gap-3">
                        <Loader className="h-5 w-5 animate-spin" />
                        Processing Payment...
                      </div>
                    ) : agentConnected ? (
                      'Payment Completed ✓'
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <CreditCard className="h-6 w-6" />
                        Make Payment (KSh {selectedService.price})
                      </div>
                    )}
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-xl">
                  <h3 className="text-xl font-black text-gray-900 mb-6">Service Progress</h3>
                  
                  {/* Progress Steps */}
                  <div className="relative">
                    {/* Connecting Line */}
                    <div className="absolute left-8 top-4 h-full w-0.5 bg-gray-200 -z-10"></div>
                    
                    {progressSteps.map((step, index) => (
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
                          
                          {/* Agent Connected Details */}
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
                          
                          {/* Mark Complete Button (for worker simulation) */}
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
              /* Empty State */
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center shadow-xl">
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-6 rounded-2xl inline-block mb-6">
                  <Target className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4">Select a Service</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Choose a service from the list to view details, make payment, and track progress.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">Instant expert assignment</span>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Lock className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-gray-700">Secure payment processing</span>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <MessageCircle className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-gray-700">Direct WhatsApp communication</span>
                  </div>
                </div>
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
              disabled={!selectedService || !phone}
              className={`font-bold px-8 py-3 rounded-lg ${
                !selectedService || !phone
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white hover:opacity-90'
              }`}
            >
              Start Your Service
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