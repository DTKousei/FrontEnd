// ============================================
// INTERFACES DE DATOS - GESTIÓN DE ASISTENCIAS
// ============================================

/**
 * Estado del registro de asistencia
 */
export enum AttendanceStatus {
  CHECK_IN_OUT = 0,
}

/**
 * Tipo de marcación (punch)
 */
export enum PunchType {
  NORMAL = 0,
  OVERTIME = 1,
  EARLY_DEPARTURE = 2,
  LATE_ARRIVAL = 3,
}

/**
 * Tipo literal para status
 */
export type AttendanceStatusType = 0;

/**
 * Tipo literal para punch
 */
export type PunchTypeValue = 0 | 1 | 2 | 3;

/**
 * Representa un registro de asistencia
 */
export interface Attendance {
  id: number;
  user_id: string;
  dispositivo_id: number;
  timestamp: string; // ISO timestamp
  status: AttendanceStatusType;
  punch: PunchTypeValue;
  sincronizado: boolean;
  fecha_sincronizacion?: string; // ISO timestamp
}

/**
 * Datos para crear un registro de asistencia manual
 */
export interface CreateAttendanceData {
  user_id: string;
  dispositivo_id: number;
  timestamp: string;
  status?: AttendanceStatusType;
  punch?: PunchTypeValue;
}

/**
 * Respuesta de sincronización de asistencias desde un dispositivo
 */
export interface SyncAttendanceResponse {
  success: boolean;
  message: string;
  registros_nuevos: number;
  registros_totales: number;
  dispositivo_id: number;
}

/**
 * Resultado de sincronización por dispositivo
 */
export interface DeviceSyncResult {
  dispositivo_id: number;
  dispositivo_nombre: string;
  success: boolean;
  registros_nuevos: number;
  registros_totales: number;
}

/**
 * Respuesta de sincronización de todos los dispositivos
 */
export interface SyncAllDevicesResponse {
  total_dispositivos: number;
  resultados: DeviceSyncResult[];
}

/**
 * Parámetros de consulta para listar asistencias
 */
export interface AttendanceQueryParams {
  fecha_inicio?: string; // ISO timestamp
  fecha_fin?: string; // ISO timestamp
  user_id?: string;
  dispositivo_id?: number;
  limit?: number;
  offset?: number;
}

/**
 * Parámetros para obtener asistencias en tiempo real
 */
export interface RealTimeAttendanceParams {
  ultimos_minutos?: number; // Default: 5
}

/**
 * Respuesta del contador de asistencias
 */
export interface AttendanceCountResponse {
  total: number;
}



/**
 * Helper: Descripción de tipos de punch
 */
export const PUNCH_TYPE_LABELS: Record<PunchTypeValue, string> = {
  0: 'Marcación Normal',
  1: 'Horas Extras',
  2: 'Salida Temprana',
  3: 'Llegada Tarde',
};

/**
 * Helper: Descripción de status
 */
export const STATUS_LABELS: Record<AttendanceStatusType, string> = {
  0: 'Check-in / Check-out',
};