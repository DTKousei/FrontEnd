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
            <div class="card-value">42</div>
            <div class="card-footer">Hoy</div>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="card-title">Personal Ausente</div>
              <div class="card-icon absent">
                <i class="fas fa-user-times"></i>
              </div>
            </div>
            <div class="card-value">8</div>
            <div class="card-footer">Hoy</div>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="card-title">Tardanzas</div>
              <div class="card-icon late">
                <i class="fas fa-clock"></i>
              </div>
            </div>
            <div class="card-value">5</div>
            <div class="card-footer">Hoy</div>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="card-title">Total Personal</div>
              <div class="card-icon total">
                <i class="fas fa-users"></i>
              </div>
            </div>
            <div class="card-value">55</div>
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
            <table>
              <thead>
                <tr>
                  <th>Empleado</th>
                  <th>Tipo</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Juan Pérez</td>
                  <td><span class="status status-late">Tardanza</span></td>
                  <td>15/05/2023</td>
                </tr>
                <tr>
                  <td>María García</td>
                  <td><span class="status status-absent">Permiso</span></td>
                  <td>14/05/2023</td>
                </tr>
                <tr>
                  <td>Carlos López</td>
                  <td><span class="status status-absent">Vacaciones</span></td>
                  <td>14/05/2023</td>
                </tr>
                <tr>
                  <td>Ana Rodríguez</td>
                  <td><span class="status status-late">Tardanza</span></td>
                  <td>13/05/2023</td>
                </tr>
                <tr>
                  <td>Luis Martínez</td>
                  <td><span class="status status-absent">Licencia</span></td>
                  <td>12/05/2023</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="dashboard-row">
          <div class="table-container">
            <h3 class="table-title">Registro de Asistencia de Hoy</h3>
            <table>
              <thead>
                <tr>
                  <th>Empleado</th>
                  <th>Hora Entrada</th>
                  <th>Hora Salida</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Juan Pérez</td>
                  <td>08:05 AM</td>
                  <td>--:--</td>
                  <td><span class="status status-late">Tardanza</span></td>
                </tr>
                <tr>
                  <td>María García</td>
                  <td>07:55 AM</td>
                  <td>--:--</td>
                  <td><span class="status status-present">Presente</span></td>
                </tr>
                <tr>
                  <td>Carlos López</td>
                  <td>--:--</td>
                  <td>--:--</td>
                  <td><span class="status status-absent">Ausente</span></td>
                </tr>
                <tr>
                  <td>Ana Rodríguez</td>
                  <td>08:10 AM</td>
                  <td>--:--</td>
                  <td><span class="status status-late">Tardanza</span></td>
                </tr>
                <tr>
                  <td>Luis Martínez</td>
                  <td>07:50 AM</td>
                  <td>--:--</td>
                  <td><span class="status status-present">Presente</span></td>
                </tr>
              </tbody>
            </table>
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
// Importación del componente de barra de navegación lateral (Sidebar)
// Contiene la navegación principal del sistema
import AdminNavbar from "@/components/Admin/NavbarView.vue";

// Importación del componente de encabezado (Header)
// Maneja la información del usuario, búsqueda y cierre de sesión
import HeaderView from "@/components/header/HeaderView.vue";

// Nota: La lógica para inicializar los gráficos (Charts) debería implementarse aquí,
// usualmente utilizando el hook onMounted.
// Actualmente, los gráficos se muestran como contenedores vacíos en el template
// y requieren una librería de gráficos (como ApexCharts o Chart.js) para renderizarse.
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
