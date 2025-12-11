// Estructura del rol según la API
export interface Role {
  id: string; // UUID
  nombre: string;
  descripcion?: string;
}

// Estructura del permiso según la API
export interface Permission {
  id: string; // UUID
  nombre: string;
  descripcion?: string;
}

// Estructura del usuario según la API
export interface User {
  id: string; // UUID en lugar de number
  usuario: string; // Cambio de 'username' a 'usuario'
  correo_electronico: string; // Cambio de 'email' a 'correo_electronico'
  esta_activo: boolean;
  creado_en: string; // Timestamp ISO
  actualizado_en?: string; // Timestamp ISO
  rol?: Role;
  usuario_permisos?: Array<{
    permiso: Permission;
  }>;
}

// Respuesta de autenticación (login y registro)
export interface AuthResponse {
  success: true;
  message: string;
  token?: string; // Login incluye token, registro no
  user?: User; // Login usa 'user', registro también
}

// Respuesta de registro (estructura específica)
export interface RegisterResponse {
  success: true;
  message: string;
  user: User;
}

// Credenciales de login
export interface LoginCredentials {
  correo_electronico: string; // La API usa correo_electronico
  contrasena: string; // La API usa 'contrasena'
}

// Datos de registro
export interface RegisterData {
  usuario: string; // Cambio de 'username' a 'usuario'
  correo_electronico: string; // Cambio de 'email' a 'correo_electronico'
  contrasena: string; // Cambio de 'password' a 'contrasena'
  rol_id?: string; // UUID opcional
}

// Datos para cambio de contraseña
export interface ChangePasswordData {
  contrasena_actual: string; // Cambio de 'current_password'
  contrasena_nueva: string; // Cambio de 'new_password'
}

// Respuesta del perfil
export interface ProfileResponse {
  success: true;
  user: User;
}

// Respuesta de verificación de token
export interface VerifyTokenResponse {
  success: true;
  message: string;
  user: User;
}

