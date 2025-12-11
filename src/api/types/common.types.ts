export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  last_page: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

// Respuesta genérica de éxito
export interface SuccessResponse {
  success: true;
  message: string;
}

// Respuesta genérica de error
export interface ErrorResponse {
  success: false;
  message: string;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
}

// Union type para respuestas de API (Updated to match backend structure)
export type ApiResponse<T = any> = 
  | (T & { success: true })
  | ErrorResponse;

export interface ApiError {
  detail: string;
  status?: number;
}
