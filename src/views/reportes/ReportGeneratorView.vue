<template>
  <div class="container">
    <!-- Sidebar -->
    <div class="sidebar">
      <div class="logo">
        <h2><i class="fas fa-fingerprint"></i> Control Asistencia</h2>
        <p>UGEL Sucre</p>
      </div>
      <ul class="nav-links">
        <li>
          <router-link to="/dashboard"
            ><i class="fas fa-tachometer-alt"></i> Dashboard</router-link
          >
        </li>
        <li>
          <router-link to="/biometrico"
            ><i class="fas fa-user-clock"></i> Registro Asistencia</router-link
          >
        </li>
        <li>
          <router-link to="/personal"
            ><i class="fas fa-users"></i> Gestión Personal</router-link
          >
        </li>
        <li>
          <router-link to="/papeletas"
            ><i class="fas fa-chart-bar"></i> Papeletas</router-link
          >
        </li>
        <li>
          <router-link to="/incidencias"
            ><i class="fas fa-question-circle"></i> Registro
            Incidencias</router-link
          >
        </li>
        <li>
          <router-link to="/reportes" class="active"
            ><i class="fas fa-chart-bar"></i> Reportes</router-link
          >
        </li>
        <li>
          <router-link to="/configuracion"
            ><i class="fas fa-cog"></i> Configuración</router-link
          >
        </li>
      </ul>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Header -->
      <div class="header">
        <div class="search-bar">
          <input type="text" placeholder="Buscar reportes..." />
        </div>
        <div class="user-info">
          <img
            src="https://ui-avatars.com/api/?name=Admin+User&background=3498db&color=fff"
            alt="Usuario"
          />
          <div>
            <div class="user-name">Admin User</div>
            <div class="user-role">Administrador</div>
            <div>
              <button @click="logout" class="logout-btn" title="Cerrar Sesión">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

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
            <div class="metric-value">89.2%</div>
            <div class="metric-change positive">
              <i class="fas fa-arrow-up"></i> 2.1% vs mes anterior
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-header">
              <div class="metric-title">Tardanzas</div>
              <div class="metric-icon delay">
                <i class="fas fa-clock"></i>
              </div>
            </div>
            <div class="metric-value">42</div>
            <div class="metric-change negative">
              <i class="fas fa-arrow-up"></i> 8% vs mes anterior
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-header">
              <div class="metric-title">Inasistencias</div>
              <div class="metric-icon absence">
                <i class="fas fa-user-times"></i>
              </div>
            </div>
            <div class="metric-value">18</div>
            <div class="metric-change positive">
              <i class="fas fa-arrow-down"></i> 12% vs mes anterior
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-header">
              <div class="metric-title">Horas Extras</div>
              <div class="metric-icon overtime">
                <i class="fas fa-business-time"></i>
              </div>
            </div>
            <div class="metric-value">156h</div>
            <div class="metric-change positive">
              <i class="fas fa-arrow-up"></i> 15% vs mes anterior
            </div>
          </div>
        </div>

        <!-- Gráficos -->
        <div class="charts-container">
          <div class="chart-card">
            <div class="chart-header">
              <div class="chart-title">Asistencia por Área - Octubre 2025</div>
              <div class="chart-actions">
                <button class="btn btn-outline">
                  <i class="fas fa-download"></i>
                </button>
              </div>
            </div>
            <div class="chart-placeholder" id="chart2"></div>
          </div>

          <div class="chart-card">
            <div class="chart-header">
              <div class="chart-title">Distribución de Incidencias</div>
              <div class="chart-actions">
                <button class="btn btn-outline">
                  <i class="fas fa-download"></i>
                </button>
              </div>
            </div>
            <div class="chart-placeholder">
              Gráfico Circular - Tipos de Incidencias
            </div>
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
              <button class="btn btn-outline btn-sm">
                <i class="fas fa-download"></i> Descargar
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
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";
import ReportPerView from "@/components/tables/ReportPerView.vue";
import ReportRegisView from "@/components/tables/ReportRegisView.vue";
import { userService } from "@/api/services/user.service";
import { reportService } from "@/api/services/report.service";
import { DepartmentService } from "@/api/services/department.service";
import type { BiometricUser } from "@/api/types/users.types";
import type { Department } from "@/api/types/department.types";

const router = useRouter();

// References
const reportRegisRef = ref();

// State for Data

// State for Data
const allUsers = ref<BiometricUser[]>([]); // Copy of all loaded users
const users = ref<BiometricUser[]>([]); // Displayed users (filtered)
const selectedUsers = ref<BiometricUser[]>([]);
const loadingUsers = ref(false);
const departments = ref<Department[]>([]);

