<script setup lang="ts">
import { ref, computed, watch } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import Dialog from "primevue/dialog";
import Swal from "sweetalert2";
import { reportService } from "@/api/services/report.service";
import type { ReportType } from "@/api/types/reports.types";
import ModalTipoReporForm from "./ModalTipoReporForm.vue";

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["update:visible"]);

const types = ref<ReportType[]>([]);
const loading = ref(true);
const modalCreateEditVisible = ref(false);
const selectedType = ref<ReportType | null>(null);
const filters = ref({
  global: { value: null, matchMode: "contains" },
});

const visibleModel = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val),
});

const loadTypes = async () => {
  loading.value = true;
  try {
    const response = await reportService.getReportTypes();
    const data = response.data as any;

    if (data.data && Array.isArray(data.data)) {
      types.value = data.data;
    } else if (Array.isArray(data)) {
      types.value = data;
    } else {
      types.value = [];
    }
  } catch (error) {
    console.error("Error loading report types:", error);
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  selectedType.value = null;
  modalCreateEditVisible.value = true;
};

const openEditModal = (type: ReportType) => {
  selectedType.value = type;
  modalCreateEditVisible.value = true;
};

const handleDelete = async (type: ReportType) => {
  const result = await Swal.fire({
    title: "¿Estás seguro?",
    text: `Eliminarás el tipo de reporte "${type.nombre}".`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#d33",
  });

  if (result.isConfirmed) {
    try {
      await reportService.deleteReportType(type.id);
      Swal.fire(
        "Eliminado",
        "El tipo de reporte ha sido eliminado.",
        "success",
      );
      loadTypes();
    } catch (error) {
      console.error("Error deleting report type:", error);
      Swal.fire("Error", "No se pudo eliminar el tipo de reporte.", "error");
    }
  }
};

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      loadTypes();
    }
  },
);
</script>

<template>
  <Dialog
    v-model:visible="visibleModel"
    modal
    header="Gestión de Tipos de Reportes"
    :style="{ width: '80vw' }"
    :breakpoints="{ '960px': '90vw', '640px': '95vw' }"
    class="p-fluid"
  >
    <div class="card">
      <DataTable
        :value="types"
        :paginator="true"
        :rows="10"
        dataKey="id"
        :loading="loading"
        stripedRows
        v-model:filters="filters"
        :globalFilterFields="['nombre', 'descripcion']"
        class="p-datatable-sm"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0 font-bold text-xl text-gray-700">
              Tipos de Reportes
            </h4>
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

        <Column field="nombre" header="Nombre" sortable></Column>
        <Column field="descripcion" header="Descripción" sortable></Column>

        <Column field="activo" header="Estado" sortable style="width: 8rem">
          <template #body="slotProps">
            <span
              :class="
                slotProps.data.activo
                  ? 'text-green-600 font-bold'
                  : 'text-red-500'
              "
            >
              {{ slotProps.data.activo ? "Activo" : "Inactivo" }}
            </span>
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

      <ModalTipoReporForm
        :visible="modalCreateEditVisible"
        :typeToEdit="selectedType"
        @close="modalCreateEditVisible = false"
        @saved="loadTypes"
      />
    </div>
  </Dialog>
</template>
