<template>
  <div class="container">
    <!-- Sidebar -->
    <!-- Sidebar -->
    <AdminNavbar />

    <!-- Main Content -->
    <div class="main-content">
      <!-- Header -->
      <!-- Header -->
      <HeaderView />

      <!-- Page Content -->
      <div class="page-content">
        <div class="page-title">
          <h1>Reportes e Informes</h1>
          <button
            class="btn btn-success"
            id="generar-reporte-btn"
            @click="handleGenerateReport"
          >
            <i class="fas fa-plus"></i> Generar Reporte
          </button>
        </div>

        <!-- Filtros -->
        <div class="filters-container">
          <div class="filters-grid">
            <div class="filter-group">
              <label for="periodo">Período</label>
              <select id="periodo">
                <option value="hoy">Hoy</option>
                <option value="semana">Esta Semana</option>
                <option value="mes" selected>Este Mes</option>
                <option value="trimestre">Este Trimestre</option>
                <option value="anio">Este Año</option>
                <option value="personalizado">Personalizado</option>
              </select>
            </div>

            <div class="filter-group">
              <label for="fecha-desde">Desde</label>
              <input type="date" id="fecha-desde" v-model="fechaDesde" />
            </div>

            <div class="filter-group">
              <label for="fecha-hasta">Hasta</label>
              <input type="date" id="fecha-hasta" v-model="fechaHasta" />
            </div>

            <div class="filter-group">
              <label for="area">Área</label>
              <select id="area" v-model="selectedArea">
                <option value="">Todas las áreas</option>
                <option
                  v-for="dept in departments"
                  :key="dept.id"
                  :value="dept.id"
                >
                  {{ dept.nombre }}
                </option>
              </select>
            </div>

            <div class="filter-group">
              <label for="tipo-reporte">Tipo de Reporte</label>
              <select id="tipo-reporte">
                <option value="">Todos los tipos</option>
                <option value="asistencia">Asistencia General</option>
                <option value="tardanzas">Tardanzas</option>
                <option value="inasistencias">Inasistencias</option>
                <option value="horas-extras">Horas Extras</option>
                <option value="incidencias">Incidencias</option>
              </select>
            </div>
          </div>
          <!-- tabla de usuarios -->
          <!-- Tabla de Selección de Usuarios -->
          <div class="mb-4">
            <ReportPerView
              :users="users"
              v-model:selection="selectedUsers"
              :loading="loadingUsers"
            />

            <div
              class="mt-2 text-sm text-gray-600"
              v-if="selectedUsers.length > 0"
            >
              <strong>{{ selectedUsers.length }}</strong> usuarios
              seleccionados.
            </div>
          </div>

          <div class="filter-actions">
            <button
              class="btn btn-outline"
              @click="
                selectedArea = '';
                applyFilters();
              "
            >
              <i class="fas fa-redo"></i> Restablecer
            </button>
            <button class="btn btn-primary" @click="applyFilters">
              <i class="fas fa-filter"></i> Aplicar Filtros
            </button>
          </div>
        </div>

        <!-- Métricas Principales -->
        <div class="metrics-dashboard">
          <div class="metric-card">
            <div class="metric-header">
              <div class="metric-title">Asistencia Puntual</div>
              <div class="metric-icon attendance">
                <i class="fas fa-user-check"></i>
              </div>
            </div>
            <div class="metric-value">{{ metrics.puntual }}</div>
            <div class="metric-change positive">
              <i class="fas fa-chart-line"></i> Total en rango
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-header">
              <div class="metric-title">Tardanzas</div>
              <div class="metric-icon delay">
                <i class="fas fa-clock"></i>
              </div>
            </div>
            <div class="metric-value">{{ metrics.tardanzas }}</div>
            <div class="metric-change negative">
              <i class="fas fa-exclamation-circle"></i> Total en rango
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-header">
              <div class="metric-title">Inasistencias</div>
              <div class="metric-icon absence">
                <i class="fas fa-user-times"></i>
              </div>
            </div>
            <div class="metric-value">{{ metrics.faltas }}</div>
            <div class="metric-change negative">
              <i class="fas fa-user-slash"></i> Total en rango
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-header">
              <div class="metric-title">Horas Extras</div>
              <div class="metric-icon overtime">
                <i class="fas fa-business-time"></i>
              </div>
            </div>
            <div class="metric-value">{{ metrics.horas_extras }}h</div>
            <div class="metric-change positive">
              <i class="fas fa-clock"></i> Total en rango
            </div>
          </div>
        </div>

        <!-- Gráficos -->
        <div class="charts-container">
          <div class="chart-card">
            <div class="chart-header">
              <div class="chart-title">Asistencia por Área (Polar)</div>
            </div>
            <!-- Gráfico Polar -->
            <PolarAsisAreaView :data="attendanceRecords" />
          </div>

          <div class="chart-card">
            <div class="chart-header">
              <div class="chart-title">Distribución de Asistencia</div>
            </div>
            <!-- Gráfico Circular -->
            <DistAsisView :metrics="metrics" />
          </div>
        </div>

        <!-- Reportes Predefinidos -->
        <div class="reports-grid">
          <div class="report-card" data-report="asistencia-mensual">
            <div class="report-icon">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <div class="report-title">Reporte de Asistencia Mensual</div>
            <div class="report-description">
              Resumen completo de asistencia, tardanzas e inasistencias del mes
              actual por empleado y área.
            </div>
            <div class="report-meta">
              <span>Actualizado: Hoy</span>
              <button class="btn btn-outline btn-sm">
                <i class="fas fa-download"></i> Descargar
              </button>
            </div>
          </div>

          <div class="report-card" data-report="incidencias-detallado">
            <div class="report-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="report-title">Reporte de Incidencias Detallado</div>
            <div class="report-description">
              Listado detallado de todas las incidencias registradas con filtros
              por tipo, área y período.
            </div>
            <div class="report-meta">
              <span>Actualizado: Ayer</span>
              <button
                class="btn btn-outline btn-sm"
                @click="handleSaldosReport"
              >
                <i class="fas fa-download"></i> Descargar Saldos
              </button>
            </div>
          </div>

          <div class="report-card" data-report="horas-extras">
            <div class="report-icon">
              <i class="fas fa-business-time"></i>
            </div>
            <div class="report-title">Control de Horas Extras</div>
            <div class="report-description">
              Reporte de horas extras trabajadas con análisis por empleado, área
              y justificación.
            </div>
            <div class="report-meta">
              <span>Actualizado: Esta semana</span>
              <button class="btn btn-outline btn-sm">
                <i class="fas fa-download"></i> Descargar
              </button>
            </div>
          </div>
        </div>

        <!-- Historial de Reportes Generados -->
        <div class="reports-table-container">
          <ReportRegisView ref="reportRegisRef" />
        </div>
      </div>
    </div>
  </div>
  <ModalDetall
    v-model:visible="showSaldosModal"
    :users="allUsers"
    @generate-report="onSaldosGenerate"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import Swal from "sweetalert2";

