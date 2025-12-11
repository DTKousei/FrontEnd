import { incidentApi as api } from '@/api/config';
import type { Incidencia, CreateIncidenciaDto, UpdateIncidenciaDto, TipoIncidencia } from '@/api/types/incidents.types';

export const incidentService = {
  // --- Incidents ---
  getAll() {
    return api.get<Incidencia[]>('/incidencias');
  },
  getById(id: number) {
    return api.get<Incidencia>(`/incidencias/${id}`);
  },
  create(data: CreateIncidenciaDto) {
    return api.post<Incidencia>('/incidencias', data);
  },
  update(id: number, data: UpdateIncidenciaDto) {
    return api.put<Incidencia>(`/incidencias/${id}`, data);
  },
  delete(id: number) {
    return api.delete(`/incidencias/${id}`);
  },

  // --- Actions ---
  approve(id: number) {
    return api.patch<Incidencia>(`/incidencias/${id}/aprobar`);
  },
  reject(id: number) {
    return api.patch<Incidencia>(`/incidencias/${id}/rechazar`);
  },

  // --- Types ---
  getAllTypes() {
    return api.get<TipoIncidencia[]>('/tipos-incidencia');
  },
  createType(data: { nombre: string }) {
    return api.post<TipoIncidencia>('/tipos-incidencia', data);
  }
};
