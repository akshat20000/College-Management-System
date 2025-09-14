import { api } from './api';
import type { User } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher' | 'admin';
  program?: string;
  department?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    localStorage.setItem('accessToken', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    localStorage.setItem('accessToken', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  },

  async refreshToken(): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/refresh');
    localStorage.setItem('accessToken', response.data.token);
    return response.data;
  },

  async getAllUsers(): Promise<User[]> {
    console.log("requesting users")
    const response = await api.get<User[]>('/users'); 
    console.log(response)
    return response.data;
  },

  async checkUserByCmsid(cmsid: string, role: string): Promise<{ found: boolean, user?: User }> {
    
    const response = await api.get(`/users/${role}/${cmsid}`);
    return response.data;
  },

  // async checkTeacherByCmsid(cmsid: string) {
  //   return this.checkUserByCmsid(cmsid, 'teacher');
  // },

  // async checkStudentByCmsid(cmsid: string) {
  //   return this.checkUserByCmsid(cmsid, 'student');
  // },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  setCurrentUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('jwt');
  }
};