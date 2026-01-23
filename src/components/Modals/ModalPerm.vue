<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import Dialog from "primevue/dialog";
import Select from "primevue/select";
import DatePicker from "primevue/datepicker";
import Textarea from "primevue/textarea";
import Button from "primevue/button";
import Swal from "sweetalert2";
import { userService } from "@/api/services/user.service";
import { permissionService } from "@/api/services/permission.service";
import { attendanceService } from "@/api/services/attendance.service";
import { DepartmentService } from "@/api/services/department.service"; // Import DepartmentService
import type { BiometricUser } from "@/api/types/users.types";
import type { CreatePermisoPersonalRequest } from "@/api/types/permissions.types";
import type { Department } from "@/api/types/department.types"; // Import Department Type

// Definición de Props (Propiedades recibidas del padre)
const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
});

// Emisiones de eventos para actualizar visibilidad y notificar guardado
const emit = defineEmits(["update:visible", "save"]);

const employees = ref<BiometricUser[]>([]);
const allUsers = ref<BiometricUser[]>([]); // Almacenar todos los usuarios para resolver nombres
const departments = ref<Department[]>([]); // Almacenar departamentos
const papeletaTypes = ref<{ label: string; value: string }[]>([]);
const loadingEmployees = ref(false);

const loadingSubmit = ref(false);
const rawPapeletaTypes = ref<any[]>([]); // Store full permission types for metadata access

// Datos del Formulario
const form = ref({
  empleado_id: null as number | null,
  tipo_papeleta: null as string | null,
  hora_salida: null as Date | null,
  // hora_retorno eliminated
  motivo_salida: "",
  fundamentacion: "",
  fecha: new Date(), // Fecha actual por defecto
});

import { getSignatureConfig } from "@/helpers/permissions.utils";

// Computado: Configuración de firmas dinámica
const signatureConfig = computed(() => {
  const employee = employees.value.find((e) => e.id === form.value.empleado_id);
  // Pasamos un objeto permiso parcial o null, y el empleado
  // @ts-ignore
  return getSignatureConfig({}, employee || {});
});

// Helper para buscar jefe de un departamento específico
const findChiefOfDept = (deptNamePartial: string) => {
  const dept = departments.value.find((d) =>
    d.nombre.toLowerCase().includes(deptNamePartial.toLowerCase()),
  );
  if (!dept || !dept.jefe_id) return null;
  return allUsers.value.find((u) => String(u.user_id) === String(dept.jefe_id));
};

const firstSignerName = computed(() => {
  const config = signatureConfig.value;
  if (!config.firma1) return "--";

  // Si el rol es JEFE DE ÁREA
  if (config.firma1.roleKey === "jefe_area") {
    // Lógica original de jefe de área
    const employee = employees.value.find(
      (e) => e.id === form.value.empleado_id,
    );
    if (!employee || !employee.departamento_id) return "--";
    const dept = departments.value.find(
      (d) => d.id === employee.departamento_id,
    );
    if (!dept || !dept.jefe_id) return "--";
    const chief = allUsers.value.find(
      (u) => String(u.user_id) === String(dept.jefe_id),
    );
    return chief ? chief.nombre : "--";
  }

  // Si el rol es RRHH
  if (config.firma1.roleKey === "rrhh") {
    const chief =
      findChiefOfDept("recursos humanos") || findChiefOfDept("rrhh");
    return chief ? chief.nombre : "--";
  }

  // Si el rol es SOLICITANTE (Caso raro jefe rrhh)
  if (config.firma1.roleKey === "solicitante") {
    const employee = employees.value.find(
      (e) => e.id === form.value.empleado_id,
    );
    return employee ? employee.nombre : "--";
  }

  return "--";
});

const secondSignerName = computed(() => {
  const config = signatureConfig.value;
  if (!config.firma2) return "--";

  // Si el rol es RRHH
  if (config.firma2.roleKey === "rrhh") {
    const chief =
      findChiefOfDept("recursos humanos") || findChiefOfDept("rrhh");
    return chief ? chief.nombre : "--";
  }

  // Si el rol es DIRECTOR / ADMINISTRACION
  if (config.firma2.roleKey === "institucion") {
    // Buscar departamento de administración o dirección
    const chief =
      findChiefOfDept("administracion") ||
      findChiefOfDept("direccion") ||
      findChiefOfDept("gerencia");
    return chief ? chief.nombre : "--";
  }

  return "--";
});

