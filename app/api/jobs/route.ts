import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';

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
            return { stringValue: String(item) };
          })
        }
      };
    } else if (typeof value === 'object' && value !== null) {
      if (value instanceof Date) {
        fields[key] = { timestampValue: value.toISOString() };
      } else {
        // Convert nested object
        const nestedFields: any = {};
        Object.keys(value).forEach(nestedKey => {
          const nestedValue = value[nestedKey];
          if (typeof nestedValue === 'string') {
            nestedFields[nestedKey] = { stringValue: nestedValue };
          } else if (typeof nestedValue === 'number') {
            nestedFields[nestedKey] = { integerValue: nestedValue.toString() };
          }
        });
        fields[key] = { mapValue: { fields: nestedFields } };
      }
    }
  });
  
  return fields;
}

// GET all jobs or filter by parameters
export async function GET(request: NextRequest) {
  try {
    console.log('Jobs API: GET request received');
    const searchParams = request.nextUrl.searchParams;
    const contentType = searchParams.get('contentType') || 'job';
    const status = searchParams.get('status');
    const approved = searchParams.get('approved');
    const phone = searchParams.get('phone');
    const role = searchParams.get('role');
    
    console.log('Query params:', {
      contentType,
      status,
      approved,
      phone,
      role
    });

    // Get all jobs from Firestore
    const response = await firestoreRequest('/jobs');
    let jobs: any[] = [];

    if (response && response.documents) {
      jobs = response.documents.map(convertFirestoreDoc);
      
      // Apply filters in memory (since Firestore REST doesn't support complex queries easily)
      if (contentType && contentType !== 'all') {
        jobs = jobs.filter(job => job.contentType === contentType);
      }
      
      if (status) {
        jobs = jobs.filter(job => job.status === status);
      }
      
      if (approved) {
        jobs = jobs.filter(job => job.approved === (approved === 'true'));
      }
      
      // For user: show only approved
      if (role === 'user' || (!role && !phone)) {
        jobs = jobs.filter(job => job.approved === true);
      }
    }

    console.log(`Found ${jobs.length} jobs with contentType: ${contentType}`);

    return NextResponse.json({
      success: true,
      data: jobs,
      count: jobs.length
    });

  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch jobs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST new job or bulk upload via CSV
export async function POST(request: NextRequest) {
  try {
    console.log('Jobs API: POST request received');
    
    const contentType = request.headers.get('content-type') || '';
    const userRole = request.headers.get('x-user-role') || 'admin';
    
    console.log('Content-Type:', contentType);
    console.log('User Role:', userRole);

    // Handle CSV upload
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('csvFile') as File;
      const csvContentType = formData.get('contentType') as string;
      const uploadedBy = formData.get('uploadedBy') as string || 'Admin';
      
      if (!file) {
        return NextResponse.json(
          { success: false, error: 'No file uploaded' },
          { status: 400 }
        );
      }

      if (!csvContentType) {
        return NextResponse.json(
          { success: false, error: 'Content type is required' },
          { status: 400 }
        );
      }

      // Read and parse CSV file
      const csvText = await file.text();
      const parsed = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true
      });

      if (parsed.errors.length > 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'CSV parsing error',
            details: parsed.errors 
          },
          { status: 400 }
        );
      }

      const jobs = parsed.data.map((row: any, index: number) => {
        // Convert CSV row to job object
        const job: any = {};
        
        // Map CSV columns to job fields
        Object.keys(row).forEach(key => {
          const value = row[key];
          if (value !== undefined && value !== '') {
            // Try to parse numbers
            if (!isNaN(Number(value)) && value.trim() !== '') {
              job[key] = Number(value);
            } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
              job[key] = value.toLowerCase() === 'true';
            } else if (value.includes(',') && !value.includes('"')) {
              // Handle comma-separated lists
              job[key] = value.split(',').map((item: string) => item.trim());
            } else {
              job[key] = value;
            }
          }
        });
        
        // Add metadata
        job.contentType = csvContentType;
        job.approved = userRole === 'admin'; // Auto-approve if uploaded by admin
        job.uploadedBy = uploadedBy;
        job.uploadedAt = new Date().toISOString();
        job.createdAt = new Date().toISOString();
        job.updatedAt = new Date().toISOString();
        job.status = 'active';
        
        return job;
      });

      // Create jobs in Firestore one by one (batch not available in REST API)
      const createdJobs = [];
      for (const job of jobs) {
        const jobId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const jobData = {
          fields: convertToFirestoreFields(job)
        };
        
        await firestoreRequest(`/jobs/${jobId}`, 'PATCH', jobData);
        createdJobs.push({ id: jobId, ...job });
      }
      
      console.log(`Bulk upload: Created ${createdJobs.length} ${csvContentType} entries`);

      return NextResponse.json({
        success: true,
        message: `Successfully uploaded ${createdJobs.length} ${csvContentType}`,
        count: createdJobs.length,
        contentType: csvContentType,
        data: createdJobs
      });

    } else {
      // Handle single job creation
      const body = await request.json();
      console.log('Creating single job:', body);

      const { 
        title, 
        description, 
        company, 
        location, 
        salary, 
        requirements, 
        deadline,
        category,
        contentType = 'job',
        postedBy,
        contactPhone,
        contactEmail
      } = body;

      if (!title || !description || !company) {
        return NextResponse.json(
          { success: false, error: 'Title, description, and company are required' },
          { status: 400 }
        );
      }

      const jobData = {
        title,
        description,
        company,
        location: location || 'Nairobi',
        salary: salary || 'Negotiable',
        requirements: Array.isArray(requirements) ? requirements : [requirements].filter(Boolean),
        deadline: deadline || null,
        category: category || 'general',
        contentType: contentType || 'job',
        approved: userRole === 'admin', // Auto-approve for admin
        postedBy: postedBy || 'Admin',
        contactPhone: contactPhone || null,
        contactEmail: contactEmail || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active'
      };

      const jobId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const firestoreData = {
        fields: convertToFirestoreFields(jobData)
      };
      
      await firestoreRequest(`/jobs/${jobId}`, 'PATCH', firestoreData);
      
      console.log('Created job with ID:', jobId);

      return NextResponse.json({
        success: true,
        message: 'Job created successfully',
        jobId: jobId,
        data: jobData
      }, { status: 201 });
    }

  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create job',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT update existing job
