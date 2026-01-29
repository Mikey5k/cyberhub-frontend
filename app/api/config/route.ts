// Configuration API endpoint for Veritas CyberHub
// Provides full no-code admin control over platform settings
// Handles GET, POST, PUT, DELETE operations for config data

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/src/lib/firebase-admin';

// Define config structure types
type Category = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  subcategories?: string[];
};

type Filter = {
  id: string;
  name: string;
  type: 'checkbox' | 'radio' | 'range' | 'select';
  values: string[];
  categoryId?: string;
};

type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  categoryId: string;
  isActive: boolean;
  packageDetails: {
    minJobs: number;
    maxJobs: number;
    deliveryTime: string;
    includedServices: string[];
  };
};

type PlatformConfig = {
  siteName: string;
  siteDescription: string;
  primaryColor: string;
  accentColor: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
};

type ConfigCollection = {
  categories: Category[];
  filters: Filter[];
  services: Service[];
  platform: PlatformConfig;
  lastUpdated: string;
};

// Default configuration
const defaultConfig: ConfigCollection = {
  categories: [
    {
      id: 'remote-jobs',
      name: 'Remote Jobs',
      description: 'Fully remote positions from global companies',
      icon: '🌍',
      subcategories: ['Tech', 'Marketing', 'Customer Support', 'Design', 'Writing']
    },
    {
      id: 'hybrid-jobs',
      name: 'Hybrid Jobs',
      description: 'Partially remote positions with office visits',
      icon: '🏢',
      subcategories: ['Local', 'Regional', 'Flexible']
    }
  ],
  filters: [
    {
      id: 'job-type',
      name: 'Job Type',
      type: 'checkbox',
      values: ['Full-time', 'Part-time', 'Contract', 'Freelance'],
      categoryId: 'all'
    },
    {
      id: 'experience-level',
      name: 'Experience Level',
      type: 'select',
      values: ['Entry Level', 'Mid Level', 'Senior', 'Executive'],
      categoryId: 'all'
    },
    {
      id: 'salary-range',
      name: 'Salary Range',
      type: 'range',
      values: ['0-1000', '1001-3000', '3001-5000', '5000+'],
      categoryId: 'all'
    }
  ],
  services: [
    {
      id: 'bulk-apply-10',
      name: 'Bulk Apply to 10 Jobs',
      description: 'We apply to 10 remote jobs on your behalf',
      price: 2500,
      currency: 'KSh',
      features: [
        '10 job applications',
        'Custom resume tailoring',
        'Cover letter writing',
        'Application tracking',
        'Weekly progress reports'
      ],
      categoryId: 'remote-jobs',
      isActive: true,
      packageDetails: {
        minJobs: 10,
        maxJobs: 10,
        deliveryTime: '3-5 business days',
        includedServices: ['resume-review', 'cover-letter', 'follow-up']
      }
    },
    {
      id: 'bulk-apply-25',
      name: 'Bulk Apply to 25 Jobs',
      description: 'We apply to 25 remote jobs on your behalf',
      price: 5500,
      currency: 'KSh',
      features: [
        '25 job applications',
        'Custom resume tailoring',
        'Cover letter writing',
        'Application tracking',
        'Priority support',
        'Interview preparation'
      ],
      categoryId: 'remote-jobs',
      isActive: true,
      packageDetails: {
        minJobs: 25,
        maxJobs: 25,
        deliveryTime: '5-7 business days',
        includedServices: ['resume-review', 'cover-letter', 'follow-up', 'interview-prep']
      }
    }
  ],
  platform: {
    siteName: 'Veritas CyberHub',
    siteDescription: 'Configurable remote work application service platform',
    primaryColor: '#1e3a8a',
    accentColor: '#f97316',
    contactEmail: 'support@veritascyberhub.com',
    contactPhone: '+254712345678',
    whatsappNumber: '+254712345678'
  },
  lastUpdated: new Date().toISOString()
};