// State for Filters
const selectedArea = ref<string>("");
const fechaDesde = ref<string>(new Date().toISOString().slice(0, 10)); // Default today
const fechaHasta = ref<string>(new Date().toISOString().slice(0, 10)); // Default today
// We extract Month/Year from 'fechaDesde' for the current report requirement

const loadTableData = async () => {
  try {
    loadingUsers.value = true;

    // Fetch users and departments
    const [usersResponse, deptsResponse] = await Promise.all([
      userService.getAll(),
      DepartmentService.getAll(),
    ]);

    console.log("Users Response:", usersResponse);
    console.log("Depts Response:", deptsResponse);

    // Process Departments
    // @ts-ignore
    const deptsData = deptsResponse.data?.data || deptsResponse.data || [];
    console.log("Parsed Depts Data:", deptsData);

    if (Array.isArray(deptsData)) {
      departments.value = deptsData;
    }

    const deptsMap = new Map<number, string>();
    departments.value.forEach((d) => deptsMap.set(d.id, d.nombre));

    // Process Users
    // @ts-ignore
    const rawUsers = usersResponse.data?.data || usersResponse.data || [];

    const enrichedUsers = rawUsers.map((user: BiometricUser) => {
      let deptName = "-";
      let deptId = user.departamento_id;

      // Try to get from existing object
      if (typeof user.departamento === "object" && user.departamento?.nombre) {
        deptName = user.departamento.nombre;
        if (!deptId) deptId = user.departamento.id;
      }
      // Try to get from ID using the map
      else if (user.departamento_id) {
        deptName = deptsMap.get(user.departamento_id) || "Sin Asignar";
      }

      return {
        ...user,
        departamento: deptName,
        departamento_id: deptId, // Ensure ID is preserved for filtering
      };
    });

    allUsers.value = enrichedUsers;
    users.value = enrichedUsers; // Initially show all
  } catch (error) {
    console.error("Error loading users for report:", error);
    Swal.fire("Error", "No se pudieron cargar los datos.", "error");
  } finally {
    loadingUsers.value = false;
  }
};

const applyFilters = () => {
  loadingUsers.value = true;

  // Filter by Area
  let filtered = [...allUsers.value];

  if (selectedArea.value) {
    // selectedArea value will be the department ID as string
    const areaId = Number(selectedArea.value);
    filtered = filtered.filter((u) => u.departamento_id === areaId);
  }

  users.value = filtered;
  loadingUsers.value = false;

  // Optional: Reset selection if needed, or keep it. Keeping it is usually better UX.
};

const handleGenerateReport = async () => {
  // 1. Validation
  if (selectedUsers.value.length === 0) {
    Swal.fire({
      icon: "warning",
      title: "Atención",
      text: "Debes seleccionar al menos un usuario de la tabla para generar el reporte.",
    });
    return;
  }

  // 2. Format Selection
  const result = await Swal.fire({
    title: "Generar Reporte",
    text: "Selecciona el formato de exportación para los usuarios seleccionados.",
    icon: "question",
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: '<i class="fas fa-file-pdf"></i> PDF',
    denyButtonText: '<i class="fas fa-file-excel"></i> Excel',
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#e74c3c", // Red for PDF
    denyButtonColor: "#27ae60", // Green for Excel
  });

  if (result.isDismissed) return;

  const isPdf = result.isConfirmed;
  const isExcel = result.isDenied;

  if (!isPdf && !isExcel) return;

  // 3. Prepare Payload
  // Extract month/year from date picker (fechaDesde)
  const dateObj = new Date(fechaDesde.value);
  // getMonth() is 0-indexed, so +1. PadStart to ensure "05".
  const mes = String(dateObj.getMonth() + 1).padStart(2, "0");
  const anio = String(dateObj.getFullYear());

  const payload = {
    mes,
    anio,
    user_ids: selectedUsers.value.map((u) => u.user_id), // using DNI string
  };

  try {
    Swal.fire({
      title: "Generando...",
      text: "Por favor espere mientras se procesa el reporte.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    let response;
    let fileName = `Reporte_${anio}_${mes}`;

    if (isPdf) {
      response = await reportService.exportPdf(payload);
      fileName += ".pdf";
    } else {
      response = await reportService.exportExcel(payload);
      fileName += ".xlsx";
    }

    // 4. Download File
    // @ts-ignore
    const blob = new Blob([response.data], {
      type: isPdf
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(link.href);

    Swal.fire("Éxito", "El reporte se ha descargado correctamente.", "success");
  } catch (error) {
    console.error("Error generating report:", error);
    Swal.fire("Error", "Hubo un problema al generar el reporte.", "error");
  }
};

const logout = () => {
  localStorage.removeItem("token");
  router.push({ name: "Login" });
};

onMounted(() => {
  loadTableData();
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
