<template>
  <div class="container">
    <AdminNavbar />
    <div class="main-content">
      <HeaderView />
      <div class="page-content">
        <h1 class="text-3xl font-bold text-blue-800 mb-4">
          Dashboard de Asistencia
        </h1>

        <div class="dashboard-grid mb-4">
          <!-- Stats Cards Row (Full Width effectively in 2-col visual but logically separate) -->
          <!-- We want a row of 4 cards above everything. Let's make a container for them -->
        </div>

        <!-- Tarjetas de Resumen (Cards) -->
        <div class="cards mb-4">
          <div class="card">
            <div class="card-header">
              <div class="card-title">Días Presente</div>
              <div class="card-icon present">
                <i class="fas fa-user-check"></i>
              </div>
            </div>
            <div class="card-value">
              {{ metrics.puntual + metrics.tardanzas }}
            </div>
            <div class="card-footer">Este mes</div>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="card-title">Ausencias</div>
              <div class="card-icon absent">
                <i class="fas fa-user-times"></i>
              </div>
            </div>
            <div class="card-value">{{ metrics.faltas }}</div>
            <div class="card-footer">Este mes</div>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="card-title">Tardanzas</div>
              <div class="card-icon late">
                <i class="fas fa-clock"></i>
              </div>
            </div>
            <div class="card-value">{{ metrics.tardanzas }}</div>
            <div class="card-footer">Este mes</div>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="card-title">Horas Trabajadas</div>
              <div class="card-icon total">
                <i class="fas fa-briefcase"></i>
              </div>
            </div>
            <div class="card-value">{{ metrics.horas_trabajadas_formato }}</div>
            <div class="card-footer">Este mes</div>
          </div>
        </div>

        <div class="dashboard-grid">
          <!-- Quadrant 1: Line Chart -->
          <div class="dashboard-card">
            <!-- Header handled inside component or here -->
            <GrafiLineas :attendances="attendances" />
          </div>

          <!-- Quadrant 2: Incident Balances (Saldos) -->
          <div class="dashboard-card">
            <div class="flex justify-content-between align-items-center mb-3">
              <h3 class="text-xl font-semibold m-0">Detalle de Incidencias</h3>
            </div>
            <DataTable
              :value="saldos"
              :loading="loadingSaldos"
              responsiveLayout="scroll"
              class="p-datatable-sm"
              stripedRows
            >
              <template #empty>No hay datos de saldos disponibles.</template>
              <Column field="tipo_nombre" header="Tipo"></Column>
              <Column header="Límite Anual">
                <template #body="slotProps">
                  {{
                    slotProps.data.limites.dias !== null
                      ? slotProps.data.limites.dias + " días"
                      : slotProps.data.limites.solicitudes !== null
                        ? slotProps.data.limites.solicitudes + " solicitudes"
                        : "Ilimitado"
                  }}
                </template>
              </Column>
              <Column header="Consumido">
                <template #body="slotProps">
                  <span class="text-yellow-600 font-bold">
                    {{
                      slotProps.data.consumido.dias > 0
                        ? slotProps.data.consumido.dias + " días"
                        : slotProps.data.consumido.solicitudes > 0
                          ? slotProps.data.consumido.solicitudes + " sol."
                          : "-"
                    }}
                  </span>
                </template>
              </Column>
              <Column header="Restante">
                <template #body="slotProps">
                  <span
                    :class="{
                      'text-green-600 font-bold':
                        (slotProps.data.restante.dias ?? 1) > 0,
                      'text-red-600': (slotProps.data.restante.dias ?? 1) <= 0,
                    }"
                  >
                    {{
                      slotProps.data.restante.dias !== null
                        ? slotProps.data.restante.dias + " días"
                        : slotProps.data.restante.solicitudes !== null
                          ? slotProps.data.restante.solicitudes + " sol."
                          : "∞"
                    }}
                  </span>
                </template>
              </Column>
              <Column
                header="Acciones"
                :exportable="false"
                style="min-width: 8rem"
              >
                <template #body="slotProps">
                  <Button
                    icon="pi pi-eye"
                    class="p-button-rounded p-button-info p-button-text"
                    @click="openDetailModal(slotProps.data)"
                    v-tooltip.top="'Ver Detalle'"
                  />
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
              <Column header="Día">
                <template #body="slotProps">
                  {{ getDayName(slotProps.data.fecha) }}
                </template>
              </Column>
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
              <DistAsisView :metrics="metrics" />
            </div>
          </div>
        </div>

        <!-- Detail Modal -->
        <Dialog
          v-model:visible="displayDetailModal"
          :header="
            selectedSaldo?.tipo_nombre
              ? `Detalle: ${selectedSaldo.tipo_nombre}`
              : 'Detalle de Solicitudes'
          "
          :modal="true"
          :style="{ width: '50vw' }"
        >
          <div
            v-if="
              selectedSaldo &&
              selectedSaldo.detalle &&
              selectedSaldo.detalle.length > 0
            "
          >
            <DataTable
              :value="selectedSaldo.detalle"
              responsiveLayout="scroll"
              class="p-datatable-sm"
              stripedRows
            >
              <Column field="fecha_inicio" header="Inicio">
                <template #body="slotProps">
                  {{ formatDate(slotProps.data.fecha_inicio) }}
                </template>
              </Column>
              <Column field="fecha_fin" header="Fin">
                <template #body="slotProps">
                  {{ formatDate(slotProps.data.fecha_fin) }}
                </template>
              </Column>
              <Column field="dias" header="Días/Cant."></Column>
              <Column field="estado_id" header="Estado">
                <template #body>
                  <Tag value="Registrado" severity="info" />
                </template>
              </Column>
            </DataTable>
          </div>
          <div v-else class="p-3 text-center text-gray-500">
            No hay solicitudes registradas para este tipo.
          </div>
          <template #footer>
            <Button
              label="Cerrar"
              icon="pi pi-times"
              @click="displayDetailModal = false"
              text
            />
          </template>
        </Dialog>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