export async function PUT(request: NextRequest) {
  try {
    console.log('Jobs API: PUT request received');
    
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log('Updating job:', id, 'with data:', body);

    // Check if job exists
    try {
      await firestoreRequest(`/jobs/${id}`);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    // Update job with new data
    const updateData = {
      ...body,
      updatedAt: new Date().toISOString()
    };

    const firestoreData = {
      fields: convertToFirestoreFields(updateData)
    };

    await firestoreRequest(`/jobs/${id}`, 'PATCH', firestoreData);

    console.log('Updated job:', id);

    return NextResponse.json({
      success: true,
      message: 'Job updated successfully',
      jobId: id
    });

  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update job',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE job
export async function DELETE(request: NextRequest) {
  try {
    console.log('Jobs API: DELETE request received');
    
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Check if job exists
    try {
      await firestoreRequest(`/jobs/${id}`);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    // Delete the job
    await firestoreRequest(`/jobs/${id}`, 'DELETE');

    console.log('Deleted job:', id);

    return NextResponse.json({
      success: true,
      message: 'Job deleted successfully',
      jobId: id
    });

  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete job',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PATCH for partial updates (like approval)
export async function PATCH(request: NextRequest) {
  try {
    console.log('Jobs API: PATCH request received');
    
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const action = searchParams.get('action');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Check if job exists
    try {
      await firestoreRequest(`/jobs/${id}`);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    let updateData: any = {
      updatedAt: new Date().toISOString()
    };

    // Handle different actions
    if (action === 'approve') {
      updateData.approved = true;
      updateData.approvedAt = new Date().toISOString();
      console.log('Approving job:', id);
    } else if (action === 'reject') {
      updateData.approved = false;
      console.log('Rejecting job:', id);
    } else if (action === 'archive') {
      updateData.status = 'archived';
      console.log('Archiving job:', id);
    } else if (action === 'activate') {
      updateData.status = 'active';
      console.log('Activating job:', id);
    } else {
      // Regular PATCH with body data
      const body = await request.json();
      updateData = { ...body, updatedAt: new Date().toISOString() };
      console.log('Patching job:', id, 'with data:', body);
    }

    const firestoreData = {
      fields: convertToFirestoreFields(updateData)
    };

    await firestoreRequest(`/jobs/${id}`, 'PATCH', firestoreData);

    console.log('Patched job:', id, 'action:', action || 'custom');

    return NextResponse.json({
      success: true,
      message: `Job ${action || 'updated'} successfully`,
      jobId: id,
      action: action || 'update'
    });

  } catch (error) {
    console.error('Error patching job:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to patch job',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}