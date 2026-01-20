<template>
  <div class="container">
    <AdminNavbar />
    <div class="main-content">
      <HeaderView />
      <div class="page-content">
        <h1 class="text-3xl font-bold text-blue-800 mb-4">
          Dashboard de Supervisor
        </h1>

        <div class="dashboard-grid">
          <!-- Quadrant 1: Line Chart -->
          <div class="dashboard-card">
            <!-- Header handled inside component or here -->
            <GraLinea :attendances="attendances" />
          </div>

          <!-- Quadrant 2: Recent Incidents -->
          <div class="dashboard-card">
            <div class="flex justify-content-between align-items-center mb-3">
              <h3 class="text-xl font-semibold m-0">
                Mis Incidencias Recientes
              </h3>
            </div>
            <DataTable
              :value="incidents"
              :loading="loadingIncidents"
              paginator
              :rows="5"
              responsiveLayout="scroll"
              class="p-datatable-sm"
              stripedRows
            >
              <template #empty>No hay incidencias recientes.</template>
              <Column field="fecha_inicio" header="Fecha">
                <template #body="slotProps">
                  {{ formatDate(slotProps.data.fecha_inicio) }}
                </template>
              </Column>
              <Column field="tipo_incidencia.nombre" header="Tipo">
                <template #body="slotProps">
                  <Tag
                    :value="slotProps.data.tipo_incidencia?.nombre || 'General'"
                    severity="warning"
                  />
                </template>
              </Column>
              <Column field="descripcion" header="Observación">
                <template #body="slotProps">
                  <span
                    class="text-sm text-gray-600 truncate-text"
                    :title="slotProps.data.descripcion"
                    >{{ slotProps.data.descripcion }}</span
                  >
                </template>
              </Column>
            </DataTable>
          </div>

          <!-- Quadrant 3: Attendance Log -->
          <div class="dashboard-card">
            <div class="flex justify-content-between align-items-center mb-3">
              <h3 class="text-xl font-semibold m-0">
                Mi Registro de Asistencia - Este Mes
              </h3>
              <div class="flex gap-2">
                <Calendar
                  v-model="selectedDate"
                  view="month"
                  dateFormat="mm/yy"
                  :maxDate="maxDate"
                  showIcon
                  class="w-8rem"
                />
                <Button
                  icon="pi pi-refresh"
                  rounded
                  text
                  @click="loadData"
                  :loading="loading"
                  tooltip="Recargar"
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
              <Column field="fecha" header="Fecha">
                <template #body="slotProps">
                  {{ formatDate(slotProps.data.fecha) }}
                </template>
              </Column>
              <Column field="entrada_real" header="Entrada">
                <template #body="slotProps">
                  {{ slotProps.data.entrada_real || "-" }}
                </template>
              </Column>
              <Column field="salida_real" header="Salida">
                <template #body="slotProps">
                  {{ slotProps.data.salida_real || "-" }}
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

          <!-- Quadrant 4: Punctuality Chart -->
          <div class="dashboard-card">
            <div class="mb-3">
              <h3 class="text-xl font-semibold m-0">
                Mi Puntualidad - Este Mes
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
import { ref, onMounted, watch } from "vue";
import AdminNavbar from "@/components/Admin/NavbarView.vue";
import HeaderView from "@/components/header/HeaderView.vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Tag from "primevue/tag";
import Calendar from "primevue/calendar";
import GraLinea from "@/components/Supervisor/GraLinea.vue";
import GraCir from "@/components/Supervisor/GraCir.vue";
import { attendanceService } from "@/api/services/attendance.service";
import { incidentService } from "@/api/services/incident.service";
import type { Attendance } from "@/api/types/attendance.types";
import type { Incidencia } from "@/api/types/incidents.types";

const attendances = ref<Attendance[]>([]);
const incidents = ref<Incidencia[]>([]);
const loading = ref(false);
const loadingIncidents = ref(false);
const maxDate = ref(new Date());

const getCurrentUserDNI = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.usuario; // Suponiendo 'usuario' es DNI
    }
  } catch (e) {
    console.error("Error al leer usuario", e);
  }
  return null;
};

const selectedDate = ref(new Date());

const metrics = ref({
  puntual: 0,
  tardanzas: 0,
  faltas: 0,
  horas_extras: 0,
});

watch(selectedDate, () => {
  loadData();
});

const loadData = async () => {
  const dni = getCurrentUserDNI();
  if (!dni) return;

  loading.value = true;
  loadingIncidents.value = true;

  try {
    const now = new Date();
    if (!selectedDate.value) selectedDate.value = now;
    const sel = selectedDate.value;
    const firstDay = new Date(sel.getFullYear(), sel.getMonth(), 1);
    const lastDayOfMonth = new Date(sel.getFullYear(), sel.getMonth() + 1, 0);

    let endDate = lastDayOfMonth;
    if (lastDayOfMonth > now) {
      endDate = now;
    }

    const formatYMD = (d: Date) => d.toISOString().split("T")[0];

    const reportResponse = await attendanceService.getUserDailyReport(dni, {
      fecha_inicio: formatYMD(firstDay),
      fecha_fin: formatYMD(endDate),
    });

    const reportData = reportResponse.data;
    // @ts-ignore
    let data = reportData.detalle || [];

    data.sort((a: any, b: any) => {
      const da = new Date(a.fecha || a.timestamp);
      const db = new Date(b.fecha || b.timestamp);
      return db.getTime() - da.getTime();
    });

    attendances.value = data;

    if (reportData.resumen) {
      metrics.value = {
        puntual: reportData.resumen.dias_trabajados || 0,
        tardanzas: reportData.resumen.dias_tarde || 0,
        faltas: reportData.resumen.dias_falta || 0,
        horas_extras: Math.round(reportData.resumen.total_horas_extras || 0),
      };
    }

    const incResponse = await incidentService.getAllIncidencias({
      // @ts-ignore
      search: dni,
    });
    // @ts-ignore
    const allIncidents = incResponse.data?.data || incResponse.data || [];
    incidents.value = allIncidents
      .filter((i: any) => {
        const emp = i.empleado;
        if (emp && (emp.user_id === dni || emp.nro_documento === dni))
          return true;
        return false;
      })
      .sort((a: any, b: any) => {
        const da = new Date(a.fecha_inicio);
        const db = new Date(b.fecha_inicio);
        return db.getTime() - da.getTime();
      });
  } catch (error) {
    console.error("Error cargando datos del dashboard", error);
  } finally {
    loading.value = false;
    loadingIncidents.value = false;
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

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

body {
  background-color: #f5f7fa;
  color: #333;
}

.container {
  display: flex;
  min-height: 100vh;
}

/* Sidebar */
.sidebar {
  width: 250px;
  background-color: var(--primary);
  color: white;
  transition: all 0.3s;
}

.logo {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo h2 {
  font-size: 1.5rem;
}

.nav-links {
  padding: 20px 0;
}

.nav-links li {
  list-style: none;
}

.nav-links a {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  color: white;
  text-decoration: none;
  transition: all 0.3s;
}

.nav-links a:hover,
.nav-links a.active {
  background-color: rgba(255, 255, 255, 0.1);
  border-left: 4px solid var(--secondary);
}

.nav-links i {
  margin-right: 10px;
  font-size: 1.2rem;
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Header */
.header {
  background-color: white;
  padding: 15px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
}

.user-info img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
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
</style>
