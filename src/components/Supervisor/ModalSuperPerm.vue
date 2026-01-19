<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import Dialog from "primevue/dialog";
import Select from "primevue/select";
import DatePicker from "primevue/datepicker";
import Textarea from "primevue/textarea";
import Button from "primevue/button";
import Swal from "sweetalert2";
import { userService } from "@/api/services/user.service";
import { permissionService } from "@/api/services/permission.service";
import { DepartmentService } from "@/api/services/department.service";
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

const jefeAreaName = computed(() => {
  if (!form.value.empleado_id) return "--";
  const employee = allUsers.value.find((e) => e.id === form.value.empleado_id);
  if (!employee || !employee.departamento_id) return "--";
  const dept = departments.value.find((d) => d.id === employee.departamento_id);
  if (!dept || !dept.jefe_id) return "--";
  const chief = allUsers.value.find(
    (u) => String(u.user_id) === String(dept.jefe_id),
  );
  return chief ? chief.nombre : "--";
});

const jefeRRHHName = computed(() => {
  const rrhhDept = departments.value.find(
    (d) =>
      d.nombre.toLowerCase().includes("recursos humanos") ||
      d.nombre.toLowerCase().includes("RRHH"),
  );
  if (!rrhhDept || !rrhhDept.jefe_id) return "--";
  const chief = allUsers.value.find(
    (u) => String(u.user_id) === String(rrhhDept.jefe_id),
  );
  return chief ? chief.nombre : "--";
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
    const supervisor = users.find(
      (u: BiometricUser) =>
        String(u.user_id) === supervisorIdStr ||
        String(u.id) === supervisorIdStr,
    );

    if (supervisor && supervisor.departamento_id) {
      // Filtrar empleados que pertenecen al mismo departamento que el supervisor
      employees.value = users.filter(
        (u: BiometricUser) => u.departamento_id === supervisor.departamento_id,
      );
    } else {
      console.warn(
        "Supervisor no tiene departamento asignado o no encontrado.",
      );
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
          <div class="signature-box">
            <div class="role-title">JEFE DE ÁREA</div>
            <div class="signature-line"></div>
            <div class="signer-name">{{ jefeAreaName }}</div>
            <div class="status-badge pending">PENDIENTE</div>
          </div>
          <div class="signature-box">
            <div class="role-title">JEFE DE RRHH</div>
            <div class="signature-line"></div>
            <div class="signer-name">{{ jefeRRHHName }}</div>
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
