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
          <router-link to="/incidencias" class="active"
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
          <input type="text" placeholder="Buscar..." />
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
          <h1>Registro de Incidencias</h1>
          <button class="btn btn-primary" id="nueva-incidencia-btn">
            <i class="fas fa-plus"></i> Nueva Incidencia
          </button>
        </div>

        <!-- Formulario de Registro -->
        <div class="form-container" id="form-incidencia">
          <h2 style="margin-bottom: 20px; color: var(--primary)">
            Registrar Nueva Incidencia
          </h2>

          <form id="incidencia-form">
            <div class="form-row">
              <div class="form-group">
                <label for="empleado">Empleado *</label>
                <select id="empleado" required>
                  <option value="">Seleccionar empleado</option>
                  <option value="1">Juan Pérez - Administración</option>
                  <option value="2">María García - Recursos Humanos</option>
                  <option value="3">Carlos López - Contabilidad</option>
                  <option value="4">Ana Rodríguez - Logística</option>
                  <option value="5">Luis Martínez - Sistemas</option>
                </select>
              </div>

              <div class="form-group">
                <label for="tipo-incidencia">Tipo de Incidencia *</label>
                <select id="tipo-incidencia" required>
                  <option value="">Seleccionar tipo</option>
                  <option value="tardanza">Tardanza</option>
                  <option value="inasistencia">Inasistencia</option>
                  <option value="permiso">Permiso</option>
                  <option value="licencia">Licencia</option>
                  <option value="comision">Comisión de Servicio</option>
                  <option value="vacaciones">Vacaciones</option>
                  <option value="otros">Otros</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="fecha-inicio">Fecha de Inicio *</label>
                <input type="date" id="fecha-inicio" required />
              </div>

              <div class="form-group">
                <label for="fecha-fin">Fecha de Fin</label>
                <input type="date" id="fecha-fin" />
              </div>
            </div>

            <div class="form-group">
              <label for="descripcion">Descripción *</label>
              <textarea
                id="descripcion"
                placeholder="Describa los detalles de la incidencia..."
                required
              ></textarea>
            </div>

            <div class="form-group">
              <label for="evidencia">Evidencia (Opcional)</label>
              <input type="file" id="evidencia" />
              <small style="color: #7f8c8d; font-size: 0.8rem"
                >Formatos permitidos: PDF, JPG, PNG (Máx. 5MB)</small
              >
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" id="cancelar-btn">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary">
                Registrar Incidencia
              </button>
            </div>
          </form>
        </div>

        <!-- Lista de Incidencias -->
        <div class="incidencias-container">
          <div class="table-header">
            <h2 style="color: var(--primary)">Historial de Incidencias</h2>
            <div class="search-box">
              <input type="text" placeholder="Buscar incidencia..." />
              <button class="btn btn-secondary">
                <i class="fas fa-filter"></i> Filtrar
              </button>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Tipo</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Juan Pérez</td>
                <td>Tardanza</td>
                <td>15/05/2023</td>
                <td>15/05/2023</td>
                <td><span class="status status-pendiente">Pendiente</span></td>
                <td class="actions">
                  <button class="action-btn" title="Editar">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="action-btn" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="action-btn delete" title="Eliminar">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
              <tr>
                <td>María García</td>
                <td>Permiso</td>
                <td>14/05/2023</td>
                <td>14/05/2023</td>
                <td><span class="status status-aprobado">Aprobado</span></td>
                <td class="actions">
                  <button class="action-btn" title="Editar">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="action-btn" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="action-btn delete" title="Eliminar">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
              <tr>
                <td>Carlos López</td>
                <td>Vacaciones</td>
                <td>10/05/2023</td>
                <td>20/05/2023</td>
                <td><span class="status status-aprobado">Aprobado</span></td>
                <td class="actions">
                  <button class="action-btn" title="Editar">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="action-btn" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="action-btn delete" title="Eliminar">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
              <tr>
                <td>Ana Rodríguez</td>
                <td>Licencia</td>
                <td>01/05/2023</td>
                <td>10/05/2023</td>
                <td><span class="status status-rechazado">Rechazado</span></td>
                <td class="actions">
                  <button class="action-btn" title="Editar">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="action-btn" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="action-btn delete" title="Eliminar">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
              <tr>
                <td>Luis Martínez</td>
                <td>Comisión de Servicio</td>
                <td>08/05/2023</td>
                <td>12/05/2023</td>
                <td><span class="status status-pendiente">Pendiente</span></td>
                <td class="actions">
                  <button class="action-btn" title="Editar">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="action-btn" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="action-btn delete" title="Eliminar">
                    <i class="fas fa-trash"></i>
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

/* Form Styles */
.form-container {
  background-color: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
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

input,
select,
textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
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
  min-height: 100px;
}

.btn {
  padding: 12px 25px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-primary {
  background-color: var(--secondary);
  color: white;
}

.btn-primary:hover {
  background-color: #2980b9;
}

.btn-secondary {
  background-color: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background-color: #7f8c8d;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 25px;
}

/* Incidencias List */
.incidencias-container {
  background-color: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  gap: 10px;
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

.status {
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-pendiente {
  background-color: #fff8e1;
  color: var(--warning);
}

.status-aprobado {
  background-color: #e8f5e9;
  color: var(--success);
}

.status-rechazado {
  background-color: #ffebee;
  color: var(--danger);
}

.actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: var(--secondary);
  transition: color 0.3s;
}

.action-btn:hover {
  color: #2980b9;
}

.action-btn.delete {
  color: var(--danger);
}

.action-btn.delete:hover {
  color: #c0392b;
}

/* Responsive */
@media (max-width: 992px) {
  .form-row {
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

  .table-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .search-box {
    width: 100%;
  }
}
</style>
