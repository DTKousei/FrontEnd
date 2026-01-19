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
          <h1>Mis Papeletas</h1>
          <button
            class="btn btn-success"
            id="nueva-papeleta-btn"
            @click="showModal = true"
          >
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
            <div class="stat-value">{{ pendientesCount }}</div>
            <div class="stat-change">Total pendientes</div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <div class="stat-title">Aprobadas Hoy</div>
              <div class="stat-icon aprobadas">
                <i class="fas fa-check-circle"></i>
              </div>
            </div>
            <div class="stat-value">{{ aprobadasHoyCount }}</div>
            <div class="stat-change">Solicitadas hoy</div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <div class="stat-title">Rechazadas</div>
              <div class="stat-icon rechazadas">
                <i class="fas fa-times-circle"></i>
              </div>
            </div>
            <div class="stat-value">{{ rechazadasCount }}</div>
            <div class="stat-change">Total rechazadas</div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <div class="stat-title">Comisiones</div>
              <div class="stat-icon comision">
                <i class="fas fa-briefcase"></i>
              </div>
            </div>
            <div class="stat-value">{{ comisionesCount }}</div>
            <div class="stat-change">Total activas</div>
          </div>
        </div>

        <!-- Tabla de Papeletas (New Component) -->
        <div class="papeletas-container">
          <TablesPerm
            :data="permissions"
            :loading="loading"
            @view="handleView"
            @approve="handleApprove"
            @reject="handleReject"
            @mark-return="handleMarkReturn"
          />
        </div>
      </div>
    </div>
  </div>

  <ModalEmpPerm
    v-model:visible="showModal"
    @save="handleSavePapeleta"
    :preselectedEmployeeId="currentUser?.user_id || currentUser?.usuario"
    :lockEmployee="true"
  />
  <ModalFirmaOnpe
    v-model:visible="showFirmaModal"
    :permiso="selectedPermiso"
    @signed="handleSigned"
    forcedRole="solicitante"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import ModalEmpPerm from "@/components/Employed/ModalEmpPerm.vue";
import ModalFirmaOnpe from "@/components/Modals/ModalFirmaOnpe.vue";
import TablesPerm from "@/components/Employed/TablesPerm.vue";
import AdminNavbar from "@/components/Admin/NavbarView.vue";
import HeaderView from "@/components/header/HeaderView.vue";
import { permissionService } from "@/api/services/permission.service";
import type { Permiso } from "@/api/types/permissions.types";
import Swal from "sweetalert2";

const showModal = ref(false);
const showFirmaModal = ref(false);
const selectedPermiso = ref<Permiso | null>(null);
const permissions = ref<Permiso[]>([]);
const loading = ref(false);

const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      return JSON.parse(userStr);
    }
  } catch (e) {
    console.error("Error reading user", e);
  }
  return null;
};

const currentUser = computed(() => getCurrentUser());

// Estadísticas Computadas
const pendientesCount = computed(() => {
  return permissions.value.filter((p) =>
    p.estado?.nombre?.toLowerCase().includes("pend"),
  ).length;
});

const aprobadasHoyCount = computed(() => {
  const hoy = new Date();
  return permissions.value.filter((p) => {
    const isAprobada = p.estado?.nombre?.toLowerCase().includes("aprob");

    // Comparar usando fechas locales para evitar discrepancias de Zona Horaria (UTC)
    if (!p.fecha_hora_inicio) return false;

    const fechaPermiso = new Date(p.fecha_hora_inicio);
    const esHoy =
      fechaPermiso.getDate() === hoy.getDate() &&
      fechaPermiso.getMonth() === hoy.getMonth() &&
      fechaPermiso.getFullYear() === hoy.getFullYear();

    return isAprobada && esHoy;
  }).length;
});

const rechazadasCount = computed(() => {
  return permissions.value.filter((p) =>
    p.estado?.nombre?.toLowerCase().includes("rechaz"),
  ).length;
});

const comisionesCount = computed(() => {
  return permissions.value.filter((p) =>
    p.tipo_permiso?.nombre?.toLowerCase().includes("comisi"),
  ).length;
});

const loadPermissions = async () => {
  const user = getCurrentUser();
  if (!user || !user.usuario) return; // user.usuario is DNI

  try {
    loading.value = true;
    const response = await permissionService.getPermisos({
      empleado_id: user.usuario,
    });
    // @ts-ignore
    const data = response.data?.data || response.data || [];
    permissions.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error loading permissions:", error);
  } finally {
    loading.value = false;
  }
};

const handleSavePapeleta = () => {
  loadPermissions();
};

const handleView = async (permiso: Permiso) => {
  try {
    loading.value = true;
    // Usar endpoint para ver PDF existente sin regenerar
    const response = await permissionService.verPDF(permiso.id);

    // Crear URL del Blob
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    // Abrir en nueva pestaña
    window.open(url, "_blank");
  } catch (error) {
    console.error("Error al visualizar PDF:", error);
    Swal.fire({
      icon: "warning",
      title: "Documento no disponible",
      text: "El documento PDF no se encuentra disponible. Asegúrese de que se haya generado correctamente.",
    });
  } finally {
    loading.value = false;
  }
};

const handleApprove = (permiso: Permiso) => {
  console.log("Iniciando flujo de firma digital para:", permiso);
  selectedPermiso.value = permiso;
  showFirmaModal.value = true;
};

const handleSigned = async () => {
  console.log("Firma realizada");
  // Update status explicitly to PENDIENTE_JEFE if signed by applicant
  // We assume here it was applicant since forcedRole="solicitante"
  if (selectedPermiso.value) {
    try {
      await permissionService.cambiarEstado(
        selectedPermiso.value.id,
        "PENDIENTE_JEFE",
      );
      Swal.fire({
        icon: "success",
        title: "Enviado",
        text: "La papeleta ha sido firmada y enviada a su jefe inmediato (Estado: Pendiente de Jefe).",
        timer: 2500,
      });
    } catch (e) {
      console.error("Error updating status after signature", e);
    }
  }
  loadPermissions();
};

const handleReject = async (permiso: Permiso) => {
  try {
    const result = await Swal.fire({
      title: "¿Rechazar Papeleta?",
      text: "Esta acción cambiará el estado a RECHAZADO. ¿Desea continuar?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, Rechazar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      loading.value = true;

      // Usar nuevo endpoint para cambiar estado por código
      await permissionService.cambiarEstado(permiso.id, "RECHAZADO");

      Swal.fire("Rechazado", "La papeleta ha sido rechazada.", "success");
      loadPermissions();
    }
  } catch (error) {
    console.error("Error al rechazar:", error);
    Swal.fire("Error", "No se pudo rechazar la papeleta.", "error");
  } finally {
    loading.value = false;
  }
};

const handleMarkReturn = async (permiso: Permiso) => {
  try {
    const result = await Swal.fire({
      title: "¿Marcar Retorno?",
      text: "Se registrará la hora actual como hora de retorno. ¿Continuar?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, Registrar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      loading.value = true;
      await permissionService.registrarRetorno(permiso.id);
      Swal.fire("Registrado", "Hora de retorno actualizada.", "success");
      loadPermissions();
    }
  } catch (error) {
    console.error("Error al marcar retorno:", error);
    Swal.fire("Error", "No se pudo registrar el retorno.", "error");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadPermissions();
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
  overflow-x: auto;
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

/* Papeletas Table Container */
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
