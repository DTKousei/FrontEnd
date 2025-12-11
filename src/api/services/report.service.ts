import { reportApi as api } from '@/api/config';
import type { PlantillaReporte, ReporteGenerado, GenerateReportDto } from '@/api/types/reports.types';

export const reportService = {
  // --- Templates ---
  getTemplateTypes() {
    return api.get<string[]>('/plantillas/tipos');
  },
  getAllTemplates() {
    return api.get<PlantillaReporte[]>('/plantillas');
  },
  getTemplateById(id: number) {
    return api.get<PlantillaReporte>(`/plantillas/${id}`);
  },
  createTemplate(data: Partial<PlantillaReporte>) {
    return api.post<PlantillaReporte>('/plantillas', data);
  },
  updateTemplate(id: number, data: Partial<PlantillaReporte>) {
    return api.put<PlantillaReporte>(`/plantillas/${id}`, data);
  },
  deleteTemplate(id: number) {
    return api.delete(`/plantillas/${id}`);
  },

  // --- Reports ---
  generate(data: GenerateReportDto) {
    return api.post<ReporteGenerado>('/reportes/generar', data);
  },
  generateSummary(data: GenerateReportDto) {
    return api.post<ReporteGenerado>('/reportes/generar-resumen', data);
  },
  getReportById(id: number) {
    return api.get<ReporteGenerado>(`/reportes/${id}`);
  },
  listEmployeeReports(params?: { empleado_id: number }) {
    return api.get<ReporteGenerado[]>('/reportes/empleado/lista', { params });
  },
  downloadReport(id: number) {
    return api.get(`/reportes/${id}/descargar`, { responseType: 'blob' });
  },
  deleteReport(id: number) {
    return api.delete(`/reportes/${id}`);
  }
};