// @ts-ignore
const vTooltip = Tooltip;
import AdminNavbar from "@/components/Admin/NavbarView.vue";
import HeaderView from "@/components/header/HeaderView.vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Tag from "primevue/tag";
import Tooltip from "primevue/tooltip";

import Calendar from "primevue/calendar"; // Import Calendar
import Dialog from "primevue/dialog"; // Import Dialog
import GrafiLineas from "@/components/Employed/GrafiLineas.vue";
import DistAsisView from "@/components/Graficas/DistAsisView.vue"; // Reusing Pie Chart
import { attendanceService } from "@/api/services/attendance.service";
import { incidentService } from "@/api/services/incident.service"; // Import Incident Service
import type { Attendance } from "@/api/types/attendance.types";
import type { Incidencia, SaldoItem } from "@/api/types/incidents.types";

const attendances = ref<Attendance[]>([]);
const incidents = ref<Incidencia[]>([]); // Estado para incidencias
const saldos = ref<SaldoItem[]>([]); // Estado para saldos
const loading = ref(false);
const loadingIncidents = ref(false);
const loadingSaldos = ref(false);

const maxDate = ref(new Date()); // Allow selection up to today
const displayDetailModal = ref(false);
const selectedSaldo = ref<SaldoItem | null>(null);

const openDetailModal = (saldo: SaldoItem) => {
  selectedSaldo.value = saldo;
  displayDetailModal.value = true;
};

const getCurrentUserDNI = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.usuario; // Asumiendo que 'usuario' es el DNI basado en la lógica de auth
    }
  } catch (e) {
    console.error("Error al leer usuario", e);
  }
  return null;
};

const selectedDate = ref(new Date()); // Default to current date

// --- Métricas Calculadas (desde Backend) ---
// Initialize metrics with default values
const metrics = ref({
  puntual: 0,
  tardanzas: 0,
  faltas: 0,
  horas_trabajadas_formato: "00:00",
});

watch(selectedDate, () => {
  loadData(false);
});

