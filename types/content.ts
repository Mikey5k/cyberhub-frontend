// TypeScript type definitions for Veritas CyberHub
// Defines the data structures used throughout the platform

// User types
export interface User {
  id: string;
  phone: string;
  email?: string;
  name?: string;
  role: 'user' | 'agent' | 'admin';
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
  isActive: boolean;
  preferences?: {
    emailNotifications: boolean;
    whatsappNotifications: boolean;
    language: string;
  };
  subscription?: {
    plan: string;
    expiresAt: string;
    isActive: boolean;
  };
}

// Job types - Updated structure for Available Positions board
export interface Job {
  id: string;
  company: string;
  position: string;
  location: string;
  category: string;
  subcategory?: string;
  applyLink: string;
  postedDate: string;
  status: 'active' | 'closed' | 'pending' | 'expired';
  
  // Optional fields for enhanced job listings
  salary?: string;
  description?: string;
  requirements?: string[];
  benefits?: string[];
  tags?: string[];
  
  // Job metadata
  source?: 'board' | 'custom';
  verified: boolean;
  lastVerified?: string;
  views: number;
  applies: number;
  
  // System fields
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// Task types for Bulk Application Service
export interface Task {
  id: string;
  userId: string;
  serviceId: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'cancelled';
  
  // Job selection
  jobs: Array<{
    jobId?: string; // For jobs from Available Positions board
    customUrl?: string; // For custom job URLs
    company?: string;
    position?: string;
    status: 'pending' | 'applied' | 'failed';
    appliedAt?: string;
    notes?: string;
  }>;
  
  // User specifications
  emailStrategy: 'single' | 'multiple';
  emails?: string | string[]; // Single email or array of emails
  applicationTiming: 'immediate' | 'scheduled';
  scheduledTime?: string;
  
  // User information for applications
  userInfo: {
    name: string;
    email: string;
    phone?: string;
    resumeUrl?: string;
    coverLetter?: string;
    additionalInfo?: Record<string, any>;
  };
  
  // Agent assignment
  assignedAgentId?: string;
  assignedAt?: string;
  startedAt?: string;
  completedAt?: string;
  
  // Pricing and payment
  packageDetails: {
    serviceName: string;
    price: number;
    currency: string;
    numberOfJobs: number;
    estimatedDelivery: string;
  };
  
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  paymentId?: string;
  
  // System fields
  createdAt: string;
  updatedAt: string;
}

// Service types
export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  categoryId: string;
  isActive: boolean;
  
  // Package details
  packageDetails: {
    minJobs: number;
    maxJobs: number;
    deliveryTime: string;
    includedServices: string[];
  };
  
  // Configuration options
  config: {
    emailStrategies: ('single' | 'multiple')[];
    applicationTiming: ('immediate' | 'scheduled')[];
    allowsCustomUrls: boolean;
    maxCustomUrls: number;
    requiresResume: boolean;
    requiresCoverLetter: boolean;
  };
  
  // System fields
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// Category types
export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  subcategories?: string[];
  order?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Filter types
export interface Filter {
  id: string;
  name: string;
  type: 'checkbox' | 'radio' | 'range' | 'select' | 'multi-select';
  values: string[];
  categoryId?: string;
  isRequired: boolean;
  order?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Platform configuration types
export interface PlatformConfig {
  siteName: string;
  siteDescription: string;
  primaryColor: string;
  accentColor: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  defaultCurrency: string;
  timezone: string;
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  requirePhoneVerification: boolean;
  createdAt: string;
  updatedAt: string;
}

// Payment types
export interface Payment {
  id: string;
  userId: string;
  taskId?: string;
  serviceId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'mpesa' | 'card' | 'bank' | 'other';
  paymentDetails?: Record<string, any>;
  mpesaCode?: string;
  receiptUrl?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Agent performance types
export interface AgentPerformance {
  agentId: string;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  failedTasks: number;
  averageCompletionTime: number; // in hours
  rating: number;
  lastActive: string;
  createdAt: string;
  updatedAt: string;
}

// Analytics types
export interface Analytics {
  date: string;
  totalUsers: number;
  activeUsers: number;
  totalJobs: number;
  activeJobs: number;
  totalTasks: number;
  completedTasks: number;
  revenue: number;
  conversionRate: number;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: 'task_update' | 'payment' | 'system' | 'promotional';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

// WhatsApp chat types
export interface WhatsAppChat {
  id: string;
  userId: string;
  agentId?: string;
  phoneNumber: string;
  status: 'active' | 'closed' | 'pending';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

// Message types for WhatsApp chat
export interface WhatsAppMessage {
  id: string;
  chatId: string;
  sender: 'user' | 'agent' | 'system';
  message: string;
  timestamp: string;
  read: boolean;
  delivered: boolean;
  mediaUrl?: string;
}

// CSV Import types
export interface CSVImport {
  id: string;
  filename: string;
  fileUrl: string;
  type: 'jobs' | 'users' | 'services' | 'categories';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  recordsProcessed: number;
  recordsFailed: number;
  errors?: string[];
  importedBy: string;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Filter query types for job search
export interface JobFilterQuery {
  category?: string;
  subcategory?: string;
  location?: string;
  jobType?: string[];
  experienceLevel?: string;
  salaryRange?: string;
  searchTerm?: string;
  status?: 'active' | 'closed' | 'pending';
  verified?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'postedDate' | 'company' | 'position' | 'salary';
  sortOrder?: 'asc' | 'desc';
}

// User preferences for job board
export interface UserJobPreferences {
  preferredCategories: string[];
  preferredLocations: string[];
  salaryExpectation?: string;
  jobType: string[];
  experienceLevel?: string;
  notificationFrequency: 'daily' | 'weekly' | 'none';
}

// Bulk application form data
export interface BulkApplicationFormData {
  serviceId: string;
  selectedJobs: Array<{
    jobId?: string;
    customUrl?: string;
    company?: string;
    position?: string;
  }>;
  emailStrategy: 'single' | 'multiple';
  emails: string | string[];
  applicationTiming: 'immediate' | 'scheduled';
  scheduledTime?: string;
  userInfo: {
    name: string;
    email: string;
    phone?: string;
    resumeUrl?: string;
    coverLetter?: string;
    additionalInfo?: Record<string, any>;
  };
  paymentMethod: 'mpesa' | 'card' | 'bank';
  agreeToTerms: boolean;
}

// Admin configuration update
export interface AdminConfigUpdate {
  section: 'categories' | 'filters' | 'services' | 'platform';
  data: any;
  action?: 'create' | 'update' | 'delete';
  itemId?: string;
}