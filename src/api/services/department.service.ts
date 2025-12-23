import { biometricApi } from '../config';
import type { Department, CreateDepartmentDto, UpdateDepartmentDto } from '../types/department.types';
import type { BiometricUser } from '../types/users.types';

export const DepartmentService = {
  getAll: () => {
    return biometricApi.get<Department[]>('/departamentos/');
  },

  getById: (id: number) => {
    return biometricApi.get<Department>(`/departamentos/${id}`);
  },

  create: (data: CreateDepartmentDto) => {
    return biometricApi.post<Department>('/departamentos/', data);
  },

  update: (id: number, data: UpdateDepartmentDto) => {
    return biometricApi.put<Department>(`/departamentos/${id}`, data);
  },

  delete: (id: number) => {
    return biometricApi.delete(`/departamentos/${id}`);
  },

  assignBoss: (departmentId: number, dni: string) => {
    // Check if this custom endpoint also needs it. Usually yes for DRF router generated ones. 
    // If it was manual, maybe not. But let's try strict URL matching if possible.
    // The previous error was specifically for getAll '/departamentos/'.
    return biometricApi.post<Department>(`/departamentos/${departmentId}/jefe/${dni}`);
  },

  getByUserDni: (dni: string) => {
    return biometricApi.get<Department>(`/departamentos/usuario/${dni}`);
  },

  getUsers: (departmentId: number) => {
    return biometricApi.get<BiometricUser[]>(`/departamentos/${departmentId}/usuarios`);
  }
};
