export interface PlantillaReporte {
  id: number;
  nombre: string;
  tipo: string;
  descripcion?: string;
  configuracion_json: string; // JSON string with columns, filters logic
  activo: boolean;
}

export interface ReporteGenerado {
  id: number;
  nombre: string;
  tipo: string;
  fecha_generacion: string;
  generado_por_id: number;
  url_archivo: string;
  formato: 'pdf' | 'excel' | 'csv';
  parametros_usados?: string;
}

export interface GenerateReportDto {
  plantilla_id?: number;
  tipo_reporte: string;
  fecha_inicio: string;
  fecha_fin: string;
  usuarios_ids?: number[];
  formato: 'pdf' | 'excel';
}
