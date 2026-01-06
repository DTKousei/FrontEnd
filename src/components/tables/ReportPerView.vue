<script setup lang="ts">
import { ref, computed } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import type { BiometricUser } from "@/api/types/users.types";

const props = defineProps<{
  users: BiometricUser[];
  selection: BiometricUser[];
  loading?: boolean;
}>();

const emit = defineEmits(["update:selection"]);

const selectedUsers = computed({
  get: () => props.selection,
  set: (val) => emit("update:selection", val),
});

const filters = ref({
  global: { value: null, matchMode: "contains" },
});

// Helper para obtener nombre del departamento de forma segura
// Debug para ver qué llega en users
// console.log("ReportPerView users:", props.users);

// Helper para obtener nombre del departamento de forma segura
const getDepartmentName = (dept: any) => {
  // Debug para evaluar cada fila si es necesario
  // console.log("Dept value:", dept);
  if (!dept) return "-";
  // Si es un string (nombre directo)
  if (typeof dept === "string") return dept;
  // Si es un objeto (debería tener .nombre)
  return dept.nombre || "-";
};
</script>

<template>
  <div class="card p-0 shadow-none border-none">
    <DataTable
      v-model:selection="selectedUsers"
      :value="users"
      :loading="loading"
      dataKey="id"
      :paginator="true"
      :rows="5"
      :rowsPerPageOptions="[5, 10, 25, 100]"
      v-model:filters="filters"
      :globalFilterFields="[
        'user_id',
        'nombre',
        'cargo',
        'departamento.nombre',
      ]"
      tableStyle="min-width: 50rem"
      class="p-datatable-sm"
      responsiveLayout="scroll"
      stripedRows
    >
      <template #header>
        <div class="flex justify-content-between align-items-center">
          <h4 class="m-0 text-blue-700">Selección de Personal</h4>
          <IconField iconPosition="left">
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="filters['global'].value"
              placeholder="Buscar..."
              class="w-full"
            />
          </IconField>
        </div>
      </template>

      <template #empty> No se encontraron usuarios. </template>

      <!-- Columnas de Datos -->
      <Column field="user_id" header="DNI" sortable></Column>

      <Column field="nombre" header="Nombres y Apellidos" sortable></Column>

      <Column field="departamento" header="Área" sortable>
        <template #body="{ data }">
          {{ getDepartmentName(data.departamento) }}
        </template>
      </Column>

      <Column field="cargo" header="Cargo" sortable>
        <template #body="{ data }">
          {{ data.cargo || "-" }}
        </template>
      </Column>

      <!-- Columna de Selección -->
      <Column
        selectionMode="multiple"
        header="Todos"
        headerStyle="width: 3rem; text-align: center"
        bodyStyle="text-align: center"
      ></Column>
    </DataTable>
  </div>
</template>

<style scoped>
:deep(.p-datatable .p-datatable-header) {
  background: transparent;
  border: none;
  padding-bottom: 1rem;
}
</style>
