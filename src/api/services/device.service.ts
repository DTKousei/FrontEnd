import { biometricApi as api } from '@/api/config';
import type { 
  Device, 
  CreateDeviceData, 
  UpdateDeviceData, 
  DeviceConnectionInfo,
  TestConnectionResponse
} from '@/api/types/devices.types';

export const deviceService = {
  // GET /api/dispositivos
  getAll() {
    return api.get<Device[]>('/dispositivos');
  },

  // GET /api/dispositivos/{id}
  getById(id: number) {
    return api.get<DeviceConnectionInfo>(`/dispositivos/${id}`);
  },

  // POST /api/dispositivos
  create(data: CreateDeviceData) {
    return api.post<Device>('/dispositivos', data);
  },

  // PUT /api/dispositivos/{id}
  update(id: number, data: UpdateDeviceData) {
    return api.put<Device>(`/dispositivos/${id}`, data);
  },

  // DELETE /api/dispositivos/{id}
  delete(id: number) {
    return api.delete<{ message: string }>(`/dispositivos/${id}`);
  },

  // POST /api/dispositivos/{id}/test-conexion
  testConnection(id: number) {
    return api.post<TestConnectionResponse>(`/dispositivos/${id}/test-conexion`);
  },

  // GET /api/dispositivos/{id}/info
  getInfo(id: number) {
    return api.get<DeviceConnectionInfo>(`/dispositivos/${id}/info`);
  }
};
