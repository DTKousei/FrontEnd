import { createApi } from './core';

// Define URLs base para cada módulo
// También puedes usar variables de entorno aquí: import.meta.env.VITE_AUTH_API_URL, etc.

const AUTH_API_URL = '/api-auth';      // Módulo 1 (Proxied)
const BIOMETRIC_API_URL = '/api-biometrico';           // Módulo 2 (Proxied)
const PAPELETA_API_URL = '/api-papeletas';  // Módulo 3 (Proxied)
export const INCIDENT_API_URL = '/api-incidencias';  // Módulo 4 (Proxied)
const PYTHON_REPORT_API_URL = '/api-reportes'; // Módulo 6 (Proxied)

// Create instances
export const authApi = createApi(AUTH_API_URL);
export const biometricApi = createApi(BIOMETRIC_API_URL);
export const papeletaApi = createApi(PAPELETA_API_URL);
export const incidentApi = createApi(INCIDENT_API_URL);
// reportApi eliminado (Módulo Node obsoleto)
export const pythonReportApi = createApi(PYTHON_REPORT_API_URL);
