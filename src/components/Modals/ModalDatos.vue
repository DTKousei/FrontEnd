<script setup lang="ts">
import { ref, computed, watch } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Swal from "sweetalert2";
import { authService } from "@/api/services/auth.service";
import { userService } from "@/api/services/user.service";
import RadarPersView from "@/components/Graficas/RadarPersView.vue";
import { attendanceService } from "@/api/services/attendance.service";
import { incidentService } from "@/api/services/incident.service";

interface ExtendedUser {
  id: number;
  user_id: string; // DNI
  nombre: string;
  email?: string;
  telefono?: string;
  departamento?: string | any;
  cargo?: string;
  fecha_nacimiento?: string;
  direccion?: string;
  estado?: string; // "Activo" | "Inactivo"
  rol?: string;
  fecha_creacion?: string;
}

const props = defineProps<{
  visible: boolean;
  user: ExtendedUser | null;
}>();

const emit = defineEmits(["update:visible"]);

const visibleModel = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val),
});

const loadingReset = ref(false);
const loadingUnlock = ref(false);
const isLocked = ref(false);
const lockReason = ref("");

// Metrics state for Radar Chart
const metrics = ref({
  puntualidad: 0,
  asistencia: 0,
  tardanzas: 0,
  horas_extras: 0,
  uso_beneficios: 0,
});
const loadingMetrics = ref(false);

// Observar cambios en la visibilidad o el usuario para obtener el estado de bloqueo y métricas
watch(
  () => [props.visible, props.user],
  async ([newVisible, newUser]) => {
    if (newVisible && newUser) {
      await Promise.all([checkLockStatus(), fetchMetrics()]);
    }
  },
);

const fetchMetrics = async () => {
  if (!props.user) return;
  loadingMetrics.value = true;
  try {
    const now = new Date();
    // Default to current month or year range
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const formatYMD = (d: Date) => d.toISOString().split("T")[0];

    // 1. Fetch Attendance Report for current month
    const reportRes = await attendanceService.getUserDailyReport(
      props.user.user_id,
      {
        fecha_inicio: formatYMD(firstDay),
        fecha_fin: formatYMD(lastDay),
      },
    );

    // 2. Fetch Incidents Balances (Saldos) for current year
    const saldosRes = await incidentService.getSaldos(
      props.user.user_id,
      now.getFullYear(),
    );

    // Process Data
    const reportData = reportRes.data;
    const saldosData = saldosRes.data;

    const diasTrabajados = reportData.resumen?.dias_trabajados || 0;
    const diasFalta = reportData.resumen?.dias_falta || 0;
    const diasTarde = reportData.resumen?.dias_tarde || 0;
    const horasExtras = Math.round(reportData.resumen?.total_horas_extras || 0);

    // Calculate total benefits consumed
    let totalBeneficios = 0;
    if (saldosData && saldosData.data && saldosData.data.length > 0) {
      // @ts-ignore
      saldosData.data[0].saldos.forEach((s: any) => {
        totalBeneficios += s.consumido?.dias || 0;
      });
    }

    metrics.value = {
      puntualidad: diasTrabajados,
      asistencia: diasFalta, // Invert logic visually if needed, but raw data here
      tardanzas: diasTarde,
      horas_extras: horasExtras,
      uso_beneficios: totalBeneficios,
    };
  } catch (e) {
    console.error("Error fetching metrics", e);
  } finally {
    loadingMetrics.value = false;
  }
};

const checkLockStatus = async () => {
  if (!props.user) return;

  // DEBUG LOGS
  console.log("ModalDatos: Checking lock status for user:", props.user.user_id);

  try {
    const response = await userService.getLockStatus(props.user.user_id);
    console.log("ModalDatos: Lock status response:", response);

    // Verificar estructura de datos anidada si el acceso directo falla (manejar tanto { isLocked: true } como { data: { isLocked: true } })
    // @ts-ignore
    const data = response.data?.data || response.data;

    if (data) {
      console.log("ModalDatos: Datos de bloqueo extraídos:", data);
      // Manejar tanto camelCase (API real) como potencialmente snake_case
      // @ts-ignore
      isLocked.value = !!data.isLocked;
      lockReason.value = data.lock_reason || "";
    } else {
      console.warn("ModalDatos: No se encontraron datos en la respuesta");
    }
  } catch (error) {
    console.warn("ModalDatos: No se pudo obtener el estado de bloqueo", error);
    // Por defecto desbloqueado o mantener estado anterior si hay error, pero es más seguro asumir desbloqueado para no bloquear la UI a menos que estemos seguros
    isLocked.value = false;
  }
};

const handleUnlockUser = async () => {
  if (!props.user) return;

  const result = await Swal.fire({
    title: "¿Desbloquear Usuario?",
    text: `Se desbloqueará el acceso para el usuario ${props.user.nombre}.`,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#27ae60",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, desbloquear",
    cancelButtonText: "Cancelar",
  });

  if (result.isConfirmed) {
    loadingUnlock.value = true;
    try {
      const response = await userService.unlockUser(props.user.user_id);
      console.log("ModalDatos: Respuesta de desbloqueo", response);

      // @ts-ignore
      const success = response.data?.success || response.data?.message;

      if (success) {
        await Swal.fire(
          "¡Desbloqueado!",
          "El usuario ha sido desbloqueado correctamente.",
          "success",
        );
        isLocked.value = false; // Actualizar estado local inmediatamente
      } else {
        throw new Error(response.data?.message || "Error desconocido");
      }
    } catch (error: any) {
      console.error("Error al desbloquear:", error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "No se pudo desbloquear al usuario.",
        "error",
      );
    } finally {
      loadingUnlock.value = false;
    }
  }
};

