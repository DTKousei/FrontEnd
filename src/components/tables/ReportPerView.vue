<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import type { BiometricUser } from "@/api/types/users.types";
import { authService } from "@/api/services/auth.service";
import type { User as AuthUser } from "@/api/types/auth.types";

const props = defineProps<{
  users: BiometricUser[];
  selection: BiometricUser[];
  loading?: boolean;
}>();

const emit = defineEmits(["update:selection"]);

const authUsers = ref<AuthUser[]>([]);
const loadingAuth = ref(false);

const loadAuthUsers = async () => {
  loadingAuth.value = true;
  try {
    const response = await authService.getAllUsers();
    // @ts-ignore
    const rawData = response.data as any;
    const data = rawData.users || rawData.data || rawData || [];
    if (Array.isArray(data)) {
      authUsers.value = data;
    }
  } catch (error) {
    console.error("Error loading auth users:", error);
  } finally {
    loadingAuth.value = false;
  }
};

const filteredUsers = computed(() => {
  if (authUsers.value.length === 0) return props.users;

  return props.users.filter((bUser) => {
    const aUser = authUsers.value.find(
      (a) => String(a.usuario).trim() === String(bUser.user_id).trim()
    );
    // Si existe en auth, verificar estado. Si no existe, asumir activo o mostrar?
    // Usualmente si no está en auth no puede loguear, pero como empleado biometrico existe.
    // El requerimiento es "solo mostrar los datos de los usuarios activos".
    return aUser ? aUser.esta_activo : true;
  });
});

const selectedUsers = computed({
  get: () => props.selection,
  set: (val) => emit("update:selection", val),
});

const filters = ref({
  global: { value: null, matchMode: "contains" },
});

onMounted(() => {
  loadAuthUsers();
});

// Helper para obtener nombre del departamento de forma segura
const getDepartmentName = (dept: any) => {
  if (!dept) return "-";
  if (typeof dept === "string") return dept;
  return dept.nombre || "-";
};
</script>

<template>
  <div class="card p-0 shadow-none border-none">
    <DataTable
      v-model:selection="selectedUsers"
      :value="filteredUsers"
      :loading="loading || loadingAuth"
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
      :metaKeySelection="false"
      stateStorage="session"
      stateKey="dt-state-report-per"
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
