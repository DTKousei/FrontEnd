import { biometricApi as api } from '@/api/config';
import type { 
  Attendance, 
  AttendanceQueryParams, 
  AttendanceCountResponse,
  SyncAttendanceResponse,
  SyncAllDevicesResponse
} from '@/api/types/attendance.types';
import type { PaginatedResponse } from '@/api/types/common.types';

export const attendanceService = {
  // GET /api/asistencias
  getAll(params?: AttendanceQueryParams) {
    return api.get<PaginatedResponse<Attendance>>('/asistencias', { params });
  },

  // GET /api/asistencias/count
  getStats() {
    return api.get<AttendanceCountResponse>('/asistencias/count');
  },

  // GET /api/asistencias/tiempo-real/{dispositivo_id}
  getRealTime(dispositivoId: number) {
    return api.get<Attendance[]>(`/asistencias/tiempo-real/${dispositivoId}`);
  },

  // POST /api/asistencias/sincronizar/{dispositivo_id}
  syncDevice(dispositivoId: number) {
    return api.post<SyncAttendanceResponse>(`/asistencias/sincronizar/${dispositivoId}`);
  },

  // POST /api/asistencias/sincronizar-hoy/{dispositivo_id}
  syncToday(dispositivoId: number) {
    return api.post<SyncAttendanceResponse>(`/asistencias/sincronizar-hoy/${dispositivoId}`);
  },

  // POST /api/asistencias/sincronizar-todos
  syncAll() {
    return api.post<SyncAllDevicesResponse>(`/asistencias/sincronizar-todos`);
  },

  // DELETE /api/asistencias/{dispositivo_id}/limpiar
  clearDevice(dispositivoId: number) {
    return api.delete<{ message: string }>(`/asistencias/${dispositivoId}/limpiar`);
  },

  // GET /api/asistencias/reporte
  getDailyReport(params: { fecha_inicio: string; fecha_fin: string }) {
    return api.get<any[]>('/asistencias/reporte', { params });
  },

  // POST /api/asistencias/calcular
  calculateAttendance(params: { fecha_inicio: string; fecha_fin: string }) {
    return api.post<{ message: string }>('/asistencias/calcular', {}, { params });
  },

  // POST /api/asistencias/registrar
  registerAttendance(data: { tipo: string; empleado_id: string; fecha_hora: string }) {
    return api.post<{ message: string }>('/asistencias/registrar', data);
  },

  // GET /api/asistencias/usuario/{user_id}/diario
  getUserDailyReport(userId: string, params: { fecha_inicio: string; fecha_fin: string }) {
    return api.get<{ resumen: any; detalle: any[] }>(`/asistencias/usuario/${userId}/diario`, { params });
  }
};
