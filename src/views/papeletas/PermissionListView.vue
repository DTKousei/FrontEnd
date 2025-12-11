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
          <router-link to="/papeletas" class="active"
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
          <router-link to="/reportes"
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
          <input type="text" placeholder="Buscar papeletas..." />
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
          <h1>Gestión de Papeletas</h1>
          <button class="btn btn-success" id="nueva-papeleta-btn">
            <i class="fas fa-plus"></i> Nueva Papeleta
          </button>
        </div>

        <!-- Estadísticas -->
        <div class="stats-cards">
          <div class="stat-card">
            <div class="stat-header">
              <div class="stat-title">Papeletas Pendientes</div>
              <div class="stat-icon pendientes">
                <i class="fas fa-clock"></i>
              </div>
            </div>
            <div class="stat-value">8</div>
            <div class="stat-change">+2 hoy</div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <div class="stat-title">Aprobadas Hoy</div>
              <div class="stat-icon aprobadas">
                <i class="fas fa-check-circle"></i>
              </div>
            </div>
            <div class="stat-value">5</div>
            <div class="stat-change">80% de tasa de aprobación</div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <div class="stat-title">Rechazadas</div>
              <div class="stat-icon rechazadas">
                <i class="fas fa-times-circle"></i>
              </div>
            </div>
            <div class="stat-value">2</div>
            <div class="stat-change">1 esta semana</div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <div class="stat-title">Comisiones</div>
              <div class="stat-icon comision">
                <i class="fas fa-briefcase"></i>
              </div>
            </div>
            <div class="stat-value">12</div>
            <div class="stat-change">Este mes</div>
          </div>
        </div>

        <!-- Barra de Acciones -->
        <div class="actions-bar">
          <div class="search-box">
            <input
              type="text"
              placeholder="Buscar por empleado, área o motivo..."
            />
            <button class="btn btn-outline">
              <i class="fas fa-search"></i>
            </button>
          </div>

          <div class="filters">
            <select>
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="aprobada">Aprobadas</option>
              <option value="rechazada">Rechazadas</option>
              <option value="completada">Completadas</option>
            </select>

            <select>
              <option value="">Todos los tipos</option>
              <option value="particular">Particular</option>
              <option value="comision">Comisión</option>
            </select>

            <input type="date" value="2023-05-15" />

            <button class="btn btn-outline">
              <i class="fas fa-download"></i> Exportar
            </button>
          </div>
        </div>

        <!-- Tabla de Papeletas -->
        <div class="papeletas-container">
          <table>
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Tipo</th>
                <th>Hora Salida</th>
                <th>Hora Regreso</th>
                <th>Motivo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div class="employee-info">
                    <div class="employee-avatar">JP</div>
                    <div class="employee-details">
                      <div class="employee-name">Juan Pérez</div>
                      <div class="employee-area">Administración</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="tipo-papeleta tipo-particular">Particular</span>
                </td>
                <td>10:30 AM</td>
                <td>11:30 AM</td>
                <td>Trámite personal en el banco</td>
                <td><span class="status status-pendiente">Pendiente</span></td>
                <td class="actions">
                  <button class="action-btn view" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="action-btn approve" title="Aprobar">
                    <i class="fas fa-check"></i>
                  </button>
                  <button class="action-btn reject" title="Rechazar">
                    <i class="fas fa-times"></i>
                  </button>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="employee-info">
                    <div class="employee-avatar">MG</div>
                    <div class="employee-details">
                      <div class="employee-name">María García</div>
                      <div class="employee-area">Recursos Humanos</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="tipo-papeleta tipo-comision">Comisión</span>
                </td>
                <td>09:00 AM</td>
                <td>02:00 PM</td>
                <td>Reunión en Ministerio de Educación</td>
                <td><span class="status status-aprobada">Aprobada</span></td>
                <td class="actions">
                  <button class="action-btn view" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="action-btn" title="Marcar completada">
                    <i class="fas fa-flag-checkered"></i>
                  </button>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="employee-info">
                    <div class="employee-avatar">CL</div>
                    <div class="employee-details">
                      <div class="employee-name">Carlos López</div>
                      <div class="employee-area">Contabilidad</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="tipo-papeleta tipo-particular">Particular</span>
                </td>
                <td>03:00 PM</td>
                <td>04:00 PM</td>
                <td>Cita médica</td>
                <td>
                  <span class="status status-completada">Completada</span>
                </td>
                <td class="actions">
                  <button class="action-btn view" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="action-btn" title="Descargar PDF">
                    <i class="fas fa-file-pdf"></i>
                  </button>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="employee-info">
                    <div class="employee-avatar">AR</div>
                    <div class="employee-details">
                      <div class="employee-name">Ana Rodríguez</div>
                      <div class="employee-area">Logística</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="tipo-papeleta tipo-comision">Comisión</span>
                </td>
                <td>08:30 AM</td>
                <td>12:00 PM</td>
                <td>Recojo de material educativo</td>
                <td><span class="status status-rechazada">Rechazada</span></td>
                <td class="actions">
                  <button class="action-btn view" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                  </button>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="employee-info">
                    <div class="employee-avatar">LM</div>
                    <div class="employee-details">
                      <div class="employee-name">Luis Martínez</div>
                      <div class="employee-area">Sistemas</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="tipo-papeleta tipo-comision">Comisión</span>
                </td>
                <td>10:00 AM</td>
                <td>05:00 PM</td>
                <td>Instalación de equipos en escuela</td>
                <td><span class="status status-aprobada">Aprobada</span></td>
                <td class="actions">
                  <button class="action-btn view" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="action-btn" title="Marcar completada">
                    <i class="fas fa-flag-checkered"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Paginación -->
          <div class="pagination">
            <div class="pagination-info">Mostrando 1-5 de 27 papeletas</div>
            <div class="pagination-controls">
              <button class="page-btn">Anterior</button>
              <button class="page-btn active">1</button>
              <button class="page-btn">2</button>
              <button class="page-btn">3</button>
              <button class="page-btn">...</button>
              <button class="page-btn">6</button>
              <button class="page-btn">Siguiente</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const logout = () => {
  localStorage.removeItem("token");
  router.push({ name: "Login" });
};
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