import ModalDetall from "@/components/Modals/ModalDetall.vue";
import ReportPerView from "@/components/tables/ReportPerView.vue";
import ReportRegisView from "@/components/tables/ReportRegisView.vue";
import DistAsisView from "@/components/Graficas/DistAsisView.vue";
import PolarAsisAreaView from "@/components/Graficas/PolarAsisAreaView.vue";
import AdminNavbar from "@/components/Admin/NavbarView.vue";
import HeaderView from "@/components/header/HeaderView.vue";
import { reportService } from "@/api/services/report.service";

import type { BiometricUser } from "@/api/types/users.types";
import { useDataStore } from "@/stores/dataStore";
import { storeToRefs } from "pinia";

// Referencias
const reportRegisRef = ref();
const showSaldosModal = ref(false);

// Estado para Datos
// Estado para Datos
const store = useDataStore();
const {
  users: storeUsers,
  authUsers: storeAuthUsers,
  departments: storeDepartments,
  loadingUsers: storeLoadingUsers,
  metrics: storeMetrics,
  attendanceRecords: storeAttendanceRecords,
} = storeToRefs(store);

const allUsers = ref<BiometricUser[]>([]); // Usuarios procesados
const users = ref<BiometricUser[]>([]); // Usuarios filtrados por UI
const selectedUsers = ref<BiometricUser[]>([]);
const loadingUsers = computed(() => storeLoadingUsers.value);
const departments = computed(() => storeDepartments.value);
const metrics = computed(() => storeMetrics.value);
const attendanceRecords = computed(() => storeAttendanceRecords.value);

