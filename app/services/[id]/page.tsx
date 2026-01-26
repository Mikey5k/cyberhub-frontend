'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, CheckCircle, Clock, DollarSign, Shield, 
  Users, FileText, MessageCircle, Loader2, AlertCircle 
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  requirements: string[];
  deliveryTime: string;
  status: string;
}

export default function ServiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params.id as string;
  
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlPhone = urlParams.get('phone');
    const savedPhone = localStorage.getItem('cyberhub_phone') || sessionStorage.getItem('cyberhub_phone');
    setPhone(urlPhone || savedPhone || '');
    
    fetchService();
  }, [serviceId]);

  const fetchService = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/services/${serviceId}`);
      const result = await response.json();
      
      if (result.success) {
        setService(result.service);
      } else {
        setError(result.error || 'Service not found');
      }
    } catch (error) {
      setError('Failed to load service details');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = () => {
    if (!phone) {
      router.push(`/login?redirect=/services/${serviceId}`);
      return;
    }
    // Order logic here
    alert(`Order placed for ${service?.name}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-700">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl border-2 border-gray-300">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Service Not Found</h2>
          <p className="text-gray-700 mb-6">{error || 'The service you are looking for does not exist.'}</p>
          <button
            onClick={() => router.push('/services')}
            className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="inline mr-2 h-5 w-5" />
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <button
          onClick={() => router.push('/services')}
          className="flex items-center gap-2 text-gray-700 hover:text-blue-700 font-semibold"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Services
        </button>
      </div>

      {/* Service Detail */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border-2 border-gray-300 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="bg-white/20 backdrop-blur-sm inline-block px-4 py-1 rounded-full text-sm font-bold mb-4">
                  {service.category}
                </div>
                <h1 className="text-3xl md:text-4xl font-black mb-4">{service.name}</h1>
                <p className="text-blue-100 text-lg max-w-3xl">{service.description}</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black">KSh {service.price}</div>
                <div className="text-blue-200">Fixed Price • No Hidden Fees</div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Left Column - Details */}
              <div className="md:col-span-2">
                {/* Requirements */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-6 w-6 text-blue-600" />
                    What You Need
                  </h3>
                  <ul className="space-y-3">
                    {service.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Process */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="h-6 w-6 text-blue-600" />
                    How It Works
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="bg-blue-100 text-blue-700 font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                        1
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Submit Requirements</h4>
                        <p className="text-gray-600">Upload or share your documents through our secure platform.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="bg-blue-100 text-blue-700 font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                        2
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Expert Assignment</h4>
                        <p className="text-gray-600">A verified expert is assigned to handle your service.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="bg-blue-100 text-blue-700 font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                        3
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Real-Time Updates</h4>
                        <p className="text-gray-600">Track progress and communicate via WhatsApp.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="bg-blue-100 text-blue-700 font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                        4
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Completion & Delivery</h4>
                        <p className="text-gray-600">Receive completed service with verification.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Order Box */}
              <div className="md:col-span-1">
                <div className="bg-gradient-to-b from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-6 sticky top-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Order This Service</h3>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <span>Delivery Time</span>
                      </div>
                      <span className="font-bold text-gray-900">{service.deliveryTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Shield className="h-5 w-5 text-green-600" />
                        <span>Verification</span>
                      </div>
                      <span className="font-bold text-green-700">Guaranteed</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-700">
                        <MessageCircle className="h-5 w-5 text-purple-600" />
                        <span>Support</span>
                      </div>
                      <span className="font-bold text-gray-900">24/7 WhatsApp</span>
                    </div>
                  </div>

                  <div className="border-t border-blue-200 pt-6">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-gray-700">Total</span>
                      <div className="text-right">
                        <div className="text-3xl font-black text-gray-900">KSh {service.price}</div>
                        <div className="text-sm text-gray-500">All inclusive</div>
                      </div>
                    </div>

                    {phone ? (
                      <button
                        onClick={handleOrder}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 px-6 rounded-xl hover:opacity-90 transition-opacity"
                      >
                        Proceed to Order
                      </button>
                    ) : (
                      <button
                        onClick={() => router.push(`/login?redirect=/services/${serviceId}`)}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 px-6 rounded-xl hover:opacity-90 transition-opacity"
                      >
                        Login to Order
                      </button>
                    )}

                    <div className="text-center mt-4 text-sm text-gray-600">
                      By ordering, you agree to our Terms of Service
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}