<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Tag from "primevue/tag";
import { userService } from "@/api/services/user.service";
import type { Permiso } from "@/api/types/permissions.types";
import type { BiometricUser } from "@/api/types/users.types";

const props = defineProps<{
  data: Permiso[];
  loading?: boolean;
}>();

const emit = defineEmits(["approve", "reject", "view"]);

const usersMap = ref<Record<string, string>>({});
const loadingUsers = ref(false);

const loadUserNames = async () => {
  // Only load if we have permissions to look up
  // Or load all users once to map names (more efficient for pages with many different users)
  try {
    loadingUsers.value = true;
    const response = await userService.getAll();
    const extractData = (res: any) => {
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.data)) return res.data;
      if (res && res.data && Array.isArray(res.data.data)) return res.data.data;
      return [];
    };
    // @ts-ignore
    const allUsers: BiometricUser[] = extractData(response.data || response);

    const map: Record<string, string> = {};
    allUsers.forEach((u) => {
      if (u.user_id) {
        map[String(u.user_id)] = u.nombre || "Sin Nombre";
      }
    });
    usersMap.value = map;
  } catch (error) {
    console.error("Error cargando mapa de usuarios:", error);
  } finally {
    loadingUsers.value = false;
  }
};

const displayData = computed(() => {
  return props.data.map((p) => ({
    ...p,
    empleado_nombre: usersMap.value[p.empleado_id] || "Cargando...",
  }));
});

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "-";
  // Format: 10:30 AM
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const getStatusSeverity = (status: any) => {
  const name = status?.nombre?.toLowerCase() || "";
  if (name.includes("aprob")) return "success";
  if (name.includes("rechaz")) return "danger";
  if (name.includes("pend")) return "warning";
  return "info";
};

const getStatusLabel = (status: any) => {
  return status?.nombre || "Pendiente";
};

onMounted(() => {
  loadUserNames();
});
</script>

<template>
  <div class="card">
    <DataTable
      :value="displayData"
      :loading="loading"
      stripedRows
      tableStyle="min-width: 50rem"
    >
      <template #empty>No hay papeletas registradas.</template>

      <Column header="Empleado">
        <template #body="slotProps">
          <div class="flex flex-column">
            <span class="font-bold">{{ slotProps.data.empleado_nombre }}</span>
            <span class="text-sm text-500"
              >DNI: {{ slotProps.data.empleado_id }}</span
            >
          </div>
        </template>
      </Column>

      <Column header="Tipo">
        <template #body="slotProps">
          {{ slotProps.data.tipo_permiso?.nombre }}
        </template>
      </Column>

      <Column header="Hora Salida">
        <template #body="slotProps">
          {{ formatDate(slotProps.data.fecha_hora_inicio) }}
        </template>
      </Column>

      <Column header="Hora Retorno">
        <template #body="slotProps">
          {{ formatDate(slotProps.data.fecha_hora_fin) }}
        </template>
      </Column>

      <Column field="motivo" header="Motivo" style="width: 20%"></Column>

      <Column header="Estado">
        <template #body="slotProps">
          <Tag
            :value="getStatusLabel(slotProps.data.estado)"
            :severity="getStatusSeverity(slotProps.data.estado)"
          />
        </template>
      </Column>

      <Column header="Acciones">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button
              icon="pi pi-eye"
              text
              rounded
              severity="info"
              aria-label="Ver"
              @click="$emit('view', slotProps.data)"
            />
            <Button
              icon="pi pi-check"
              text
              rounded
              severity="success"
              aria-label="Aprobar"
              @click="$emit('approve', slotProps.data)"
            />
            <Button
              icon="pi pi-times"
              text
              rounded
              severity="danger"
              aria-label="Rechazar"
              @click="$emit('reject', slotProps.data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