// Estado para Filtros
const selectedArea = ref<string>("");
const now = new Date();
const y = now.getFullYear();
const m = String(now.getMonth() + 1).padStart(2, "0");
const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();

const fechaDesde = ref<string>(`${y}-${m}-01`);
const fechaHasta = ref<string>(`${y}-${m}-${lastDay}`);

/*
// Metrics and Records are now in store and computed
const metrics = ref({ ... });
const attendanceRecords = ref<any[]>([]);
*/

const loadTableData = async () => {
  try {
    // Fetch data from store (cache first)
    await store.fetchAll();

    const deptsMap = new Map<number, string>();
    storeDepartments.value.forEach((d) => deptsMap.set(d.id, d.nombre));

    // Procesar Usuarios
    const enrichedUsers = storeUsers.value.map((user: BiometricUser) => {
      let deptName = "-";
      let deptId = user.departamento_id;

      // Intentar obtener del objeto existente
      if (typeof user.departamento === "object" && user.departamento?.nombre) {
        deptName = user.departamento.nombre;
        if (!deptId) deptId = user.departamento.id;
      }
      // Intentar obtener del ID usando el mapa de departamentos
      else if (user.departamento_id) {
        deptName = deptsMap.get(user.departamento_id) || "Sin Asignar";
      }

      return {
        ...user,
        departamento: deptName,
        departamento_id: deptId,
      };
    });

    // Procesar Auth Users del store
    const authDataRaw = storeAuthUsers.value;
    console.log("Auth Data From Store:", authDataRaw);

    const activeUserIds = new Set<string>();

    if (Array.isArray(authDataRaw)) {
      authDataRaw.forEach((u: any) => {
        if (u.esta_activo) {
          activeUserIds.add(String(u.usuario).trim());
        }
      });
    }
    console.log("Active User IDs Count:", activeUserIds.size);

    // Filtrar solo usuarios activos
    const activeUsers = enrichedUsers.filter((u: BiometricUser) => {
      const match = activeUserIds.has(String(u.user_id).trim());
      return match;
    });

    console.log("Active Users filtered Count:", activeUsers.length);

    allUsers.value = activeUsers;
    users.value = activeUsers; // Inicialmente mostrar todos
  } catch (error) {
    console.error("Error loading users for report:", error);
    Swal.fire("Error", "No se pudieron cargar los datos.", "error");
  }
};

const applyFilters = () => {
  // Loading is now handled by store, but filtering is local

  // Filtrar por Área
  let filtered = [...allUsers.value];

  if (selectedArea.value) {
    const areaId = Number(selectedArea.value);
    filtered = filtered.filter((u) => u.departamento_id === areaId);
  }

  users.value = filtered;

  // Actualizar métricas cuando cambian los filtros
  fetchMetrics();

  Swal.fire({
    icon: "success",
    title: "Filtros aplicados correctamente",
    showConfirmButton: false,
    timer: 1500,
  });
};

const fetchMetrics = async () => {
  // Call store action (which handles caching)
  await store.fetchMetrics(fechaDesde.value, fechaHasta.value);
};

