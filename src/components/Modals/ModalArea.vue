<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import Dialog from "primevue/dialog";
import Swal from "sweetalert2";
import { DepartmentService } from "@/api/services/department.service";
import type { Department } from "@/api/types/department.types";
import ModalDepartment from "@/components/Modals/ModalDepartment.vue";

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["update:visible"]);

const departments = ref<Department[]>([]);
const loading = ref(true);
const modalCreateEditVisible = ref(false);
const selectedDepartment = ref<Department | null>(null);
const filters = ref({
  global: { value: null, matchMode: "contains" },
});

const visibleModel = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val),
});

const loadDepartments = async () => {
  loading.value = true;
  try {
    const response = await DepartmentService.getAll();
    const data = response.data as any;

    if (Array.isArray(data)) {
      departments.value = data;
    } else if (data && Array.isArray(data.data)) {
      departments.value = data.data;
    } else {
      departments.value = [];
    }
  } catch (error) {
    console.error("Error loading departments:", error);
    // Swal.fire("Error", "No se pudieron cargar los departamentos", "error");
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  selectedDepartment.value = null;
  modalCreateEditVisible.value = true;
};

const openEditModal = (department: Department) => {
  selectedDepartment.value = department;
  modalCreateEditVisible.value = true;
};

const handleDelete = async (department: Department) => {
  const result = await Swal.fire({
    title: "¿Estás seguro?",
    text: `Eliminarás el departamento ${department.nombre}`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#d33",
  });

  if (result.isConfirmed) {
    try {
      await DepartmentService.delete(department.id);
      Swal.fire("Eliminado", "El departamento ha sido eliminado.", "success");
      loadDepartments();
    } catch (error) {
      console.error("Error deleting department:", error);
      Swal.fire("Error", "No se pudo eliminar el departamento.", "error");
    }
  }
};

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      loadDepartments();
    }
  }
);

onMounted(() => {
  // loadDepartments(); // Se carga al abrir
});
</script>

<template>
  <Dialog
    v-model:visible="visibleModel"
    modal
    header="Gestión de Áreas"
    :style="{ width: '80vw' }"
    :breakpoints="{ '960px': '90vw', '640px': '95vw' }"
    class="p-fluid"
  >
    <div class="card">
      <DataTable
        :value="departments"
        :paginator="true"
        :rows="10"
        dataKey="id"
        :loading="loading"
        stripedRows
        v-model:filters="filters"
        :globalFilterFields="['nombre', 'descripcion', 'jefe_id']"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0 font-bold text-xl text-gray-700">Areas</h4>
            <div class="flex gap-2">
              <IconField>
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText
                  v-model="filters['global'].value"
                  placeholder="Buscar..."
                />
              </IconField>
              <Button
                label="Nuevo"
                icon="pi pi-plus"
                severity="success"
                @click="openCreateModal"
              />
            </div>
          </div>
        </template>

        <Column field="id" header="ID" sortable style="width: 5rem"></Column>
        <Column field="nombre" header="Nombre" sortable></Column>
        <Column field="descripcion" header="Descripción" sortable></Column>
        <Column field="jefe_id" header="Jefe (DNI)" sortable>
          <template #body="slotProps">
            {{ slotProps.data.jefe_id || "-" }}
          </template>
        </Column>

        <Column header="Acciones" style="width: 10rem">
          <template #body="slotProps">
            <div class="flex gap-2">
              <Button
                icon="pi pi-pencil"
                outlined
                rounded
                severity="warning"
                @click="openEditModal(slotProps.data)"
              />
              <Button
                icon="pi pi-trash"
                outlined
                rounded
                severity="danger"
                @click="handleDelete(slotProps.data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>

      <ModalDepartment
        :visible="modalCreateEditVisible"
        :departmentToEdit="selectedDepartment"
        @close="modalCreateEditVisible = false"
        @saved="loadDepartments"
      />
    </div>
  </Dialog>
</template>