const handleResetPassword = async () => {
  if (!props.user) return;

  const result = await Swal.fire({
    title: "¿Restablecer contraseña?",
    text: `La contraseña se restablecerá al formato por defecto: Ugel${props.user.user_id}@`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, restablecer",
  });

  if (result.isConfirmed) {
    loadingReset.value = true;
    try {
      await authService.changePasswordByDNI(props.user.user_id, {});

      Swal.fire(
        "¡Restablecido!",
        "La contraseña ha sido restablecida correctamente.",
        "success",
      );
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo restablecer la contraseña.", "error");
    } finally {
      loadingReset.value = false;
    }
  }
};
</script>

<template>
  <Dialog
    v-model:visible="visibleModel"
    modal
    header="Detalle del Empleado"
    :style="{ width: '70vw' }"
    :breakpoints="{ '960px': '85vw', '640px': '95vw' }"
    class="p-fluid"
  >
    <div v-if="user" class="grid">
      <!-- Columna Izquierda: Espacio para Gráfico Radar -->
      <div
        class="col-12 md:col-5 flex flex-column align-items-center justify-content-center border-right-1 surface-border p-4"
      >
        <div
          class="w-full h-auto bg-white border-round flex align-items-center justify-content-center text-gray-500 overflow-hidden"
        >
          <!-- Espacio reservado para gráfico de radar -->
          <RadarPersView v-if="!loadingMetrics" :metrics="metrics" />
          <div v-else class="text-center p-4">
            <i class="pi pi-spin pi-spinner text-2xl"></i>
            <p>Cargando estadísticas...</p>
          </div>
        </div>
      </div>

      <!-- Columna Derecha: Datos del Empleado -->
      <div class="col-12 md:col-7 p-4">
        <h3
          class="text-xl font-bold text-gray-800 mb-4 border-bottom-1 surface-border pb-2"
        >
          Información Personal
        </h3>

        <div class="grid">
          <div class="col-12 md:col-6 mb-3">
            <label class="block text-500 font-medium mb-1"
              >Nombre Completo</label
            >
            <div class="text-900 font-bold">{{ user.nombre }}</div>
          </div>
          <div class="col-12 md:col-6 mb-3">
            <label class="block text-500 font-medium mb-1">DNI / Usuario</label>
            <div class="text-900">{{ user.user_id }}</div>
          </div>
          <div class="col-12 md:col-6 mb-3">
            <label class="block text-500 font-medium mb-1"
              >Correo Electrónico</label
            >
            <div class="text-900">{{ user.email || "-" }}</div>
          </div>
          <div class="col-12 md:col-6 mb-3">
            <label class="block text-500 font-medium mb-1">Teléfono</label>
            <div class="text-900">{{ user.telefono || "-" }}</div>
          </div>
          <div class="col-12 md:col-6 mb-3">
            <label class="block text-500 font-medium mb-1"
              >Departamento / Área</label
            >
            <div class="text-900">{{ user.departamento || "-" }}</div>
          </div>
          <div class="col-12 md:col-6 mb-3">
            <label class="block text-500 font-medium mb-1">Cargo</label>
            <div class="text-900">{{ user.cargo || "-" }}</div>
          </div>
          <div class="col-12 md:col-6 mb-3">
            <label class="block text-500 font-medium mb-1">Estado</label>
            <div class="flex align-items-center gap-2">
              <span
                :class="{
                  'text-green-600': user.estado === 'Activo',
                  'text-red-500': user.estado !== 'Activo',
                  'text-orange-500': user.estado === 'Pendiente',
                }"
                class="font-bold"
              >
                {{ user.estado }}
              </span>
              <!-- Bloqueo Status Indicator -->
              <span
                v-if="isLocked"
                class="inline-flex align-items-center px-2 py-1 border-round bg-red-100 text-red-700 text-xs font-bold"
              >
                <i class="pi pi-lock mr-1"></i> Bloqueado
              </span>
            </div>
          </div>
          <div class="col-12 md:col-6 mb-3">
            <label class="block text-500 font-medium mb-1">Rol de Acceso</label>
            <div class="text-900">{{ user.rol }}</div>
          </div>
        </div>

        <h3
          class="text-xl font-bold text-gray-800 mt-4 mb-4 border-bottom-1 surface-border pb-2"
        >
          Acciones de Seguridad
        </h3>
        <div class="flex flex-wrap gap-3">
          <Button
            label="Restablecer Contraseña"
            icon="pi pi-key"
            severity="warning"
            outlined
            @click="handleResetPassword"
            :loading="loadingReset"
          />

          <Button
            v-if="isLocked"
            label="Desbloquear Usuario"
            icon="pi pi-unlock"
            severity="success"
            outlined
            @click="handleUnlockUser"
            :loading="loadingUnlock"
          />
        </div>
      </div>
    </div>
  </Dialog>
</template>
