import { apiClient } from './apiClient';

export interface FeeGroup {
  id: number;
  name: string;
  description?: string;
  session_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  session?: {
    id: number;
    name: string;
  };
  fee_types?: FeeType[];
}

export interface FeeType {
  id: number;
  name: string;
  description?: string;
  amount: number;
  fee_group_id: number;
  session_id: number;
  frequency: 'one_time' | 'monthly' | 'quarterly' | 'yearly';
  due_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  fee_group?: FeeGroup;
  session?: {
    id: number;
    name: string;
  };
}

export interface StudentFee {
  id: number;
  student_id: number;
  fee_type_id: number;
  amount_due: number;
  amount_paid: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  session_id: number;
  due_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  student?: {
    id: number;
    name: string;
    admission_no: string;
    class_room?: {
      id: number;
      name: string;
    };
    section?: {
      id: number;
      name: string;
    };
  };
  fee_type?: FeeType;
  session?: {
    id: number;
    name: string;
  };
  // Computed properties
  remaining_amount?: number;
  payment_percentage?: number;
  is_overdue?: boolean;
}

export interface FeeTransaction {
  id: number;
  student_id: number;
  fee_type_id: number;
  amount_paid: number;
  payment_date: string;
  payment_mode: 'cash' | 'online' | 'cheque' | 'bank_transfer';
  receipt_no: string;
  session_id: number;
  collected_by?: number;
  notes?: string;
  reference_no?: string;
  created_at: string;
  updated_at: string;
  student?: {
    id: number;
    name: string;
    admission_no: string;
    class_room?: {
      id: number;
      name: string;
    };
    section?: {
      id: number;
      name: string;
    };
  };
  fee_type?: FeeType;
  session?: {
    id: number;
    name: string;
  };
  collectedBy?: {
    id: number;
    name: string;
  };
}

export interface FeeMaster {
  id: number;
  fee_group_id: number;
  fee_type_id: number;
  class_id: number;
  amount: number;
  session_id: number;
  created_at: string;
  updated_at: string;
  fee_group?: FeeGroup;
  fee_type?: FeeType;
  class_room?: {
    id: number;
    name: string;
  };
  session?: {
    id: number;
    name: string;
  };
}

export interface ClassRoom {
  id: number;
  name: string;
  session_id: number;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: number;
  name: string;
  class_id: number;
  session_id: number;
  created_at: string;
  updated_at: string;
}

export interface FeeAssignmentRequest {
  class_id: number;
  section_id?: number;
  fee_type_ids: number[];
  session_id: number;
  due_date?: string;
  notes?: string;
}

export interface FeePaymentRequest {
  student_id: number;
  fee_type_id: number;
  amount_paid: number;
  payment_date: string;
  payment_mode: 'cash' | 'online' | 'cheque' | 'bank_transfer';
  session_id: number;
  notes?: string;
  reference_no?: string;
}

export interface FeeSummary {
  total_due: number;
  total_paid: number;
  total_remaining: number;
  pending_count: number;
  partial_count: number;
  paid_count: number;
  overdue_count: number;
  fees: StudentFee[];
}

export interface TransactionSummary {
  total_transactions: number;
  total_amount_collected: number;
  total_students: number;
  payment_mode_breakdown: Record<string, { count: number; amount: number }>;
  daily_collection: Record<string, { count: number; amount: number }>;
}

export interface TodayCollection {
  date: string;
  total_transactions: number;
  total_amount: number;
  payment_modes: Record<string, { count: number; amount: number }>;
  recent_transactions: FeeTransaction[];
}

export interface MonthlyCollection {
  month: string;
  start_date: string;
  end_date: string;
  total_transactions: number;
  total_amount: number;
  daily_breakdown: Record<string, { count: number; amount: number }>;
  payment_mode_breakdown: Record<string, { count: number; amount: number }>;
}

export interface Receipt {
  receipt_no: string;
  date: string;
  student_name: string;
  admission_no: string;
  class: string;
  section: string;
  fee_type: string;
  fee_group: string;
  amount_paid: number;
  payment_mode: string;
  collected_by: string;
  notes?: string;
  reference_no?: string;
}

class FeesService {
  // Fee Groups
  async getFeeGroups(sessionId?: number, params?: any) {
    const response = await apiClient.get('/api/v1/fee-groups', {
      params: { session_id: sessionId, ...params }
    });
    return response.data;
  }

  async createFeeGroup(data: Partial<FeeGroup>) {
    const response = await apiClient.post('/api/v1/fee-groups', data);
    return response.data;
  }

  async updateFeeGroup(id: number, data: Partial<FeeGroup>) {
    const response = await apiClient.put(`/api/v1/fee-groups/${id}`, data);
    return response.data;
  }

  async deleteFeeGroup(id: number) {
    const response = await apiClient.delete(`/api/v1/fee-groups/${id}`);
    return response.data;
  }

  async getFeeGroupsBySession(sessionId: number) {
    const response = await apiClient.get(`/api/v1/fee-groups/session/${sessionId}`);
    return response.data;
  }

  // Fee Types
  async getFeeTypes(sessionId?: number, params?: any) {
    const response = await apiClient.get('/api/v1/fee-types', {
      params: { session_id: sessionId, ...params }
    });
    return response.data;
  }

