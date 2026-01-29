import { NextResponse } from 'next/server';

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const API_KEY = process.env.FIREBASE_API_KEY;

async function firestoreFetch(endpoint: string, method: string = 'GET', data?: any) {
  if (!PROJECT_ID || !API_KEY) {
    throw new Error('Firebase configuration missing');
  }

  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents${endpoint}?key=${API_KEY}`;

  const options: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };

  if (data && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Firestore error (${response.status}):`, errorText);
    throw new Error(`Firestore error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

function transformDocument(doc: any) {
  if (!doc || !doc.fields) return null;
  const docId = doc.name.split('/').pop();
  const fields = doc.fields;
  const result: any = { id: docId };

  Object.keys(fields).forEach(key => {
    const field = fields[key];
    if (field.stringValue !== undefined) result[key] = field.stringValue;
    else if (field.integerValue !== undefined) result[key] = parseInt(field.integerValue, 10);
    else if (field.doubleValue !== undefined) result[key] = parseFloat(field.doubleValue);
    else if (field.booleanValue !== undefined) result[key] = field.booleanValue;
    else if (field.arrayValue?.values) {
      result[key] = field.arrayValue.values.map((item: any) => item.stringValue ?? item);
    }
    else if (field.timestampValue !== undefined) result[key] = field.timestampValue;
    else if (field.mapValue?.fields) result[key] = transformDocument({ fields: field.mapValue.fields });
  });

  return result;
}

export async function GET(request: Request) {
  try {
    // Check if Firebase env vars are available
    if (!PROJECT_ID || !API_KEY) {
      console.error('FIREBASE_PROJECT_ID:', PROJECT_ID ? 'Set' : 'Missing');
      console.error('FIREBASE_API_KEY:', API_KEY ? 'Set (first 10 chars):' + API_KEY.substring(0, 10) + '...' : 'Missing');
      
      return NextResponse.json({
        success: false,
        error: 'Firebase configuration missing',
        data: [],
        count: 0,
        totalCount: 0,
        message: 'Server configuration error'
      }, { status: 500 });
    }
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // If type filter is specified, use structured query
    if (type) {
      const structuredQuery = {
        where: {
          fieldFilter: {
            field: { fieldPath: 'type' },
            op: 'EQUAL',
            value: { stringValue: type }
          }
        },
        from: [{ collectionId: 'content' }]
      };
      
      const response = await firestoreFetch(':runQuery', 'POST', { structuredQuery });
      
      // Extract documents from runQuery response (can be multiple or empty)
      const documents = Array.isArray(response) ? response : [response];
      const data = documents
        .filter((item: any) => item.document) // Filter out null/undefined
        .map((item: any) => transformDocument(item.document))
        .filter(Boolean);

      return NextResponse.json({
        success: true,
        message: 'Content retrieved',
        data,
        count: data.length,
        totalCount: data.length
      });
    }
    
    // If no type filter, get all documents
    const result = await firestoreFetch('/content');
    const data = result.documents?.map(transformDocument).filter(Boolean) || [];

    return NextResponse.json({
      success: true,
      message: 'Content retrieved',
      data,
      count: data.length,
      totalCount: data.length
    });
  } catch (error: any) {
    console.error('Jobs GET error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      message: 'Failed to fetch content',
      data: [],
      count: 0,
      totalCount: 0
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const docId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    const data = {
      fields: {
        id: { stringValue: docId },
        title: { stringValue: body.title || '' },
        description: { stringValue: body.description || '' },
        type: { stringValue: body.type || 'job' },
        category: { stringValue: body.category || '' },
        postedDate: { stringValue: new Date().toISOString().split('T')[0] },
        status: { stringValue: 'active' },
        ...(body.location && { location: { stringValue: body.location } }),
        ...(body.institution && { institution: { stringValue: body.institution } }),
        ...(body.amount && { amount: { integerValue: body.amount.toString() } }),
      }
    };

    await firestoreFetch('/content/' + docId, 'PATCH', data);

    return NextResponse.json({ success: true, data: { id: docId, ...body } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ success: false, error: 'Expected array for bulk upload' }, { status: 400 });
    }

    const added = [];
    for (const item of body) {
      const docId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const data = {
        fields: {
          id: { stringValue: docId },
          title: { stringValue: item.title || '' },
          description: { stringValue: item.description || '' },
          type: { stringValue: item.type || 'job' },
          category: { stringValue: item.category || '' },
          postedDate: { stringValue: item.postedDate || new Date().toISOString().split('T')[0] },
          status: { stringValue: 'active' },
          ...(item.location && { location: { stringValue: item.location } }),
          ...(item.institution && { institution: { stringValue: item.institution } }),
          ...(item.amount && { amount: { integerValue: item.amount.toString() } }),
        }
      };
      await firestoreFetch('/content/' + docId, 'PATCH', data);
      added.push({ id: docId, ...item });
    }

    return NextResponse.json({ success: true, data: added, count: added.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
    }
    await firestoreFetch('/content/' + id, 'DELETE');
    return NextResponse.json({ success: true, message: 'Deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}