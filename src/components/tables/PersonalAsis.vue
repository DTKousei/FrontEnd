<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import DatePicker from "primevue/datepicker";
import Tag from "primevue/tag";
import Avatar from "primevue/avatar";
import { attendanceService } from "@/api/services/attendance.service";
import { userService } from "@/api/services/user.service";
import { authService } from "@/api/services/auth.service";
import type { BiometricUser } from "@/api/types/users.types";

interface DailyRecord {
  id: number;
  fecha: string;
  user_id: string;
  horario_id: number | null;
  horas_esperadas: number; // e.g. 8.0
  horas_trabajadas: number; // e.g. 0.0
  estado_asistencia: string; // "FERIADO", "FALTA", "ASISTENCIA", etc.
  es_justificado: boolean;
  entrada_real: string | null;
  salida_real: string | null;

  // UI Helpers
  employeeName?: string;
  employeeRole?: string;
  avatarInitials?: string;
}

const records = ref<DailyRecord[]>([]);
const loading = ref(true);
const calculating = ref(false);
const selectedDate = ref<Date>(new Date());

const handleCalculation = async () => {
  calculating.value = true;
  try {
    const dateStr = formatDateForApi(selectedDate.value);
    await attendanceService.calculateAttendance({
      fecha_inicio: dateStr,
      fecha_fin: dateStr,
    });
    // SweetAlert2 ideally, but standard alert for now if quick
    alert("Cálculo de asistencia completado exitosamente.");
    loadData();
  } catch (error) {
    console.error("Error calculating attendance:", error);
    alert("Error al calcular la asistencia.");
  } finally {
    calculating.value = false;
  }
};

const getSeverity = (status: string) => {
  switch (status?.toUpperCase()) {
    case "ASISTENCIA":
    case "PRESENTE":
      return "success";
    case "TARDE":
      return "warn";
    case "FALTA":
    case "AUSENTE":
      return "danger";
    case "FERIADO":
      return "info";
    default:
      return "secondary";
  }
};

const getInitials = (name: string) => {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

const formatDateForApi = (date: Date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatTime = (isoString: string | null) => {
  if (!isoString) return "--:--";
  // Assuming ISO string or HH:mm:ss format depending on API, lets handle standard Date parsable strings
  // or "HH:mm:ss" directly which new Date() might not parse well universally without date part in some browsers,
  // but if backend sends full ISO, it's fine.
  // If backend sends just time "08:00:00", we just show it cut to HH:mm
  if (isoString.includes("T")) {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return isoString.substring(0, 5); // Fallback for HH:mm:ss
};

const loadData = async () => {
  loading.value = true;
  try {
    const dateStr = formatDateForApi(selectedDate.value);

    // 1. Fetch Users & Auth Users in parallel for mapping
    // We cache this? Ideally yes, but for now simple fetch
    const [usersRes, authRes, reportRes] = await Promise.allSettled([
      userService.getAll(),
      authService.getAllUsers(),
      attendanceService.getDailyReport({
        fecha_inicio: dateStr,
        fecha_fin: dateStr,
      }),
    ]);

    let biometricUsers: BiometricUser[] = [];
    let authUsers: any[] = [];
    let rawRecords: any[] = [];

    if (usersRes.status === "fulfilled") {
      // @ts-ignore
      biometricUsers = Array.isArray(usersRes.value.data.data)
        ? usersRes.value.data.data
        : Array.isArray(usersRes.value.data)
        ? usersRes.value.data
        : [];
    }

    if (authRes.status === "fulfilled") {
      const val = authRes.value as any;
      authUsers = Array.isArray(val.data?.users)
        ? val.data.users
        : val.data?.data || [];
    }

    if (reportRes.status === "fulfilled") {
      rawRecords = reportRes.value.data;
    }

    // Map logic
    records.value = rawRecords.map((rec) => {
      const bUser = biometricUsers.find(
        (u) => String(u.user_id) === String(rec.user_id)
      );
      const aUser = authUsers.find(
        (u) => String(u.usuario) === String(rec.user_id)
      );

      const fullName = bUser
        ? bUser.nombre
        : aUser
        ? `User ${rec.user_id}`
        : `ID: ${rec.user_id}`;
      const role = bUser?.cargo || aUser?.rol?.nombre || "N/A";

      return {
        ...rec,
        employeeName: fullName,
        employeeRole: role,
        avatarInitials: getInitials(fullName),
      };
    });
  } catch (error) {
    console.error("Error loading daily records:", error);
  } finally {
    loading.value = false;
  }
};

watch(selectedDate, () => {
  loadData();
});

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="card bg-white p-4 rounded-lg shadow-sm">
    <!-- Header -->
    <div
      class="flex flex-wrap md:flex-nowrap align-items-center justify-content-between w-full mb-4 gap-4"
    >
      <h2 class="text-xl font-bold text-blue-600 m-0">Registros de Hoy</h2>

      <div class="flex align-items-center gap-2">
        <DatePicker v-model="selectedDate" dateFormat="dd/mm/yy" showIcon />
        <Button
          icon="pi pi-cog"
          label="Calcular"
          severity="secondary"
          @click="handleCalculation"
          :loading="calculating"
        />
        <Button
          icon="pi pi-refresh"
          label="Actualizar"
          severity="bg-blue-600"
          @click="loadData"
          :loading="loading"
        />
      </div>
    </div>

    <!-- Table -->
    <DataTable
      :value="records"
      stripedRows
      :loading="loading"
      responsiveLayout="scroll"
      paginator
      :rows="10"
      :rowsPerPageOptions="[5, 10, 25]"
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} empleados"
    >
      <template #empty>No hay registros para este día.</template>

      <!-- Employee Column -->
      <Column
        header="Empleado"
        style="min-width: 14rem"
        sortable
        field="employeeName"
      >
        <template #body="{ data }">
          <div class="flex items-center gap-3">
            <Avatar
              :label="data.avatarInitials"
              shape="circle"
              size="large"
              class="bg-blue-500 text-white"
            />
            <span class="font-bold text-gray-800">{{ data.employeeName }}</span>
          </div>
        </template>
      </Column>

      <!-- Cargo Column -->
      <Column
        header="Cargo"
        sortable
        field="employeeRole"
        style="min-width: 10rem"
      >
        <template #body="{ data }">
          {{ data.employeeRole }}
        </template>
      </Column>

      <!-- Entrada -->
      <Column header="Entrada" sortable field="entrada_real">
        <template #body="{ data }">
          {{ formatTime(data.entrada_real) }}
        </template>
      </Column>

      <!-- Salida -->
      <Column header="Salida" sortable field="salida_real">
        <template #body="{ data }">
          {{ formatTime(data.salida_real) }}
        </template>
      </Column>

      <!-- Horas Worked -->
      <Column header="Horas Trabajadas" sortable field="horas_trabajadas">
        <template #body="{ data }">
          {{ data.horas_trabajadas ? data.horas_trabajadas.toFixed(2) : "--" }}
        </template>
      </Column>

      <!-- Status -->
      <Column header="Estado" sortable field="estado_asistencia">
        <template #body="{ data }">
          <Tag
            :value="data.estado_asistencia"
            :severity="getSeverity(data.estado_asistencia)"
            rounded
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>
/* Optional specific overrides if not covered by global styles */
:deep(.p-datepicker) {
  width: 140px;
}
</style>
