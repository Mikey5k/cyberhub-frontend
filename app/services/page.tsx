'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Filter, CheckCircle, Clock, DollarSign, 
  Shield, Users, Zap, Award, TrendingUp, Star,
  ChevronRight, ArrowRight, Loader2, AlertCircle
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  requirements: string[];
  deliveryTime: string;
  popular?: boolean;
  status: string;
}

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Get phone from URL or localStorage
  const [phone, setPhone] = useState<string>('');

  useEffect(() => {
    // Get phone from localStorage or URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlPhone = urlParams.get('phone');
    const savedPhone = localStorage.getItem('cyberhub_phone') || sessionStorage.getItem('cyberhub_phone');
    
    const userPhone = urlPhone || savedPhone || '';
    setPhone(userPhone);
    
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/services');
      const result = await response.json();
      
      if (result.success) {
        setServices(result.services);
        setFilteredServices(result.services);
      } else {
        setError(result.error || 'Failed to load services');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter services based on search and category
  useEffect(() => {
    let filtered = services;
    
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }
    
    setFilteredServices(filtered);
  }, [searchTerm, selectedCategory, services]);

  const handleServiceClick = (serviceId: string) => {
    if (phone) {
      router.push(`/services/${serviceId}?phone=${encodeURIComponent(phone)}`);
    } else {
      router.push(`/login?redirect=/services/${serviceId}`);
    }
  };

  const categories = ['all', 'e-citizen', 'education', 'compliance', 'remote-work', 'business'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-700">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-black mb-6">
              Browse Our Services
              <span className="block text-blue-200 mt-2">AI-Led. Expert-Assisted.</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Choose from verified digital services. Our AI guides you, then connects you with an expert for completion.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search services (e.g., 'KRA PIN', 'KUCCPS', 'Business Registration')"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-3 mb-4">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                    selectedCategory === category
                      ? 'bg-white text-blue-700'
                      : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                  }`}
                >
                  {category === 'all' ? 'All Services' : category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchServices}
              className="mt-4 text-red-700 font-semibold hover:text-red-800"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="bg-white rounded-2xl p-8 border-2 border-gray-300">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No services found</h3>
                <p className="text-gray-600">Try a different search term or category</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="mt-4 text-blue-600 font-semibold hover:text-blue-800"
                >
                  Clear filters
                </button>
              </div>
            </div>
          ) : (
            filteredServices.map((service) => (
              <div
                key={service.id}
                onClick={() => handleServiceClick(service.id)}
                className="bg-white rounded-2xl border-2 border-gray-300 p-6 hover:border-blue-400 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
              >
                {/* Service Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {service.popular && (
                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Popular
                        </div>
                      )}
                      <div className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                        {service.category}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700">
                      {service.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-gray-900">KSh {service.price}</div>
                    <div className="text-sm text-gray-500">Fixed Price</div>
                  </div>
                </div>

                {/* Service Description */}
                <p className="text-gray-600 mb-6 line-clamp-3">
                  {service.description}
                </p>

                {/* Requirements */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Requirements:
                  </h4>
                  <ul className="space-y-2">
                    {service.requirements.slice(0, 3).map((req, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-gray-700">{req}</span>
                      </li>
                    ))}
                    {service.requirements.length > 3 && (
                      <li className="text-sm text-gray-500">
                        +{service.requirements.length - 3} more requirements
                      </li>
                    )}
                  </ul>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{service.deliveryTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-700">Verified</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:text-blue-800">
                    <span>View Details</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* How It Works */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">1. Choose Service</h3>
              <p className="text-gray-700 text-sm">Select from verified digital services</p>
            </div>
            <div className="text-center">
              <div className="bg-green-600 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">2. AI Guidance</h3>
              <p className="text-gray-700 text-sm">Our AI explains requirements and process</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-600 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">3. Expert Connection</h3>
              <p className="text-gray-700 text-sm">Connect with verified expert for completion</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-2xl border-2 border-gray-300 p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Need a Custom Service?</h3>
            <p className="text-gray-700 mb-6">
              Have a specific digital service need? Contact us and we'll match you with the right expert.
            </p>
            <button
              onClick={() => router.push(phone ? '/services/contact' : '/login?redirect=/services/contact')}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 px-8 rounded-lg hover:opacity-90"
            >
              Contact Support
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}