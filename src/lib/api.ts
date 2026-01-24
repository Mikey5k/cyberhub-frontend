const API_BASE = 'https://cyberhub-veritas.vercel.app/api';

export interface UserRole {
  role: 'user' | 'worker' | 'admin' | 'manager' | 'guest';
  phone: string;
  exists: boolean;
  collection?: string;
}

export interface Task {
  id: string;
  customerPhone: string;
  title: string;
  description: string;
  price: number;
  status: 'awaiting_worker' | 'in-progress' | 'processing' | 'completed' | 'cancelled';
  progress: number;
  assignedWorkerPhone: string | null;
  createdAt: any;
  updatedAt: any;
  completedAt?: any;
  type?: 'assigned' | 'available';
}

export interface Agent {
  id: string;
  phone: string;
  name: string;
  status: 'pending' | 'active' | 'suspended';
  managerPhone?: string;
  totalEarnings: number;
  completedTasks: number;
  joinedAt: any;
}

export interface TeamData {
  success: boolean;
  agents: Agent[];
  agentsCount: number;
  tasks: any[];
  tasksCount: number;
  commissions?: {
    totalRevenue: number;
    agentEarnings: number;
    managerCommission: number;
    completedTasksCount: number;
  };
}

export interface CommissionData {
  success: boolean;
  userRole: string;
  teamAgentsCount?: number;
  teamTotalEarnings?: number;
  managerCommission?: number;
  commissionRate?: number;
  agentCommissions?: any[];
  nextWithdrawal?: string;
  totalTasksValue?: number;
  agentCommission?: number;
  completedTasks?: number;
  tasks?: any[];
}

export interface ContactInfo {
  success: boolean;
  hasWorker?: boolean;
  hasManager?: boolean;
  workerPhone?: string;
  managerPhone?: string;
  managerName?: string;
  whatsappLink: string;
  message?: string;
  taskTitle?: string;
  taskStatus?: string;
}

// Phone-based authentication
export async function getUserRole(phone: string): Promise<UserRole> {
  const encodedPhone = encodeURIComponent(phone);
  const response = await fetch(`${API_BASE}/userOperations?phone=${encodedPhone}`);
  if (!response.ok) {
    throw new Error(`Failed to get role: ${response.statusText}`);
  }
  return response.json();
}

export async function createUser(phone: string, role: 'user' | 'worker' | 'admin' | 'manager', name?: string, managerPhone?: string) {
  const requestBody: any = { phone, role, name };
  if (managerPhone) requestBody.managerPhone = managerPhone;
  
  const response = await fetch(`${API_BASE}/userOperations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to create user: ${response.statusText}`);
  }
  return response.json();
}

export async function getTasks(phone: string, role: string): Promise<{ tasks: Task[], count: number }> {
  const encodedPhone = encodeURIComponent(phone);
  const encodedRole = encodeURIComponent(role);
  const response = await fetch(`${API_BASE}/taskOperations?phone=${encodedPhone}&role=${encodedRole}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to get tasks: ${response.statusText}`);
  }
  return response.json();
}

export async function createTask(phone: string, title: string, description?: string, price?: number) {
  const response = await fetch(`${API_BASE}/taskOperations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operation: 'create', phone, title, description, price })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to create task: ${response.statusText}`);
  }
  return response.json();
}

export async function assignTask(taskId: string, workerPhone: string) {
  const response = await fetch(`${API_BASE}/taskOperations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }, // FIXED: Was missing quote
    body: JSON.stringify({ operation: 'assign', taskId, workerPhone })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to assign task: ${response.statusText}`);
  }
  return response.json();
}

export async function updateTask(taskId: string, status: string, progress?: number, notes?: string) {
  const response = await fetch(`${API_BASE}/taskOperations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operation: 'update', taskId, status, progress, notes })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to update task: ${response.statusText}`);
  }
  return response.json();
}

export async function getTaskWorker(taskId: string): Promise<ContactInfo> {
  const response = await fetch(`${API_BASE}/userOperations?taskId=${encodeURIComponent(taskId)}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to get task worker: ${response.statusText}`);
  }
  return response.json();
}

export async function getAgentManager(agentPhone: string): Promise<ContactInfo> {
  const response = await fetch(`${API_BASE}/userOperations?agentPhone=${encodeURIComponent(agentPhone)}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to get agent manager: ${response.statusText}`);
  }
  return response.json();
}

export async function getTeamData(managerPhone: string): Promise<TeamData> {
  const encodedPhone = encodeURIComponent(managerPhone);
  const response = await fetch(`${API_BASE}/getTeamData?managerPhone=${encodedPhone}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to get team data: ${response.statusText}`);
  }
  return response.json();
}

export async function getCommissions(userPhone: string, userRole: string): Promise<CommissionData> {
  const encodedPhone = encodeURIComponent(userPhone);
  const encodedRole = encodeURIComponent(userRole);
  const response = await fetch(`${API_BASE}/commissionOperations?userPhone=${encodedPhone}&userRole=${encodedRole}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to get commissions: ${response.statusText}`);
  }
  return response.json();
}

export async function requestWithdrawal(userPhone: string, userRole: string, amount: number, method: string = 'mpesa') {
  const response = await fetch(`${API_BASE}/commissionOperations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userPhone, userRole, amount, method })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to request withdrawal: ${response.statusText}`);
  }
  return response.json();
}

// Mock data functions (keep for backward compatibility)
export async function getAgentTasks(agentPhone: string): Promise<any[]> {
  try {
    const data = await getTasks(agentPhone, 'worker');
    return data.tasks || [];
  } catch (error) {
    console.warn('Failed to fetch agent tasks:', error);
    return [];
  }
}

export async function getTeamAgents(managerPhone: string): Promise<Agent[]> {
  try {
    const data = await getTeamData(managerPhone);
    return data.agents || [];
  } catch (error) {
    console.warn('Failed to fetch team agents:', error);
    return [];
  }
}

export async function getTeamTasks(managerPhone: string): Promise<any[]> {
  try {
    const data = await getTeamData(managerPhone);
    return data.tasks || [];
  } catch (error) {
    console.warn('Failed to fetch team tasks:', error);
    return [];
  }
}

export async function getServices(): Promise<any[]> {
  // TODO: Implement when service API is created
  return [];
}

export async function approveAgent(agentId: string): Promise<void> {
  // TODO: Implement when agent approval API is created
  return Promise.resolve();
}

export async function addService(serviceData: any): Promise<void> {
  // TODO: Implement when service API is created
  return Promise.resolve();
}

// Keep mock data functions for development
function getMockAgents(): Agent[] {
  return [
    {
      id: "1",
      phone: "+254722334455",
      name: "John Agent",
      status: "active",
      managerPhone: "+254715554444",
      totalEarnings: 15000,
      completedTasks: 12,
      joinedAt: "2024-01-15"
    }
  ];
}

function getMockAgentTasks(): any[] {
  return [
    {
      id: "1",
      title: "KRA PIN Registration",
      description: "Assist client with KRA PIN application",
      category: "E-Citizen",
      price: 1500,
      status: "completed",
      assignedTo: "+254722334455",
      assignedAt: "2024-02-01",
      completedAt: "2024-02-10",
      clientPhone: "+254711223344",
      requirements: ["ID Copy", "Passport Photo"]
    }
  ];
}