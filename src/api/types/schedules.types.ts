// ============================================
// INTERFACES DE DATOS - GESTIÓN DE HORARIOS
// ============================================

/**
 * Días de la semana válidos
 */
export type DiaSemana = 
  | 'lunes'
  | 'martes'
  | 'miercoles'
  | 'jueves'
  | 'viernes'
  | 'sabado'
  | 'domingo';

/**
 * Representa un horario laboral en el sistema
 */
export interface Schedule {
  id: number;
  nombre: string;
  descripcion?: string;
  hora_entrada: string; // Formato: "HH:MM:SS"
  hora_salida: string; // Formato: "HH:MM:SS"
  dias_semana: DiaSemana[];
  tolerancia_entrada: number; // Minutos
  tolerancia_salida: number; // Minutos
  activo: boolean;
  fecha_creacion?: string; // ISO timestamp
  fecha_actualizacion?: string; // ISO timestamp
}

/**
 * Datos requeridos para crear un nuevo horario
 */
export interface CreateScheduleData {
  nombre: string;
  descripcion?: string;
  hora_entrada: string; // Formato: "HH:MM:SS"
  hora_salida: string; // Formato: "HH:MM:SS"
  dias_semana: DiaSemana[];
  tolerancia_entrada: number;
  tolerancia_salida: number;
  activo?: boolean;
}

/**
 * Datos para actualizar un horario existente
 */
export interface UpdateScheduleData {
  nombre?: string;
  descripcion?: string;
  hora_entrada?: string;
  hora_salida?: string;
  dias_semana?: DiaSemana[];
  tolerancia_entrada?: number;
  tolerancia_salida?: number;
  activo?: boolean;
}

/**
 * Parámetros de consulta para listar horarios
 */
export interface ScheduleQueryParams {
  activo?: boolean;
  limit?: number;
  offset?: number;
}



/**
 * Helper: Array con todos los días de la semana
 */
export const DIAS_SEMANA: DiaSemana[] = [
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
  'domingo',
];

/**
 * Helper: Días laborales típicos (Lunes a Viernes)
 */
export const DIAS_LABORALES: DiaSemana[] = [
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
];

/**
 * Helper: Fin de semana
 */
export const FIN_DE_SEMANA: DiaSemana[] = ['sabado', 'domingo'];