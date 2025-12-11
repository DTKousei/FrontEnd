// Estructura del dispositivo biométrico
export interface Device {
  id: number;
  nombre: string;
  ip_address: string;
  puerto: number;
  ubicacion?: string;
  activo: boolean;
  fecha_creacion: string; // ISO timestamp
  fecha_actualizacion: string; // ISO timestamp
}

// Datos para crear un dispositivo
export interface CreateDeviceData {
  nombre: string;
  ip_address: string;
  puerto: number;
  ubicacion?: string;
  password?: number;
  timeout?: number;
  activo?: boolean;
}

// Datos para actualizar un dispositivo
export interface UpdateDeviceData {
  nombre?: string;
  ip_address?: string;
  puerto?: number;
  ubicacion?: string;
  password?: number;
  timeout?: number;
  activo?: boolean;
}

// Información del dispositivo al probar conexión
export interface DeviceConnectionInfo {
  serial_number: string;
  firmware_version: string;
  platform: string;
  ip_address: string;
  puerto: number;
  hora_dispositivo: string; // ISO timestamp
}

// Respuesta de prueba de conexión
export interface TestConnectionResponse {
  success: boolean;
  message: string;
  info?: DeviceConnectionInfo;
}

// Estado de sincronización de un dispositivo
export interface DeviceSyncStatus {
  id: number;
  nombre: string;
  ip_address: string;
  ultima_sincronizacion: string; // ISO timestamp
  minutos_desde_sync: number;
  activo: boolean;
}

// Respuesta del estado de sincronización general
export interface SyncStatusResponse {
  total_dispositivos: number;
  dispositivos: DeviceSyncStatus[];
}

// Respuesta de sincronización de hora
export interface SyncTimeResponse {
  success: boolean;
  message: string;
  hora_anterior?: string; // ISO timestamp
  hora_nueva?: string; // ISO timestamp
  hora_sistema?: string; // ISO timestamp
}

// Respuesta genérica de dispositivos
export interface DeviceResponse {
  success: boolean;
  message?: string;
  data?: Device;
}