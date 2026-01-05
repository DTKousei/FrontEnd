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
          <button class="btn btn-success" id="generar-reporte-btn">
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
              <input type="date" id="fecha-desde" value="2025-05-01" />
            </div>

            <div class="filter-group">
              <label for="fecha-hasta">Hasta</label>
              <input type="date" id="fecha-hasta" value="2025-05-31" />
            </div>

            <div class="filter-group">
              <label for="area">Área</label>
              <select id="area">
                <option value="">Todas las áreas</option>
                <option value="administracion">Administración</option>
                <option value="rrhh">Recursos Humanos</option>
                <option value="contabilidad">Contabilidad</option>
                <option value="logistica">Logística</option>
                <option value="sistemas">Sistemas</option>
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
            <button class="btn btn-outline">
              <i class="fas fa-redo"></i> Restablecer
            </button>
            <button class="btn btn-primary">
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
          <div class="chart-header">
            <div class="chart-title">Reportes Generados Recientemente</div>
            <button class="btn btn-outline" id="exportar-todo">
              <i class="fas fa-file-export"></i> Exportar Todo
            </button>
          </div>

          <table>
            <thead>
              <tr>
                <th>Nombre del Reporte</th>
                <th>Tipo</th>
                <th>Período</th>
                <th>Generado</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div class="report-type">
                    <div class="type-icon monthly">
                      <i class="fas fa-calendar"></i>
                    </div>
                    <div>
                      <div>Asistencia Octubre 2025</div>
                      <small>Completo</small>
                    </div>
                  </div>
                </td>
                <td>Mensual</td>
                <td>01/10/2025 - 31/10/2025</td>
                <td>01/11/5 09:30</td>
                <td><span class="status status-completed">Completado</span></td>
                <td class="actions">
                  <button class="action-btn download" title="Descargar PDF">
                    <i class="fas fa-file-pdf"></i>
                  </button>
                  <button class="action-btn download" title="Descargar Excel">
                    <i class="fas fa-file-excel"></i>
                  </button>
                  <button class="action-btn" title="Ver">
                    <i class="fas fa-eye"></i>
                  </button>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="report-type">
                    <div class="type-icon weekly">
                      <i class="fas fa-calendar-week"></i>
                    </div>
                    <div>
                      <div>Incidencias Semana 21</div>
                      <small>Resumido</small>
                    </div>
                  </div>
                </td>
                <td>Semanal</td>
                <td>22/10/2025 - 28/10/2025</td>
                <td>29/10/2025 08:15</td>
                <td><span class="status status-completed">Completado</span></td>
                <td class="actions">
                  <button class="action-btn download" title="Descargar PDF">
                    <i class="fas fa-file-pdf"></i>
                  </button>
                  <button class="action-btn download" title="Descargar Excel">
                    <i class="fas fa-file-excel"></i>
                  </button>
                  <button class="action-btn" title="Ver">
                    <i class="fas fa-eye"></i>
                  </button>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="report-type">
                    <div class="type-icon custom">
                      <i class="fas fa-cog"></i>
                    </div>
                    <div>
                      <div>Análisis Tardanzas Q2</div>
                      <small>Personalizado</small>
                    </div>
                  </div>
                </td>
                <td>Trimestral</td>
                <td>01/09/2025 - 30/11/2025</td>
                <td>15/10/2025 14:20</td>
                <td>
                  <span class="status status-processing">Procesando</span>
                </td>
                <td class="actions">
                  <button class="action-btn" title="Cancelar">
                    <i class="fas fa-times"></i>
                  </button>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="report-type">
                    <div class="type-icon daily">
                      <i class="fas fa-calendar-day"></i>
                    </div>
                    <div>
                      <div>Asistencia Diaria</div>
                      <small>15/05/2025</small>
                    </div>
                  </div>
                </td>
                <td>Diario</td>
                <td>15/10/2025</td>
                <td>15/10/2025 18:00</td>
                <td><span class="status status-completed">Completado</span></td>
                <td class="actions">
                  <button class="action-btn download" title="Descargar PDF">
                    <i class="fas fa-file-pdf"></i>
                  </button>
                  <button class="action-btn download" title="Descargar Excel">
                    <i class="fas fa-file-excel"></i>
                  </button>
                  <button class="action-btn" title="Ver">
                    <i class="fas fa-eye"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import ReportPerView from "@/components/tables/ReportPerView.vue";
import { userService } from "@/api/services/user.service";
import type { BiometricUser } from "@/api/types/users.types";

const router = useRouter();

// State for User Selection Table
const users = ref<BiometricUser[]>([]);
const selectedUsers = ref<BiometricUser[]>([]);
const loadingUsers = ref(false);

const loadUsers = async () => {
  try {
    loadingUsers.value = true;
    const response = await userService.getAll();
    // @ts-ignore
    users.value = response.data?.data || response.data || [];
  } catch (error) {
    console.error("Error loading users for report:", error);
  } finally {
    loadingUsers.value = false;
  }
};

const logout = () => {
  localStorage.removeItem("token");
  router.push({ name: "Login" });
};

onMounted(() => {
  loadUsers();
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
