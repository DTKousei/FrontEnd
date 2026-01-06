import { pythonReportApi } from '@/api/config';
import type { ReportExportRequest, AttendanceMetricsResponse } from '@/api/types/reports.types';

export const reportService = {
  // --- Metrics ---
  getAttendanceMetrics(fecha_inicio: string, fecha_fin: string) {
    return pythonReportApi.get<AttendanceMetricsResponse>('/asistencias/reporte', {
      params: { fecha_inicio, fecha_fin }
    });
  },

  // --- Python Exports (Port 8001) ---
  exportPdf(data: ReportExportRequest) {
    return pythonReportApi.post('/reports/export/pdf', data, {
      responseType: 'blob'
    });
  },
  
  exportExcel(data: ReportExportRequest) {
    return pythonReportApi.post('/reports/export/excel', data, {
      responseType: 'blob'
    });
  },

  // --- Generated Reports Management ---
  listGenerated() {
    return pythonReportApi.get('/reports/generated/');
  },

  deleteGenerated(id: number) {
    return pythonReportApi.delete(`/reports/generated/${id}`);
  },

  downloadGenerated(id: number, format: 'PDF' | 'EXCEL' = 'PDF') {
    return pythonReportApi.get(`/reports/generated/${id}`, {
      params: { format },
      responseType: 'blob'
    });
  },

  // --- Report Types Management ---
  getTypes() {
    return pythonReportApi.get('/report-types');
  },

  createType(data: { nombre: string; descripcion: string; activo: boolean }) {
    return pythonReportApi.post('/report-types', data);
  },

  updateType(id: number, data: { nombre: string; descripcion: string; activo: boolean }) {
    return pythonReportApi.put(`/report-types/${id}`, data);
  },

  deleteType(id: number) {
    return pythonReportApi.delete(`/report-types/${id}`);
  }
};
