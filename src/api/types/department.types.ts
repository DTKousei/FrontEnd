export interface Department {
    id: number;
    nombre: string;
    descripcion: string;
    jefe_id: string | null;
    fecha_creacion: string;
}

export interface CreateDepartmentDto {
    nombre: string;
    descripcion: string;
}

export interface UpdateDepartmentDto {
    nombre?: string;
    descripcion?: string;
    jefe_id?: string | null;
}
