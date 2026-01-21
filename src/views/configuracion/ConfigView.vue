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
        <h1 class="page-title">Configuración del Sistema</h1>

        <!-- Navegación de Configuración -->
        <div class="config-nav">
          <div class="config-tabs">
            <button
              class="config-tab"
              :class="{ active: activeTab === 'general' }"
              @click="activeTab = 'general'"
            >
              General
            </button>
            <button
              class="config-tab"
              :class="{ active: activeTab === 'horarios' }"
              @click="activeTab = 'horarios'"
            >
              Horarios Laborales
            </button>
            <button
              class="config-tab"
              :class="{ active: activeTab === 'biometrico' }"
              @click="activeTab = 'biometrico'"
            >
              Control Biométrico
            </button>
            <button
              class="config-tab"
              :class="{ active: activeTab === 'permisos' }"
              @click="activeTab = 'permisos'"
            >
              Permisos y Roles
            </button>
            <button
              class="config-tab"
              :class="{ active: activeTab === 'notificaciones' }"
              @click="activeTab = 'notificaciones'"
            >
              Feriados y Alertas
            </button>
            <button
              class="config-tab"
              :class="{ active: activeTab === 'backup' }"
              @click="activeTab = 'backup'"
            >
              Backup y Restauración
            </button>
            <button
              class="config-tab"
              :class="{ active: activeTab === 'sistema' }"
              @click="activeTab = 'sistema'"
            >
              Sistema
            </button>
          </div>

          <!-- Datos Principales -->

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
        <div
          class="config-section"
          :class="{ active: activeTab === 'general' }"
        >
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
        <div
          class="config-section"
          :class="{ active: activeTab === 'horarios' }"
        >
          <h2 class="section-title">Horarios Laborales</h2>
          <p class="section-description">
            Gestiona los perfiles de horarios y sus turnos (segmentos).
          </p>

          <div
            class="mb-4 flex justify-between items-center"
            style="
              margin-bottom: 1rem;
              display: flex;
              justify-content: space-between;
              align-items: center;
            "
          >
            <span class="text-gray-600">Lista de Horarios Configurados</span>
            <Button
              label="Nuevo Horario"
              icon="pi pi-plus"
              @click="openCreateHorario"
            />
          </div>

          <DataTable
            :value="schedules"
            :loading="loadingSchedules"
            stripedRows
            tableStyle="min-width: 50rem"
          >
            <Column field="nombre" header="Nombre"></Column>
            <Column field="descripcion" header="Descripción"></Column>
            <Column field="activo" header="Estado">
              <template #body="slotProps">
                <span
                  :class="
                    slotProps.data.activo
                      ? 'text-green-600 font-bold'
                      : 'text-red-500'
                  "
                >
                  {{ slotProps.data.activo ? "Activo" : "Inactivo" }}
                </span>
              </template>
            </Column>
            <Column header="Acciones">
              <template #body="slotProps">
                <div class="flex gap-2">
                  <Button
                    icon="pi pi-pencil"
                    size="small"
                    severity="warning"
                    text
                    @click="openEditHorario(slotProps.data)"
                  />
                  <Button
                    icon="pi pi-trash"
                    size="small"
                    severity="danger"
                    text
                    @click="deleteSchedule(slotProps.data)"
                  />
                </div>
              </template>
            </Column>
            <template #empty>No hay horarios registrados.</template>
          </DataTable>
        </div>

        <!-- Sección Control Biométrico -->
        <!-- Sección Control Biométrico -->
        <div
          class="config-section"
          :class="{ active: activeTab === 'biometrico' }"
        >
          <TestConexView />
        </div>

        <!-- Sección Permisos y Roles -->
        <div
          class="config-section"
          :class="{ active: activeTab === 'permisos' }"
        >
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

        <!-- Sección Notificaciones (Feriados y Alertas) -->
        <div
          class="config-section"
          :class="{ active: activeTab === 'notificaciones' }"
        >
          <CalenFerView />
        </div>

        <!-- Sección Backup y Restauración -->
        <div class="config-section" :class="{ active: activeTab === 'backup' }">
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
        </div>

        <!-- Sección Sistema (Nueva) -->
        <div
          class="config-section"
          :class="{ active: activeTab === 'sistema' }"
        >
          <h2 class="section-title">Configuración del Sistema</h2>
          <p class="section-description">
            Opciones avanzadas y gestión de datos estructurales.
          </p>

          <div class="form-grid">
            <div class="form-group">
              <label>Gestión de Áreas y Departamentos</label>
              <button
                class="btn btn-secondary"
                style="width: 100%"
                @click="modalAreaVisible = true"
              >
                <i class="fas fa-building"></i> Gestionar Áreas
              </button>
              <div class="label-hint">
                Administrar departamentos y asignar jefes de área
              </div>
            </div>

            <div class="form-group">
              <label>Gestión de Tipos de Papeletas</label>
              <button
                class="btn btn-secondary"
                style="width: 100%"
                @click="modalTipoPerVisible = true"
              >
                <i class="fas fa-file-alt"></i> Gestionar Tipos
              </button>
              <div class="label-hint">
                Configurar tipos de permisos, tiempos y requisitos
              </div>
            </div>

            <div class="form-group">
              <label>Gestión de Tipos de Reportes</label>
              <button
                class="btn btn-secondary"
                style="width: 100%"
                @click="modalTipoReporVisible = true"
              >
                <i class="fas fa-file-invoice"></i> Gestionar Tipos de Reportes
              </button>
              <div class="label-hint">
                Configurar el catálogo de reportes disponibles
              </div>
            </div>

            <div class="form-group">
              <label>Gestión de Tipos de Incidencias</label>
              <button
                class="btn btn-secondary"
                style="width: 100%"
                @click="modalTipoInciVisible = true"
              >
                <i class="fas fa-exclamation-circle"></i> Gestionar Incidencias
              </button>
              <div class="label-hint">
                Configurar tipos de faltas, sanciones y justificaciones
              </div>
            </div>
          </div>

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

    <!-- Modals -->
    <ModalArea v-model:visible="modalAreaVisible" />
    <ModalTipoPer v-model:visible="modalTipoPerVisible" />
    <ModalTipoRepor v-model:visible="modalTipoReporVisible" />
    <ModalTipoInci v-model:visible="modalTipoInciVisible" />
    <ModalHorario
      v-model:visible="modalHorarioVisible"
      :scheduleToEdit="selectedSchedule"
      @saved="loadSchedules"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import Swal from "sweetalert2";
