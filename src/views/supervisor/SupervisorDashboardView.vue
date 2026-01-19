<template>
  <div class="container">
    <AdminNavbar />
    <div class="main-content">
      <HeaderView />
      <div class="dashboard-content">
        <h1 class="page-title">Dashboard de Supervisor</h1>

        <!-- Placeholder for Supervisor specific content -->
        <div class="card">
          <div class="card-body text-center p-5">
            <h3>Bienvenido al Panel de Supervisión</h3>
            <p>Aquí podrá ver estadísticas y métricas de su área asignada.</p>
            <i class="fas fa-chart-line fa-3x text-muted mt-3"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AdminNavbar from "@/components/Admin/NavbarView.vue";
import HeaderView from "@/components/header/HeaderView.vue";
</script>

<style scoped>
/* Reuse styles or import from common */
/* For brevity, minimal styling here relying on global or component reuse */
.container {
  display: flex;
  min-height: 100vh;
}
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.dashboard-content {
  padding: 30px;
  flex: 1;
}
.page-title {
  margin-bottom: 20px;
  color: var(--primary-color, #2c5aa0);
}
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}
.text-center {
  text-align: center;
}
.p-5 {
  padding: 3rem;
}
.text-muted {
  color: #6c757d;
}
.mt-3 {
  margin-top: 1rem;
}
</style>
