// Configuration schema and validation for Veritas CyberHub
// Defines the structure and validation rules for platform configuration

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

export interface Filter {
  id: string;
  name: string;
  type: 'checkbox' | 'radio' | 'range' | 'select' | 'multi-select';
  values: string[];
  categoryId?: string; // If specific to a category, otherwise applies to all
  isRequired: boolean;
  order?: number;
  isActive: boolean;
}

export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  categoryId: string;
  isActive: boolean;
  estimatedDelivery: string; // e.g., "3-5 business days"
  minJobs: number;
  maxJobs: number;
  emailStrategies: ('single' | 'multiple')[]; // Single email for all or multiple emails
  applicationTiming: ('immediate' | 'scheduled')[];
  allowsCustomUrls: boolean;
  maxCustomUrls: number;
  createdAt: string;
  updatedAt: string;
}

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
}

export interface JobStructure {
  fields: Array<{
    name: string;
    type: 'string' | 'number' | 'date' | 'boolean' | 'array';
    required: boolean;
    displayName: string;
    description?: string;
  }>;
  requiredFields: string[];
  displayOrder: string[];
}

export interface ConfigCollection {
  categories: Category[];
  filters: Filter[];
  services: ServicePackage[];
  platform: PlatformConfig;
  jobStructure: JobStructure;
  lastUpdated: string;
  version: string;
}

