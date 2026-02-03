<template>
  <div class="container">
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
          <h1>Registro de Asistencia</h1>
          <div class="current-date" id="current-date"></div>
        </div>

        <!-- Sección Biométrica -->
        <div class="biometric-section">
          <div class="biometric-container">
            <div class="biometric-icon">
              <i class="fas fa-fingerprint"></i>
            </div>
            <div class="biometric-message">
              Coloque su dedo en el lector biométrico para registrar su
              asistencia
            </div>
            <button
              class="biometric-btn"
              id="biometric-scan"
              @click="handleSyncOpen"
            >
              <i class="fas fa-fingerprint"></i>
              Escanear Huella Digital
            </button>
            <div class="current-time" id="current-time"></div>
          </div>
        </div>

        <!-- Acciones Rápidas -->
        <div class="quick-actions">
          <!-- registrar Entrada manual -->
          <div class="action-card entrada" @click="handleManualOpen('ENTRADA')">
            <div class="action-icon">
              <i class="fas fa-sign-in-alt"></i>
            </div>
            <div class="action-title">Registrar Entrada</div>
            <div class="action-desc">Marcar hora de ingreso</div>
          </div>

          <!-- registrar Salida manual -->
          <div class="action-card salida" @click="handleManualOpen('SALIDA')">
            <div class="action-icon">
              <i class="fas fa-sign-out-alt"></i>
            </div>
            <div class="action-title">Registrar Salida</div>
            <div class="action-desc">Marcar hora de salida</div>
          </div>

          <div
            class="action-card emergencia"
            data-action="emergencia"
            @click="handleEmergency"
          >
            <div class="action-icon">
              <i class="fas fa-first-aid"></i>
            </div>
            <div class="action-title">Salida Emergencia</div>
            <div class="action-desc">Registro especial</div>
          </div>
        </div>

        <!-- Registros del Día -->
        <div class="records-container">
          <PersonalAsis />
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de Confirmación -->
  <div class="modal" id="confirmation-modal">
    <div class="modal-content modal-success">
      <div class="modal-icon">
        <i class="fas fa-check-circle"></i>
      </div>
      <h3 class="modal-title" id="modal-title">Asistencia Registrada</h3>
    </div>
  </div>

  <ModalRegisManu
    v-model:visible="showManualModal"
    :type="manualModalType"
    @success="handleSuccess"
  />
  <ModalSyncDevice v-model:visible="showSyncModal" />
</template>

<script setup lang="ts">
import AdminNavbar from "@/components/Admin/NavbarView.vue";
import HeaderView from "@/components/header/HeaderView.vue";
import PersonalAsis from "@/components/tables/PersonalAsis.vue";
import ModalRegisManu from "@/components/Admin/ModalRegisManu.vue";
import ModalSyncDevice from "@/components/Biometrico/ModalSyncDevice.vue"; // Import
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const showManualModal = ref(false);
const showSyncModal = ref(false); // Sync Modal State
const manualModalType = ref<"ENTRADA" | "SALIDA">("ENTRADA");

const handleManualOpen = (type: "ENTRADA" | "SALIDA") => {
  manualModalType.value = type;
  showManualModal.value = true;
};

const handleSyncOpen = () => {
  showSyncModal.value = true;
};

const handleEmergency = () => {
  router.push({ name: "Incidencias" });
};

const handleSuccess = () => {
  // Opcional: refrescar PersonalAsis si fuera necesario usando un ref o event bus
  // Por ahora el modal muestra el sweet alert de éxito
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

/* Biometric Section */
.biometric-section {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border-radius: 10px;
  padding: 30px;
  margin-bottom: 30px;
  text-align: center;
}

.biometric-container {
  max-width: 400px;
  margin: 0 auto;
}

.biometric-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  color: white;
}

.biometric-message {
  font-size: 1.2rem;
  margin-bottom: 25px;
}

.biometric-btn {
  background-color: white;
  color: var(--primary);
  border: none;
  padding: 15px 30px;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.biometric-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.current-time {
  font-size: 1.5rem;
  font-weight: bold;
  margin-top: 15px;
}

.current-date {
  font-size: 1rem;
  opacity: 0.9;
}

/* Quick Actions */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.action-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s;
}

.action-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.action-icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
}

.action-card.entrada .action-icon {
  color: var(--success);
}

.action-card.salida .action-icon {
  color: var(--danger);
}

.action-card.descanso .action-icon {
  color: var(--warning);
}

.action-card.emergencia .action-icon {
  color: var(--secondary);
}

.action-title {
  font-weight: 600;
  margin-bottom: 5px;
}

.action-desc {
  font-size: 0.9rem;
  color: #7f8c8d;
}

/* Today's Records */
.records-container {
  background-color: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.records-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.date-selector {
  display: flex;
  gap: 10px;
  align-items: center;
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

.status-presente {
  background-color: #e8f5e9;
  color: var(--success);
}

.status-tardanza {
  background-color: #fff8e1;
  color: var(--warning);
}

.status-ausente {
  background-color: #ffebee;
  color: var(--danger);
}

.status-descanso {
  background-color: #e3f2fd;
  color: var(--secondary);
}

.employee-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.employee-avatar {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background-color: var(--secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
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
  padding: 30px;
  max-width: 500px;
  width: 90%;
  text-align: center;
}

.modal-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.modal-success .modal-icon {
  color: var(--success);
}

.modal-warning .modal-icon {
  color: var(--warning);
}

.modal-title {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: var(--primary);
}

.modal-message {
  margin-bottom: 25px;
  color: #7f8c8d;
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
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

/* Responsive */
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

  .records-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }
}
</style>
