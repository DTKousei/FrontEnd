// ==============================
// TIPOS DE DATOS - API DE INCIDENCIAS
// ==============================

export interface IncidenciaEstado {
  id: string; // UUID
  nombre: string;
  descripcion?: string;
  incidencias?: Incidencia[];
}

export interface TipoIncidencia {
  id: string; // UUID
  nombre: string;
  codigo: string;
  requiere_aprobacion: boolean;
  requiere_documento: boolean;
  descuenta_salario: boolean;
  esta_activo: boolean;
  // New fields
  max_dias_anual?: number;
  max_solicitudes_anual?: number;
  toma_dias_calendario?: boolean;
  creado_en: string;
  incidencias?: Incidencia[];
}

export interface Incidencia {
  id: string; // UUID
  empleado_id: string;
  tipo_incidencia_id: string;
  fecha_inicio: string; // ISO 8601: YYYY-MM-DD
  fecha_fin: string; // ISO 8601: YYYY-MM-DD
  descripcion: string;
  url_documento: string;
  estado_id: string;
  aprobado_por: string | null;
  aprobado_en: string | null;
  motivo_rechazo: string | null;
  creado_en: string;
  tipo_incidencia?: {
    id: string;
    nombre: string;
    codigo: string;
    requiere_aprobacion?: boolean;
    requiere_documento?: boolean;
    descuenta_salario?: boolean;
    esta_activo?: boolean;
    max_dias_anual?: number;
    max_solicitudes_anual?: number;
    toma_dias_calendario?: boolean;
    creado_en?: string;
  };
  estado?: {
    id: string;
    nombre: string;
    descripcion?: string;
  };
}

export interface IncidenciaPaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IncidenciasResponse {
  data: Incidencia[];
  pagination: IncidenciaPaginationInfo;
}

// ==============================
// REQUEST DTOs
// ==============================

export interface CreateIncidenciaEstadoRequest {
  nombre: string;
  descripcion?: string;
}

export interface UpdateIncidenciaEstadoRequest {
  nombre?: string;
  descripcion?: string;
}

export interface CreateTipoIncidenciaRequest {
  nombre: string;
  codigo: string;
  requiere_aprobacion: boolean;
  requiere_documento: boolean;
  descuenta_salario: boolean;
  esta_activo: boolean;
  max_dias_anual?: number;
  max_solicitudes_anual?: number;
  toma_dias_calendario?: boolean;
}

export interface UpdateTipoIncidenciaRequest {
  nombre?: string;
  codigo?: string;
  requiere_aprobacion?: boolean;
  requiere_documento?: boolean;
  descuenta_salario?: boolean;
  esta_activo?: boolean;
  max_dias_anual?: number;
  max_solicitudes_anual?: number;
  toma_dias_calendario?: boolean;
}

export interface CreateIncidenciaRequest {
  empleado_id: string;
  tipo_incidencia_id: string;
  fecha_inicio: string; // YYYY-MM-DD
  fecha_fin: string; // YYYY-MM-DD
  descripcion: string;
  estado_id: string;
  documento: File; // PDF file
}

export interface UpdateIncidenciaRequest {
  empleado_id?: string;
  tipo_incidencia_id?: string;
  fecha_inicio?: string; // YYYY-MM-DD
  fecha_fin?: string; // YYYY-MM-DD
  descripcion?: string;
  estado_id?: string;
  documento?: File; // PDF file (opcional)
}

export interface AprobarIncidenciaRequest {
  aprobado_por: string;
}

export interface RechazarIncidenciaRequest {
  motivo_rechazo: string;
}

// ==============================
// RESPONSE DTOs
// ==============================

export interface IncidenciaEstadoResponse {
  message: string;
  data: IncidenciaEstado;
}

export interface IncidenciaEstadosResponse {
  data: IncidenciaEstado[];
}

export interface TipoIncidenciaResponse {
  message: string;
  data: TipoIncidencia;
}

export interface TiposIncidenciaResponse {
  data: TipoIncidencia[];
}

export interface IncidenciaResponse {
  message: string;
  data: Incidencia;
}

export interface IncidenciaErrorResponse {
  error: string;
  message: string;
  details?: Array<{
    msg: string;
    param: string;
    location: string;
  }>;
}

// ==============================
// FILTERS & PARAMS
// ==============================

export interface ListIncidenciasParams {
  page?: number;
  limit?: number;
  empleado_id?: string;
  estado_id?: string;
  tipo_incidencia_id?: string;
}

export interface ListTiposIncidenciaParams {
  esta_activo?: boolean;
}