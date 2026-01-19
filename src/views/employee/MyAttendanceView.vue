<template>
  <div class="container">
    <AdminNavbar />
    <div class="main-content">
      <HeaderView />
      <div class="page-content">
        <h1 class="text-3xl font-bold text-blue-800 mb-4">Mis Asistencias</h1>

        <div class="card bg-white p-4 shadow-1 border-round-lg">
          <div class="flex justify-content-between align-items-center mb-4">
            <h3 class="m-0">Historial de Marcaciones</h3>
            <Button
              icon="pi pi-refresh"
              rounded
              outlined
              @click="loadAttendance"
              :loading="loading"
              tooltip="Recargar"
            />
          </div>

          <DataTable
            :value="attendances"
            :loading="loading"
            paginator
            :rows="10"
            responsiveLayout="scroll"
            class="p-datatable-sm"
            stripedRows
          >
            <Column field="fecha_hora" header="Fecha y Hora">
              <template #body="slotProps">
                {{ formatDateTime(slotProps.data.timestamp) }}
              </template>
            </Column>
            <Column field="status" header="Estado">
              <template #body="slotProps">
                <Tag
                  :value="getStatusLabel(slotProps.data.status)"
                  severity="info"
                />
              </template>
            </Column>
            <Column field="punch" header="Tipo">
              <template #body="slotProps">
                {{ getPunchLabel(slotProps.data.punch) }}
              </template>
            </Column>
            <Column field="dispositivo_id" header="Dispositivo">
              <template #body="slotProps">
                <span class="text-gray-600 text-sm"
                  >ID: {{ slotProps.data.dispositivo_id }}</span
                >
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import AdminNavbar from "@/components/Admin/NavbarView.vue";
import HeaderView from "@/components/header/HeaderView.vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Tag from "primevue/tag";
import { attendanceService } from "@/api/services/attendance.service";
import { PUNCH_TYPE_LABELS, STATUS_LABELS } from "@/api/types/attendance.types";

const attendances = ref([]);
const loading = ref(false);

const getCurrentUserDNI = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      // Asumiendo que el 'usuario' es el DNI o hay un campo especifico.
      // En auth.types.ts User tiene 'usuario' (username), 'correo', etc.
      // Necesitamos verificar si 'usuario' es el DNI o si el DNI está en otro lado.
      // Por ahora usaremos 'usuario' asumiendo que es el DNI para empleados.
      return user.usuario;
    }
  } catch (e) {
    console.error("Error reading user", e);
  }
  return null;
};

const loadAttendance = async () => {
  const dni = getCurrentUserDNI();
  if (!dni) return;

  loading.value = true;
  try {
    // Fetch attendances filtered by user_id
    const response = await attendanceService.getAll({
      user_id: dni,
      limit: 100,
    });
    // @ts-ignore
    attendances.value = response.data?.data || response.data || [];
  } catch (error) {
    console.error("Error loading my attendance", error);
  } finally {
    loading.value = false;
  }
};

const formatDateTime = (isoString: string) => {
  if (!isoString) return "-";
  return new Date(isoString).toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const getStatusLabel = (status: number) => {
  // @ts-ignore
  return STATUS_LABELS[status] || "Desconocido";
};

const getPunchLabel = (punch: number) => {
  // @ts-ignore
  return PUNCH_TYPE_LABELS[punch] || "Normal";
};

onMounted(() => {
  loadAttendance();
});
</script>

<style scoped>
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
.container {
  display: flex;
  min-height: 100vh;
}
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}
.page-content {
  padding: 30px;
}
</style>
