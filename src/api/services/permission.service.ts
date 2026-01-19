import { papeletaApi as api } from '@/api/config';
import type {
  // Tipos de Permiso
  TipoPermisoResponse,
  TiposPermisoResponse,
  CreateTipoPermisoRequest,
  UpdateTipoPermisoRequest,
  
  // Estados
  // Estado, // Removed unused
  EstadoResponse,
  EstadosResponse,
  CreateEstadoRequest,
  UpdateEstadoRequest,
  
  // Permisos
  PermisoResponse,
  PermisosListResponse,
  CreatePermisoRequest,
  CreatePermisoPersonalRequest,
  CreateComisionServicioRequest,
  UpdatePermisoRequest,
  ListPermisosParams,
  
  // Firmas
  TipoFirma,
  FirmaBase64Request,
  FirmaDigitalRequest,
  VerificarFirmaResponse,
  
  // PDF
  UploadPDFResponse,
} from '@/api/types/permissions.types';

export const permissionService = {
  // ==============================
  // ENDPOINTS - TIPOS DE PERMISO
  // ==============================
  
  /**
   * Listar tipos de permisos
   * @param params - Filtros opcionales
   */
  getTiposPermiso(params?: { activo?: boolean }) {
    return api.get<TiposPermisoResponse>('/permiso-tipos', { params });
  },

  /**
   * Obtener tipo de permiso por ID
   */
  getTipoPermisoById(id: string) {
    return api.get<TipoPermisoResponse>(`/permiso-tipos/${id}`);
  },

  /**
   * Crear nuevo tipo de permiso
   */
  createTipoPermiso(data: CreateTipoPermisoRequest) {
    return api.post<TipoPermisoResponse>('/permiso-tipos', data);
  },

  /**
   * Editar un tipo de permiso
   */
  updateTipoPermiso(id: string, data: UpdateTipoPermisoRequest) {
    return api.put<TipoPermisoResponse>(`/permiso-tipos/${id}`, data);
  },

  /**
   * Eliminar un tipo de permiso
   */
  deleteTipoPermiso(id: string) {
    return api.delete<{ success: boolean; message: string }>(`/permiso-tipos/${id}`);
  },

  // ==============================
  // ENDPOINTS - ESTADOS
  // ==============================
  
  /**
   * Listar todos los estados
   */
  getEstados() {
    return api.get<EstadosResponse>('/estados');
  },

  /**
   * Verificar un estado (Obtener por ID)
   */
  getEstadoById(id: string) {
    return api.get<EstadoResponse>(`/estados/${id}`);
  },

  /**
   * Crear estado
   */
  createEstado(data: CreateEstadoRequest) {
    return api.post<EstadoResponse>('/estados', data);
  },

  /**
   * Actualizar estado
   */
  updateEstado(id: string, data: UpdateEstadoRequest) {
    return api.put<EstadoResponse>(`/estados/${id}`, data);
  },

  /**
   * Eliminar estado
   */
  deleteEstado(id: string) {
    return api.delete<{ success: boolean; message: string }>(`/estados/${id}`);
  },

  // ==============================
  // ENDPOINTS - PERMISOS (PAEPLETAS)
  // ==============================
  
  /**
   * Crear un nuevo permiso (personal o comisión de servicio)
   */
  createPermiso(data: CreatePermisoRequest) {
    return api.post<PermisoResponse>('/permisos', data);
  },

  /**
   * Crear permiso personal (conveniencia)
   */
  createPermisoPersonal(data: CreatePermisoPersonalRequest) {
    return this.createPermiso(data);
  },

  /**
   * Crear comisión de servicio (conveniencia)
   */
  createComisionServicio(data: CreateComisionServicioRequest) {
    return this.createPermiso(data);
  },

  /**
   * Listar permisos con filtros
   */
  getPermisos(params?: ListPermisosParams) {
    return api.get<PermisosListResponse>('/permisos', { params });
  },

  /**
   * Obtener permiso por ID
   */
  getPermisoById(id: string) {
    return api.get<PermisoResponse>(`/permisos/${id}`);
  },

  /**
   * Actualizar permiso
   */
  updatePermiso(id: string, data: UpdatePermisoRequest) {
    return api.put<PermisoResponse>(`/permisos/${id}`, data);
  },

  /**
   * Eliminar permiso
   */
  deletePermiso(id: string) {
    return api.delete<{ success: boolean; message: string }>(`/permisos/${id}`);
  },

  /**
   * Cambiar estado del permiso por código (ej: RECHAZADO, APROBADO)
   */
  cambiarEstado(id: string, codigoEstado: string) {
    return api.patch<PermisoResponse>(`/permisos/${id}/estado`, {
      codigo_estado: codigoEstado,
    });
  },

  // ==============================
  // ENDPOINTS - FIRMAS TRADICIONALES
  // ==============================
  
  /**
   * Firmar con imagen Base64
   */
  firmarPermiso(id: string, data: FirmaBase64Request) {
    return api.patch<PermisoResponse>(`/permisos/${id}/firmar`, data);
  },

  /**
   * Firmar como solicitante (Base64)
   */
  firmarComoSolicitante(id: string, firmaBase64: string) {
    return this.firmarPermiso(id, {
      tipo_firma: 'solicitante',
      firma: firmaBase64,
    });
  },

  /**
   * Firmar como jefe de área (Base64)
   */
  firmarComoJefeArea(id: string, firmaBase64: string) {
    return this.firmarPermiso(id, {
      tipo_firma: 'jefe_area',
      firma: firmaBase64,
    });
  },

  /**
   * Firmar como RRHH (Base64)
   */
  firmarComoRRHH(id: string, firmaBase64: string) {
    return this.firmarPermiso(id, {
      tipo_firma: 'rrhh',
      firma: firmaBase64,
    });
  },

  /**
   * Firmar como institución (Base64)
   */
  firmarComoInstitucion(id: string, firmaBase64: string) {
    return this.firmarPermiso(id, {
      tipo_firma: 'institucion',
      firma: firmaBase64,
    });
  },

  // ==============================
  // ENDPOINTS - FIRMAS DIGITALES ONPE
  // ==============================
  
  /**
   * Firmar con certificado digital ONPE
   */
  firmarDigitalmente(id: string, data: FirmaDigitalRequest) {
    return api.patch<PermisoResponse>(`/permisos/${id}/firmar-digital`, data);
  },

  /**
   * Firmar digitalmente como solicitante (ONPE)
   */
  firmarDigitalmenteSolicitante(id: string, data: Omit<FirmaDigitalRequest, 'tipo_firma'>) {
    return this.firmarDigitalmente(id, {
      tipo_firma: 'solicitante',
      ...data,
    });
  },

  /**
   * Firmar digitalmente como jefe de área (ONPE)
   */
  firmarDigitalmenteJefeArea(id: string, data: Omit<FirmaDigitalRequest, 'tipo_firma'>) {
    return this.firmarDigitalmente(id, {
      tipo_firma: 'jefe_area',
      ...data,
    });
  },

  /**
   * Firmar digitalmente como RRHH (ONPE)
   */
  firmarDigitalmenteRRHH(id: string, data: Omit<FirmaDigitalRequest, 'tipo_firma'>) {
    return this.firmarDigitalmente(id, {
      tipo_firma: 'rrhh',
      ...data,
    });
  },

  /**
   * Firmar digitalmente como institución (ONPE)
   */
  firmarDigitalmenteInstitucion(id: string, data: Omit<FirmaDigitalRequest, 'tipo_firma'>) {
    return this.firmarDigitalmente(id, {
      tipo_firma: 'institucion',
      ...data,
    });
  },

  /**
   * Verificar firma digital
   */
  verificarFirma(id: string, tipoFirma: TipoFirma) {
    return api.get<VerificarFirmaResponse>(`/permisos/${id}/verificar-firma/${tipoFirma}`);
  },

  // ==============================
  // ENDPOINTS - PDF
  // ==============================
  
  /**
   * Ver PDF ya generado (sin regenerar)
   */
  verPDF(id: string) {
    return api.get(`/permisos/${id}/pdf/ver`, {
      responseType: 'blob',
    });
  },

  /**
   * Generar y descargar PDF de la papeleta
   */
  generarPDF(id: string) {
    return api.get(`/permisos/${id}/pdf`, {
      responseType: 'blob',
    });
  },

  /**
   * Cargar PDF firmado físicamente
   */
  uploadPDF(id: string, pdfFile: File) {
    const formData = new FormData();
    formData.append('pdf', pdfFile, pdfFile.name);

    return api.post<UploadPDFResponse>(`/permisos/${id}/upload-pdf`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  /**
   * Registrar retorno del empleado
   * Actualiza la fecha de fin a la hora actual y regenera el PDF
   */
  async registrarRetorno(id: string) {
      /* Adjust timezone offset if necessary, but this creates ISO in local time representation approximately if we build it manually, 
         or just use new Date() and let backend handle it if it expects UTC.
         The previous implementation in modals used manual construction.
      */
      const d = new Date();
      const pad = (n: number) => (n < 10 ? "0" + n : n);
      // Construct ISO string in local time to preserve what user sees (roughly)
      const localIso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;

      await this.updatePermiso(id, { fecha_hora_fin: localIso });
      return this.generarPDF(id);
  },
};

// Interfaz opcional para el servicio completo
export interface PermissionService {
  // Tipos de Permiso
  getTiposPermiso(params?: { activo?: boolean }): Promise<{ data: TiposPermisoResponse }>;
  getTipoPermisoById(id: string): Promise<{ data: TipoPermisoResponse }>;
  createTipoPermiso(data: CreateTipoPermisoRequest): Promise<{ data: TipoPermisoResponse }>;
  
  // Estados
  getEstados(): Promise<{ data: EstadosResponse }>;
  
  // Permisos
  createPermiso(data: CreatePermisoRequest): Promise<{ data: PermisoResponse }>;
  createPermisoPersonal(data: CreatePermisoPersonalRequest): Promise<{ data: PermisoResponse }>;
  createComisionServicio(data: CreateComisionServicioRequest): Promise<{ data: PermisoResponse }>;
  getPermisos(params?: ListPermisosParams): Promise<{ data: PermisosListResponse }>;
  getPermisoById(id: string): Promise<{ data: PermisoResponse }>;
  
  // Firmas tradicionales
  firmarPermiso(id: string, data: FirmaBase64Request): Promise<{ data: PermisoResponse }>;
  firmarComoSolicitante(id: string, firmaBase64: string): Promise<{ data: PermisoResponse }>;
  firmarComoJefeArea(id: string, firmaBase64: string): Promise<{ data: PermisoResponse }>;
  firmarComoRRHH(id: string, firmaBase64: string): Promise<{ data: PermisoResponse }>;
  firmarComoInstitucion(id: string, firmaBase64: string): Promise<{ data: PermisoResponse }>;
  
  // Firmas digitales ONPE
  firmarDigitalmente(id: string, data: FirmaDigitalRequest): Promise<{ data: PermisoResponse }>;
  firmarDigitalmenteSolicitante(id: string, data: Omit<FirmaDigitalRequest, 'tipo_firma'>): Promise<{ data: PermisoResponse }>;
  firmarDigitalmenteJefeArea(id: string, data: Omit<FirmaDigitalRequest, 'tipo_firma'>): Promise<{ data: PermisoResponse }>;
  firmarDigitalmenteRRHH(id: string, data: Omit<FirmaDigitalRequest, 'tipo_firma'>): Promise<{ data: PermisoResponse }>;
  firmarDigitalmenteInstitucion(id: string, data: Omit<FirmaDigitalRequest, 'tipo_firma'>): Promise<{ data: PermisoResponse }>;
  verificarFirma(id: string, tipoFirma: TipoFirma): Promise<{ data: VerificarFirmaResponse }>;
  
  // PDF
  verPDF(id: string): Promise<{ data: Blob }>;
  generarPDF(id: string): Promise<{ data: Blob }>;
  uploadPDF(id: string, pdfFile: File): Promise<{ data: UploadPDFResponse }>;
}