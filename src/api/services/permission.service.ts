import { papeletaApi as api } from '@/api/config';
import type { 
  Permiso, 
  TipoPermiso, 
  Estado,
  FiltrosPermisos,
  RespuestaPaginada,
  RespuestaSimple,
  FirmaTradicionalRequest,
  FirmaDigitalRequest,
  VerificacionFirma,
  NuevoPermiso,
  NuevoTipoPermiso
} from '@/api/types/permissions.types';

export const permissionService = {
  // --- Permission Types (Permiso Tipos) - CRUD COMPLETO ---
  getAllTypes(activo?: boolean) {
    const params = activo !== undefined ? { activo } : {};
    return api.get<RespuestaPaginada<TipoPermiso>>('/permiso-tipos', { params });
  },
  
  getTypeById(id: string) {
    return api.get<RespuestaSimple<TipoPermiso>>(`/permiso-tipos/${id}`);
  },
  
  createType(data: NuevoTipoPermiso) {
    return api.post<RespuestaSimple<TipoPermiso>>('/permiso-tipos', data);
  },
  
  updateType(id: string, data: Partial<NuevoTipoPermiso>) {
    return api.put<RespuestaSimple<TipoPermiso>>(`/permiso-tipos/${id}`, data);
  },
  
  deleteType(id: string) {
    return api.delete<RespuestaSimple<{ message: string }>>(`/permiso-tipos/${id}`);
  },

  // --- Estados - CRUD COMPLETO ---
  getAllStates() {
    return api.get<RespuestaPaginada<Estado>>('/estados');
  },
  
  getStateById(id: string) {
    return api.get<RespuestaSimple<Estado>>(`/estados/${id}`);
  },
  
  createState(data: { nombre: string; codigo: string; descripcion: string }) {
    return api.post<RespuestaSimple<Estado>>('/estados', data);
  },
  
  updateState(id: string, data: Partial<{ nombre: string; codigo: string; descripcion: string }>) {
    return api.put<RespuestaSimple<Estado>>(`/estados/${id}`, data);
  },
  
  deleteState(id: string) {
    return api.delete<RespuestaSimple<{ message: string }>>(`/estados/${id}`);
  },

  // --- Permissions (Papeletas) - CRUD COMPLETO ---
  getAll(filtros?: FiltrosPermisos) {
    return api.get<RespuestaPaginada<Permiso>>('/permisos', { params: filtros });
  },
  
  getById(id: string) {
    return api.get<RespuestaSimple<Permiso>>(`/permisos/${id}`);
  },
  
  create(data: NuevoPermiso) {
    return api.post<RespuestaSimple<Permiso>>('/permisos', data);
  },
  
  update(id: string, data: Partial<NuevoPermiso>) {
    return api.put<RespuestaSimple<Permiso>>(`/permisos/${id}`, data);
  },
  
  delete(id: string) {
    return api.delete<RespuestaSimple<{ message: string }>>(`/permisos/${id}`);
  },

  // --- Firmas Tradicionales (foto/scanner) ---
  signTraditional(id: string, data: FirmaTradicionalRequest) {
    return api.patch<RespuestaSimple<Permiso> & { firmas_completas: boolean }>(
      `/permisos/${id}/firmar`, 
      data
    );
  },

  // --- Firmas Digitales ONPE ---
  signDigital(id: string, data: FirmaDigitalRequest) {
    return api.patch<
      RespuestaSimple<Permiso> & { 
        certificado: any;
        qr_verificacion: string;
        url_verificacion: string;
        firmas_completas: boolean;
      }
    >(`/permisos/${id}/firmar-digital`, data);
  },

  // --- Verificación de Firma ---
  verifySignature(id: string, tipoFirma: 'solicitante' | 'jefe_area' | 'rrhh' | 'institucion') {
    return api.get<RespuestaSimple<VerificacionFirma>>(
      `/permisos/${id}/verificar-firma/${tipoFirma}`
    );
  },

  // --- PDF ---
  getPdf(id: string) {
    return api.get(`/permisos/${id}/pdf`, { 
      responseType: 'blob' 
    });
  },
  
  uploadSignedPdf(id: string, file: File) {
    const formData = new FormData();
    formData.append('pdf', file);
    return api.post<RespuestaSimple<{ pdf_firmado_path: string }> & { 
      archivo: { 
        nombre: string; 
        ruta: string; 
        tamano: number; 
      } 
    }>(`/permisos/${id}/upload-pdf`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};