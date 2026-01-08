<template>
  <div class="recent-incidents-table">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando incidencias...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
    </div>

    <table v-else>
      <thead>
        <tr>
          <th>Empleado</th>
          <th>Tipo</th>
          <th>Fecha</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="incidencia in incidencias" :key="incidencia.id">
          <td>
            <!-- Mostrar nombre si está disponible, o fallback al ID -->
            {{ getEmployeeName(incidencia) }}
          </td>
          <td>
            <span
              :class="[
                'status',
                getStatusClass(incidencia.tipo_incidencia?.nombre),
              ]"
            >
              {{ incidencia.tipo_incidencia?.nombre || "Desconocido" }}
            </span>
          </td>
          <td>{{ formatDate(incidencia.fecha_inicio) }}</td>
        </tr>
        <tr v-if="incidencias.length === 0">
          <td colspan="3" class="text-center">No hay incidencias recientes</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { incidentService } from "@/api/services/incident.service";
import { userService } from "@/api/services/user.service";
import type { Incidencia } from "@/api/types/incidents.types";

const incidencias = ref<Incidencia[]>([]);
const loading = ref(true);
const error = ref("");
const employeeNames = ref<Record<string, string>>({});

// Función para obtener nombres de empleados
const fetchEmployeeNames = async (userIds: string[]) => {
  // Evitar duplicados
  const uniqueIds = [...new Set(userIds)];

  for (const id of uniqueIds) {
    if (!employeeNames.value[id]) {
      try {
        const response = await userService.getByUserId(id);
        // @ts-ignore
        const userData = response.data || response;
        // @ts-ignore
        const realData = userData.data || userData;

        if (realData && realData.nombre) {
          employeeNames.value[id] = realData.nombre;
        } else {
          employeeNames.value[id] = id;
        }
      } catch (e) {
        console.warn(`No se pudo cargar nombre para ${id}`);
        employeeNames.value[id] = id;
      }
    }
  }
};

const getEmployeeName = (incidencia: Incidencia) => {
  return employeeNames.value[incidencia.empleado_id] || incidencia.empleado_id;
};

const getStatusClass = (tipo: string | undefined) => {
  if (!tipo) return "status-default";
  const lower = tipo.toLowerCase();
  if (lower.includes("tardanza")) return "status-late";
  if (lower.includes("falta") || lower.includes("ausente"))
    return "status-absent";
  if (lower.includes("permiso") || lower.includes("licencia"))
    return "status-present"; // Usamos verde/azul como "justificado"
  return "status-default";
};

const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  // Ajuste simple de fecha para visualización, asumiendo ISO string
  return new Date(dateString).toLocaleDateString("es-PE");
};

const loadRecentIncidents = async () => {
  try {
    loading.value = true;
    // Asumimos que la API soporta ordenamiento por fecha desc. Si no, habría que ordenar en cliente.
    // Usualmente los endpoints de listado devuelven los más recientes primero o requieren un sort param.
    // Aquí solcitamos limite de 5.
    const response = await incidentService.getAllIncidencias({ limit: 5 });

    if (response.data && Array.isArray(response.data.data)) {
      incidencias.value = response.data.data;

      // Cargar nombres de los empleados
      const userIds = incidencias.value.map((i) => i.empleado_id);
      await fetchEmployeeNames(userIds);
    } else {
      // Fallback si la estructura es diferente
      // @ts-ignore
      const data = response.data || response;
      // @ts-ignore
      incidencias.value = Array.isArray(data) ? data.slice(0, 5) : [];
    }
  } catch (err) {
    console.error("Error cargando incidencias recientes:", err);
    error.value = "Error al cargar datos.";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadRecentIncidents();
});
</script>

<style scoped>
.recent-incidents-table {
  width: 100%;
  overflow-x: auto;
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
  color: #2c3e50;
}

.status {
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-block;
}

.status-late {
  background-color: #fff8e1;
  color: #f39c12;
}

.status-absent {
  background-color: #ffebee;
  color: #e74c3c;
}

.status-present {
  background-color: #e8f5e9;
  color: #27ae60;
}

.status-default {
  background-color: #ecf0f1;
  color: #7f8c8d;
}

.loading-state,
.error-state {
  padding: 20px;
  text-align: center;
  color: #7f8c8d;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.text-center {
  text-align: center;
}
</style>