import "@fortawesome/fontawesome-free/css/all.min.css";
import ModalArea from "@/components/Modals/ModalArea.vue";
import ModalTipoPer from "@/components/Modals/ModalTipoPer.vue";
import ModalTipoRepor from "@/components/Modals/ModalTipoRepor.vue";
import ModalTipoInci from "@/components/Modals/ModalTipoInci.vue";
import ModalHorario from "@/components/Modals/ModalHorario.vue";
import CalenFerView from "@/components/Calendario/CalenFerView.vue";
import AdminNavbar from "@/components/Admin/NavbarView.vue";
import HeaderView from "@/components/header/HeaderView.vue";
import TestConexView from "@/components/Biometrico/TestConexView.vue";
import Button from "primevue/button"; // Necesario para la sección de horarios
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { scheduleService } from "@/api/services/schedule.service";
import type { Schedule } from "@/api/types/schedules.types";

const activeTab = ref("general");
const modalAreaVisible = ref(false);
const modalTipoPerVisible = ref(false);
const modalTipoReporVisible = ref(false);
const modalTipoInciVisible = ref(false);

// Horarios State
const modalHorarioVisible = ref(false);
const schedules = ref<Schedule[]>([]);
const loadingSchedules = ref(false);
const selectedSchedule = ref<Schedule | null>(null);

const loadSchedules = async () => {
  loadingSchedules.value = true;
  try {
    const response = await scheduleService.getAll();
    // @ts-ignore
    const data = response.data?.data || response.data || [];
    schedules.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error loading schedules", error);
  } finally {
    loadingSchedules.value = false;
  }
};

const openCreateHorario = () => {
  selectedSchedule.value = null;
  modalHorarioVisible.value = true;
};

const openEditHorario = (schedule: Schedule) => {
  selectedSchedule.value = schedule;
  modalHorarioVisible.value = true;
};

const deleteSchedule = async (schedule: Schedule) => {
  const result = await Swal.fire({
    title: "¿Estás seguro?",
    text: `Vas a eliminar el horario "${schedule.nombre}". Verifica que NO tenga usuarios asignados, de lo contrario la operación podría fallar.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  });

  if (result.isConfirmed) {
    try {
      loadingSchedules.value = true;
      await scheduleService.delete(schedule.id);
      Swal.fire("Eliminado", "El horario ha sido eliminado.", "success");
      await loadSchedules();
    } catch (error) {
      console.error("Error eliminando horario:", error);
      Swal.fire(
        "Error",
        "No se pudo eliminar el horario. Es posible que tenga usuarios asignados o segmentos activos.",
        "error",
      );
    } finally {
      loadingSchedules.value = false;
    }
  }
};

onMounted(() => {
  loadSchedules();
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

/* System Info Cards */
.system-info {
  margin-top: 20px;
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.info-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #eee;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s;
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.info-title {
  font-size: 0.9rem;
  color: #7f8c8d;
  font-weight: 600;
}

.info-icon {
  width: 35px;
  height: 35px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
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
  font-size: 1.4rem;
  font-weight: bold;
  color: var(--dark);
  margin-bottom: 5px;
}

.info-description {
  font-size: 0.8rem;
  color: #95a5a6;
}

/* Backup Options */
.backup-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.backup-option {
  background-color: #fff;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.backup-option:hover {
  border-color: var(--secondary);
  background-color: #fcfdfe;
  transform: translateY(-5px);
}

.backup-option.selected {
  border-color: var(--secondary);
  background-color: #ebf5fb;
}

.backup-icon {
  width: 60px;
  height: 60px;
  background-color: #ecf0f1;
  color: var(--dark);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  font-size: 1.5rem;
  transition: all 0.3s;
}

.backup-option:hover .backup-icon {
  background-color: var(--secondary);
  color: white;
}

.backup-title {
  font-weight: bold;
  margin-bottom: 5px;
  color: var(--dark);
}

.backup-desc {
  font-size: 0.8rem;
  color: #7f8c8d;
}

/* Danger Zone */
.danger-zone {
  border: 1px solid #fab1a0;
  background-color: #fff5f5;
  border-radius: 8px;
  padding: 25px;
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
  color: #636e72;
  margin-bottom: 20px;
}

.btn-danger {
  background-color: var(--danger);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-danger:hover {
  background-color: #c0392b;
}

/* Estilos para el botón btn-secondary, que puede que falte */
.btn-secondary {
  background-color: var(--secondary);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-secondary:hover {
  background-color: #2980b9;
}
</style>