/* Stats Cards */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.stat-title {
  font-size: 0.9rem;
  color: #7f8c8d;
  font-weight: 600;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.pendientes {
  background-color: var(--warning);
}

.stat-icon.aprobadas {
  background-color: var(--success);
}

.stat-icon.rechazadas {
  background-color: var(--danger);
}

.stat-icon.comision {
  background-color: var(--secondary);
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-change {
  font-size: 0.8rem;
  color: #7f8c8d;
}

/* Actions Bar */
.actions-bar {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.search-box {
  display: flex;
  gap: 10px;
  flex: 1;
  max-width: 400px;
}

.search-box input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.filters {
  display: flex;
  gap: 15px;
  align-items: center;
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

/* Papeletas Table */
.papeletas-container {
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

.employee-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.employee-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
}

.employee-details {
  display: flex;
  flex-direction: column;
}

.employee-name {
  font-weight: 600;
}

.employee-area {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-pendiente {
  background-color: #fff8e1;
  color: var(--warning);
}

.status-aprobada {
  background-color: #e8f5e9;
  color: var(--success);
}

.status-rechazada {
  background-color: #ffebee;
  color: var(--danger);
}

.status-completada {
  background-color: #e3f2fd;
  color: var(--secondary);
}

.tipo-papeleta {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.tipo-particular {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.tipo-comision {
  background-color: #e8f5e9;
  color: #388e3c;
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

.action-btn.approve {
  color: var(--success);
}

.action-btn.approve:hover {
  color: #219a52;
}

.action-btn.reject {
  color: var(--danger);
}

.action-btn.reject:hover {
  color: #c0392b;
}

.action-btn.view {
  color: var(--warning);
}

.action-btn.view:hover {
  color: #e67e22;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.pagination-info {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.pagination-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.page-btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.page-btn.active {
  background-color: var(--secondary);
  color: white;
  border-color: var(--secondary);
}

.page-btn:hover:not(.active) {
  background-color: #f8f9fa;
}

/* Modal */
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
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
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

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--dark);
}

.label-required::after {
  content: " *";
  color: var(--danger);
}

input,
select,
textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 0.9rem;
  transition: border 0.3s;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: var(--secondary);
}

textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

/* Firmas Section */
.firmas-section {
  margin-top: 30px;
  padding: 20px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  background-color: #fafafa;
}

.firmas-title {
  font-size: 1.1rem;
  color: var(--primary);
  margin-bottom: 20px;
  text-align: center;
}

.firmas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.firma-item {
  text-align: center;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 5px;
  background-color: white;
}

.firma-label {
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--dark);
}

.firma-space {
  height: 60px;
  border-bottom: 1px solid #ddd;
  margin-bottom: 10px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.firma-name {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.firma-status {
  font-size: 0.7rem;
  padding: 3px 8px;
  border-radius: 10px;
  margin-top: 5px;
}

.firma-pendiente {
  background-color: #fff8e1;
  color: var(--warning);
}

.firma-completada {
  background-color: #e8f5e9;
  color: var(--success);
}

/* Responsive */
@media (max-width: 992px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .firmas-grid {
    grid-template-columns: 1fr 1fr;
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

  .actions-bar {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .search-box {
    max-width: 100%;
  }

  .filters {
    flex-wrap: wrap;
  }

  table {
    display: block;
    overflow-x: auto;
  }

  .firmas-grid {
    grid-template-columns: 1fr;
  }
}
</style>
