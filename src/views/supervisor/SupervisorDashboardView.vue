<template>
  <div class="container">
    <AdminNavbar />
    <div class="main-content">
      <HeaderView />
      <div class="page-content">
        <h1 class="text-3xl font-bold text-blue-800 mb-4">
          Dashboard de Equipo ({{ departmentName }})
        </h1>

        <!-- Tarjetas de Resumen (Cards) -->
        <div class="cards mb-4">
          <div class="card">
            <div class="card-header">
              <div class="card-title">Días Trabajados (Total)</div>
              <div class="card-icon present">
                <i class="fas fa-user-check"></i>
              </div>
            </div>
            <div class="card-value">
              {{ metrics.puntual }}
            </div>
            <div class="card-footer">Este mes (Equipo)</div>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="card-title">Ausencias (Total)</div>
              <div class="card-icon absent">
                <i class="fas fa-user-times"></i>
              </div>
            </div>
            <div class="card-value">{{ metrics.faltas }}</div>
            <div class="card-footer">Este mes (Equipo)</div>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="card-title">Tardanzas (Total)</div>
              <div class="card-icon late">
                <i class="fas fa-clock"></i>
              </div>
            </div>
            <div class="card-value">{{ metrics.tardanzas }}</div>
            <div class="card-footer">Este mes (Equipo)</div>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="card-title">Horas Trabajadas</div>
              <div class="card-icon extra">
                <i class="fas fa-briefcase"></i>
              </div>
            </div>
            <div class="card-value">{{ metrics.horas_trabajadas_formato }}</div>
            <div class="card-footer">Este mes (Equipo)</div>
          </div>
        </div>

        <div class="dashboard-grid">
          <!-- Quadrant 1: Team Attendance Chart -->
          <div class="dashboard-card" style="grid-column: span 2">
            <TeamAttendanceChart :stats="dailyStats" />
          </div>

          <!-- Quadrant 2: Recent Team Attendances -->
          <div class="dashboard-card">
            <div class="flex justify-content-between align-items-center mb-3">
              <h3 class="text-xl font-semibold m-0">
                Asistencia Reciente del Equipo
              </h3>
              <div class="flex gap-2">
                <Button
                  icon="pi pi-refresh"
                  rounded
                  text
                  @click="loadData(true)"
                  :loading="loading"
                  v-tooltip="'Recargar'"
                />
              </div>
            </div>
            <DataTable
              :value="attendances"
              :loading="loading"
              paginator
              :rows="5"
              responsiveLayout="scroll"
              class="p-datatable-sm"
              stripedRows
            >
              <Column header="Empleado">
                <template #body="slotProps">
                  <div class="flex flex-column">
                    <span class="font-bold text-sm">{{
                      slotProps.data.nombre_completo || slotProps.data.user_id
                    }}</span>
                  </div>
                </template>
              </Column>
              <Column field="fecha" header="Fecha">
                <template #body="slotProps">
                  {{ formatDate(slotProps.data.fecha) }}
                </template>
              </Column>
              <Column header="Entrada/Salida">
                <template #body="slotProps">
                  <div class="text-xs">
                    <div>E: {{ slotProps.data.entrada_real || "-" }}</div>
                    <div>S: {{ slotProps.data.salida_real || "-" }}</div>
                  </div>
                </template>
              </Column>
              <Column field="estado_asistencia" header="Estado">
                <template #body="slotProps">
                  <Tag
                    :value="slotProps.data.estado_asistencia"
                    :severity="getSeverity(slotProps.data.estado_asistencia)"
                  />
                </template>
              </Column>
            </DataTable>
          </div>

          <!-- Quadrant 3: Team Punctuality Distribution -->
          <div class="dashboard-card">
            <div class="mb-3">
              <h3 class="text-xl font-semibold m-0">
                Distribución de Asistencia (Mes)
              </h3>
            </div>
            <div class="flex justify-content-center">
              <GraCir :metrics="metrics" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import AdminNavbar from "@/components/Admin/NavbarView.vue";
