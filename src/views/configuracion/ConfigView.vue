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
          <router-link to="/reportes"
            ><i class="fas fa-chart-bar"></i> Reportes</router-link
          >
        </li>
        <li>
          <router-link to="/configuracion" class="active"
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
          <input type="text" placeholder="Buscar en configuración..." />
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
        <h1 class="page-title">Configuración del Sistema</h1>

        <!-- Navegación de Configuración -->
        <div class="config-nav">
          <div class="config-tabs">
            <button class="config-tab active" data-tab="general">
              General
            </button>
            <button class="config-tab" data-tab="horarios">
              Horarios Laborales
            </button>
            <button class="config-tab" data-tab="biometrico">
              Control Biométrico
            </button>
            <button class="config-tab" data-tab="permisos">
              Permisos y Roles
            </button>
            <button class="config-tab" data-tab="notificaciones">
              Notificaciones
            </button>
            <button class="config-tab" data-tab="backup">
              Backup y Restauración
            </button>
            <button class="config-tab" data-tab="sistema">Sistema</button>
          </div>

          <div class="system-info">
            <div class="info-cards">
              <div class="info-card">
                <div class="info-header">
                  <div class="info-title">Estado del Sistema</div>
                  <div class="info-icon system">
                    <i class="fas fa-server"></i>
                  </div>
                </div>
                <div class="info-value">En Línea</div>
                <div class="info-description">
                  Todos los servicios funcionando
                </div>
              </div>

              <div class="info-card">
                <div class="info-header">
                  <div class="info-title">Base de Datos</div>
                  <div class="info-icon database">
                    <i class="fas fa-database"></i>
                  </div>
                </div>
                <div class="info-value">MySQL 8.0</div>
                <div class="info-description">Última actualización: Hoy</div>
              </div>

              <div class="info-card">
                <div class="info-header">
                  <div class="info-title">Seguridad</div>
                  <div class="info-icon security">
                    <i class="fas fa-shield-alt"></i>
                  </div>
                </div>
                <div class="info-value">Activa</div>
                <div class="info-description">SSL habilitado</div>
              </div>

              <div class="info-card">
                <div class="info-header">
                  <div class="info-title">Último Backup</div>
                  <div class="info-icon backup">
                    <i class="fas fa-save"></i>
                  </div>
                </div>
                <div class="info-value">Ayer 23:00</div>
                <div class="info-description">Automático</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sección General -->
        <div class="config-section active" id="general-section">
          <h2 class="section-title">Configuración General</h2>
          <p class="section-description">
            Configura los parámetros básicos del sistema de control de
            asistencia.
          </p>

          <div class="form-grid">
            <div class="form-group">
              <label for="nombre-institucion">Nombre de la Institución</label>
              <input
                type="text"
                id="nombre-institucion"
                value="UGEL Sucre"
                required
              />
            </div>

            <div class="form-group">
              <label for="ruc">RUC</label>
              <input type="text" id="ruc" value="20123456781" maxlength="11" />
            </div>

            <div class="form-group">
              <label for="direccion">Dirección</label>
              <input
                type="text"
                id="direccion"
                value="Av. Principal 123, Sucre"
              />
            </div>

            <div class="form-group">
              <label for="telefono">Teléfono</label>
              <input type="tel" id="telefono" value="+51 074 123456" />
            </div>

            <div class="form-group">
              <label for="email">Email de Contacto</label>
              <input
                type="email"
                id="email"
                value="contacto@ugelsucre.edu.pe"
              />
            </div>

            <div class="form-group">
              <label for="zona-horaria">Zona Horaria</label>
              <select id="zona-horaria">
                <option value="-5" selected>Lima, Perú (UTC-5)</option>
                <option value="-6">Central (UTC-6)</option>
                <option value="-8">Pacífico (UTC-8)</option>
              </select>
            </div>

            <div class="form-group">
              <label for="idioma">Idioma del Sistema</label>
              <select id="idioma">
                <option value="es" selected>Español</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn btn-outline">Cancelar</button>
            <button class="btn btn-primary">Guardar Cambios</button>
          </div>
        </div>

        <!-- Sección Horarios Laborales -->
        <div class="config-section" id="horarios-section">
          <h2 class="section-title">Horarios Laborales</h2>
          <p class="section-description">
            Configura los horarios de trabajo y tolerancias para el control de
            asistencia.
          </p>

          <div class="form-grid">
            <div class="form-group">
              <label for="hora-entrada">Hora de Entrada</label>
              <input type="time" id="hora-entrada" value="08:00" required />
            </div>

            <div class="form-group">
              <label for="hora-salida">Hora de Salida</label>
              <input type="time" id="hora-salida" value="17:00" required />
            </div>

            <div class="form-group">
              <label for="tolerancia-entrada"
                >Tolerancia de Entrada (minutos)</label
              >
              <input
                type="number"
                id="tolerancia-entrada"
                value="10"
                min="0"
                max="60"
              />
              <div class="label-hint">
                Tiempo de gracia para no marcar como tardanza
              </div>
            </div>

            <div class="form-group">
              <label for="dias-laborales">Días Laborales</label>
              <div class="checkbox-group">
                <input type="checkbox" id="lunes" checked />
                <label for="lunes" class="checkbox-label">Lunes</label>
              </div>
              <div class="checkbox-group">
                <input type="checkbox" id="martes" checked />
                <label for="martes" class="checkbox-label">Martes</label>
              </div>
              <div class="checkbox-group">
                <input type="checkbox" id="miercoles" checked />
                <label for="miercoles" class="checkbox-label">Miércoles</label>
              </div>
              <div class="checkbox-group">
                <input type="checkbox" id="jueves" checked />
                <label for="jueves" class="checkbox-label">Jueves</label>
              </div>
              <div class="checkbox-group">
                <input type="checkbox" id="viernes" checked />
                <label for="viernes" class="checkbox-label">Viernes</label>
              </div>
              <div class="checkbox-group">
                <input type="checkbox" id="sabado" />
                <label for="sabado" class="checkbox-label">Sábado</label>
              </div>
              <div class="checkbox-group">
                <input type="checkbox" id="domingo" />
                <label for="domingo" class="checkbox-label">Domingo</label>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn btn-outline">Cancelar</button>
            <button class="btn btn-primary">Guardar Horarios</button>
          </div>
        </div>

        <!-- Sección Control Biométrico -->
        <div class="config-section" id="biometrico-section">
          <h2 class="section-title">Control Biométrico</h2>
          <p class="section-description">
            Configura los dispositivos biométricos y parámetros de verificación.
          </p>

          <div class="form-grid">
            <div class="form-group">
              <label for="tipo-dispositivo">Tipo de Dispositivo</label>
              <select id="tipo-dispositivo">
                <option value="huella" selected>Lector de Huellas</option>
                <option value="rostro">Reconocimiento Facial</option>
                <option value="tarjeta">Lector de Tarjetas</option>
              </select>
            </div>

            <div class="form-group">
              <label for="puerto-dispositivo">Puerto del Dispositivo</label>
              <select id="puerto-dispositivo">
                <option value="usb" selected>USB</option>
                <option value="serial">Serial (COM)</option>
                <option value="red">Red (TCP/IP)</option>
              </select>
            </div>

            <div class="form-group">
              <label for="modelo-dispositivo">Modelo del Dispositivo</label>
              <input type="text" id="modelo-dispositivo" value="ZK4500" />
            </div>

            <div class="form-group">
              <label for="sensibilidad">Sensibilidad de Verificación</label>
              <select id="sensibilidad">
                <option value="baja">Baja</option>
                <option value="media" selected>Media</option>
                <option value="alta">Alta</option>
              </select>
              <div class="label-hint">
                Ajusta el nivel de precisión requerido
              </div>
            </div>
          </div>

          <div class="checkbox-group">
            <input type="checkbox" id="verificacion-dual" checked />
            <label for="verificacion-dual" class="checkbox-label"
              >Habilitar verificación dual (huella + código)</label
            >
          </div>

          <div class="checkbox-group">
            <input type="checkbox" id="registro-fotos" />
            <label for="registro-fotos" class="checkbox-label"
              >Capturar fotografía en cada registro</label
            >
          </div>

          <div class="form-actions">
            <button class="btn btn-outline">Probar Conexión</button>
            <button class="btn btn-primary">Guardar Configuración</button>
          </div>
        </div>

        <!-- Sección Permisos y Roles -->
        <div class="config-section" id="permisos-section">
          <h2 class="section-title">Permisos y Roles</h2>
          <p class="section-description">
            Gestiona los niveles de acceso y permisos para diferentes roles de
            usuario.
          </p>

          <table class="permissions-table">
            <thead>
              <tr>
                <th>Módulo/Función</th>
                <th class="permission-check">Administrador</th>
                <th class="permission-check">Supervisor</th>
                <th class="permission-check">Empleado</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ver Dashboard</td>
                <td class="permission-check">
                  <input type="checkbox" checked disabled />
                </td>
                <td class="permission-check">
                  <input type="checkbox" checked />
                </td>
                <td class="permission-check">
                  <input type="checkbox" checked />
                </td>
              </tr>
              <tr>
                <td>Registro de Asistencia</td>
                <td class="permission-check">
                  <input type="checkbox" checked disabled />
                </td>
                <td class="permission-check">
                  <input type="checkbox" checked />
                </td>
                <td class="permission-check">
                  <input type="checkbox" checked />
                </td>
              </tr>
              <tr>
                <td>Gestión de Personal</td>
                <td class="permission-check">
                  <input type="checkbox" checked />
                </td>
                <td class="permission-check"><input type="checkbox" /></td>
                <td class="permission-check"><input type="checkbox" /></td>
              </tr>
              <tr>
                <td>Registro de Incidencias</td>
                <td class="permission-check">
                  <input type="checkbox" checked />
                </td>
                <td class="permission-check">
                  <input type="checkbox" checked />
                </td>
                <td class="permission-check"><input type="checkbox" /></td>
              </tr>
              <tr>
                <td>Reportes e Informes</td>
                <td class="permission-check">
                  <input type="checkbox" checked />
                </td>
                <td class="permission-check">
                  <input type="checkbox" checked />
                </td>
                <td class="permission-check"><input type="checkbox" /></td>
              </tr>
              <tr>
                <td>Configuración del Sistema</td>
                <td class="permission-check">
                  <input type="checkbox" checked />
                </td>
                <td class="permission-check"><input type="checkbox" /></td>
                <td class="permission-check"><input type="checkbox" /></td>
              </tr>
            </tbody>
          </table>

          <div class="form-actions">
            <button class="btn btn-outline">Restablecer por Defecto</button>
            <button class="btn btn-primary">Guardar Permisos</button>
          </div>
        </div>

        <!-- Sección Backup y Restauración -->
        <div class="config-section" id="backup-section">
          <h2 class="section-title">Backup y Restauración</h2>
          <p class="section-description">
            Gestiona las copias de seguridad y restauración del sistema.
          </p>

          <div class="backup-options">
            <div class="backup-option" data-type="completo">
              <div class="backup-icon">
                <i class="fas fa-database"></i>
              </div>
              <div class="backup-title">Backup Completo</div>
              <div class="backup-desc">
                Base de datos + archivos del sistema
              </div>
            </div>

            <div class="backup-option" data-type="base-datos">
              <div class="backup-icon">
                <i class="fas fa-table"></i>
              </div>
              <div class="backup-title">Solo Base de Datos</div>
              <div class="backup-desc">Estructura y datos principales</div>
            </div>

            <div class="backup-option" data-type="configuracion">
              <div class="backup-icon">
                <i class="fas fa-cogs"></i>
              </div>
              <div class="backup-title">Solo Configuración</div>
              <div class="backup-desc">Ajustes y parámetros del sistema</div>
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label for="frecuencia-backup"
                >Frecuencia de Backup Automático</label
              >
              <select id="frecuencia-backup">
                <option value="diario">Diario</option>
                <option value="semanal" selected>Semanal</option>
                <option value="mensual">Mensual</option>
                <option value="ninguno">Desactivado</option>
              </select>
            </div>

            <div class="form-group">
              <label for="retencion-backup">Período de Retención</label>
              <select id="retencion-backup">
                <option value="7">7 días</option>
                <option value="30" selected>30 días</option>
                <option value="90">90 días</option>
                <option value="365">1 año</option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn btn-outline">Restaurar Sistema</button>
            <button class="btn btn-success">Generar Backup Manual</button>
          </div>

          <!-- Zona de Peligro -->
          <div class="danger-zone" style="margin-top: 40px">
            <h3 class="danger-title">
              <i class="fas fa-exclamation-triangle"></i>
              Zona de Peligro
            </h3>
            <p class="danger-description">
              Las siguientes acciones son irreversibles. Realice estas
              operaciones solo si está completamente seguro.
            </p>
            <button class="btn btn-danger" id="reset-system">
              <i class="fas fa-bomb"></i> Restablecer Sistema a Valores de
              Fábrica
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

