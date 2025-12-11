import { incidentApi as api } from '@/api/config';
import type {
  // Estados
  Estado,
  EstadoResponse,
  EstadosResponse,
  CreateEstadoRequest,
  UpdateEstadoRequest,
  
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
    return api.get<EstadosResponse>('/estados');
  },

  /**
   * Obtener un estado por ID
   */
  getEstadoById(id: string) {
    return api.get<{ data: Estado }>(`/estados/${id}`);
  },

  /**
   * Crear un nuevo estado
   */
  createEstado(data: CreateEstadoRequest) {
    return api.post<EstadoResponse>('/estados', data);
  },

  /**
   * Actualizar un estado
   */
  updateEstado(id: string, data: UpdateEstadoRequest) {
    return api.put<EstadoResponse>(`/estados/${id}`, data);
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
   * Crear una nueva incidencia con archivo PDF
   */
  createIncidencia(data: CreateIncidenciaRequest) {
    const formData = new FormData();
    
    // Agregar campos al FormData
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'documento') {
        formData.append(key, value, value.name);
      } else {
        formData.append(key, String(value));
      }
    });

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
    
    // Agregar solo los campos proporcionados
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'documento') {
          formData.append(key, value, value.name);
        } else {
          formData.append(key, String(value));
        }
      }
    });

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
  getAllEstados(): Promise<{ data: EstadosResponse }>;
  getEstadoById(id: string): Promise<{ data: { data: Estado } }>;
  createEstado(data: CreateEstadoRequest): Promise<{ data: EstadoResponse }>;
  updateEstado(id: string, data: UpdateEstadoRequest): Promise<{ data: EstadoResponse }>;
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