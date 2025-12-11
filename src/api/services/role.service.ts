import { authApi as api } from '@/api/config';
import type { Role, Permission } from '@/api/types/auth.types';// Reusing response wrapper if applicable, or generic

export const roleService = {
  // --- Permissions Endpoints ---
  // GET /api/permisos
  getAllPermissions() {
    return api.get<Permission[]>('/permisos');
  },
  
  // GET /api/permisos/:id
  getPermissionById(id: string) {
    return api.get<Permission>(`/permisos/${id}`);
  },
  
  // POST /api/permisos
  createPermission(data: { nombre: string; descripcion?: string }) {
    return api.post<Permission>('/permisos', data);
  },
  
  // PUT /api/permisos/:id
  updatePermission(id: string, data: Partial<Permission>) {
    return api.put<Permission>(`/permisos/${id}`, data);
  },
  
  // DELETE /api/permisos/:id
  deletePermission(id: string) {
    return api.delete(`/permisos/${id}`);
  },

  // --- Roles Endpoints ---
  // GET /api/roles
  getAllRoles() {
    return api.get<Role[]>('/roles');
  },

  // GET /api/roles/:id
  getRoleById(id: string) {
    return api.get<Role>(`/roles/${id}`);
  },

  // POST /api/roles
  createRole(data: { nombre: string; descripcion?: string; permisos?: string[] }) {
    return api.post<Role>('/roles', data);
  },

  // PUT /api/roles/:id
  updateRole(id: string, data: Partial<{ nombre: string; descripcion?: string; permisos: string[] }>) {
    return api.put<Role>(`/roles/${id}`, data);
  },

  // DELETE /api/roles/:id
  deleteRole(id: string) {
    return api.delete(`/roles/${id}`);
  }
};