const handleGenerateReport = async () => {
  // 1. Validación
  if (selectedUsers.value.length === 0) {
    Swal.fire({
      icon: "warning",
      title: "Atención",
      text: "Debes seleccionar al menos un usuario de la tabla para generar el reporte.",
    });
    return;
  }

  // 2. Selección de Formato
  const result = await Swal.fire({
    title: "Generar Reporte",
    text: "Selecciona el formato de exportación para los usuarios seleccionados.",
    icon: "question",
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: '<i class="fas fa-file-pdf"></i> PDF',
    denyButtonText: '<i class="fas fa-file-excel"></i> Excel',
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#e74c3c", // Rojo para PDF
    denyButtonColor: "#27ae60", // Verde para Excel
  });

  if (result.isDismissed) return;

  const isPdf = result.isConfirmed;
  const isExcel = result.isDenied;

  if (!isPdf && !isExcel) return;

  // 3. Preparar Datos (Payload)
  const [y, m] = fechaDesde.value.split("-");
  const mes = m;
  const anio = y;

  // Obtener Nombre del Área
  let areaName = "Todas las áreas";

  if (selectedArea.value) {
    // Filtro explícito seleccionado
    const areaId = Number(selectedArea.value);
    const areaObj = departments.value.find((d) => d.id === areaId);
    if (areaObj) areaName = areaObj.nombre;
  } else if (selectedUsers.value.length > 0) {
    // Sin filtro explícito, inferir de los usuarios seleccionados
    const uniqueDepts = new Set<string>();

    selectedUsers.value.forEach((u) => {
      let dName = "";
      if (
        typeof u.departamento === "object" &&
        (u.departamento as any).nombre
      ) {
        dName = (u.departamento as any).nombre;
      } else if (u.departamento) {
        dName = String(u.departamento);
      }

      if (dName && dName !== "-" && dName !== "Sin Asignar") {
        uniqueDepts.add(dName);
      }
    });

    if (uniqueDepts.size === 1) {
      // Solo una área implicada
      areaName = Array.from(uniqueDepts)[0];
    } else if (uniqueDepts.size > 1) {
      // Múltiples áreas: generar abreviaturas
      const abbrevs = Array.from(uniqueDepts).map((name) => {
        const cleaned = name.trim();
        // Tomar las primeras 3 letras y capitalizar
        if (cleaned.length <= 3) return cleaned;
        return (
          cleaned.substring(0, 3).charAt(0).toUpperCase() +
          cleaned.substring(1, 3).toLowerCase()
        );
      });
      areaName = abbrevs.join("/");
    }
  }

  const payload = {
    mes,
    anio,
    area: areaName,
    user_ids: selectedUsers.value.map((u) => u.user_id), // usando DNI string
  };

  try {
    Swal.fire({
      title: "Generando...",
      text: "Por favor espere mientras se procesa el reporte.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    // Mantenemos la llamada a la API pero ignoramos la respuesta blob para la descarga
    if (isPdf) {
      await reportService.exportPdf(payload);
    } else {
      await reportService.exportExcel(payload);
    }

    // 4. Actualizar Historial en lugar de descargar
    if (reportRegisRef.value) {
      reportRegisRef.value.loadReports();
    }

    Swal.fire(
      "Éxito",
      "Reporte generado correctamente. Revise la tabla de historial.",
      "success",
    );
  } catch (error) {
    console.error("Error generating report:", error);
    Swal.fire("Error", "Hubo un problema al generar el reporte.", "error");
  }
};

const handleSaldosReport = () => {
  showSaldosModal.value = true;
};

const onSaldosGenerate = async (data: {
  anio: number;
  empleado_id?: string;
}) => {
  try {
    Swal.fire({
      title: "Generando PDF",
      text: "Por favor espere...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const response = await reportService.exportSaldosPdf(data);

    // Descargar Blob
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `saldos_incidencias_${data.anio}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);

    // Swal.close(); // Don't close immediately if we want to show success
    Swal.close();
    Swal.fire("Éxito", "Reporte descargado correctamente", "success");
  } catch (error) {
    console.error("Error exporting saldos:", error);
    Swal.fire("Error", "Error al generar el reporte", "error");
  }
};

onMounted(() => {
  loadTableData();
  fetchMetrics();
});
</script>

<style>
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

/* Page Content */
.page-content {
  padding: 30px;
  flex: 1;
}

.page-title {
  margin-bottom: 20px;
  color: var(--primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Filtros de Reportes */
.filters-container {
  background-color: white;
  border-radius: 8px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--dark);
}

input,
select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 0.9rem;
  transition: border 0.3s;
}

input:focus,
select:focus {
  outline: none;
  border-color: var(--secondary);
}

.filter-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background-color: var(--secondary);
  color: white;
}

.btn-primary:hover {
  background-color: #2980b9;
}

.btn-success {
  background-color: var(--success);
  color: white;
}

.btn-success:hover {
  background-color: #219a52;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid #ddd;
  color: var(--dark);
}

.btn-outline:hover {
  background-color: #f8f9fa;
}

/* Dashboard de Métricas */
.metrics-dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.metric-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.metric-title {
  font-size: 0.9rem;
  color: #7f8c8d;
  font-weight: 600;
}

.metric-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.metric-icon.attendance {
  background-color: var(--success);
}

.metric-icon.delay {
  background-color: var(--warning);
}

.metric-icon.absence {
  background-color: var(--danger);
}

.metric-icon.overtime {
  background-color: var(--secondary);
}

.metric-value {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.metric-change {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.metric-change.positive {
  color: var(--success);
}

.metric-change.negative {
  color: var(--danger);
}

/* Gráficos y Visualizaciones */
.charts-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.chart-card {
  background-color: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-title {
  font-size: 1.1rem;
  color: var(--primary);
  font-weight: 600;
}

.chart-actions {
  display: flex;
  gap: 10px;
}

.chart-placeholder {
  height: 300px;
  background: linear-gradient(45deg, #f8f9fa, #e9ecef);
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  font-size: 1.1rem;
}

/* Reportes Predefinidos */
.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.report-card {
  background-color: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  cursor: pointer;
}

.report-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.report-icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
  color: var(--secondary);
}

.report-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--primary);
}

.report-description {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 20px;
  line-height: 1.5;
}

.report-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #7f8c8d;
}

/* Tabla de Reportes */
.reports-table-container {
  background-color: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
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
  color: var(--dark);
}

.report-type {
  display: flex;
  align-items: center;
  gap: 10px;
}

.type-icon {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.8rem;
}

.type-icon.daily {
  background-color: var(--success);
}

.type-icon.weekly {
  background-color: var(--warning);
}

.type-icon.monthly {
  background-color: var(--secondary);
}

.type-icon.custom {
  background-color: var(--primary);
}

.status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-completed {
  background-color: #e8f5e9;
  color: var(--success);
}

.status-processing {
  background-color: #fff8e1;
  color: var(--warning);
}

.actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: var(--secondary);
  transition: color 0.3s;
  padding: 5px;
  border-radius: 4px;
}

.action-btn:hover {
  background-color: #f8f9fa;
  color: #2980b9;
}

.action-btn.download {
  color: var(--success);
}

.action-btn.download:hover {
  color: #219a52;
}

/* Modal de Exportación */
.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background-color: white;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
}

.modal-header {
  padding: 20px 25px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 1.3rem;
  color: var(--primary);
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #7f8c8d;
}

.modal-body {
  padding: 25px;
}

.export-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
}

.export-option {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.export-option:hover {
  border-color: var(--secondary);
  background-color: #f8f9fa;
}

.export-option.selected {
  border-color: var(--secondary);
  background-color: #e3f2fd;
}

.export-icon {
  font-size: 2rem;
  margin-bottom: 10px;
  color: var(--secondary);
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

/* Responsive */
@media (max-width: 1200px) {
  .charts-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
  }

  .nav-links {
    display: flex;
    overflow-x: auto;
  }

  .nav-links li {
    flex: 0 0 auto;
  }

  .nav-links a {
    padding: 15px;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .filter-actions {
    justify-content: stretch;
  }

  .filter-actions .btn {
    flex: 1;
  }

  .export-options {
    grid-template-columns: 1fr;
  }

  table {
    display: block;
    overflow-x: auto;
  }
}
</style>
