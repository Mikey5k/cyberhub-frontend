// Configuration API endpoint for Veritas CyberHub
// Provides full no-code admin control over platform settings
// Handles GET, POST, PUT, DELETE operations for config data

import { NextRequest, NextResponse } from 'next/server';

export const runtime = "edge";

// Firestore REST API helper
const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/databases/(default)/documents`;

async function firestoreRequest(endpoint: string, method: string = 'GET', body?: any) {
  const url = `${FIRESTORE_URL}${endpoint}`;
  const apiKey = process.env.FIREBASE_API_KEY;
  
  if (!apiKey) {
    throw new Error("Firebase API key not configured");
  }

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  // Add API key as query parameter
  const finalUrl = `${url}?key=${apiKey}`;
  const response = await fetch(finalUrl, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Firestore API error (${response.status}):`, errorText);
    throw new Error(`Firestore request failed: ${response.status} ${errorText}`);
  }
  
  return await response.json();
}

// Convert Firestore document to plain object
function convertFirestoreDoc(doc: any): any {
  const fields = doc.fields || {};
  const result: any = { id: doc.name.split('/').pop() };
  
  Object.keys(fields).forEach(key => {
    const field = fields[key];
    if (field.stringValue !== undefined) result[key] = field.stringValue;
    else if (field.integerValue !== undefined) result[key] = Number(field.integerValue);
    else if (field.doubleValue !== undefined) result[key] = Number(field.doubleValue);
    else if (field.booleanValue !== undefined) result[key] = field.booleanValue;
    else if (field.timestampValue !== undefined) result[key] = field.timestampValue;
    else if (field.arrayValue?.values) {
      result[key] = field.arrayValue.values.map((val: any) => 
        val.stringValue !== undefined ? val.stringValue : 
        val.integerValue !== undefined ? Number(val.integerValue) : 
        val.doubleValue !== undefined ? Number(val.doubleValue) : 
        val.booleanValue !== undefined ? val.booleanValue :
        val
      );
    }
    else if (field.mapValue?.fields) {
      // Handle nested objects
      const nested: any = {};
      Object.keys(field.mapValue.fields).forEach(nestedKey => {
        const nestedField = field.mapValue.fields[nestedKey];
        if (nestedField.stringValue !== undefined) nested[nestedKey] = nestedField.stringValue;
        else if (nestedField.integerValue !== undefined) nested[nestedKey] = Number(nestedField.integerValue);
        else if (nestedField.doubleValue !== undefined) nested[nestedKey] = Number(nestedField.doubleValue);
        else if (nestedField.booleanValue !== undefined) nested[nestedKey] = nestedField.booleanValue;
        else if (nestedField.arrayValue?.values) {
          nested[nestedKey] = nestedField.arrayValue.values.map((val: any) => 
            val.stringValue !== undefined ? val.stringValue : 
            val.integerValue !== undefined ? Number(val.integerValue) : 
            val
          );
        }
      });
      result[key] = nested;
    }
  });
  
  return result;
}

// Convert object to Firestore fields format
function convertToFirestoreFields(data: any): any {
  const fields: any = {};
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    
    if (value === null || value === undefined) {
      // Skip null/undefined values
      return;
    }
    
    if (typeof value === 'string') {
      fields[key] = { stringValue: value };
    } else if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        fields[key] = { integerValue: value.toString() };
      } else {
        fields[key] = { doubleValue: value };
      }
    } else if (typeof value === 'boolean') {
      fields[key] = { booleanValue: value };
    } else if (Array.isArray(value)) {
      fields[key] = {
        arrayValue: {
          values: value.map(item => {
            if (typeof item === 'string') return { stringValue: item };
            if (typeof item === 'number') {
              if (Number.isInteger(item)) return { integerValue: item.toString() };
              return { doubleValue: item };
            }
            if (typeof item === 'boolean') return { booleanValue: item };
            if (typeof item === 'object' && item !== null) {
              // Handle nested objects in arrays
              return { mapValue: { fields: convertToFirestoreFields(item) } };
            }
            return { stringValue: String(item) };
          })
        }
      };
    } else if (typeof value === 'object' && value !== null) {
      if (value instanceof Date) {
        fields[key] = { timestampValue: value.toISOString() };
      } else {
        // Convert nested object
        fields[key] = { mapValue: { fields: convertToFirestoreFields(value) } };
      }
    }
  });
  
  return fields;
}

