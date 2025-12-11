// ============================================
// INTERFACES DE DATOS - GESTIÓN DE USUARIOS
// ============================================

/**
 * Representa un usuario en el sistema biométrico
 */
/**
 * Representa un usuario en el sistema biométrico
 */
export interface BiometricUser {
  id: number;
  user_id: string;
  nombre: string;
  privilegio: number;
  dispositivo_id: number;
  email?: string;
  telefono?: string;
  departamento?: string;
  cargo?: string;
  fecha_creacion: string; // ISO timestamp
}

/**
 * Datos requeridos para crear un nuevo usuario
 */
export interface CreateUserData {
  user_id: string;
  nombre: string;
  privilegio: number;
  password?: string;
  dispositivo_id: number;
  email?: string;
  telefono?: string;
  departamento?: string;
  cargo?: string;
}

/**
 * Datos para actualizar un usuario existente
 */
export interface UpdateUserData {
  user_id?: string;
  nombre?: string;
  privilegio?: number;
  password?: string;
  dispositivo_id?: number;
  email?: string;
  telefono?: string;
  departamento?: string;
  cargo?: string;
}

/**
 * Respuesta de sincronización de usuarios desde dispositivo
 */
export interface SyncUsersResponse {
  success: boolean;
  message: string;
  usuarios_nuevos: number;
  usuarios_actualizados: number;
}

/**
 * Parámetros de consulta para listar usuarios
 */
export interface UserQueryParams {
  dispositivo_id?: number;
  limit?: number;
  offset?: number;
  departamento?: string;
  activo?: boolean;
}

/**
 * Niveles de privilegio de usuario
 */
export enum UserPrivilege {
  USUARIO = 0,
  ADMINISTRADOR = 14,
}

/**
 * Tipo literal para niveles de privilegio
 */
export type PrivilegeLevel = 0 | 14;


