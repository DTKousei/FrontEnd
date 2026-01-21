import { biometricApi as api, authApi } from '@/api/config';
import type { 
  BiometricUser, 
  CreateUserData, 
  UpdateUserData, 
  UserQueryParams,
  SyncUsersResponse
} from '@/api/types/users.types';
import type { PaginatedResponse } from '@/api/types/common.types';

export const userService = {
  // Obtener todos los usuarios (GET /api/usuarios)
  getAll(params?: UserQueryParams) {
    return api.get<PaginatedResponse<BiometricUser>>('/usuarios/', { params });
  },

  // Obtener usuario por ID (GET /api/usuarios/{id})
  getById(id: number) {
    return api.get<BiometricUser>(`/usuarios/${id}/`);
  },

  // Obtener usuario por DNI/UserID (GET /api/usuarios/user_id/{user_id})
  getByUserId(user_id: string) {
    return api.get<BiometricUser>(`/usuarios/user_id/${user_id}`);
  },

  // Crear nuevo usuario (POST /api/usuarios)
  create(data: CreateUserData) {
    return api.post<BiometricUser>('/usuarios/', data);
  },

  // Actualizar usuario existente (PUT /api/usuarios/{id})
  update(id: number, data: UpdateUserData) {
    return api.put<BiometricUser>(`/usuarios/${id}`, data);
  },

  // Eliminar usuario (DELETE /api/usuarios/{id})
  delete(id: number) {
    return api.delete<{ message: string }>(`/usuarios/${id}/`);
  },

  // Sincronizar usuario específico con dispositivo (POST /api/usuarios/{id}/sincronizar)
  syncUserWithDevice(id: number) {
    return api.post<{ message: string }>(`/usuarios/${id}/sincronizar/`);
  },

  syncAllFromDevice(deviceId: number) {
    return api.post<SyncUsersResponse>(`/usuarios/dispositivos/${deviceId}/sincronizar`);
  },

  // Verificar estado de bloqueo (GET /api/users/{id}/lock-status)
  getLockStatus(user_id: string | number) {
    // Estructura de respuesta: { success: boolean, data: { isLocked: boolean, ... } }
    // Se usa authApi porque la función de bloqueo está en el puerto 3001 (Auth Service)
    return authApi.get<{ success: boolean; data: { isLocked: boolean; lock_reason?: string } }>(`/users/${user_id}/lock-status`);
  },

  // Desbloquear usuario (POST /api/users/{id}/unlock)
  unlockUser(user_id: string | number) {
     // Se usa authApi porque la función de bloqueo está en el puerto 3001 (Auth Service)
    return authApi.post<{ success: boolean; message: string }>(`/users/${user_id}/unlock`);
  }
};