import "@fortawesome/fontawesome-free/css/all.min.css";

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
  margin-bottom: 30px;
  color: var(--primary);
}

/* Config Navigation */
.config-nav {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.config-tabs {
  display: flex;
  gap: 10px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
  margin-bottom: 20px;
  overflow-x: auto;
}

.config-tab {
  padding: 10px 20px;
  border: none;
  background: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  color: #7f8c8d;
  transition: all 0.3s;
  white-space: nowrap;
}

.config-tab.active {
  background-color: var(--secondary);
  color: white;
}

.config-tab:hover:not(.active) {
  background-color: #f8f9fa;
  color: var(--dark);
}

/* Config Sections */
.config-section {
  display: none;
  background-color: white;
  border-radius: 8px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.config-section.active {
  display: block;
}

.section-title {
  font-size: 1.3rem;
  color: var(--primary);
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.section-description {
  color: #7f8c8d;
  margin-bottom: 25px;
  line-height: 1.5;
}

/* Form Styles */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--dark);
}

.label-hint {
  font-size: 0.8rem;
  color: #7f8c8d;
  font-weight: normal;
  margin-top: 4px;
}

input,
select,
textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 0.9rem;
  transition: all 0.3s;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: var(--secondary);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

input[type="checkbox"] {
  width: auto;
  margin-right: 10px;
}

.checkbox-group {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.checkbox-label {
  font-weight: normal;
  margin-bottom: 0;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.btn {
  padding: 12px 25px;
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

.btn-danger {
  background-color: var(--danger);
  color: white;
}

.btn-danger:hover {
  background-color: #c0392b;
}

/* System Info Cards */
.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.info-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.info-title {
  font-size: 0.9rem;
  color: #7f8c8d;
  font-weight: 600;
}

.info-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.info-icon.system {
  background-color: var(--secondary);
}

.info-icon.database {
  background-color: var(--success);
}

.info-icon.security {
  background-color: var(--warning);
}

.info-icon.backup {
  background-color: var(--primary);
}

.info-value {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.info-description {
  font-size: 0.8rem;
  color: #7f8c8d;
}

/* Backup Section */
.backup-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.backup-option {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.backup-option:hover {
  border-color: var(--secondary);
  background-color: #f8f9fa;
}

.backup-option.selected {
  border-color: var(--secondary);
  background-color: #e3f2fd;
}

.backup-icon {
  font-size: 2rem;
  margin-bottom: 10px;
  color: var(--secondary);
}

.backup-title {
  font-weight: 600;
  margin-bottom: 5px;
  color: var(--primary);
}

.backup-desc {
  font-size: 0.8rem;
  color: #7f8c8d;
}

/* User Permissions Table */
.permissions-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 25px;
}

.permissions-table th,
.permissions-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.permissions-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: var(--dark);
}

.permission-check {
  text-align: center;
}

/* Danger Zone */
.danger-zone {
  border: 2px solid var(--danger);
  border-radius: 8px;
  padding: 25px;
  background-color: #fff5f5;
}

.danger-title {
  color: var(--danger);
  font-size: 1.2rem;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.danger-description {
  color: #7f8c8d;
  margin-bottom: 20px;
  line-height: 1.5;
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

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

/* Responsive */
@media (max-width: 992px) {
  .form-grid {
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

  .config-tabs {
    flex-wrap: wrap;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    justify-content: center;
  }
}
</style>
