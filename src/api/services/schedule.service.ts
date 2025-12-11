import { biometricApi as api } from '@/api/config';
import type { 
  Schedule, 
  CreateScheduleData, 
  UpdateScheduleData 
} from '@/api/types/schedules.types';

export const scheduleService = {
  // GET /api/horarios
  getAll() {
    return api.get<Schedule[]>('/horarios');
  },

  // GET /api/horarios/{id}
  getById(id: number) {
    return api.get<Schedule>(`/horarios/${id}`);
  },

  // POST /api/horarios
  create(data: CreateScheduleData) {
    return api.post<Schedule>('/horarios', data);
  },

  // PUT /api/horarios/{id}
  update(id: number, data: UpdateScheduleData) {
    return api.put<Schedule>(`/horarios/${id}`, data);
  },

  // DELETE /api/horarios/{id}
  delete(id: number) {
    return api.delete<{ message: string }>(`/horarios/${id}`);
  }
};