// Default configuration schema
export const defaultConfig: ConfigCollection = {
  categories: [
    {
      id: 'remote-jobs',
      name: 'Remote Jobs',
      description: 'Fully remote positions from global companies',
      icon: '🌍',
      subcategories: ['Tech', 'Marketing', 'Customer Support', 'Design', 'Writing', 'Sales', 'Project Management'],
      order: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'hybrid-jobs',
      name: 'Hybrid Jobs',
      description: 'Partially remote positions with office visits',
      icon: '🏢',
      subcategories: ['Local', 'Regional', 'Flexible'],
      order: 2,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'freelance-gigs',
      name: 'Freelance Gigs',
      description: 'Short-term freelance projects and gigs',
      icon: '💼',
      subcategories: ['One-time', 'Ongoing', 'Project-based'],
      order: 3,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  filters: [
    {
      id: 'job-type',
      name: 'Job Type',
      type: 'checkbox',
      values: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'],
      categoryId: 'all',
      isRequired: false,
      order: 1,
      isActive: true
    },
    {
      id: 'experience-level',
      name: 'Experience Level',
      type: 'select',
      values: ['Entry Level', 'Mid Level', 'Senior', 'Executive', 'All Levels'],
      categoryId: 'all',
      isRequired: false,
      order: 2,
      isActive: true
    },
    {
      id: 'salary-range',
      name: 'Salary Range',
      type: 'range',
      values: ['0-1000', '1001-3000', '3001-5000', '5001-10000', '10000+'],
      categoryId: 'all',
      isRequired: false,
      order: 3,
      isActive: true
    },
    {
      id: 'location-type',
      name: 'Location Type',
      type: 'radio',
      values: ['Fully Remote', 'Hybrid', 'On-site'],
      categoryId: 'all',
      isRequired: false,
      order: 4,
      isActive: true
    }
  ],
  services: [
    {
      id: 'bulk-apply-10',
      name: 'Bulk Apply to 10 Jobs',
      description: 'Professional application service for 10 remote job positions',
      price: 2500,
      currency: 'KSh',
      features: [
        '10 targeted job applications',
        'Custom resume tailoring for each job',
        'Professional cover letter writing',
        'Application tracking dashboard',
        'Weekly progress reports',
        'Basic interview preparation'
      ],
      categoryId: 'remote-jobs',
      isActive: true,
      estimatedDelivery: '3-5 business days',
      minJobs: 10,
      maxJobs: 10,
      emailStrategies: ['single', 'multiple'],
      applicationTiming: ['immediate', 'scheduled'],
      allowsCustomUrls: true,
      maxCustomUrls: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'bulk-apply-25',
      name: 'Bulk Apply to 25 Jobs',
      description: 'Comprehensive application service for 25 remote job positions',
      price: 5500,
      currency: 'KSh',
      features: [
        '25 targeted job applications',
        'Custom resume tailoring for each job',
        'Professional cover letter writing',
        'Application tracking dashboard',
        'Daily progress updates',
        'Priority customer support',
        'Advanced interview preparation',
        'LinkedIn profile optimization'
      ],
      categoryId: 'remote-jobs',
      isActive: true,
      estimatedDelivery: '5-7 business days',
      minJobs: 25,
      maxJobs: 25,
      emailStrategies: ['single', 'multiple'],
      applicationTiming: ['immediate', 'scheduled'],
      allowsCustomUrls: true,
      maxCustomUrls: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'custom-package',
      name: 'Custom Application Package',
      description: 'Tailored application service based on your specific needs',
      price: 1000,
      currency: 'KSh',
      features: [
        'Custom number of applications',
        'Flexible email strategy',
        'Scheduled application timing',
        'Mix of board jobs and custom URLs',
        'Personalized application approach'
      ],
      categoryId: 'all',
      isActive: true,
      estimatedDelivery: 'Varies based on requirements',
      minJobs: 5,
      maxJobs: 100,
      emailStrategies: ['single', 'multiple'],
      applicationTiming: ['immediate', 'scheduled'],
      allowsCustomUrls: true,
      maxCustomUrls: 50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  platform: {
    siteName: 'Veritas CyberHub',
    siteDescription: 'Configurable remote work application service platform with bulk application services',
    primaryColor: '#1e3a8a',
    accentColor: '#f97316',
    contactEmail: 'support@veritascyberhub.com',
    contactPhone: '+254712345678',
    whatsappNumber: '+254712345678',
    defaultCurrency: 'KSh',
    timezone: 'Africa/Nairobi',
    maintenanceMode: false,
    allowRegistrations: true,
    requirePhoneVerification: true
  },
  jobStructure: {
    fields: [
      {
        name: 'company',
        type: 'string',
        required: true,
        displayName: 'Company',
        description: 'Name of the hiring company'
      },
      {
        name: 'position',
        type: 'string',
        required: true,
        displayName: 'Position',
        description: 'Job title or position name'
      },
      {
        name: 'location',
        type: 'string',
        required: true,
        displayName: 'Location',
        description: 'Job location (e.g., "Remote", "Nairobi, Kenya")'
      },
      {
        name: 'category',
        type: 'string',
        required: true,
        displayName: 'Category',
        description: 'Job category (e.g., "Tech", "Marketing")'
      },
      {
        name: 'applyLink',
        type: 'string',
        required: true,
        displayName: 'Application Link',
        description: 'URL to apply for the job'
      },
      {
        name: 'postedDate',
        type: 'date',
        required: true,
        displayName: 'Posted Date',
        description: 'Date when the job was posted'
      },
      {
        name: 'status',
        type: 'string',
        required: true,
        displayName: 'Status',
        description: 'Job status (e.g., "active", "closed")'
      },
      {
        name: 'salary',
        type: 'string',
        required: false,
        displayName: 'Salary',
        description: 'Salary range or information'
      },
      {
        name: 'description',
        type: 'string',
        required: false,
        displayName: 'Description',
        description: 'Detailed job description'
      },
      {
        name: 'requirements',
        type: 'array',
        required: false,
        displayName: 'Requirements',
        description: 'List of job requirements'
      },
      {
        name: 'benefits',
        type: 'array',
        required: false,
        displayName: 'Benefits',
        description: 'List of job benefits'
      }
    ],
    requiredFields: ['company', 'position', 'location', 'category', 'applyLink', 'postedDate', 'status'],
    displayOrder: ['company', 'position', 'location', 'category', 'salary', 'postedDate', 'status']
  },
  lastUpdated: new Date().toISOString(),
  version: '2.0.0'
};

// Validation functions
export function validateCategory(category: Partial<Category>): string[] {
  const errors: string[] = [];
  
  if (!category.id || category.id.trim() === '') {
    errors.push('Category ID is required');
  }
  
  if (!category.name || category.name.trim() === '') {
    errors.push('Category name is required');
  }
  
  if (category.price !== undefined && (typeof category.price !== 'number' || category.price < 0)) {
    errors.push('Price must be a positive number');
  }
  
  return errors;
}

export function validateFilter(filter: Partial<Filter>): string[] {
  const errors: string[] = [];
  
  if (!filter.id || filter.id.trim() === '') {
    errors.push('Filter ID is required');
  }
  
  if (!filter.name || filter.name.trim() === '') {
    errors.push('Filter name is required');
  }
  
  const validTypes = ['checkbox', 'radio', 'range', 'select', 'multi-select'];
  if (!filter.type || !validTypes.includes(filter.type)) {
    errors.push(`Filter type must be one of: ${validTypes.join(', ')}`);
  }
  
  if (!filter.values || !Array.isArray(filter.values) || filter.values.length === 0) {
    errors.push('Filter values must be a non-empty array');
  }
  
  return errors;
}

export function validateService(service: Partial<ServicePackage>): string[] {
  const errors: string[] = [];
  
  if (!service.id || service.id.trim() === '') {
    errors.push('Service ID is required');
  }
  
  if (!service.name || service.name.trim() === '') {
    errors.push('Service name is required');
  }
  
  if (!service.description || service.description.trim() === '') {
    errors.push('Service description is required');
  }
  
  if (service.price === undefined || typeof service.price !== 'number' || service.price < 0) {
    errors.push('Service price must be a positive number');
  }
  
  if (!service.currency || service.currency.trim() === '') {
    errors.push('Service currency is required');
  }
  
  if (!service.features || !Array.isArray(service.features) || service.features.length === 0) {
    errors.push('Service features must be a non-empty array');
  }
  
  if (service.minJobs === undefined || service.minJobs < 1) {
    errors.push('Minimum jobs must be at least 1');
  }
  
  if (service.maxJobs === undefined || service.maxJobs < service.minJobs) {
    errors.push('Maximum jobs must be greater than or equal to minimum jobs');
  }
  
  return errors;
}

export function validatePlatformConfig(config: Partial<PlatformConfig>): string[] {
  const errors: string[] = [];
  
  if (!config.siteName || config.siteName.trim() === '') {
    errors.push('Site name is required');
  }
  
  if (!config.contactEmail || config.contactEmail.trim() === '') {
    errors.push('Contact email is required');
  }
  
  if (!config.contactPhone || config.contactPhone.trim() === '') {
    errors.push('Contact phone is required');
  }
  
  if (!config.defaultCurrency || config.defaultCurrency.trim() === '') {
    errors.push('Default currency is required');
  }
  
  return errors;
}

// Helper functions
export function generateId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency === 'KSh' ? 'KES' : currency
  }).format(price);
}

export function getActiveCategories(categories: Category[]): Category[] {
  return categories.filter(category => category.isActive).sort((a, b) => (a.order || 0) - (b.order || 0));
}

export function getActiveServices(services: ServicePackage[]): ServicePackage[] {
  return services.filter(service => service.isActive).sort((a, b) => a.price - b.price);
}

export function getCategoryById(categories: Category[], id: string): Category | undefined {
  return categories.find(category => category.id === id);
}

export function getServiceById(services: ServicePackage[], id: string): ServicePackage | undefined {
  return services.find(service => service.id === id);
}