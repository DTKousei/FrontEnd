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
  0: 'Lunes',
  1: 'Martes',
  2: 'Miércoles',
  3: 'Jueves',
  4: 'Viernes',
  5: 'Sábado',
  6: 'Domingo'
};

export const LISTA_DIAS = [
  { id: 0, nombre: 'Lunes' },
  { id: 1, nombre: 'Martes' },
  { id: 2, nombre: 'Miércoles' },
  { id: 3, nombre: 'Jueves' },
  { id: 4, nombre: 'Viernes' },
  { id: 5, nombre: 'Sábado' },
  { id: 6, nombre: 'Domingo' },
];

/**
 * Payload para crear un segmento individual
 * POST /api/horarios/segmentos/
 */
export interface CreateSegmentData {
  horario_id: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  tolerancia_minutos: number;
  orden_turno: number;
}

/**
 * Payload para actualizar un segmento
 * PUT /api/horarios/segmentos/{id}
 */
export interface UpdateSegmentData {
  hora_inicio?: string;
  hora_fin?: string;
  tolerancia_minutos?: number;
  orden_turno?: number;
  // Nota: dia_semana y horario_id usualmente no se cambian al editar un segmento específico, 
  // pero si la API lo permite, se agregarían aquí. Según docs: hora_inicio, tolerancia.
}

/**
 * Representa un feriado
 */
export interface Holiday {
  id: number;
  fecha: string; // YYYY-MM-DD
  nombre: string;
  tipo: 'FERIADO' | 'NO_LABORABLE';
  repetir_anual?: boolean;
}

/**
 * Payload para crear un feriado
 * POST /api/horarios/feriados/
 */
export interface CreateHolidayData {
  fecha: string;
  nombre: string;
  tipo: 'FERIADO' | 'NO_LABORABLE';
  repetir_anual?: boolean;
}