/**
 * Carga la lista de empleados.
 * Filtra solo aquellos que tienen asistencia registrada hoy (PRESENTE, TARDANZA, etc.).
 */
const loadEmployees = async () => {
  try {
    loadingEmployees.value = true;

    // 1. Obtener todos los empleados
    const usersResponse = await userService.getAll();
    const extractData = (res: any) => {
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.data)) return res.data;
      if (res && res.data && Array.isArray(res.data.data)) return res.data.data;
      return [];
    };
    // @ts-ignore
    const users = extractData(usersResponse.data || usersResponse);
    allUsers.value = users; // Almacenar todos los usuarios para búsquedas

    // 2. Obtener asistencias de hoy para filtrar
    const today = new Date().toISOString().split("T")[0];
    const attendanceResponse = await attendanceService.getDailyReport({
      fecha_inicio: today,
      fecha_fin: today,
    });

    // @ts-ignore
    const dailyAttendance = attendanceResponse.data || [];

    // Filtrar solo empleados presentes
    const presentStatus = ["ASISTENCIA", "PRESENTE", "TARDANZA"];
    const presentRecords = dailyAttendance.filter((record: any) => {
      const status = record.estado_asistencia
        ? record.estado_asistencia.toUpperCase()
        : "";
      return (
        presentStatus.includes(status) ||
        (record.entrada_real && record.entrada_real !== null)
      );
    });

    // Extraer IDs de empleados con asistencia
    const presentEmployeeIds = new Set(
      presentRecords.map((a: any) => String(a.user_id || a.empleado_id)),
    );

    // 3. Filtrar empleados
    employees.value = users.filter((emp: BiometricUser) =>
      presentEmployeeIds.has(String(emp.user_id)),
    );

    if (employees.value.length === 0) {
      console.warn("No hay empleados con asistencia registrada para hoy.");
    }
  } catch (error) {
    console.error("Error loading employees:", error);
  } finally {
    loadingEmployees.value = false;

    // Auto-select if prop is provided
  }
};

/**
 * Carga la lista de departamentos disponibles desde el servicio.
 */
const loadDepartments = async () => {
  try {
    const response = await DepartmentService.getAll();
    // @ts-ignore
    departments.value = response.data || [];
  } catch (error) {
    console.error("Error loading departments:", error);
  }
};

/**
 * Carga los tipos de papeleta/permiso activos.
 * Mapea la respuesta para el formato del selector (label, value).
 */
const loadTiposPapeleta = async () => {
  try {
    const response = await permissionService.getTiposPermiso({ activo: true });
    // @ts-ignore
    const tipos = response.data?.data || response.data || [];
    if (Array.isArray(tipos)) {
      rawPapeletaTypes.value = tipos; // Save raw types
      papeletaTypes.value = tipos.map((t: any) => ({
        label: t.nombre,
        value: t.id,
      }));
    }
  } catch (error) {
    console.error("Error cargando tipos de permiso:", error);
  }
};

/**
 * Watcher: Auto-calculate return time based on selected type and start time.
 */
// Watcher logic for auto-calculating return time removed as field is removed
/*
watch(
  [() => form.value.tipo_papeleta, () => form.value.hora_salida],
  ([newType, newTime]) => {
     // ... logic removed
  }
);
*/

// Modelo computado para manejar la visibilidad del modal (v-model)
const visibleModel = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val),
});

/**
 * Combina un objeto Date (fecha) y un objeto Date (hora) en una cadena ISO.
 * Se usa para formatear la fecha_inicio y fecha_fin que espera el backend.
 */
