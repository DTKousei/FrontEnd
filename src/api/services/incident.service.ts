import { incidentApi as api } from '@/api/config';
import type {
  // Estados
  IncidenciaEstado,
  IncidenciaEstadoResponse,
  IncidenciaEstadosResponse,
  CreateIncidenciaEstadoRequest,
  UpdateIncidenciaEstadoRequest,
  
  // Tipos de Incidencia
  TipoIncidencia,
  TipoIncidenciaResponse,
  TiposIncidenciaResponse,
  CreateTipoIncidenciaRequest,
  UpdateTipoIncidenciaRequest,
  ListTiposIncidenciaParams,
  
  // Incidencias
  Incidencia,
  IncidenciaResponse,
  IncidenciasResponse,
  CreateIncidenciaRequest,
  UpdateIncidenciaRequest,
  ListIncidenciasParams,
  
  // Acciones
  AprobarIncidenciaRequest,
  RechazarIncidenciaRequest,
} from '@/api/types/incidents.types';

export const incidentService = {
  // ==============================
  // ENDPOINTS - ESTADOS
  // ==============================
  
  /**
   * Listar todos los estados
   */
  getAllEstados() {
    return api.get<IncidenciaEstadosResponse>('/estados');
  },

  /**
   * Obtener un estado por ID
   */
  getEstadoById(id: string) {
    return api.get<{ data: IncidenciaEstado }>(`/estados/${id}`);
  },

  /**
   * Crear un nuevo estado
   */
  createEstado(data: CreateIncidenciaEstadoRequest) {
    return api.post<IncidenciaEstadoResponse>('/estados', data);
  },

  /**
   * Actualizar un estado
   */
  updateEstado(id: string, data: UpdateIncidenciaEstadoRequest) {
    return api.put<IncidenciaEstadoResponse>(`/estados/${id}`, data);
  },

  /**
   * Eliminar un estado
   */
  deleteEstado(id: string) {
    return api.delete<{ message: string }>(`/estados/${id}`);
  },

  // ==============================
  // ENDPOINTS - TIPOS DE INCIDENCIA
  // ==============================
  
  /**
   * Listar tipos de incidencia
   * @param params - Filtros opcionales
   */
  getAllTiposIncidencia(params?: ListTiposIncidenciaParams) {
    return api.get<TiposIncidenciaResponse>('/tipos-incidencia', { params });
  },

  /**
   * Obtener un tipo de incidencia por ID
   */
  getTipoIncidenciaById(id: string) {
    return api.get<{ data: TipoIncidencia }>(`/tipos-incidencia/${id}`);
  },

  /**
   * Crear un nuevo tipo de incidencia
   */
  createTipoIncidencia(data: CreateTipoIncidenciaRequest) {
    return api.post<TipoIncidenciaResponse>('/tipos-incidencia', data);
  },

  /**
   * Actualizar un tipo de incidencia
   */
  updateTipoIncidencia(id: string, data: UpdateTipoIncidenciaRequest) {
    return api.put<TipoIncidenciaResponse>(`/tipos-incidencia/${id}`, data);
  },

  /**
   * Eliminar un tipo de incidencia
   */
  deleteTipoIncidencia(id: string) {
    return api.delete<{ message: string }>(`/tipos-incidencia/${id}`);
  },

  // ==============================
  // ENDPOINTS - INCIDENCIAS
  // ==============================
  
  /**
   * Listar incidencias con paginación y filtros
   * @param params - Parámetros de paginación y filtros
   */
  getAllIncidencias(params?: ListIncidenciasParams) {
    return api.get<IncidenciasResponse>('/incidencias', { params });
  },

  /**
   * Obtener una incidencia por ID
   */
  getIncidenciaById(id: string) {
    return api.get<{ data: Incidencia }>(`/incidencias/${id}`);
  },


  /**
   * Obtener el documento de una incidencia (Blob)
   */
  getIncidenciaDocumento(id: string) {
    return api.get(`/incidencias/${id}/documento`, {
      responseType: 'blob',
    });
  },

  /**
   * Crear una nueva incidencia con archivo PDF
   */
  createIncidencia(data: CreateIncidenciaRequest) {
    const formData = new FormData();
    
    // Agregar campos al FormData
    formData.append('empleado_id', data.empleado_id);
    formData.append('tipo_incidencia_id', data.tipo_incidencia_id);
    formData.append('fecha_inicio', data.fecha_inicio);
    formData.append('fecha_fin', data.fecha_fin);
    formData.append('descripcion', data.descripcion);
    formData.append('estado_id', data.estado_id);
    
    // El archivo es obligatorio en la creación según el tipo, pero manejamos si existe por seguridad
    if (data.documento instanceof File) {
      formData.append('documento', data.documento, data.documento.name);
    }

    return api.post<IncidenciaResponse>('/incidencias', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Actualizar una incidencia
   * @param id - ID de la incidencia
   * @param data - Datos a actualizar (archivo PDF opcional)
   */
  updateIncidencia(id: string, data: UpdateIncidenciaRequest) {
    const formData = new FormData();
    
    // Agregar solo los campos proporcionados y válidos
    if (data.empleado_id) formData.append('empleado_id', data.empleado_id);
    if (data.tipo_incidencia_id) formData.append('tipo_incidencia_id', data.tipo_incidencia_id);
    if (data.fecha_inicio) formData.append('fecha_inicio', data.fecha_inicio);
    if (data.fecha_fin) formData.append('fecha_fin', data.fecha_fin);
    if (data.descripcion) formData.append('descripcion', data.descripcion);
    if (data.estado_id) formData.append('estado_id', data.estado_id);
    
    // Manejo seguro del archivo
    if (data.documento instanceof File) {
      formData.append('documento', data.documento, data.documento.name);
    }

    return api.put<IncidenciaResponse>(`/incidencias/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Eliminar una incidencia
   */
  deleteIncidencia(id: string) {
    return api.delete<{ message: string }>(`/incidencias/${id}`);
  },

  // ==============================
  // ACCIONES SOBRE INCIDENCIAS
  // ==============================
  
  /**
   * Aprobar una incidencia
   */
  aprobarIncidencia(id: string, data: AprobarIncidenciaRequest) {
    return api.patch<IncidenciaResponse>(`/incidencias/${id}/aprobar`, data);
  },

  /**
   * Rechazar una incidencia
   */
  rechazarIncidencia(id: string, data: RechazarIncidenciaRequest) {
    return api.patch<IncidenciaResponse>(`/incidencias/${id}/rechazar`, data);
  },
};

// Opcional: Interfaz para el servicio completo
export interface IncidentService {
  // Estados
  getAllEstados(): Promise<{ data: IncidenciaEstadosResponse }>;
  getEstadoById(id: string): Promise<{ data: { data: IncidenciaEstado } }>;
  createEstado(data: CreateIncidenciaEstadoRequest): Promise<{ data: IncidenciaEstadoResponse }>;
  updateEstado(id: string, data: UpdateIncidenciaEstadoRequest): Promise<{ data: IncidenciaEstadoResponse }>;
  deleteEstado(id: string): Promise<{ data: { message: string } }>;
  
  // Tipos de Incidencia
  getAllTiposIncidencia(params?: ListTiposIncidenciaParams): Promise<{ data: TiposIncidenciaResponse }>;
  getTipoIncidenciaById(id: string): Promise<{ data: { data: TipoIncidencia } }>;
  createTipoIncidencia(data: CreateTipoIncidenciaRequest): Promise<{ data: TipoIncidenciaResponse }>;
  updateTipoIncidencia(id: string, data: UpdateTipoIncidenciaRequest): Promise<{ data: TipoIncidenciaResponse }>;
  deleteTipoIncidencia(id: string): Promise<{ data: { message: string } }>;
  
  // Incidencias
  getAllIncidencias(params?: ListIncidenciasParams): Promise<{ data: IncidenciasResponse }>;
  getIncidenciaById(id: string): Promise<{ data: { data: Incidencia } }>;
  createIncidencia(data: CreateIncidenciaRequest): Promise<{ data: IncidenciaResponse }>;
  updateIncidencia(id: string, data: UpdateIncidenciaRequest): Promise<{ data: IncidenciaResponse }>;
  deleteIncidencia(id: string): Promise<{ data: { message: string } }>;
  
  // Acciones
  aprobarIncidencia(id: string, data: AprobarIncidenciaRequest): Promise<{ data: IncidenciaResponse }>;
  rechazarIncidencia(id: string, data: RechazarIncidenciaRequest): Promise<{ data: IncidenciaResponse }>;
}