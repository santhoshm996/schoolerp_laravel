import { apiClient } from './apiClient';

export interface DashboardData {
  total_students?: number;
  total_teachers?: number;
  total_classes?: number;
  total_sections?: number;
  system_health?: {
    status?: string;
    last_backup?: string;
    active_users_today?: number;
  };
  recent_activities?: Array<{
    action: string;
    user: string;
    time: string;
  }>;
  assigned_classes?: {
    count?: number;
    classes?: Array<{
      id: number;
      name: string;
      section: string;
      students_count: number;
    }>;
  };
  todays_timetable?: Array<{
    time: string;
    class: string;
    subject: string;
  }>;
  attendance_today?: number;
  todays_collection?: {
    amount?: number;
    transactions?: number;
    pending?: number;
  };
  pending_dues?: {
    total_amount?: number;
    students_count?: number;
    overdue_count?: number;
  };
  monthly_summary?: {
    collected?: number;
    pending?: number;
    total_students?: number;
  };
  class_info?: {
    class?: string;
    section?: string;
    roll_number?: string;
  };
  attendance?: {
    percentage?: number;
    present_days?: number;
    total_days?: number;
  };
  upcoming_exams?: Array<{
    subject: string;
    date: string;
    type: string;
  }>;
  recent_results?: Array<{
    subject: string;
    score: number;
    grade: string;
  }>;
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
  message: string;
}

class DashboardService {
  /**
   * Fetch dashboard data based on user role
   */
  async getDashboardData(): Promise<DashboardData> {
    try {
      const response = await apiClient.get('/api/v1/dashboard');
      return response.data.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard data';
      throw new Error(errorMessage);
    }
  }

  /**
   * Refresh dashboard data
   */
  async refreshDashboardData(): Promise<DashboardData> {
    return this.getDashboardData();
  }
}

export const dashboardService = new DashboardService();
