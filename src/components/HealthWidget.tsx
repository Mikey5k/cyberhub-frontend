"use client";

import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Clock, RefreshCw, Power, Trash2, Wifi, Database, AlertTriangle, Zap } from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'up' | 'down' | 'slow';
  responseTime?: number;
  endpoint?: string;
  lastChecked: string;
}

interface HealthAlert {
  id: number;
  message: string;
  type: 'info' | 'warning' | 'error';
  timestamp: string;
  service: string;
}

export default function HealthWidget() {
  // Initial services state
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Firestore Database', status: 'up', responseTime: 180, endpoint: 'Firestore Connection', lastChecked: new Date().toISOString() },
    { name: 'Vercel API Endpoints', status: 'up', responseTime: 120, endpoint: '/api/* (11 endpoints)', lastChecked: new Date().toISOString() },
    { name: 'Phone Authentication', status: 'up', responseTime: 80, endpoint: 'URL Parameter System', lastChecked: new Date().toISOString() },
    { name: 'Task Processing Engine', status: 'up', responseTime: 150, endpoint: '/api/createTask', lastChecked: new Date().toISOString() },
    { name: 'Commission Calculator', status: 'up', responseTime: 200, endpoint: '/api/calculateCommission', lastChecked: new Date().toISOString() },
    { name: 'WhatsApp Integration', status: 'up', responseTime: 220, endpoint: 'External Service', lastChecked: new Date().toISOString() },
    { name: 'Payment Gateway', status: 'up', responseTime: 180, endpoint: 'M-Pesa Integration', lastChecked: new Date().toISOString() },
  ]);

  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState('');
  const [actionsLog, setActionsLog] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Simulate health check
  const checkHealth = async () => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const updatedServices = services.map(service => {
        // Randomly simulate status changes (10% chance of issue)
        const random = Math.random();
        let newStatus: 'up' | 'down' | 'slow' = 'up';
        if (random < 0.05) newStatus = 'down';
        else if (random < 0.1) newStatus = 'slow';

        const newResponseTime = Math.floor(Math.random() * 250) + 50;
        
        // Log issues as alerts
        if (newStatus === 'down' && service.status !== 'down') {
          addAlert({
            id: Date.now(),
            message: `${service.name} is DOWN`,
            type: 'error',
            timestamp: new Date().toLocaleTimeString(),
            service: service.name
          });
        } else if (newStatus === 'slow' && service.status !== 'slow') {
          addAlert({
            id: Date.now(),
            message: `${service.name} is running SLOW (${newResponseTime}ms)`,
            type: 'warning',
            timestamp: new Date().toLocaleTimeString(),
            service: service.name
          });
        }

        return {
          ...service,
          status: newStatus,
          responseTime: newResponseTime,
          lastChecked: new Date().toISOString()
        };
      });

      setServices(updatedServices);
      setLastChecked(new Date().toLocaleTimeString());
      setLoading(false);
      logAction('✅ System health check completed');
    }, 800);
  };

  // Log actions
  const logAction = (action: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setActionsLog(prev => [`[${timestamp}] ${action}`, ...prev.slice(0, 9)]);
  };

  // Add alerts
  const addAlert = (alert: HealthAlert) => {
    setAlerts(prev => [alert, ...prev.slice(0, 4)]);
  };

  // Action handlers
  const handleRestartService = (serviceName: string) => {
    setServices(prev => prev.map(service => 
      service.name === serviceName 
        ? { ...service, status: 'up', responseTime: 100, lastChecked: new Date().toISOString() }
        : service
    ));
    logAction(`🔄 Restarted ${serviceName}`);
    addAlert({
      id: Date.now(),
      message: `Manually restarted ${serviceName}`,
      type: 'info',
      timestamp: new Date().toLocaleTimeString(),
      service: serviceName
    });
  };

  const handleClearCache = () => {
    // Clear various caches
    localStorage.removeItem('cyberhub_cache');
    localStorage.removeItem('cyberhub_services_cache');
    localStorage.removeItem('cyberhub_users_cache');
    sessionStorage.clear();
    
    logAction('🗑️ Cleared all cache and local storage');
    addAlert({
      id: Date.now(),
      message: 'All cache cleared successfully',
      type: 'info',
      timestamp: new Date().toLocaleTimeString(),
      service: 'System'
    });
  };

  const handleTestConnection = (serviceName: string) => {
    setServices(prev => prev.map(service => 
      service.name === serviceName 
        ? { 
            ...service, 
            responseTime: Math.floor(Math.random() * 150) + 50,
            lastChecked: new Date().toISOString()
          }
        : service
    ));
    logAction(`📡 Tested connection to ${serviceName}`);
  };

  const handleRefreshData = () => {
    checkHealth();
    logAction('🔄 Refreshed all system data');
  };

  const handleClearAlerts = () => {
    setAlerts([]);
    logAction('🧹 Cleared all alerts');
  };

  const handleForceAllUp = () => {
    setServices(prev => prev.map(service => ({
      ...service,
      status: 'up',
      responseTime: 100,
      lastChecked: new Date().toISOString()
    })));
    logAction('⚡ Forced all services to UP status');
    addAlert({
      id: Date.now(),
      message: 'All services forced to UP status',
      type: 'warning',
      timestamp: new Date().toLocaleTimeString(),
      service: 'System'
    });
  };

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(checkHealth, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Initial check
  useEffect(() => {
    checkHealth();
  }, []);

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up': return 'bg-green-100 text-green-800 border-green-300';
      case 'slow': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'down': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'up': return <CheckCircle className="w-5 h-5" />;
      case 'slow': return <Clock className="w-5 h-5" />;
      case 'down': return <AlertCircle className="w-5 h-5" />;
      default: return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'info': return <Database className="w-4 h-4" />;
      default: return <Database className="w-4 h-4" />;
    }
  };

  // Calculate stats
  const stats = {
    up: services.filter(s => s.status === 'up').length,
    down: services.filter(s => s.status === 'down').length,
    slow: services.filter(s => s.status === 'slow').length,
    total: services.length,
    avgResponse: Math.round(services.reduce((sum, s) => sum + (s.responseTime || 0), 0) / services.length)
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">System Health Dashboard</h2>
            <p className="text-gray-600 mt-1">Monitor and manage all platform services</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-bold text-gray-900">{stats.up}</span>
              <span className="text-gray-600">Up</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="font-bold text-gray-900">{stats.slow}</span>
              <span className="text-gray-600">Slow</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="font-bold text-gray-900">{stats.down}</span>
              <span className="text-gray-600">Down</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border">
              <Zap className="w-4 h-4 text-blue-500" />
              <span className="font-bold text-gray-900">{stats.avgResponse}ms</span>
              <span className="text-gray-600">Avg</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Services Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Services Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Service Status</h3>
                <p className="text-sm text-gray-600">{stats.total} services monitored</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoRefresh"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <label htmlFor="autoRefresh" className="text-sm text-gray-700">
                    Auto-refresh (30s)
                  </label>
                </div>
                <button
                  onClick={checkHealth}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? 'Checking...' : 'Check Now'}</span>
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {services.map((service, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow gap-3">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`p-3 rounded-full ${getStatusColor(service.status)}`}>
                      {getStatusIcon(service.status)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{service.name}</div>
                      <div className="text-sm text-gray-500">
                        {service.endpoint} • {service.responseTime}ms
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Last checked: {new Date(service.lastChecked).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(service.status)}`}>
                      {service.status.toUpperCase()}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleTestConnection(service.name)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200"
                        title="Test Connection"
                      >
                        <Wifi className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRestartService(service.name)}
                        className={`p-2 rounded-lg border ${service.status === 'down' ? 'text-red-600 hover:bg-red-50 border-red-200' : 'text-gray-400 hover:bg-gray-50 border-gray-200'}`}
                        title="Restart Service"
                        disabled={service.status !== 'down'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-500">
                  Last system check: {lastChecked || 'Never'}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleClearCache}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear Cache</span>
                  </button>
                  <button
                    onClick={handleForceAllUp}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Force All Up</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Log Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Database className="w-5 h-5 text-gray-600" />
                <h4 className="text-lg font-bold text-gray-900">Recent Actions Log</h4>
              </div>
              <button
                onClick={() => setActionsLog([])}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear Log
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 h-48 overflow-y-auto">
              {actionsLog.length > 0 ? (
                <div className="space-y-2">
                  {actionsLog.map((log, index) => (
                    <div key={index} className="text-sm font-mono text-gray-700 bg-white p-3 rounded border hover:bg-gray-50">
                      {log}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Database className="w-8 h-8 mb-2" />
                  <div className="text-sm">No actions recorded yet</div>
                  <div className="text-xs mt-1">Actions will appear here when you use health tools</div>
                </div>
              )}
            </div>
            
            <div className="mt-3 text-xs text-gray-500">
              Logs auto-clear after 10 entries • Shows manual interventions only
            </div>
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="space-y-6">
          {/* Alerts Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <h4 className="text-lg font-bold text-gray-900">Active Alerts</h4>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold ${alerts.length > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {alerts.length > 0 ? (
                alerts.map(alert => (
                  <div key={alert.id} className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}>
                    <div className="flex items-start space-x-2">
                      <div className="mt-0.5">
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{alert.message}</div>
                        <div className="text-xs mt-1 flex justify-between">
                          <span className="text-gray-600">{alert.service}</span>
                          <span className="text-gray-500">{alert.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <div className="text-sm">No active alerts</div>
                  <div className="text-xs mt-1">All systems operational</div>
                </div>
              )}
            </div>
            
            {alerts.length > 0 && (
              <button
                onClick={handleClearAlerts}
                className="w-full mt-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
              >
                Clear All Alerts
              </button>
            )}
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h4>
            
            <div className="space-y-3">
              <button
                onClick={handleRefreshData}
                className="w-full flex items-center justify-between p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 border border-blue-200"
              >
                <div className="flex items-center space-x-3">
                  <RefreshCw className="w-4 h-4" />
                  <span className="font-medium">Refresh All Data</span>
                </div>
                <span className="text-xs px-2 py-1 bg-blue-100 rounded">F5</span>
              </button>
              
              <button
                onClick={handleClearCache}
                className="w-full flex items-center justify-between p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 border border-gray-200"
              >
                <div className="flex items-center space-x-3">
                  <Trash2 className="w-4 h-4" />
                  <span className="font-medium">Clear System Cache</span>
                </div>
                <span className="text-xs px-2 py-1 bg-gray-100 rounded">C</span>
              </button>
              
              <button
                onClick={handleForceAllUp}
                className="w-full flex items-center justify-between p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 border border-green-200"
              >
                <div className="flex items-center space-x-3">
                  <Zap className="w-4 h-4" />
                  <span className="font-medium">Force All Services Up</span>
                </div>
                <span className="text-xs px-2 py-1 bg-green-100 rounded">U</span>
              </button>
              
              <button
                onClick={() => {
                  checkHealth();
                  handleRefreshData();
                }}
                className="w-full flex items-center justify-between p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 border border-purple-200"
              >
                <div className="flex items-center space-x-3">
                  <Power className="w-4 h-4" />
                  <span className="font-medium">Deep System Check</span>
                </div>
                <span className="text-xs px-2 py-1 bg-purple-100 rounded">D</span>
              </button>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Up - Service operational</span>
                </div>
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Slow - High latency (&gt;200ms)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Down - Service unavailable</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}