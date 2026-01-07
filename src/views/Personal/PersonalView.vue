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
          <h1>Gestión de Personal</h1>
          <button
            class="btn btn-success"
            id="nuevo-empleado-btn"
            @click="openNewModal"
          >
            <i class="fas fa-user-plus"></i> Nuevo Empleado
          </button>
        </div>

        <!-- Estadísticas -->
        <div class="stats-cards">
          <div class="stat-card">
            <div class="stat-header">
              <div class="stat-title">Total Empleados</div>
              <div class="stat-icon total">
                <i class="fas fa-users"></i>
              </div>
            </div>
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-change">+{{ stats.newMonth }} este mes</div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <div class="stat-title">Activos</div>
              <div class="stat-icon active">
                <i class="fas fa-user-check"></i>
              </div>
            </div>
            <div class="stat-value">{{ stats.active }}</div>
            <div class="stat-change">
              {{
                stats.total
                  ? Math.round((stats.active / stats.total) * 100)
                  : 0
              }}% del total
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <div class="stat-title">Inactivos</div>
              <div class="stat-icon inactive">
                <i class="fas fa-user-times"></i>
              </div>
            </div>
            <div class="stat-value">{{ stats.inactive }}</div>
            <div class="stat-change">
              {{
                stats.total
                  ? Math.round((stats.inactive / stats.total) * 100)
                  : 0
              }}% del total
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <div class="stat-title">Pendientes</div>
              <div class="stat-icon pending">
                <i class="fas fa-user-clock"></i>
              </div>
            </div>
            <div class="stat-value">{{ stats.pending }}</div>
            <div class="stat-change">Por verificar</div>
          </div>
        </div>

        <!-- Tabla de Empleados -->
        <div class="employees-container">
          <PersonalTable
            ref="personalTableRef"
            @edit-user="onEditUser"
            @update-stats="handleStatsUpdate"
          />
        </div>
      </div>
    </div>

    <!-- Modal Registro -->
    <ModalRegisPer
      :visible="showModal"
      :userToEdit="selectedUser"
      @close="showModal = false"
      @saved="onEmployeeSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import PersonalTable from "@/components/tables/personalView.vue";
import ModalRegisPer from "@/components/Admin/ModalRegisPer.vue";
import AdminNavbar from "@/components/Admin/NavbarView.vue";
import HeaderView from "@/components/header/HeaderView.vue";

const showModal = ref(false);
const personalTableRef = ref();
const selectedUser = ref(null);

const stats = reactive({
  total: 0,
  active: 0,
  inactive: 0,
  pending: 0,
  newMonth: 0,
});

const handleStatsUpdate = (newStats: any) => {
  stats.total = newStats.total;
  stats.active = newStats.active;
  stats.inactive = newStats.inactive;
  stats.pending = newStats.pending;
  stats.newMonth = newStats.newMonth;
};

const openNewModal = () => {
  selectedUser.value = null;
  showModal.value = true;
};

const onEditUser = (user: any) => {
  selectedUser.value = user;
  showModal.value = true;
};

const onEmployeeSaved = () => {
  // Refresh table data
  if (personalTableRef.value) {
    personalTableRef.value.loadUsers();
  }
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

.stat-icon.total {
  background-color: var(--secondary);
}

.stat-icon.active {
  background-color: var(--success);
}

.stat-icon.inactive {
  background-color: var(--danger);
}

.stat-icon.pending {
  background-color: var(--warning);
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

/* Employees Table */
.employees-container {
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
  cursor: pointer;
  user-select: none;
}

th:hover {
  background-color: #e9ecef;
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

.employee-position {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-active {
  background-color: #e8f5e9;
  color: var(--success);
}

.status-inactive {
  background-color: #ffebee;
  color: var(--danger);
}

.status-pending {
  background-color: #fff8e1;
  color: var(--warning);
}

.role {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.role-admin {
  background-color: #e3f2fd;
  color: #1976d2;
}

.role-supervisor {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.role-employee {
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

.action-btn.edit {
  color: var(--warning);
}

.action-btn.edit:hover {
  color: #e67e22;
}

.action-btn.delete {
  color: var(--danger);
}

.action-btn.delete:hover {
  color: #c0392b;
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
  max-width: 600px;
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

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

/* Responsive */
@media (max-width: 992px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .actions-bar {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .search-box {
    max-width: 100%;
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

  table {
    display: block;
    overflow-x: auto;
  }
}
</style>
