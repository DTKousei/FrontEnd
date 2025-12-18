import { createApi } from './core';

// Define base URLs for each module
// You can also use environment variables here: import.meta.env.VITE_AUTH_API_URL, etc.

const AUTH_API_URL = 'http://localhost:3001/api';      // Módulo 1
const BIOMETRIC_API_URL = '/api-biometrico';           // Módulo 2 (Proxied to 8000)
const PAPELETA_API_URL = 'http://localhost:3002/api';  // Módulo 3
const INCIDENT_API_URL = 'http://localhost:3003/api';  // Módulo 4
const REPORT_API_URL = 'http://localhost:3004/api';    // Módulo 5

// Create instances
export const authApi = createApi(AUTH_API_URL);
export const biometricApi = createApi(BIOMETRIC_API_URL);
export const papeletaApi = createApi(PAPELETA_API_URL);
export const incidentApi = createApi(INCIDENT_API_URL);
export const reportApi = createApi(REPORT_API_URL);
