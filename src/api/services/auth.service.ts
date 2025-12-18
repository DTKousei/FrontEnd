import { authApi as api } from '@/api/config';
import type { SuccessResponse } from '@/api/types/common.types';
import type { 
  LoginCredentials, 
  AuthResponse, 
  RegisterData, 
  ChangePasswordData,
  VerifyTokenResponse,
  ProfileResponse,
  RegisterResponse
} from '@/api/types/auth.types';

export const authService = {
  // POST /api/auth/login
  login(credentials: LoginCredentials) {
    return api.post<AuthResponse>('/auth/login', credentials);
  },

  // POST /api/auth/register
  register(data: RegisterData) {
    return api.post<RegisterResponse>('/auth/register', data);
  },

  // POST /api/auth/logout
  logout() {
    return api.post<SuccessResponse>('/auth/logout');
  },

  // POST /api/auth/change-password
  changePassword(data: ChangePasswordData) {
    return api.post<SuccessResponse>('/auth/change-password', data);
  },

  // GET /api/auth/profile
  getProfile() {
    return api.get<ProfileResponse>('/auth/profile');
  },

  // GET /api/auth/verify
  verifyToken() {
    return api.get<VerifyTokenResponse>('/auth/verify');
  },
  // GET /api/users
  getAllUsers() {
    return api.get<{ success: boolean; data: import('@/api/types/auth.types').User[] }>('/users');
  }
};

