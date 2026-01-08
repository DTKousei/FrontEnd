import { createApi } from './core';

// Define base URLs for each module
// You can also use environment variables here: import.meta.env.VITE_AUTH_API_URL, etc.

const AUTH_API_URL = 'http://localhost:3001/api';      // Módulo 1
const BIOMETRIC_API_URL = '/api-biometrico';           // Módulo 2 (Proxied to 8000)
const PAPELETA_API_URL = 'http://localhost:3002/api';  // Módulo 3
export const INCIDENT_API_URL = 'http://localhost:3003/api';  // Módulo 4
const PYTHON_REPORT_API_URL = '/api-reportes'; // Módulo 6 (Python proxied)

// Create instances
export const authApi = createApi(AUTH_API_URL);
export const biometricApi = createApi(BIOMETRIC_API_URL);
export const papeletaApi = createApi(PAPELETA_API_URL);
export const incidentApi = createApi(INCIDENT_API_URL);
// reportApi removed (Node module deprecated)
export const pythonReportApi = createApi(PYTHON_REPORT_API_URL);