// Default configuration
const defaultConfig = {
  categories: [
    {
      id: 'remote-jobs',
      name: 'Remote Jobs',
      description: 'Fully remote positions from global companies',
      icon: '🌍',
      subcategories: ['Tech', 'Marketing', 'Customer Support', 'Design', 'Writing'],
      isActive: true,
      order: 1
    },
    {
      id: 'hybrid-jobs',
      name: 'Hybrid Jobs',
      description: 'Partially remote positions with office visits',
      icon: '🏢',
      subcategories: ['Local', 'Regional', 'Flexible'],
      isActive: true,
      order: 2
    }
  ],
  filters: [
    {
      id: 'job-type',
      name: 'Job Type',
      type: 'checkbox',
      values: ['Full-time', 'Part-time', 'Contract', 'Freelance'],
      categoryId: 'all',
      isRequired: false,
      order: 1
    },
    {
      id: 'experience-level',
      name: 'Experience Level',
      type: 'select',
      values: ['Entry Level', 'Mid Level', 'Senior', 'Executive'],
      categoryId: 'all',
      isRequired: false,
      order: 2
    },
    {
      id: 'salary-range',
      name: 'Salary Range',
      type: 'range',
      values: ['0-1000', '1001-3000', '3001-5000', '5000+'],
      categoryId: 'all',
      isRequired: false,
      order: 3
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
      isActive: true
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
      isActive: true
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

// GET configuration
export async function GET(request: NextRequest) {
  try {
    console.log('Config API: GET request received');
    
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    
    // Try to fetch config from Firestore
    try {
      const response = await firestoreRequest('/config/platform');
      
      if (response && response.fields) {
        const configData = convertFirestoreDoc(response);
        
        if (section && configData[section]) {
          // Return specific section
          return NextResponse.json({
            success: true,
            data: { [section]: configData[section] },
            message: `Retrieved ${section} configuration`
          });
        }
        
        // Return full config
        return NextResponse.json({
          success: true,
          data: configData,
          message: 'Configuration retrieved successfully'
        });
      }
    } catch (error) {
      console.log('No config found in Firestore, using default');
    }
    
    // Return default config if none exists
    return NextResponse.json({
      success: true,
      data: section ? { [section]: defaultConfig[section as keyof typeof defaultConfig] } : defaultConfig,
      message: 'Using default configuration'
    });
    
  } catch (error) {
    console.error('Error fetching configuration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch configuration' },
      { status: 500 }
    );
  }
}

// POST configuration (update section)
export async function POST(request: NextRequest) {
  try {
    console.log('Config API: POST request received');
    
    // Simple admin check (in production, use proper auth)
    const userRole = request.headers.get('x-user-role') || 'admin';
    if (userRole !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
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
    
    // Get current config or use default
    let currentConfig;
    try {
      const response = await firestoreRequest('/config/platform');
      if (response && response.fields) {
        currentConfig = convertFirestoreDoc(response);
      } else {
        currentConfig = { ...defaultConfig };
      }
    } catch (error) {
      currentConfig = { ...defaultConfig };
    }
    
    // Update the specific section
    currentConfig[section] = data;
    currentConfig.lastUpdated = new Date().toISOString();
    
    // Save to Firestore
    const configData = {
      fields: convertToFirestoreFields(currentConfig)
    };
    
    await firestoreRequest('/config/platform', 'PATCH', configData);
    
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

// PUT configuration (update specific item)
export async function PUT(request: NextRequest) {
  try {
    console.log('Config API: PUT request received');
    
    // Simple admin check
    const userRole = request.headers.get('x-user-role') || 'admin';
    if (userRole !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
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
    
    // Get current config
    let currentConfig;
    try {
      const response = await firestoreRequest('/config/platform');
      if (response && response.fields) {
        currentConfig = convertFirestoreDoc(response);
      } else {
        currentConfig = { ...defaultConfig };
      }
    } catch (error) {
      currentConfig = { ...defaultConfig };
    }
    
    const sectionData = currentConfig[section];
    
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
    currentConfig[section] = sectionData;
    currentConfig.lastUpdated = new Date().toISOString();
    
    // Save to Firestore
    const configData = {
      fields: convertToFirestoreFields(currentConfig)
    };
    
    await firestoreRequest('/config/platform', 'PATCH', configData);
    
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

// DELETE configuration item
export async function DELETE(request: NextRequest) {
  try {
    console.log('Config API: DELETE request received');
    
    // Simple admin check
    const userRole = request.headers.get('x-user-role') || 'admin';
    if (userRole !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
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
    
    // Get current config
    let currentConfig;
    try {
      const response = await firestoreRequest('/config/platform');
      if (response && response.fields) {
        currentConfig = convertFirestoreDoc(response);
      } else {
        currentConfig = { ...defaultConfig };
      }
    } catch (error) {
      currentConfig = { ...defaultConfig };
    }
    
    const sectionData = currentConfig[section];
    
    if (!Array.isArray(sectionData)) {
      return NextResponse.json(
        { success: false, error: 'Section is not an array' },
        { status: 400 }
      );
    }
    
    // Filter out the item to delete
    const updatedSectionData = sectionData.filter((item: any) => item.id !== itemId);
    currentConfig[section] = updatedSectionData;
    currentConfig.lastUpdated = new Date().toISOString();
    
    // Save to Firestore
    const configData = {
      fields: convertToFirestoreFields(currentConfig)
    };
    
    await firestoreRequest('/config/platform', 'PATCH', configData);
    
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