import { apiClient } from './apiClient';

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      id: number;
      name: string;
      email: string;
      username: string;
      phone: string;
      status: string;
      role: string;
      role_description: string;
    };
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  phone: string;
  status: string;
  role: string;
  role_description: string;
}

class AuthService {
  async login(loginField: string, password: string): Promise<LoginResponse> {
    const payload = loginField.includes('@') 
      ? { email: loginField, password }
      : { username: loginField, password };

    const response = await apiClient.post('/api/v1/login', payload);
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/v1/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async me(): Promise<User> {
    const response = await apiClient.get('/api/v1/me');
    return response.data.data;
  }
}

export const authService = new AuthService();
