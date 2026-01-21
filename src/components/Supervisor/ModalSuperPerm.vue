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
import { DepartmentService } from "@/api/services/department.service";
import { attendanceService } from "@/api/services/attendance.service";
import type { BiometricUser } from "@/api/types/users.types";
import type { CreatePermisoPersonalRequest } from "@/api/types/permissions.types";
import type { Department } from "@/api/types/department.types";

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  supervisorId: {
    type: [Number, String],
    required: true,
  },
});

const emit = defineEmits(["update:visible", "save"]);

const employees = ref<BiometricUser[]>([]);
const allUsers = ref<BiometricUser[]>([]);
const departments = ref<Department[]>([]);
const papeletaTypes = ref<{ label: string; value: string }[]>([]);
const loadingEmployees = ref(false);
const loadingSubmit = ref(false);
const rawPapeletaTypes = ref<any[]>([]);

const form = ref({
  empleado_id: null as number | string | null,
  tipo_papeleta: null as string | null,
  hora_salida: null as Date | null,
  hora_retorno: null as Date | null,
  motivo_salida: "",
  fundamentacion: "",
  fecha: new Date(),
});

import {
  getSignatureConfig,
  hasPendingOrOpenPermission,
  validateManualReturnTime,
} from "@/helpers/permissions.utils";

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

const loadEmployees = async () => {
  try {
    loadingEmployees.value = true;
    const usersResponse = await userService.getAll();
    const extractData = (res: any) => {
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.data)) return res.data;
      if (res && res.data && Array.isArray(res.data.data)) return res.data.data;
      return [];
    };
    // @ts-ignore
    const users = extractData(usersResponse.data || usersResponse);
    allUsers.value = users;

    // Identificar el departamento del supervisor
    const supervisorIdStr = String(props.supervisorId);
    console.log("ModalSuperPerm: Supervisor ID:", supervisorIdStr);

    const supervisor = users.find(
      (u: BiometricUser) =>
        String(u.user_id) === supervisorIdStr ||
        String(u.id) === supervisorIdStr,
    );
    console.log("ModalSuperPerm: Supervisor found:", supervisor);

    let filteredEmployees: BiometricUser[] = [];

    if (supervisor && supervisor.departamento_id) {
      // Filtrar empleados que pertenecen al mismo departamento que el supervisor
      filteredEmployees = users.filter(
        (u: BiometricUser) => u.departamento_id === supervisor.departamento_id,
      );
      console.log(
        `ModalSuperPerm: Found ${filteredEmployees.length} employees in dept ${supervisor.departamento_id}`,
      );
    } else {
      console.warn(
        "Supervisor no tiene departamento asignado o no encontrado.",
      );
      filteredEmployees = [];
    }

    // --- FILTRAR POR ASISTENCIA HOY ---
    if (filteredEmployees.length > 0) {
      // Usar fecha local constructiva
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const todayStr = `${year}-${month}-${day}`;

      console.log("ModalSuperPerm: Fetching attendance report for:", todayStr);

      // Usar getDailyReport que está diseñado para rangos de fechas
      // getAll devolvía 422 con fecha_inicio/fecha_fin
      const attResponse = await attendanceService.getDailyReport({
        fecha_inicio: todayStr,
        fecha_fin: todayStr,
      });

      console.log("ModalSuperPerm: Report Response:", attResponse);

      // @ts-ignore
      const attendanceList = attResponse.data?.data || attResponse.data || [];
      console.log(`ModalSuperPerm: Fetched ${attendanceList.length} records`);

      if (attendanceList.length > 0) {
        console.log("ModalSuperPerm: Sample record:", attendanceList[0]);
      }

      // Crear Set de IDs de usuarios que tienen asistencia hoy Y están PRESENTES/TARDANZA
      const presentUserIds = new Set();

      attendanceList.forEach((a: any) => {
        // Normalizar estado
        const rawStatus = (
          a.estado_asistencia ||
          a.estado ||
          a.status ||
          ""
        ).toUpperCase();

        // Consideramos presentes a: PRESENTE, ASISTENCIA, TARDANZA
        // Excluimos: FALTA, AUSENCIA, FERIADO
        if (
          rawStatus.includes("PRESENTE") ||
          rawStatus.includes("ASISTENCIA") ||
          rawStatus.includes("TARDANZA")
        ) {
          const uid = String(a.user_id || a.empleado_id || a.dni || a.id);
          if (uid) presentUserIds.add(uid);
        }
      });
      console.log(
        "ModalSuperPerm: Present IDs (Filtered by Status):",
        Array.from(presentUserIds),
      );

      // Filtrar empleados: solo mostrar los que están en presentUserIds
      employees.value = filteredEmployees.filter((emp) =>
        presentUserIds.has(String(emp.user_id)),
      );
      console.log(`ModalSuperPerm: Final list size: ${employees.value.length}`);
    } else {
      employees.value = [];
    }
  } catch (error) {
    console.error("Error loading employees:", error);
  } finally {
    loadingEmployees.value = false;
  }
};

const loadDepartments = async () => {
  try {
    const response = await DepartmentService.getAll();
    // @ts-ignore
    departments.value = response.data || [];
  } catch (error) {
    console.error("Error loading departments:", error);
  }
};

