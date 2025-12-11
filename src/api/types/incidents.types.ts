export interface TipoIncidencia {
  id: number;
  nombre: string;
  descripcion?: string;
  gravedad: 'leve' | 'moderada' | 'grave' | 'critica';
}

export interface Incidencia {
  id: number;
  titulo: string;
  descripcion: string;
  usuario_id: number; // El empleado involucrado
  reportado_por_id: number; // Quien reporta
  tipo_incidencia_id: number;
  fecha_incidencia: string;
  estado: 'pendiente' | 'en_proceso' | 'resuelta' | 'rechazada' | 'aprobada'; // "aprobada/rechazada" based on prompt PATCH
  archivos_adjuntos?: string[]; // URLs
}

export interface CreateIncidenciaDto {
  titulo: string;
  descripcion: string;
  usuario_id: number;
  tipo_incidencia_id: number;
  fecha_incidencia: string;
}

export interface UpdateIncidenciaDto extends Partial<CreateIncidenciaDto> {
  estado?: string;
}
