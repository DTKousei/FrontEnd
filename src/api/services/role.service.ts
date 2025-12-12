import { authApi as api } from '@/api/config';
import type { 
  Permission, 
  RolesResponse, 
  RoleResponse, 
  PermissionsResponse, 
  PermissionResponse 
} from '@/api/types/auth.types';

export const roleService = {
  // --- Permissions Endpoints ---
  // GET /api/permisos
  getAllPermissions() {
    return api.get<PermissionsResponse>('/permisos');
  },
  
  // GET /api/permisos/:id
  getPermissionById(id: string) {
    return api.get<PermissionResponse>(`/permisos/${id}`);
  },
  
  // POST /api/permisos
  createPermission(data: { nombre: string; descripcion?: string }) {
    return api.post<PermissionResponse>('/permisos', data);
  },
  
  // PUT /api/permisos/:id
  updatePermission(id: string, data: Partial<Permission>) {
    return api.put<PermissionResponse>(`/permisos/${id}`, data);
  },
  
  // DELETE /api/permisos/:id
  deletePermission(id: string) {
    return api.delete<{ success: boolean; message: string }>(`/permisos/${id}`);
  },

  // --- Roles Endpoints ---
  // GET /api/roles
  getAllRoles() {
    return api.get<RolesResponse>('/roles');
  },

  // GET /api/roles/:id
  getRoleById(id: string) {
    return api.get<RoleResponse>(`/roles/${id}`);
  },

  // POST /api/roles
  createRole(data: { nombre: string; descripcion?: string; permisos?: string[] }) {
    return api.post<RoleResponse>('/roles', data);
  },

  // PUT /api/roles/:id
  updateRole(id: string, data: Partial<{ nombre: string; descripcion?: string; permisos: string[] }>) {
    return api.put<RoleResponse>(`/roles/${id}`, data);
  },

  // DELETE /api/roles/:id
  deleteRole(id: string) {
    return api.delete<{ success: boolean; message: string }>(`/roles/${id}`);
  }
};
