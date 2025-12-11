// types/permisos.types.ts

/**
 * Tipos de permisos
 */
export interface TipoPermiso {
  id: string;
  nombre: string;
  codigo: string;
  descripcion: string;
  requiere_firma_institucion: boolean;
  tiempo_maximo_horas: number | null;
  esta_activo: boolean;
  creado_en: string;
  actualizado_en: string;
  _count?: {
    permisos: number;
  };
}

/**
 * Estados del permiso
 */
export interface Estado {
  id: string;
  nombre: string;
  codigo: string;
  descripcion: string;
  creado_en: string;
  actualizado_en: string;
}

/**
 * Permiso (Papeleta)
 */
export interface Permiso {
  id: string;
  empleado_id: string;
  tipo_permiso_id: string;
  estado_id: string;
  fecha_hora_inicio: string;
  fecha_hora_fin: string | null;
  hora_salida_calculada: string | null;
  motivo: string;
  justificacion: string;
  institucion_visitada: string | null;
  creado_en: string;
  actualizado_en: string;
  
  // Firmas tradicionales
  firma_solicitante?: string | null;
  firma_solicitante_en?: string | null;
  firma_jefe_area?: string | null;
  firma_jefe_area_en?: string | null;
  firma_rrhh?: string | null;
  firma_rrhh_en?: string | null;
  firma_institucion?: string | null;
  firma_institucion_en?: string | null;
  
  // Métodos de firma
  metodo_firma_solicitante?: 'base64' | 'onpe' | null;
  metodo_firma_jefe_area?: 'base64' | 'onpe' | null;
  metodo_firma_rrhh?: 'base64' | 'onpe' | null;
  metodo_firma_institucion?: 'base64' | 'onpe' | null;
  
  // Firmas digitales
  firma_solicitante_digital?: string | null;
  firma_jefe_area_digital?: string | null;
  firma_rrhh_digital?: string | null;
  firma_institucion_digital?: string | null;
  
  // Certificados
  certificado_solicitante?: CertificadoDigital | null;
  certificado_jefe_area?: CertificadoDigital | null;
  certificado_rrhh?: CertificadoDigital | null;
  certificado_institucion?: CertificadoDigital | null;
  
  // Validaciones
  firma_solicitante_validada?: boolean;
  firma_jefe_area_validada?: boolean;
  firma_rrhh_validada?: boolean;
  firma_institucion_validada?: boolean;
  
  // PDF
  pdf_firmado_path?: string | null;
  
  // Relaciones
  tipo_permiso?: {
    id?: string;
    nombre: string;
    codigo?: string;
    requiere_firma_institucion?: boolean;
    tiempo_maximo_horas?: number | null;
  };
  estado?: {
    id?: string;
    nombre: string;
    codigo?: string;
  };
}

/**
 * Certificado digital
 */
export interface CertificadoDigital {
  dni: string;
  nombre: string;
  entidad_emisora?: string;
  fecha_emision?: string;
  fecha_expiracion?: string;
  numero_serie?: string;
}

/**
 * Filtros para listar permisos
 */
export interface FiltrosPermisos {
  empleado_id?: string;
  tipo_permiso_id?: string;
  estado_id?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  page?: number;
  limit?: number;
}

/**
 * Respuesta paginada
 */
export interface RespuestaPaginada<T> {
  success: boolean;
  data: T[];
  total?: number;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Respuesta simple
 */
export interface RespuestaSimple<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Tipos de firma
 */
export type TipoFirma = 'solicitante' | 'jefe_area' | 'rrhh' | 'institucion';

/**
 * Datos para firmar tradicionalmente
 */
export interface FirmaTradicionalRequest {
  tipo_firma: TipoFirma;
  firma: string; // base64 image
}

/**
 * Datos para firma digital
 */
export interface FirmaDigitalRequest {
  tipo_firma: TipoFirma;
  firma_digital: string; // firma digital
  certificado: {
    dni: string;
    nombre: string;
    entidad_emisora?: string;
    fecha_emision?: string;
    fecha_expiracion?: string;
    numero_serie?: string;
  };
}

/**
 * Respuesta de verificación de firma
 */
export interface VerificacionFirma {
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
}

/**
 * Nuevo tipo de permiso
 */
export interface NuevoTipoPermiso {
  nombre: string;
  codigo: string;
  descripcion: string;
  requiere_firma_institucion: boolean;
  tiempo_maximo_horas: number | null;
  esta_activo: boolean;
}

/**
 * Nuevo permiso
 */
export interface NuevoPermiso {
  empleado_id: string;
  tipo_permiso_id: string;
  fecha_hora_inicio: string;
  fecha_hora_fin?: string;
  motivo: string;
  justificacion: string;
  institucion_visitada?: string;
}