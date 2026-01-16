<template>
  <div class="attendance-table">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando asistencia...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
    </div>

    <table v-else>
      <thead>
        <tr>
          <th>Empleado</th>
          <th>Hora Entrada</th>
          <th>Hora Salida</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(record, index) in attendanceRecords" :key="index">
          <td>
            {{ record.employeeName || "Desconocido" }}
          </td>
          <td>{{ formatTime(record.entrada_real) }}</td>
          <td>{{ formatTime(record.salida_real) }}</td>
          <td>
            <span :class="['status', getStatusClass(record.estado_asistencia)]">
              {{ record.estado_asistencia || "Pendiente" }}
            </span>
          </td>
        </tr>
        <tr v-if="attendanceRecords.length === 0">
          <td colspan="4" class="text-center">No hay registros hoy</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { attendanceService } from "@/api/services/attendance.service";
import { userService } from "@/api/services/user.service";
import { authService } from "@/api/services/auth.service";

const attendanceRecords = ref<any[]>([]);
const loading = ref(true);
const error = ref("");

// Helper para formato de hora
const formatTime = (isoString: string | null) => {
  if (!isoString) return "--:--";
  if (isoString.includes("T")) {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return isoString.substring(0, 5);
};

// Helper para clases de estado
const getStatusClass = (status?: string) => {
  if (!status) return "status-default";
  const s = status.toLowerCase();

  if (s === "presente" || s === "asistencia") return "status-present";
  if (s === "tarde" || s === "tardanza") return "status-late";
  if (s === "falta" || s === "ausente") return "status-absent";
  if (s === "feriado") return "status-default"; // O usar otro color

  return "status-default";
};

// Función principal de carga de datos (copiada y adaptada de PersonalAsis.vue)
const loadRecentAttendance = async () => {
  loading.value = true;
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    // 1. Calcular asistencia (opcional, para asegurar datos frescos)
    try {
      await attendanceService.calculateAttendance({
        fecha_inicio: dateStr,
        fecha_fin: dateStr,
      });
    } catch (calcError) {
      console.warn("Auto-calculate warning:", calcError);
    }

    // 2. Cargar datos en paralelo
    const [usersRes, authRes, reportRes] = await Promise.allSettled([
      userService.getAll(),
      authService.getAllUsers(),
      attendanceService.getDailyReport({
        fecha_inicio: dateStr,
        fecha_fin: dateStr,
      }),
    ]);

    let biometricUsers: any[] = [];
    let authUsers: any[] = [];
    let rawRecords: any[] = [];

    if (usersRes.status === "fulfilled") {
      // @ts-ignore
      const val = usersRes.value.data;
      biometricUsers = Array.isArray(val.data)
        ? val.data
        : Array.isArray(val)
        ? val
        : [];
    }

    if (authRes.status === "fulfilled") {
      const val = authRes.value as any;
      // Estructura puede variar: val.data.users o val.data.data
      authUsers = Array.isArray(val.data?.users)
        ? val.data.users
        : val.data?.data || [];
    }

    if (reportRes.status === "fulfilled") {
      rawRecords = reportRes.value.data || [];
    }

    // 3. Mapear datos
    const mappedRecords = rawRecords
      .filter((rec) => rec.estado_asistencia !== "SIN_HORARIO")
      .map((rec) => {
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

        return {
          ...rec,
          employeeName: fullName, // Campo unificado para la vista
        };
      });

    // 4. Filtrar/Ordenar: Queremos los ULTIMOS 5.
    // Si la API no ordena por hora, deberíamos ordenar nosotros si es posible.
    // Asumimos que queremos mostrar "actividad reciente", o simplemente los 5 primeros si son pocos.
    // PersonalAsis muestra todos. Aquí cortaremos.

    // Si queremos lo más reciente arriba:
    // mappedRecords.sort((a, b) => ... comparacion de entrada_real ... )

    attendanceRecords.value = mappedRecords.slice(0, 5);
  } catch (err) {
    console.error("Error loading recent attendance:", err);
    error.value = "Error obteniendo datos.";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadRecentAttendance();
});
</script>

<style scoped>
.attendance-table {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.status {
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-block;
}

.status-present {
  background-color: #e8f5e9;
  color: #27ae60;
}

.status-absent {
  background-color: #ffebee;
  color: #e74c3c;
}

.status-late {
  background-color: #fff8e1;
  color: #f39c12;
}

.status-default {
  background-color: #ecf0f1;
  color: #7f8c8d;
}

.loading-state,
.error-state {
  padding: 20px;
  text-align: center;
  color: #7f8c8d;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.text-center {
  text-align: center;
}
</style>