export async function GET(request: NextRequest) {
  try {
    // Check for specific config section
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    
    const configRef = adminDb.collection('config').doc('platform');
    const configDoc = await configRef.get();
    
    if (!configDoc.exists) {
      // Return default config if none exists
      return NextResponse.json({
        success: true,
        data: section ? { [section]: defaultConfig[section as keyof ConfigCollection] } : defaultConfig,
        message: 'Using default configuration'
      });
    }
    
    const configData = configDoc.data() as ConfigCollection;
    
    if (section && section in configData) {
      // Return specific section
      return NextResponse.json({
        success: true,
        data: { [section]: configData[section as keyof ConfigCollection] },
        message: `Retrieved ${section} configuration`
      });
    }
    
    // Return full config
    return NextResponse.json({
      success: true,
      data: configData,
      message: 'Configuration retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching configuration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch configuration' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { section, data } = body;
    
    if (!section || !data) {
      return NextResponse.json(
        { success: false, error: 'Missing section or data' },
        { status: 400 }
      );
    }
    
    const validSections = ['categories', 'filters', 'services', 'platform'];
    if (!validSections.includes(section)) {
      return NextResponse.json(
        { success: false, error: 'Invalid section' },
        { status: 400 }
      );
    }
    
    const configRef = adminDb.collection('config').doc('platform');
    const configDoc = await configRef.get();
    
    let currentConfig: ConfigCollection;
    
    if (configDoc.exists) {
      currentConfig = configDoc.data() as ConfigCollection;
    } else {
      currentConfig = defaultConfig;
    }
    
    // Update the specific section
    currentConfig[section as keyof ConfigCollection] = data;
    currentConfig.lastUpdated = new Date().toISOString();
    
    // Save to Firestore
    await configRef.set(currentConfig, { merge: true });
    
    return NextResponse.json({
      success: true,
      data: { [section]: data },
      message: `Updated ${section} configuration`
    });
    
  } catch (error) {
    console.error('Error updating configuration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update configuration' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { section, itemId, updates } = body;
    
    if (!section || !itemId || !updates) {
      return NextResponse.json(
        { success: false, error: 'Missing section, itemId, or updates' },
        { status: 400 }
      );
    }
    
    const configRef = adminDb.collection('config').doc('platform');
    const configDoc = await configRef.get();
    
    if (!configDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Configuration not found' },
        { status: 404 }
      );
    }
    
    const currentConfig = configDoc.data() as ConfigCollection;
    const sectionData = currentConfig[section as keyof ConfigCollection];
    
    if (!Array.isArray(sectionData)) {
      return NextResponse.json(
        { success: false, error: 'Section is not an array' },
        { status: 400 }
      );
    }
    
    // Find and update the item
    const itemIndex = sectionData.findIndex((item: any) => item.id === itemId);
    if (itemIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }
    
    // Update the item
    sectionData[itemIndex] = { ...sectionData[itemIndex], ...updates };
    currentConfig[section as keyof ConfigCollection] = sectionData;
    currentConfig.lastUpdated = new Date().toISOString();
    
    // Save to Firestore
    await configRef.set(currentConfig, { merge: true });
    
    return NextResponse.json({
      success: true,
      data: sectionData[itemIndex],
      message: `Updated ${itemId} in ${section}`
    });
    
  } catch (error) {
    console.error('Error updating configuration item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update configuration item' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { section, itemId } = body;
    
    if (!section || !itemId) {
      return NextResponse.json(
        { success: false, error: 'Missing section or itemId' },
        { status: 400 }
      );
    }
    
    const configRef = adminDb.collection('config').doc('platform');
    const configDoc = await configRef.get();
    
    if (!configDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Configuration not found' },
        { status: 404 }
      );
    }
    
    const currentConfig = configDoc.data() as ConfigCollection;
    const sectionData = currentConfig[section as keyof ConfigCollection];
    
    if (!Array.isArray(sectionData)) {
      return NextResponse.json(
        { success: false, error: 'Section is not an array' },
        { status: 400 }
      );
    }
    
    // Filter out the item to delete
    const updatedSectionData = sectionData.filter((item: any) => item.id !== itemId);
    currentConfig[section as keyof ConfigCollection] = updatedSectionData;
    currentConfig.lastUpdated = new Date().toISOString();
    
    // Save to Firestore
    await configRef.set(currentConfig, { merge: true });
    
    return NextResponse.json({
      success: true,
      message: `Deleted ${itemId} from ${section}`
    });
    
  } catch (error) {
    console.error('Error deleting configuration item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete configuration item' },
      { status: 500 }
    );
  }
}