  async createFeeType(data: Partial<FeeType>) {
    const response = await apiClient.post('/api/v1/fee-types', data);
    return response.data;
  }

  async updateFeeType(id: number, data: Partial<FeeType>) {
    const response = await apiClient.put(`/api/v1/fee-types/${id}`, data);
    return response.data;
  }

  async deleteFeeType(id: number) {
    const response = await apiClient.delete(`/api/v1/fee-types/${id}`);
    return response.data;
  }

  async getFeeTypesByFeeGroup(feeGroupId: number) {
    const response = await apiClient.get(`/api/v1/fee-types/fee-group/${feeGroupId}`);
    return response.data;
  }

  // Student Fees
  async getStudentFees(sessionId?: number, params?: any) {
    const response = await apiClient.get('/api/v1/student-fees', {
      params: { session_id: sessionId, ...params }
    });
    return response.data;
  }

  async assignFees(data: FeeAssignmentRequest) {
    const response = await apiClient.post('/api/v1/fee-master/assign-fees', data);
    return response.data;
  }

  async collectPayment(data: FeePaymentRequest) {
    const response = await apiClient.post('/api/v1/student-fees/collect-payment', data);
    return response.data;
  }

  async getStudentFeeSummary(studentId: number, sessionId?: number) {
    const response = await apiClient.get(`/api/v1/student-fees/student/${studentId}/summary`, {
      params: { session_id: sessionId }
    });
    return response.data;
  }

  async getFeeReports(sessionId?: number, params?: any) {
    const response = await apiClient.get('/api/v1/student-fees/reports', {
      params: { session_id: sessionId, ...params }
    });
    return response.data;
  }

  async removeFeeAssignment(id: number) {
    const response = await apiClient.delete(`/api/v1/student-fees/${id}`);
    return response.data;
  }

  // Fee Master Management
  async getFeeMasters(sessionId?: number, params?: any) {
    const response = await apiClient.get('/api/v1/fee-master', {
      params: { session_id: sessionId, ...params }
    });
    return response.data;
  }

  async createFeeMaster(data: Partial<FeeMaster>) {
    const response = await apiClient.post('/api/v1/fee-master', data);
    return response.data;
  }

  async updateFeeMaster(id: number, data: Partial<FeeMaster>) {
    const response = await apiClient.put(`/api/v1/fee-master/${id}`, data);
    return response.data;
  }

  async deleteFeeMaster(id: number) {
    const response = await apiClient.delete(`/api/v1/fee-master/${id}`);
    return response.data;
  }

  async getFeeMaster(id: number) {
    const response = await apiClient.get(`/api/v1/fee-master/${id}`);
    return response.data;
  }

  async getClassFeeSummary(classId: number, sessionId: number) {
    const response = await apiClient.get('/api/v1/fee-master/class-summary', {
      params: { class_id: classId, session_id: sessionId }
    });
    return response.data;
  }

  // Additional methods for fee assignment
  async getClasses() {
    const response = await apiClient.get('/api/v1/classes');
    return response.data;
  }

  async getSections() {
    const response = await apiClient.get('/api/v1/sections');
    return response.data;
  }

  async getStudents(params?: any) {
    const response = await apiClient.get('/api/v1/students', { params });
    return response.data;
  }

  // Fee Transactions
  async getFeeTransactions(sessionId?: number, params?: any) {
    const response = await apiClient.get('/api/v1/fee-transactions', {
      params: { session_id: sessionId, ...params }
    });
    return response.data;
  }

  async getFeeTransaction(id: number) {
    const response = await apiClient.get(`/api/v1/fee-transactions/${id}`);
    return response.data;
  }

  async getTransactionByReceipt(receiptNo: string) {
    const response = await apiClient.get(`/api/v1/fee-transactions/receipt/${receiptNo}`);
    return response.data;
  }

  async getTransactionSummary(sessionId?: number, params?: any) {
    const response = await apiClient.get('/api/v1/fee-transactions/summary', {
      params: { session_id: sessionId, ...params }
    });
    return response.data;
  }

  async getTodayCollection() {
    const response = await apiClient.get('/api/v1/fee-transactions/today');
    return response.data;
  }

  async getMonthlyCollection(month?: string, sessionId?: number) {
    const response = await apiClient.get('/api/v1/fee-transactions/monthly', {
      params: { month, session_id: sessionId }
    });
    return response.data;
  }

  async generateReceipt(id: number) {
    const response = await apiClient.get(`/api/v1/fee-transactions/${id}/receipt`);
    return response.data;
  }

  async updateTransactionNotes(id: number, notes: string) {
    const response = await apiClient.put(`/api/v1/fee-transactions/${id}/notes`, { notes });
    return response.data;
  }

  // Advanced Fee Collection Methods
  async collectFee(data: FeePaymentRequest) {
    const response = await apiClient.post('/api/v1/collect-fee', data);
    return response.data;
  }

  async generateInvoice(studentId: number, sessionId: number, includePaid: boolean = false) {
    const response = await apiClient.post(`/api/v1/generate-invoice/${studentId}`, {
      session_id: sessionId,
      include_paid: includePaid
    });
    return response.data;
  }

  async getFeeSplit(studentId: number, sessionId: number) {
    const response = await apiClient.get(`/api/v1/fee-split/${studentId}`, {
      params: { session_id: sessionId }
    });
    return response.data;
  }
}

export const feesService = new FeesService();
