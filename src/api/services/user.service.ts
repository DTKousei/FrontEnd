import { biometricApi as api } from '@/api/config';
import type { 
  BiometricUser, 
  CreateUserData, 
  UpdateUserData, 
  UserQueryParams,
  SyncUsersResponse
} from '@/api/types/users.types';
import type { PaginatedResponse } from '@/api/types/common.types';

export const userService = {
  // GET /api/usuarios
  getAll(params?: UserQueryParams) {
    return api.get<PaginatedResponse<BiometricUser>>('/usuarios', { params });
  },

  // GET /api/usuarios/{id}
  getById(id: number) {
    return api.get<BiometricUser>(`/usuarios/${id}`);
  },

  // POST /api/usuarios
  create(data: CreateUserData) {
    return api.post<BiometricUser>('/usuarios', data);
  },

  // PUT /api/usuarios/{id}
  update(id: number, data: UpdateUserData) {
    return api.put<BiometricUser>(`/usuarios/${id}`, data);
  },

  // DELETE /api/usuarios/{id}
  delete(id: number) {
    return api.delete<{ message: string }>(`/usuarios/${id}`);
  },

  // POST /api/usuarios/{id}/sincronizar
  syncUserWithDevice(id: number) {
    return api.post<{ message: string }>(`/usuarios/${id}/sincronizar`);
  },

  // POST /api/usuarios/dispositivos/{id}/sincronizar
  syncAllFromDevice(deviceId: number) {
    return api.post<SyncUsersResponse>(`/usuarios/dispositivos/${deviceId}/sincronizar`);
  }
};