const combineDateAndTime = (date: Date, time: Date): string => {
  const d = new Date(date);
  const t = new Date(time);
  d.setHours(t.getHours(), t.getMinutes(), 0, 0);
  const pad = (n: number) => (n < 10 ? "0" + n : n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:00`;
};

/**
 * Maneja el envío del formulario.
 * Valida campos, construye el payload y llama al servicio para crear el permiso.
 * Si es exitoso, genera el PDF automáticamente.
 */
const handleSubmit = async () => {
  if (
    !form.value.empleado_id ||
    !form.value.tipo_papeleta ||
    !form.value.hora_salida ||
    // !form.value.hora_retorno || // Optional now
    !form.value.motivo_salida ||
    !form.value.fundamentacion ||
    !form.value.fecha
  ) {
    Swal.fire({
      icon: "warning",
      title: "Campos Incompletos",
      text: "Por favor complete todos los campos obligatorios marcados con *",
    });
    return;
  }

  // Buscar usuario para obtener DNI (user_id)
  const employee = employees.value.find((e) => e.id === form.value.empleado_id);
  if (!employee || !employee.user_id) {
    Swal.fire(
      "Error",
      "El empleado seleccionado no tiene un ID de usuario válido (DNI)",
      "error",
    );
    return;
  }

  loadingSubmit.value = true;

  try {
    const fechaInicio = combineDateAndTime(
      form.value.fecha,
      form.value.hora_salida,
    );
    const fechaFin = undefined; // No return time logic needed for now or handled differently defined by policy types if needed later

    const payload: CreatePermisoPersonalRequest = {
      empleado_id: String(employee.user_id), // Enviar DNI
      tipo_permiso_id: form.value.tipo_papeleta,
      fecha_hora_inicio: fechaInicio,
      fecha_hora_fin: fechaFin,
      motivo: form.value.motivo_salida,
      justificacion: form.value.fundamentacion,
    };

    console.log("Enviando Payload:", payload);

    const response = await permissionService.createPermisoPersonal(payload);

    // Obtener ID del nuevo permiso
    // @ts-ignore
    const newPermiso = response.data?.data || response.data;

    // Generar PDF automáticamente (para que se guarde en el servidor)
    if (newPermiso && newPermiso.id) {
      console.log("Generando PDF para el permiso:", newPermiso.id);
      try {
        await permissionService.generarPDF(newPermiso.id);
      } catch (pdfError) {
        console.error("Error generando PDF inicial:", pdfError);
      }
    }

    Swal.fire({
      icon: "success",
      title: "Permiso Creado",
      text: "La papeleta de salida ha sido registrada correctamente.",
    });

    emit("save");
    handleCancel(); // Close and reset
  } catch (error: any) {
    console.error("Error creando permiso:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text:
        error.response?.data?.message ||
        error.message ||
        "No se pudo crear el permiso.",
    });
  } finally {
    loadingSubmit.value = false;
  }
};

// Cierra el modal y limpia el formulario
const handleCancel = () => {
  visibleModel.value = false;
  resetForm();
};

// Restablece los valores del formulario a su estado inicial
const resetForm = () => {
  form.value = {
    empleado_id: null,
    tipo_papeleta: null,
    hora_salida: null,
    motivo_salida: "",
    fundamentacion: "",
    fecha: new Date(),
  };
};

// Ciclo de vida: Cargar datos iniciales al montar el componente
onMounted(() => {
  loadEmployees();
  loadDepartments(); // Cargar departamentos al montar
  loadTiposPapeleta();
});
</script>

<template>
  <Dialog
    v-model:visible="visibleModel"
    modal
    header="Nueva Papeleta de Salida"
    :style="{ width: '50vw', minWidth: '600px' }"
    :breakpoints="{ '960px': '75vw', '640px': '95vw' }"
    class="p-fluid modal-papeleta"
  >
    <div class="formgrid grid mt-2">
      <!-- Fila 1: Empleado, Tipo -->
      <div class="field col-12 md:col-6">
        <label class="font-bold block mb-2"
          >Empleado <span class="text-red-500">*</span></label
        >
        <Select
          v-model="form.empleado_id"
          :options="employees"
          optionLabel="nombre"
          optionValue="id"
          filter
          placeholder="Seleccionar"
          class="w-full"
          :loading="loadingEmployees"
          emptyFilterMessage="No se encontraron empleados"
        >
          <template #option="slotProps">
            <div class="flex align-items-center">
              <span>{{ slotProps.option.nombre }}</span>
            </div>
          </template>
        </Select>
      </div>

      <div class="field col-12 md:col-6">
        <label class="font-bold block mb-2"
          >Tipo de Papeleta <span class="text-red-500">*</span></label
        >
        <Select
          v-model="form.tipo_papeleta"
          :options="papeletaTypes"
          optionLabel="label"
          optionValue="value"
          placeholder="Seleccionar"
          class="w-full"
        />
      </div>

      <!-- Fila 2: Fecha, Hora Salida, Hora Retorno -->
      <div class="field col-12 md:col-4">
        <label class="font-bold block mb-2"
          >Fecha <span class="text-red-500">*</span></label
        >
        <DatePicker
          v-model="form.fecha"
          dateFormat="dd/mm/yy"
          showIcon
          class="w-full"
          disabled
        />
      </div>

      <div class="field col-12 md:col-4">
        <label class="font-bold block mb-2"
          >Hora Salida <span class="text-red-500">*</span></label
        >
        <DatePicker
          v-model="form.hora_salida"
          timeOnly
          showIcon
          placeholder="00:00"
          class="w-full"
        />
      </div>

      <!-- Fila 2: Motivo y Fundamentación -->
      <div class="field col-12">
        <label class="font-bold block mb-2"
          >Motivo de Salida <span class="text-red-500">*</span></label
        >
        <Textarea
          v-model="form.motivo_salida"
          rows="4"
          placeholder="Describa el motivo..."
          class="w-full"
        />
      </div>

      <div class="field col-12">
        <label class="font-bold block mb-2"
          >Fundamentación <span class="text-red-500">*</span></label
        >
        <Textarea
          v-model="form.fundamentacion"
          rows="4"
          placeholder="Justificación..."
          class="w-full"
        />
      </div>

      <!-- Firmas Section (Visual Placeholder) -->
      <div class="field col-12">
        <h4
          class="text-center font-bold text-primary mb-4"
          style="color: var(--primary-color)"
        >
          FIRMAS DE AUTORIZACIÓN
        </h4>
        <div class="flex justify-content-between gap-3 signatures-container">
          <!-- Solicitante -->
          <div class="signature-box">
            <div class="role-title">SOLICITANTE</div>
            <div class="signature-line"></div>
            <div class="signer-name">
              {{
                form.empleado_id
                  ? employees.find((e) => e.id === form.empleado_id)?.nombre
                  : "Nombre del Empleado"
              }}
            </div>
            <div class="status-badge pending">PENDIENTE</div>
          </div>

          <!-- Firma 1 (Dinámica: Jefe Area o RRHH) -->
          <div class="signature-box" v-if="signatureConfig.firma1">
            <div class="role-title">{{ signatureConfig.firma1.label }}</div>
            <div class="signature-line"></div>
            <div class="signer-name">{{ firstSignerName }}</div>
            <div class="status-badge pending">PENDIENTE</div>
          </div>

          <!-- Firma 2 (Dinámica: RRHH o Director) -->
          <div class="signature-box" v-if="signatureConfig.firma2">
            <div class="role-title">{{ signatureConfig.firma2.label }}</div>
            <div class="signature-line"></div>
            <div class="signer-name">{{ secondSignerName }}</div>
            <div class="status-badge pending">PENDIENTE</div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-content-end gap-2 mt-4">
        <Button
          label="Cancelar"
          icon="pi pi-times"
          severity="secondary"
          @click="handleCancel"
          outlined
        />
        <Button
          label="Generar Papeleta"
          icon="pi pi-check"
          severity="success"
          @click="handleSubmit"
          :loading="loadingSubmit"
        />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.field {
  margin-bottom: 1rem;
}

/* Custom styles for the signature boxes to match the look */
.signatures-container {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
  border: 1px dashed #ccc;
  padding: 20px;
  border-radius: 8px;
  background-color: #f9fafb;
}

.signature-box {
  flex: 1;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 1.5rem 1rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 160px;
}

.role-title {
  font-weight: 600;
  font-size: 0.85rem;
  color: #374151;
  margin-bottom: auto; /* Push content down */
  letter-spacing: 0.5px;
}

.signature-line {
  width: 80%;
  height: 1px;
  background-color: #9ca3af;
  margin-top: 40px;
  margin-bottom: 8px;
}

.signer-name {
  font-size: 0.8rem;
  color: #6b7280;
  margin-bottom: 8px;
  height: 1.2em; /* fixed height */
}

.status-badge {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: bold;
}

.status-badge.pending {
  background-color: #fef3c7;
  color: #d97706;
}
</style>
