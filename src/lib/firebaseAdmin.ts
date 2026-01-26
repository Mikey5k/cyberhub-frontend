// Firestore REST API wrapper (replaces Firebase Admin SDK)
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const API_KEY = process.env.FIREBASE_API_KEY;

// Helper function to call Firestore REST API
async function firestoreFetch(endpoint: string, method: string = 'GET', data?: any) {
  if (!PROJECT_ID || !API_KEY) {
    throw new Error('Missing Firebase environment variables');
  }
  
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents${endpoint}?key=${API_KEY}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Firestore REST error (${response.status}):`, errorText);
    throw new Error(`Firestore error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

// Transform Firestore document to object
function transformDocument(doc: any) {
  if (!doc || !doc.fields) return null;
  
  const docId = doc.name.split('/').pop();
  const fields = doc.fields;
  const result: any = { id: docId };
  
  Object.keys(fields).forEach(key => {
    const field = fields[key];
    if (field.stringValue !== undefined) {
      result[key] = field.stringValue;
    } else if (field.integerValue !== undefined) {
      result[key] = parseInt(field.integerValue, 10);
    } else if (field.doubleValue !== undefined) {
      result[key] = parseFloat(field.doubleValue);
    } else if (field.booleanValue !== undefined) {
      result[key] = field.booleanValue;
    } else if (field.arrayValue?.values) {
      result[key] = field.arrayValue.values.map((item: any) => {
        if (item.stringValue !== undefined) return item.stringValue;
        return item;
      });
    } else if (field.timestampValue !== undefined) {
      result[key] = field.timestampValue;
    } else if (field.mapValue?.fields) {
      result[key] = transformDocument({ fields: field.mapValue.fields });
    }
  });
  
  return result;
}

// Mock db object that mimics Firebase Admin SDK interface but uses REST API
const db = {
  collection: (collectionName: string) => {
    return {
      // Document reference
      doc: (docId: string) => ({
        get: async () => {
          try {
            const endpoint = `/${collectionName}/${docId}`;
            const result = await firestoreFetch(endpoint, 'GET');
            return {
              exists: result && result.fields ? true : false,
              data: () => transformDocument(result),
              id: docId
            };
          } catch (error: any) {
            if (error.message.includes('404')) {
              return { exists: false, data: () => null, id: docId };
            }
            throw error;
          }
        },
        set: async (data: any) => {
          const endpoint = `/${collectionName}/${docId}`;
          const firestoreData = {
            fields: Object.keys(data).reduce((acc: any, key) => {
              const value = data[key];
              if (typeof value === 'string') {
                acc[key] = { stringValue: value };
              } else if (typeof value === 'number') {
                acc[key] = { integerValue: value.toString() };
              } else if (typeof value === 'boolean') {
                acc[key] = { booleanValue: value };
              } else if (Array.isArray(value)) {
                acc[key] = { 
                  arrayValue: { 
                    values: value.map(item => ({ stringValue: item.toString() }))
                  }
                };
              } else if (value instanceof Date) {
                acc[key] = { timestampValue: value.toISOString() };
              } else if (typeof value === 'object' && value !== null) {
                acc[key] = { stringValue: JSON.stringify(value) };
              }
              return acc;
            }, {})
          };
          
          await firestoreFetch(endpoint, 'PATCH', firestoreData);
          return { id: docId };
        },
        update: async (data: any) => {
          const endpoint = `/${collectionName}/${docId}`;
          const firestoreData = {
            fields: Object.keys(data).reduce((acc: any, key) => {
              const value = data[key];
              if (typeof value === 'string') {
                acc[key] = { stringValue: value };
              } else if (typeof value === 'number') {
                acc[key] = { integerValue: value.toString() };
              } else if (typeof value === 'boolean') {
                acc[key] = { booleanValue: value };
              } else if (Array.isArray(value)) {
                acc[key] = { 
                  arrayValue: { 
                    values: value.map(item => ({ stringValue: item.toString() }))
                  }
                };
              } else if (value instanceof Date) {
                acc[key] = { timestampValue: value.toISOString() };
              } else if (typeof value === 'object' && value !== null) {
                acc[key] = { stringValue: JSON.stringify(value) };
              }
              return acc;
            }, {})
          };
          
          await firestoreFetch(endpoint, 'PATCH', firestoreData);
          return { id: docId };
        }
      }),
      
      // Query methods
      where: (field: string, operator: string, value: any) => {
        // Simple mock - doesn't actually filter
        return {
          orderBy: (field: string, direction: string = 'asc') => ({
            get: async () => {
              try {
                const endpoint = `/${collectionName}`;
                const result = await firestoreFetch(endpoint, 'GET');
                
                const documents = result.documents || [];
                const transformedDocs = documents.map(transformDocument);
                
                // Simple client-side sorting
                transformedDocs.sort((a: any, b: any) => {
                  const aVal = a[field];
                  const bVal = b[field];
                  if (direction === 'desc') {
                    return bVal > aVal ? 1 : -1;
                  }
                  return aVal > bVal ? 1 : -1;
                });
                
                return {
                  forEach: (callback: (doc: any) => void) => {
                    transformedDocs.forEach(doc => callback({
                      data: () => doc,
                      id: doc.id
                    }));
                  }
                };
              } catch (error) {
                console.error('Query error:', error);
                return { forEach: () => {} };
              }
            }
          }),
          get: async () => {
            try {
              const endpoint = `/${collectionName}`;
              const result = await firestoreFetch(endpoint, 'GET');
              
              const documents = result.documents || [];
              const transformedDocs = documents.map(transformDocument);
              
              // Simple client-side filtering (very basic)
              const filteredDocs = transformedDocs.filter((doc: any) => {
                if (operator === '==') return doc[field] === value;
                return true;
              });
              
              return {
                forEach: (callback: (doc: any) => void) => {
                  filteredDocs.forEach(doc => callback({
                    data: () => doc,
                    id: doc.id
                  }));
                }
              };
            } catch (error) {
              console.error('Query error:', error);
              return { forEach: () => {} };
            }
          }
        };
      },
      
      orderBy: (field: string, direction: string = 'asc') => ({
        get: async () => {
          try {
            const endpoint = `/${collectionName}`;
            const result = await firestoreFetch(endpoint, 'GET');
            
            const documents = result.documents || [];
            const transformedDocs = documents.map(transformDocument);
            
            // Client-side sorting
            transformedDocs.sort((a: any, b: any) => {
              const aVal = a[field];
              const bVal = b[field];
              if (direction === 'desc') {
                return bVal > aVal ? 1 : -1;
              }
              return aVal > bVal ? 1 : -1;
            });
            
            return {
              forEach: (callback: (doc: any) => void) => {
                transformedDocs.forEach(doc => callback({
                  data: () => doc,
                  id: doc.id
                }));
              }
            };
          } catch (error) {
            console.error('Query error:', error);
            return { forEach: () => {} };
          }
        }
      }),
      
      get: async () => {
        try {
          const endpoint = `/${collectionName}`;
          const result = await firestoreFetch(endpoint, 'GET');
          
          const documents = result.documents || [];
          const transformedDocs = documents.map(transformDocument);
          
          return {
            forEach: (callback: (doc: any) => void) => {
              transformedDocs.forEach(doc => callback({
                data: () => doc,
                id: doc.id
              }));
            }
          };
        } catch (error) {
          console.error('Collection get error:', error);
          return { forEach: () => {} };
        }
      }
    };
  }
};

// Mock auth object
const auth = {
  // Add auth methods if needed
};

export { db, auth };