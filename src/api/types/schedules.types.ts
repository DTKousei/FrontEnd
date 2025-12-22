// ============================================
// INTERFACES DE DATOS - GESTIÓN DE HORARIOS
// ============================================

/**
 * Representa la metadata de un horario (Cabecera)
 * Coincide con GET /api/horarios
 */
export interface Schedule {
  id: number;
  nombre: string;
  descripcion?: string; // "Turno partido", etc.
  activo: boolean;
  fecha_creacion?: string; // ISO timestamp
  fecha_actualizacion?: string; // ISO timestamp
  // Propiedades opcionales para vistas detalladas
  segmentos?: ScheduleSegment[]; 
}

/**
 * Datos para crear un nuevo horario (Cabecera)
 */
export interface CreateScheduleData {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

/**
 * Datos para actualizar un horario
 */
export interface UpdateScheduleData {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
}

/**
 * Representa un segmento de horario (Turno detallado)
 */
export interface ScheduleSegment {
  id?: number;
  horario_id: number;
  dias_semana: number[]; // [1, 2, 3, 4, 5] -> Lunes a Viernes
  hora_inicio: string; // HH:MM:SS
  hora_fin: string; // HH:MM:SS
  tolerancia_minutos: number;
  orden_turno: number; // 1, 2, 3...
}

/**
 * Payload para creación masiva de segmentos
 * POST /api/horarios/segmentos/bulk
 */
export interface CreateSegmentBulk {
  horario_id: number;
  dias_semana: number[]; // Array de índices de días (ej. 1=Lunes)
  hora_inicio: string;
  hora_fin: string;
  tolerancia_minutos: number;
  orden_turno: number;
}

/**
 * Payload para asignar horario a usuario
 * POST /api/horarios/asignar
 */
export interface AssignSchedule {
  user_id: string | number; // ID del usuario (puede ser DNI string o ID numérico)
  horario_id: number;
  fecha_inicio: string; // YYYY-MM-DD o ISO
  fecha_fin?: string; // Opcional
}

/**
 * Respuesta genérica de éxito/mensaje
 */
export interface ScheduleResponse {
  message: string;
  data?: any;
}

// ------------------------------------
// HELPERS Y CONSTANTES
// ------------------------------------

export const DIAS_SEMANA_MAP: Record<number, string> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
  7: 'Domingo'
};

export const LISTA_DIAS = [
  { id: 1, nombre: 'Lunes' },
  { id: 2, nombre: 'Martes' },
  { id: 3, nombre: 'Miércoles' },
  { id: 4, nombre: 'Jueves' },
  { id: 5, nombre: 'Viernes' },
  { id: 6, nombre: 'Sábado' },
  { id: 7, nombre: 'Domingo' },
];