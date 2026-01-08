<template>
  <div class="container">
    <!-- Barra Lateral (Sidebar) -->

    <AdminNavbar />

    <!-- Contenido Principal -->
    <div class="main-content">
      <!-- Encabezado (Header) -->
      <HeaderView />

      <!-- Contenido del Dashboard -->
      <div class="dashboard-content">
        <h1 class="page-title">Dashboard de Asistencia</h1>

        <!-- Tarjetas de Resumen (Cards) -->
        <div class="cards">
          <div class="card">
            <div class="card-header">
              <div class="card-title">Personal Presente</div>
              <div class="card-icon present">
                <i class="fas fa-user-check"></i>
              </div>
            </div>
            <div class="card-value">{{ totalPresent }}</div>
            <div class="card-footer">Hoy</div>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="card-title">Personal Ausente</div>
              <div class="card-icon absent">
                <i class="fas fa-user-times"></i>
              </div>
            </div>
            <div class="card-value">{{ totalAbsent }}</div>
            <div class="card-footer">Hoy</div>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="card-title">Tardanzas</div>
              <div class="card-icon late">
                <i class="fas fa-clock"></i>
              </div>
            </div>
            <div class="card-value">{{ totalLate }}</div>
            <div class="card-footer">Hoy</div>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="card-title">Total Personal</div>
              <div class="card-icon total">
                <i class="fas fa-users"></i>
              </div>
            </div>
            <div class="card-value">{{ totalPersonnel }}</div>
            <div class="card-footer">Activos</div>
          </div>
        </div>

        <!-- Gráficos y Tablas -->
        <div class="dashboard-row">
          <div class="chart-container">
            <h3 class="chart-title">Asistencia por Área - Última Semana</h3>
            <div id="attendance-chart">
              <div id="chart"></div>
            </div>
          </div>

          <div class="table-container">
            <h3 class="table-title">Incidencias Recientes</h3>
            <InsiRecView />
          </div>
        </div>

        <div class="dashboard-row">
          <div class="table-container">
            <h3 class="table-title">Registro de Asistencia de Hoy</h3>
            <AsisRecView />
          </div>

          <div class="chart-container">
            <h3 class="chart-title">Distribución por Estado</h3>
            <div
              id="distribution-chart"
              style="
                height: 300px;
                background-color: #f8f9fa;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 5px;
              "
            >
              <div id="chart1"></div>
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
import { reportService } from "@/api/services/report.service";
import InsiRecView from "@/components/tables/InsiRecView.vue";
import AsisRecView from "@/components/tables/AsisRecView.vue";

const totalPresent = ref(0);
const totalAbsent = ref(0);
const totalLate = ref(0);
const totalPersonnel = ref(0);

const fetchDashboardStats = async () => {
  try {
    const today = new Date();
    // Ajustar zona horaria si es necesario. Para fecha local 'YYYY-MM-DD':
    const localDate = today.toLocaleDateString("en-CA"); // Formato YYYY-MM-DD

    console.log("Fetching dashboard stats for:", localDate);
    const response = await reportService.getAttendanceMetrics(
      localDate,
      localDate
    );

    if (response.data) {
      const metrics = response.data;
      // Mapeo de datos
      totalPersonnel.value = metrics.total_empleados || 0;
      totalAbsent.value = metrics.totales.faltas || 0;
      totalLate.value = metrics.totales.tardanzas || 0;

      // Presentes = Puntuales + Tardanzas
      totalPresent.value =
        (metrics.totales.puntual || 0) + (metrics.totales.tardanzas || 0);
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
  }
};

onMounted(() => {
  fetchDashboardStats();
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

/* btn logout */
.logout-btn {
  margin-left: auto; /* Empuja el botón hacia la derecha */
  background: transparent;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 5px;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-btn svg {
  width: 20px;
  height: 20px;
}

.logout-btn:hover {
  background-color: #fee2e2; /* Un fondo rojo suave al pasar el mouse */
  color: #ef4444; /* Icono rojo */
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

/* Dashboard Content */
.dashboard-content {
  padding: 30px;
  flex: 1;
}

.page-title {
  margin-bottom: 20px;
  color: var(--primary);
}

/* Cards */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.card-title {
  font-size: 1rem;
  color: var(--dark);
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
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.card-footer {
  font-size: 0.8rem;
  color: #7f8c8d;
}

/* Charts and Tables */
.dashboard-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.chart-container,
.table-container {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.chart-title,
.table-title {
  margin-bottom: 15px;
  color: var(--primary);
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
}

.status {
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-present {
  background-color: #e8f5e9;
  color: var(--success);
}

.status-absent {
  background-color: #ffebee;
  color: var(--danger);
}

.status-late {
  background-color: #fff8e1;
  color: var(--warning);
}

/* Responsive */
@media (max-width: 992px) {
  .dashboard-row {
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
}
</style>
