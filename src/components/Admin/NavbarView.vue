<template>
  <!-- Sidebar -->
  <div class="sidebar">
    <div class="logo">
      <h2><i class="fas fa-fingerprint"></i> Control Asistencia</h2>
      <p>UGEL Sucre</p>
    </div>
    <ul class="nav-links">
      <li v-if="hasRole(['ADMINISTRADOR', 'JEFE'])">
        <router-link to="/dashboard"
          ><i class="fas fa-tachometer-alt"></i> Dashboard</router-link
        >
      </li>
      <li v-if="hasRole(['ADMINISTRADOR'])">
        <router-link to="/biometrico"
          ><i class="fas fa-user-clock"></i> Registro Asistencia</router-link
        >
      </li>
      <li v-if="hasRole(['ADMINISTRADOR', 'JEFE'])">
        <router-link to="/personal"
          ><i class="fas fa-users"></i> Gestión Personal</router-link
        >
      </li>
      <li v-if="hasRole(['ADMINISTRADOR', 'JEFE'])">
        <router-link to="/papeletas"
          ><i class="fas fa-chart-bar"></i> Papeletas</router-link
        >
      </li>
      <li v-if="hasRole(['ADMINISTRADOR', 'JEFE'])">
        <router-link to="/incidencias"
          ><i class="fas fa-question-circle"></i> Registro de
          incidencias</router-link
        >
      </li>
      <li v-if="hasRole(['ADMINISTRADOR', 'JEFE'])">
        <router-link to="/reportes"
          ><i class="fas fa-chart-bar"></i> Reportes</router-link
        >
      </li>
      <li v-if="hasRole(['ADMINISTRADOR'])">
        <router-link to="/configuracion"
          ><i class="fas fa-cog"></i> Configuración</router-link
        >
      </li>
      <!-- Sección: Menú para Supervisores (División) -->

      <!-- Section: MI ESPACIO (Personal) -->
      <li v-if="hasRole(['SUPERVISOR', 'EMPLEADO'])" class="nav-section-header">
        <span v-if="hasRole(['SUPERVISOR'])">MI ESPACIO</span>
      </li>

      <li v-if="hasRole(['EMPLEADO', 'SUPERVISOR'])">
        <router-link to="/mis-asistencias"
          ><i class="fas fa-clock"></i> Mis Asistencias</router-link
        >
      </li>
      <li v-if="hasRole(['EMPLEADO', 'SUPERVISOR'])">
        <router-link to="/mis-papeletas"
          ><i class="fas fa-file-alt"></i> Mis Papeletas</router-link
        >
      </li>

      <!-- Section: GESTIÓN (Supervisor) -->
      <li v-if="hasRole(['SUPERVISOR'])" class="nav-section-header">
        <span>GESTIÓN</span>
      </li>

      <li v-if="hasRole(['SUPERVISOR'])">
        <router-link to="/supervisor/dashboard"
          ><i class="fas fa-tachometer-alt"></i> Dashboard Equipo</router-link
        >
      </li>
      <li v-if="hasRole(['SUPERVISOR'])">
        <router-link to="/supervisor/papeletas"
          ><i class="fas fa-clipboard-list"></i> Gestión Papeletas</router-link
        >
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/authStore";

const authStore = useAuthStore();

// Función auxiliar para verificar roles desde el store de autenticación
// Devuelve true si el rol actual del usuario está incluido en la lista de roles permitidos
const hasRole = (roles: string[]) => {
  const currentRole = (authStore.user?.rol || "").toUpperCase().trim();
  return roles.includes(currentRole);
};
</script>

<style>
/* Variables Globales para el contexto de la Barra de Navegación (si no están definidas en root) */
:root {
  --primary: #2c5aa0;
  --secondary: #3498db;
  --success: #27ae60;
  --warning: #f39c12;
  --danger: #e74c3c;
  --light: #ecf0f1;
  --dark: #34495e;
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

.nav-section-header {
  padding: 10px 20px 5px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 1px;
  margin-top: 10px;
}
</style>