import HeaderView from "@/components/header/HeaderView.vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Tag from "primevue/tag";
import GraCir from "@/components/Supervisor/GraCir.vue";
import TeamAttendanceChart from "@/components/Supervisor/TeamAttendanceChart.vue";
import { attendanceService } from "@/api/services/attendance.service";
import { DepartmentService } from "@/api/services/department.service";
import { useAuthStore } from "@/stores/authStore";

// Tipos
interface DailyStat {
  date: string;
  present: number;
  absent: number;
  late: number;
}

const authStore = useAuthStore();
const departmentName = ref("Mi Área");
const loading = ref(false);

// Datos
const attendances = ref<any[]>([]); // Usando 'any' para el ítem enriquecido del Reporte Diario
const dailyStats = ref<DailyStat[]>([]);
const metrics = ref({
  puntual: 0,
  tardanzas: 0,
  faltas: 0,
  horas_trabajadas_formato: "00:00",
});

// ... (imports)

const loadData = async (_force = false) => {
  // FIXED: Access 'dni' directly as 'user_id' might not be explicitly defined in the store type
  const userDni = authStore.user?.dni || authStore.user?.user_id;

  console.log("SupervisorDashboard: Starting loadData", {
    userDni,
    user: authStore.user,
  });

  if (!userDni) {
    console.warn("SupervisorDashboard: No user DNI found");
    return;
  }

  loading.value = true;

  try {
    const dni = String(userDni);

    // 1. Obtener el Departamento del Supervisor
    let deptId: number | null = null;
    let deptNameVal = "";

    try {
      console.log(`SupervisorDashboard: Fetching department for DNI ${dni}`);
      const deptRes = await DepartmentService.getByUserDni(dni);
      console.log("SupervisorDashboard: Dept response", deptRes.data);

      if (deptRes.data) {
        deptId = deptRes.data.id;
        deptNameVal = deptRes.data.nombre;
      }
    } catch (e) {
      console.warn(
        "No se pudo obtener el departamento del supervisor vía DNI, verificando store...",
        e,
      );
      if (authStore.user?.departamento_id) {
        deptId = authStore.user.departamento_id;
      }
    }

    if (!deptId) {
      console.error("El supervisor no tiene departamento asignado.");
      departmentName.value = "Sin Departamento";
      loading.value = false;
      return;
    }
    departmentName.value = deptNameVal || "Mi Equipo";

    // 2. Obtener Usuarios del Departamento
    const usersRes = await DepartmentService.getUsers(deptId);
    // @ts-ignore
    const teamUsers = usersRes.data?.data || usersRes.data || [];

    // debugInfo.value.teamSize = teamUsers.length;

    const teamUserIds = new Set<string>(
      teamUsers.map((u: any) => String(u.user_id || u.dni).trim()),
    );
    // Mapa para nombres
    const userNames = new Map<string, string>();
    teamUsers.forEach((u: any) => {
      userNames.set(String(u.user_id || u.dni).trim(), u.nombre);
    });

    if (teamUserIds.size === 0) {
      console.warn("No se encontraron usuarios en el departamento.");
      loading.value = false;
      return;
    }

    // 3. Obtener Reporte Diario (para todos)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const formatYMD = (d: Date) => d.toISOString().split("T")[0];

    console.log(
      `SupervisorDashboard: Fetching reports from ${formatYMD(firstDay)} to ${formatYMD(now)}`,
    );

    const promises = Array.from(teamUserIds).map(async (userId) => {
      try {
        // FIXED: Using getUserDailyReport correctly
        const report = await attendanceService.getUserDailyReport(userId, {
          fecha_inicio: formatYMD(firstDay),
          fecha_fin: formatYMD(now),
        });
        return report.data?.detalle || [];
      } catch (error) {
        console.error(`Error fetching report for user ${userId}:`, error);
        return [];
      }
    });

    const allTeamReportsNested = await Promise.all(promises);
    const teamReports = allTeamReportsNested
      .flat()
      .filter((r: any) => r.estado_asistencia !== "SIN_HORARIO");

    console.log(
      `SupervisorDashboard: Total reports fetched (active): ${teamReports.length}`,
    );

    // 4. Calcular Métricas y Estadísticas
    let totalPuntual = 0;
    let totalTardanza = 0;
    let totalFalta = 0;
    let totalSeconds = 0;

    const dateMap = new Map<
      string,
      { present: number; late: number; absent: number }
    >();

    teamReports.sort(
      (a: any, b: any) =>
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
    );

    attendances.value = teamReports.slice(0, 50).map((r: any) => ({
      ...r,
      nombre_completo: userNames.get(String(r.user_id).trim()) || r.user_id,
    }));

    teamReports.forEach((r: any) => {
      // ... same logic
      const date = r.fecha;
      if (!dateMap.has(date)) {
        dateMap.set(date, { present: 0, late: 0, absent: 0 });
      }
      const dayStat = dateMap.get(date)!;

      const status = (r.estado_asistencia || "").toUpperCase();

      if (status === "ASISTENCIA" || status === "PRESENTE") {
        totalPuntual++;
        dayStat.present++;
      } else if (status === "TARDANZA") {
        totalTardanza++;
        dayStat.late++;
      } else if (status === "FALTA" || status === "AUSENCIA") {
        totalFalta++;
        dayStat.absent++;
      }

      if (r.horas_trabajadas) {
        if (typeof r.horas_trabajadas === "number") {
          totalSeconds += r.horas_trabajadas * 3600;
        } else if (
          typeof r.horas_trabajadas === "string" &&
          r.horas_trabajadas.includes(":")
        ) {
          const [h, m] = r.horas_trabajadas.split(":").map(Number);
          totalSeconds += h * 3600 + m * 60;
        }
      }
    });

    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const hStr = h < 10 ? `0${h}` : `${h}`;
    const mStr = m < 10 ? `0${m}` : `${m}`;

    metrics.value = {
      puntual: totalPuntual,
      tardanzas: totalTardanza,
      faltas: totalFalta,
      horas_trabajadas_formato: `${hStr}:${mStr}`,
    };

    const sortedDates = Array.from(dateMap.keys()).sort();
    dailyStats.value = sortedDates.map((d) => ({
      date: d,
      ...dateMap.get(d)!,
    }));
  } catch (error) {
    console.error("Error cargando datos del equipo de supervisión", error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (isoString: string) => {
  if (!isoString) return "-";
  return new Date(isoString).toLocaleDateString("es-PE");
};

const getSeverity = (status: string) => {
  if (!status) return "info";
  switch (status.toUpperCase()) {
    case "ASISTENCIA":
    case "PRESENTE":
      return "success";
    case "TARDANZA":
      return "warning";
    case "FALTA":
    case "AUSENCIA":
      return "danger";
    case "FERIADO":
      return "info";
    default:
      return "secondary";
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
:root {
  --primary: #2c5aa0;
  --secondary: #3498db;
  --success: #27ae60;
  --warning: #f39c12;
  --danger: #e74c3c;
  --light: #ecf0f1;
  --dark: #34495e;
}

body {
  background-color: #f5f7fa;
  color: #333;
}

.container {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.page-content {
  padding: 30px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem;
}

@media (min-width: 992px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.dashboard-card {
  background-color: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.truncate-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
  display: inline-block;
}

/* Cards Styles copied from Dashboard */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.card {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.card-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.card-icon.present {
  background-color: #dcfce7;
  color: #22c55e;
}

.card-icon.absent {
  background-color: #fee2e2;
  color: #ef4444;
}

.card-icon.late {
  background-color: #fef9c3;
  color: #eab308;
}

.card-icon.extra {
  background-color: #dbeafe;
  color: #3b82f6;
}

.card-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 5px;
  line-height: 1;
}

.card-footer {
  font-size: 0.85rem;
  color: #94a3b8;
  font-weight: 500;
}
</style>
