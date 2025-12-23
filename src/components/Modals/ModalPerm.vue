import { ref, onMounted, computed } from "vue";
import Dialog from "primevue/dialog";
import Dropdown from "primevue/dropdown";
import Calendar from "primevue/calendar";
import Textarea from "primevue/textarea";
import Button from "primevue/button";
import Swal from "sweetalert2";
import { userService } from "@/api/services/user.service";
import { permissionService } from "@/api/services/permission.service";
import { attendanceService } from "@/api/services/attendance.service";
import type { BiometricUser } from "@/api/types/users.types";
import type { CreatePermisoPersonalRequest } from "@/api/types/permissions.types";

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["update:visible", "save"]);

const employees = ref<BiometricUser[]>([]);
const papeletaTypes = ref<{ label: string; value: string }[]>([]);
const loadingEmployees = ref(false);
const loadingSubmit = ref(false);

// Form Data
const form = ref({
  empleado_id: null as number | null,
  tipo_papeleta: null as string | null,
  hora_salida: null as Date | null,
  hora_retorno: null as Date | null,
  motivo_salida: "",
  fundamentacion: "",
  fecha: new Date(), // Fecha actual por defecto
});

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
    const allEmployees = extractData(usersResponse.data || usersResponse);

    // 2. Obtener asistencias de hoy para filtrar
    const today = new Date().toISOString().split('T')[0];
    const attendanceResponse = await attendanceService.getDailyReport({ 
        fecha_inicio: today, 
        fecha_fin: today 
    });
    
    // @ts-ignore
    const dailyAttendance = attendanceResponse.data || [];
    
    // Extraer IDs de empleados con asistencia (asumiendo que dailyAttendance tiene user_id o empleado_id)
    // Ajustar según la estructura real de la respuesta de getDailyReport.
    // Si getDailyReport devuelve un array de objetos con 'user_id' o similar:
    const presentEmployeeIds = new Set(dailyAttendance.map((a: any) => String(a.user_id || a.empleado_id)));

    // 3. Filtrar empleados
    employees.value = allEmployees.filter((emp: BiometricUser) => 
        presentEmployeeIds.has(String(emp.user_id))
    );

    if (employees.value.length === 0) {
        console.warn("No hay empleados con asistencia registrada para hoy.");
    }

  } catch (error) {
    console.error("Error loading employees:", error);
    // Fallback: mostrar todos si falla el filtro de asistencia? 
    // Por seguridad/rigurosidad, mejor dejar vacía o mostrar error, pero el usuario pidió explícitame filtro.
  } finally {
    loadingEmployees.value = false;
  }
};

const loadTiposPapeleta = async () => {
  try {
    const response = await permissionService.getTiposPermiso({ activo: true });
    // @ts-ignore
    const tipos = response.data?.data || response.data || [];
    if (Array.isArray(tipos)) {
      papeletaTypes.value = tipos.map((t: any) => ({
        label: t.nombre,
        value: t.id,
      }));
    }
  } catch (error) {
    console.error("Error cargando tipos de permiso:", error);
  }
};

const visibleModel = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val),
});

const combineDateAndTime = (date: Date, time: Date): string => {
  const d = new Date(date);
  const t = new Date(time);
  d.setHours(t.getHours(), t.getMinutes(), 0, 0);
  // Return ISO format with offset or simply local ISO string if backend expects UTC-neutral
  // Using standard ISO string:
  // Manual construction to avoid timezone shifts if backend expects local time string
  const pad = (n: number) => (n < 10 ? "0" + n : n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:00`;
};

const handleSubmit = async () => {
  if (
    !form.value.empleado_id ||
    !form.value.tipo_papeleta ||
    !form.value.hora_salida ||
    !form.value.hora_retorno ||
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

  // Find user to get DNI (user_id)
  const employee = employees.value.find((e) => e.id === form.value.empleado_id);
  if (!employee || !employee.user_id) {
    Swal.fire(
      "Error",
      "El empleado seleccionado no tiene un ID de usuario válido (DNI)",
      "error"
    );
    return;
  }

  loadingSubmit.value = true;

  try {
    const fechaInicio = combineDateAndTime(
      form.value.fecha,
      form.value.hora_salida
    );
    const fechaFin = combineDateAndTime(
      form.value.fecha,
      form.value.hora_retorno
    );

    const payload: CreatePermisoPersonalRequest = {
      empleado_id: String(employee.user_id), // Send DNI
      tipo_permiso_id: form.value.tipo_papeleta,
      fecha_hora_inicio: fechaInicio,
      fecha_hora_fin: fechaFin,
      motivo: form.value.motivo_salida,
      justificacion: form.value.fundamentacion,
    };

    console.log("Enviando Payload:", payload);

    await permissionService.createPermisoPersonal(payload);

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
        <Dropdown
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
        </Dropdown>
      </div>

      <div class="field col-12 md:col-6">
        <label class="font-bold block mb-2"
          >Tipo de Papeleta <span class="text-red-500">*</span></label
        >
        <Dropdown
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
        <Calendar
          v-model="form.fecha"
          dateFormat="dd/mm/yy"
          showIcon
          iconDisplay="input"
          class="w-full"
          disabled
        />
      </div>

      <div class="field col-12 md:col-4">
        <label class="font-bold block mb-2"
          >Hora Salida <span class="text-red-500">*</span></label
        >
        <Calendar
          v-model="form.hora_salida"
          timeOnly
          showIcon
          iconDisplay="input"
          placeholder="00:00"
          class="w-full"
        />
      </div>

      <div class="field col-12 md:col-4">
        <label class="font-bold block mb-2"
          >Hora Retorno <span class="text-red-500">*</span></label
        >
        <Calendar
          v-model="form.hora_retorno"
          timeOnly
          showIcon
          iconDisplay="input"
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

          <!-- Jefe de Area -->
          <div class="signature-box">
            <div class="role-title">JEFE DE ÁREA</div>
            <div class="signature-line"></div>
            <div class="signer-name">--</div>
            <div class="status-badge pending">PENDIENTE</div>
          </div>

          <!-- Jefe RRHH -->
          <div class="signature-box">
            <div class="role-title">JEFE DE RRHH</div>
            <div class="signature-line"></div>
            <div class="signer-name">Mg. Elena Mendoza</div>
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
