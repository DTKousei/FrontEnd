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
  // Iniciar sesión (POST /api/auth/login)
  login(credentials: LoginCredentials) {
    return api.post<AuthResponse>('/auth/login', credentials);
  },

  // Registrar nuevo usuario (POST /api/auth/register)
  register(data: RegisterData) {
    return api.post<RegisterResponse>('/auth/register', data);
  },

  // Cerrar sesión (POST /api/auth/logout)
  logout() {
    return api.post<SuccessResponse>('/auth/logout');
  },

  // Cambiar contraseña (POST /api/auth/change-password)
  changePassword(data: ChangePasswordData) {
    return api.post<SuccessResponse>('/auth/change-password', data);
  },

  // Obtener perfil del usuario actual (GET /api/auth/profile)
  getProfile() {
    return api.get<ProfileResponse>('/auth/profile');
  },

  // Verificar validez del token (GET /api/auth/verify)
  verifyToken() {
    return api.get<VerifyTokenResponse>('/auth/verify');
  },
  // Obtener todos los usuarios del sistema de auth (GET /api/users)
  getAllUsers() {
    return api.get<{ success: boolean; data: import('@/api/types/auth.types').User[] }>('/users');
  },

  // Actualizar usuario de auth (PUT /api/users/:id)
  updateUser(id: string, data: import('@/api/types/auth.types').UpdateAuthUser) {
    return api.put<{ success: boolean; data: import('@/api/types/auth.types').User }>(`/users/${id}`, data);
  },

  // === NUEVOS ENDPOINTS BASADOS EN DNI ===

  // Obtener detalles del empleado por DNI (GET /api/users/usuario/:DNI)
  getUserByDNI(usuario: string) {
    return api.get<{ success: boolean; data: import('@/api/types/auth.types').User }>(`/users/usuario/${usuario}`);
  },

  // Actualizar usuario por DNI (PUT /api/users/usuario/:DNI)
  updateUserByDNI(usuario: string, data: import('@/api/types/auth.types').UpdateAuthUser) {
    return api.put<{ success: boolean; data: import('@/api/types/auth.types').User }>(`/users/usuario/${usuario}`, data);
  },

  // Cambiar contraseña por DNI (POST /api/auth/change-pass/:DNI)
  changePasswordByDNI(usuario: string, data: any) {
    return api.post<SuccessResponse>(`/auth/change-pass/${usuario}`, data);
  }
};

