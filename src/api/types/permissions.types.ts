// ==============================
// TIPOS DE DATOS - API DE PERMISOS
// ==============================

// ========== TIPOS DE PERMISO ==========

export interface TipoPermiso {
  id: string; // UUID
  nombre: string;
  codigo: string;
  descripcion?: string;
  requiere_firma_institucion: boolean;
  tiempo_maximo_horas: number | null;
  esta_activo: boolean;
  creado_en: string;
  actualizado_en: string;
  _count?: {
    permisos: number;
  };
}

export interface CreateTipoPermisoRequest {
  nombre: string;
  codigo: string;
  descripcion?: string;
  requiere_firma_institucion: boolean;
  tiempo_maximo_horas?: number | null;
  esta_activo?: boolean;
}

export interface UpdateTipoPermisoRequest {
  nombre?: string;
  codigo?: string;
  descripcion?: string;
  requiere_firma_institucion?: boolean;
  tiempo_maximo_horas?: number | null;
  esta_activo?: boolean;
}

export interface TipoPermisoResponse {
  success: boolean;
  data: TipoPermiso;
  message?: string;
}

export interface TiposPermisoResponse {
  success: boolean;
  data: TipoPermiso[];
  total: number;
}

// ========== ESTADOS ==========

export interface Estado {
  id: string; // UUID
  nombre: string;
  codigo: string;
  descripcion?: string;
  creado_en: string;
  actualizado_en: string;
}

export interface EstadosResponse {
  success: boolean;
  data: Estado[];
  total: number;
}

// ========== PERMISOS (PAEPLETAS) ==========

export interface Permiso {
  id: string; // UUID
  empleado_id: string; // DNI (7-9 dígitos)
  tipo_permiso_id: string;
  estado_id: string;
  fecha_hora_inicio: string; // ISO 8601
  fecha_hora_fin?: string | null; // ISO 8601 (opcional)
  hora_salida_calculada?: string | null; // ISO 8601 (calculado)
  motivo: string;
  justificacion?: string | null;
  institucion_visitada?: string | null;
  
  // Firmas tradicionales (Base64)
  firma_solicitante?: string | null;
  firma_jefe_area?: string | null;
  firma_rrhh?: string | null;
  firma_institucion?: string | null;
  
  // Fechas de firmas tradicionales
  firma_solicitante_en?: string | null;
  firma_jefe_area_en?: string | null;
  firma_rrhh_en?: string | null;
  firma_institucion_en?: string | null;
  
  // Métodos de firma
  metodo_firma_solicitante?: 'base64' | 'onpe' | null;
  metodo_firma_jefe_area?: 'base64' | 'onpe' | null;
  metodo_firma_rrhh?: 'base64' | 'onpe' | null;
  metodo_firma_institucion?: 'base64' | 'onpe' | null;
  
  // Firmas digitales ONPE
  firma_solicitante_digital?: string | null;
  firma_jefe_area_digital?: string | null;
  firma_rrhh_digital?: string | null;
  firma_institucion_digital?: string | null;
  
  // Certificados digitales
  certificado_solicitante?: {
    dni: string;
    nombre: string;
    entidad_emisora?: string;
    fecha_emision?: string;
    fecha_expiracion?: string;
    numero_serie?: string;
  } | null;
  certificado_jefe_area?: {
    dni: string;
    nombre: string;
    entidad_emisora?: string;
    fecha_emision?: string;
    fecha_expiracion?: string;
    numero_serie?: string;
  } | null;
  certificado_rrhh?: {
    dni: string;
    nombre: string;
    entidad_emisora?: string;
    fecha_emision?: string;
    fecha_expiracion?: string;
    numero_serie?: string;
  } | null;
  certificado_institucion?: {
    dni: string;
    nombre: string;
    entidad_emisora?: string;
    fecha_emision?: string;
    fecha_expiracion?: string;
    numero_serie?: string;
  } | null;
  
  // Validación de firmas
  firma_solicitante_validada?: boolean | null;
  firma_jefe_area_validada?: boolean | null;
  firma_rrhh_validada?: boolean | null;
  firma_institucion_validada?: boolean | null;
  
  // Documento y PDF
  documento_hash?: string | null;
  pdf_firmado_path?: string | null;
  
  // Timestamps
  creado_en: string;
  actualizado_en: string;
  
  // Relaciones
  tipo_permiso?: {
    id: string;
    nombre: string;
    codigo: string;
    requiere_firma_institucion?: boolean;
    tiempo_maximo_horas?: number | null;
  };
  estado?: {
    id: string;
    nombre: string;
    codigo: string;
  };
}

export interface CreatePermisoPersonalRequest {
  empleado_id: string; // DNI
  tipo_permiso_id: string;
  fecha_hora_inicio: string; // ISO 8601: "2024-12-03T14:00:00"
  fecha_hora_fin: string; // ISO 8601: "2024-12-03T16:00:00"
  motivo: string;
  justificacion?: string;
}

export interface CreateComisionServicioRequest {
  empleado_id: string; // DNI
  tipo_permiso_id: string;
  fecha_hora_inicio: string; // ISO 8601
  motivo: string;
  justificacion: string;
  institucion_visitada: string;
  fecha_hora_fin?: string; // ISO 8601 (opcional)
}

export type CreatePermisoRequest = CreatePermisoPersonalRequest | CreateComisionServicioRequest;

export interface PermisoResponse {
  success: boolean;
  message: string;
  data: Permiso;
  firmas_completas?: boolean;
  certificado?: any;
  qr_verificacion?: string;
  url_verificacion?: string;
}

export interface PermisosListResponse {
  success: boolean;
  data: Permiso[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ListPermisosParams {
  empleado_id?: string;
  tipo_permiso_id?: string;
  estado_id?: string;
  fecha_desde?: string; // ISO 8601
  fecha_hasta?: string; // ISO 8601
  page?: number;
  limit?: number;
}

// ========== FIRMAS ==========

export type TipoFirma = 'solicitante' | 'jefe_area' | 'rrhh' | 'institucion';

export interface FirmaBase64Request {
  tipo_firma: TipoFirma;
  firma: string; // Base64: "data:image/png;base64,iVBORw0KGgoAAA..."
}

export interface FirmaDigitalRequest {
  tipo_firma: TipoFirma;
  firma_digital: string; // Firma digital
  certificado: {
    dni: string;
    nombre: string;
    entidad_emisora?: string;
    fecha_emision?: string;
    fecha_expiracion?: string;
    numero_serie?: string;
  };
}

export interface VerificarFirmaResponse {
  success: boolean;
  data: {
    permiso_id: string;
    tipo_firma: TipoFirma;
    metodo_firma: 'base64' | 'onpe';
    validada: boolean;
    firmante: {
      nombre: string;
      dni: string;
      cargo: string;
    };
    certificado?: {
      entidad_emisora: string;
      numero_serie: string;
      vigente_desde: string;
      vigente_hasta: string;
    };
    fecha_firma: string;
    documento_hash: string;
    permiso: {
      empleado_id: string;
      tipo_permiso: string;
      estado: string;
      fecha_inicio: string;
    };
  };
}

// ========== PDF ==========

export interface UploadPDFResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    pdf_firmado_path: string;
  };
  archivo?: {
    nombre: string;
    ruta: string;
    tamano: number;
  };
}

// ========== PAGINACIÓN ==========

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ========== ERRORES ==========

export interface ApiError {
  success: false;
  error: string;
  details?: Array<{
    msg: string;
    param: string;
    location: string;
  }>;
}