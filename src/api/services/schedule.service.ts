import { biometricApi as api } from '@/api/config';
import type { 
  Schedule, 
  CreateScheduleData, 
  UpdateScheduleData,
  CreateSegmentBulk,
  AssignSchedule,
  ScheduleSegment
} from '@/api/types/schedules.types';

export const scheduleService = {
  // Obtener todos los horarios (Cabeceras)
  // GET /api/horarios
  getAll() {
    return api.get<Schedule[]>('/horarios/');
  },

  // Obtener horario por ID
  // GET /api/horarios/{id}
  getById(id: number) {
    return api.get<Schedule>(`/horarios/${id}`);
  },

  // Crear nuevo horario (Cabecera)
  // POST /api/horarios
  create(data: CreateScheduleData) {
    return api.post<Schedule>('/horarios/', data);
  },

  // Actualizar horario
  // PUT /api/horarios/{id}
  update(id: number, data: UpdateScheduleData) {
    return api.put<Schedule>(`/horarios/${id}/`, data);
  },

  // Eliminar horario
  // DELETE /api/horarios/{id}
  delete(id: number) {
    return api.delete<{ message: string }>(`/horarios/${id}/`);
  },

  // -------------------------------------------------------------
  // SEGMENTOS (TURNOS DETALLADOS)
  // -------------------------------------------------------------

  // Crear segmentos masivamente (Bulk)
  // POST /api/horarios/segmentos/bulk
  createSegmentsBulk(data: CreateSegmentBulk) {
    return api.post<{ message: string; segments: ScheduleSegment[] }>('/horarios/segmentos/bulk', data);
  },

  // Obtener segmentos de un horario específico
  // GET /api/horarios/{id}/segmentos (Inferido como necesario)
  getSegments(horarioId: number) {
    return api.get<ScheduleSegment[]>(`/horarios/${horarioId}/segmentos`);
  },

  // -------------------------------------------------------------
  // ASIGNACIONES
  // -------------------------------------------------------------

  // Asignar horario a usuario
  // POST /api/horarios/asignar
  assignToUser(data: AssignSchedule) {
    return api.post<{ message: string; assignment_id: number }>('/horarios/asignar', data);
  },
  
  // Obtener asignación actual de un usuario (Opcional/Inferido)
  // GET /api/horarios/asignaciones/usuario/{id}
  getUserAssignment(userId: string | number) {
    return api.get<any>(`/horarios/asignaciones/usuario/${userId}`);
  }
};