const loadTiposPapeleta = async () => {
  try {
    const response = await permissionService.getTiposPermiso({ activo: true });
    // @ts-ignore
    const tipos = response.data?.data || response.data || [];
    if (Array.isArray(tipos)) {
      rawPapeletaTypes.value = tipos;
      papeletaTypes.value = tipos.map((t: any) => ({
        label: t.nombre,
        value: t.id,
      }));
    }
  } catch (error) {
    console.error("Error cargando tipos de permiso:", error);
  }
};

/*
watch(
  [() => form.value.tipo_papeleta, () => form.value.hora_salida],
  ([newType, newTime]) => {
    if (!newType || !newTime) return;
    const selectedType = rawPapeletaTypes.value.find((t) => t.id === newType);
    if (
      selectedType &&
      selectedType.tiempo_maximo_horas &&
      selectedType.tiempo_maximo_horas > 0
    ) {
      const startTime = new Date(newTime);
      const endTime = new Date(
        startTime.getTime() + selectedType.tiempo_maximo_horas * 60 * 60 * 1000,
      );
      form.value.hora_retorno = endTime;
    }
  },
);
*/

const visibleModel = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val),
});

const combineDateAndTime = (date: Date, time: Date): string => {
  const d = new Date(date);
  const t = new Date(time);
  d.setHours(t.getHours(), t.getMinutes(), 0, 0);
  const pad = (n: number) => (n < 10 ? "0" + n : n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:00`;
};

const handleSubmit = async () => {
  if (
    !form.value.empleado_id ||
    !form.value.tipo_papeleta ||
    !form.value.hora_salida ||
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
    const permisosResponse = await permissionService.getPermisos({
      empleado_id: String(employee.user_id),
    });
    // @ts-ignore
    const permisos = permisosResponse.data?.data || permisosResponse.data || [];

    // --- NUEVA VALIDACIÓN DE PENDIENTES (hasPendingOrOpenPermission) ---
    // Usamos el helper centralizado
    if (hasPendingOrOpenPermission(String(employee.user_id), permisos)) {
      Swal.fire({
        icon: "error",
        title: "Papeleta Pendiente",
        text: "El empleado tiene una papeleta pendiente de aprobación o sin cierre (hora retorno). No puede generar una nueva.",
      });
      loadingSubmit.value = false;
      return;
    }

    // --- VALIDACIÓN DE TIEMPO MÁXIMO ---
    const selectedType = rawPapeletaTypes.value.find(
      (t) => t.id === form.value.tipo_papeleta,
    );
    if (
      selectedType &&
      selectedType.tiempo_maximo_horas &&
      form.value.hora_salida &&
      form.value.hora_retorno
    ) {
      const errorMsg = validateManualReturnTime(
        combineDateAndTime(form.value.fecha, form.value.hora_salida),
        combineDateAndTime(form.value.fecha, form.value.hora_retorno),
        selectedType.tiempo_maximo_horas,
      );

      if (errorMsg) {
        const result = await Swal.fire({
          title: "Tiempo Excedido",
          text: errorMsg,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Continuar de todos modos",
          cancelButtonText: "Corregir",
        });

        if (!result.isConfirmed) {
          loadingSubmit.value = false;
          return;
        }
      }
    }

    const fechaInicio = combineDateAndTime(
      form.value.fecha,
      form.value.hora_salida,
    );
    const fechaFin = form.value.hora_retorno
      ? combineDateAndTime(form.value.fecha, form.value.hora_retorno)
      : undefined;

    const payload: CreatePermisoPersonalRequest = {
      empleado_id: String(employee.user_id),
      tipo_permiso_id: form.value.tipo_papeleta,
      fecha_hora_inicio: fechaInicio,
      fecha_hora_fin: fechaFin,
      motivo: form.value.motivo_salida,
      justificacion: form.value.fundamentacion,
    };

    const response = await permissionService.createPermisoPersonal(payload);
    // @ts-ignore
    const newPermiso = response.data?.data || response.data;

    if (newPermiso && newPermiso.id) {
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
    handleCancel();
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

const handleCancel = () => {
  visibleModel.value = false;
  resetForm();
};

const resetForm = () => {
  form.value = {
    empleado_id: null,
    tipo_papeleta: null,
    hora_salida: null,
    hora_retorno: null,
    motivo_salida: "",
    fundamentacion: "",
    fecha: new Date(),
  };
};

onMounted(() => {
  loadEmployees();
  loadDepartments();
  loadTiposPapeleta();
});
</script>

<template>
  <Dialog
    v-model:visible="visibleModel"
    modal
    header="Nueva Papeleta de Salida (Supervisor)"
    :style="{ width: '50vw', minWidth: '600px' }"
    :breakpoints="{ '960px': '75vw', '640px': '95vw' }"
    class="p-fluid modal-papeleta"
  >
    <div class="formgrid grid mt-2">
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
          placeholder="Seleccionar Empleado"
          class="w-full"
          :loading="loadingEmployees"
          emptyFilterMessage="No se encontraron empleados en su área"
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

      <div class="field col-12">
        <h4
          class="text-center font-bold text-primary mb-4"
          style="color: var(--primary-color)"
        >
          FIRMAS DE AUTORIZACIÓN
        </h4>
        <div class="flex justify-content-between gap-3 signatures-container">
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
  margin-bottom: auto;
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
  height: 1.2em;
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
