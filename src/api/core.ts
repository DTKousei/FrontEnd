
import axios, { type AxiosInstance, type AxiosError } from 'axios';

// Factory function to create API instances with specific base URLs
export const createApi = (baseURL: string): AxiosInstance => {
  const api: AxiosInstance = axios.create({
    baseURL,
    timeout: 30000, // 30 seconds
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request Interceptor
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response Interceptor
  api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response && error.response.status === 401) {
        // Handle unauthorized access (e.g., redirect to login)
        localStorage.removeItem('token');
        // window.location.href = '/login'; // Uncomment when routing is ready
      }
      return Promise.reject(error);
    }
  );

  return api;
};