const loadData = async (forceRecalculate = false) => {
  const dni = getCurrentUserDNI();
  if (!dni) return;

  loading.value = true;
  loadingIncidents.value = true;

  try {
    // 1. Obtener Reporte Diario de Asistencia (Nuevo Endpoint)
    // Calculamos rango basado en el mes seleccionado
    const now = new Date();
    // Ensure selectedDate is valid
    if (!selectedDate.value) selectedDate.value = now;

    const sel = selectedDate.value;

    // Primer día del mes seleccionado
    const firstDay = new Date(sel.getFullYear(), sel.getMonth(), 1);

    // Último día del mes seleccionado
    const lastDayOfMonth = new Date(sel.getFullYear(), sel.getMonth() + 1, 0);

    // Regla: "no permitir el futuro" y "calculo hasta el dia actual"
    // Si el mes seleccionado es el actual, el fin es hoy.
    // Si es un mes pasado, el fin es el último día de ese mes.
    // Si es futuro (aunque el UI lo bloquee), tomamos min(finMes, hoy) por seguridad.

    let endDate = lastDayOfMonth;
    if (lastDayOfMonth > now) {
      endDate = now;
    }

    const formatYMD = (d: Date) => d.toISOString().split("T")[0];

    // FIX: Calcular asistencia automÃ¡ticamente SOLO si se solicita (botÃ³n refrescar)
    // Esto evita la latencia en la carga inicial, pero permite al usuario corregir estados.
    if (forceRecalculate) {
      try {
        await attendanceService.calculateAttendance({
          fecha_inicio: formatYMD(firstDay),
          fecha_fin: formatYMD(endDate),
        });
      } catch (calcError) {
        console.warn("Error recalculando asistencia:", calcError);
      }
    }

    const reportResponse = await attendanceService.getUserDailyReport(dni, {
      fecha_inicio: formatYMD(firstDay),
      fecha_fin: formatYMD(endDate),
    });

    const reportData = reportResponse.data;

    // A. Actualizar Tabla y Gráfico de Líneas con 'detalle'
    // El gráfico de líneas ahora soporta 'fecha' + 'entrada_real'
    //@ts-ignore
    let data = reportData.detalle || [];

    // Ordenar Inversamente (Más reciente primero) para la tabla
    // Pero el gráfico suele necesitar orden cronológico.
    // Opción: Invertir solo para la tabla visualmente, o tener dos listas.
    // La grafica GrafiLineas hace su propio sort interno? Revisemos.
    // GrafiLineas: "dailyAtt.sort(...)".
    // Así que podemos pasarle la lista en cualquier orden.
    // Para la tabla requerimos descendente.
    data.sort((a: any, b: any) => {
      const da = new Date(a.fecha || a.timestamp);
      const db = new Date(b.fecha || b.timestamp);
      return db.getTime() - da.getTime(); // Descendente
    });

    attendances.value = data;

    // B. Actualizar Métricas con 'resumen'
    if (reportData.resumen) {
      metrics.value = {
        puntual: reportData.resumen.dias_trabajados || 0, // Asumiendo días trabajados como puntuales/normales aprox.
        tardanzas: reportData.resumen.dias_tarde || 0,
        faltas: reportData.resumen.dias_falta || 0,
        // @ts-ignore
        horas_trabajadas_formato:
          reportData.resumen.total_horas_trabajadas_formato || "00:00",
      };
    }

    // 2. Obtener Incidencias
    const incResponse = await incidentService.getAllIncidencias({
      // @ts-ignore
      search: dni, // Muchas APIs soportan una búsqueda genérica
    });
    // @ts-ignore
    const allIncidents = incResponse.data?.data || incResponse.data || [];
    // Filtrar por DNI por si acaso 'search' fue muy amplio o ignorado
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
        return db.getTime() - da.getTime(); // Descendente
      });

    // 3. Obtener Saldos de Incidencias (Nuevo Endpoint)
    loadingSaldos.value = true;
    try {
      const saldosResponse = await incidentService.getSaldos(
        dni,
        sel.getFullYear(),
      );
      // Extraemos saldos del respuesta. La respuesta es { anio: ..., data: [{ empleado_id, saldos: [...] }] }
      // Como pedimos por DNI especifico, deberíamos tomar el primer elemento de data
      if (
        saldosResponse.data &&
        saldosResponse.data.data &&
        saldosResponse.data.data.length > 0
      ) {
        saldos.value = saldosResponse.data.data[0].saldos;
      } else {
        saldos.value = [];
      }
    } catch (e) {
      console.error("Error cargando saldos", e);
      saldos.value = [];
    } finally {
      loadingSaldos.value = false;
    }
  } catch (error) {
    console.error("Error cargando datos del dashboard", error);
  } finally {
    loading.value = false;
    loadingIncidents.value = false;
  }
};

const formatDate = (isoString: string) => {
  if (!isoString) return "-";
  // Fix: Si la fecha viene como YYYY-MM-DD, agregar una hora segura para evitar desfases de zona horaria al convertirse a Date
  // O simplemente usar UTC.
  // Una estrategia comun es agregar T00:00:00 y usar getUTC* methods, o agregar T12:00:00 (medio dia) para que caiga el mismo dia.
  if (isoString.length === 10 && isoString.includes("-")) {
    // Forzar interpretación local o añadir hora para evitar "día anterior" por UTC-5
    return new Date(isoString + "T12:00:00").toLocaleDateString("es-PE");
  }
  return new Date(isoString).toLocaleDateString("es-PE");
};

const getDayName = (isoString: string) => {
  if (!isoString) return "-";
  let date;
  if (isoString.length === 10 && isoString.includes("-")) {
    date = new Date(isoString + "T12:00:00");
  } else {
    date = new Date(isoString);
  }
  const dayName = date.toLocaleDateString("es-PE", { weekday: "long" });
  return dayName.charAt(0).toUpperCase() + dayName.slice(1);
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

/* * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
} */

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
  border-radius: 12px; /* Smoother corners */
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06); /* Modern shadow */
  height: 100%; /* Fill grid cell height */
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
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.card-icon.present {
  background-color: var(--success);
}

.card-icon.absent {
  background-color: var(--danger);
}

.card-icon.late {
  background-color: var(--warning);
}

.card-icon.total {
  background-color: var(--secondary);
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
