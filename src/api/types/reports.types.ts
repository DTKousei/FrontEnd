// ============================================
// INTERFACES DE DATOS - REPORTES (PYTHON)
// ============================================

export interface ReportExportRequest {
  mes: string;
  anio: string;
  area?: string;
  user_ids: string[];
}

export interface ReportType {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  code?: string; // Optional code for frontend mapping
  created_at?: string;
}

export interface ReportTypeCreate {
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface GeneratedReport {
  id: number;
  report_type_id?: number; // Optional if not linked
  report_type_name?: string; // Backend likely returns the name too
  usuario_id: number;
  fecha_generacion: string;
  filtros: any;
  parametros?: any;
  area?: string;
  archivo_path?: string;
  formato: string;
  estado: string; // 'COMPLETED', 'PENDING', 'FAILED'
}

// Response for GET /api/asistencias/reporte
export interface AttendanceMetricsResponse {
  rango: {
    inicio: string;
    fin: string;
  };
  totales: {
    puntual: number;
    tardanzas: number;
    faltas: number;
    horas_extras: number;
  };
  total_empleados: number;
  data: any[];
}
