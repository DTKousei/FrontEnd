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
import { incidentService } from "@/api/services/incident.service";
import type { TipoIncidencia } from "@/api/types/incidents.types";
import ModalTipoIncidencia from "./ModalTipoIncidencia.vue";

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["update:visible"]);

const types = ref<TipoIncidencia[]>([]);
const loading = ref(true);
const modalCreateEditVisible = ref(false);
const selectedType = ref<TipoIncidencia | null>(null);
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
    const response = await incidentService.getAllTiposIncidencia();
    const data = response.data as any;

    // Handle variety of response structures just in case
    if (data.data && Array.isArray(data.data)) {
      types.value = data.data;
    } else if (Array.isArray(data)) {
      types.value = data;
    } else {
      types.value = [];
    }
  } catch (error) {
    console.error("Error loading incident types:", error);
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  selectedType.value = null;
  modalCreateEditVisible.value = true;
};

const openEditModal = (type: TipoIncidencia) => {
  selectedType.value = type;
  modalCreateEditVisible.value = true;
};

const handleDelete = async (type: TipoIncidencia) => {
  const result = await Swal.fire({
    title: "¿Estás seguro?",
    text: `Eliminarás el tipo de incidencia "${type.nombre}".`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#d33",
  });

  if (result.isConfirmed) {
    try {
      await incidentService.deleteTipoIncidencia(type.id);
      Swal.fire(
        "Eliminado",
        "El tipo de incidencia ha sido eliminado.",
        "success"
      );
      loadTypes();
    } catch (error) {
      console.error("Error deleting incident type:", error);
      Swal.fire("Error", "No se pudo eliminar el tipo de incidencia.", "error");
    }
  }
};

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      loadTypes();
    }
  }
);
</script>

<template>
  <Dialog
    v-model:visible="visibleModel"
    modal
    header="Gestión de Tipos de Incidencias"
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
        :globalFilterFields="['nombre', 'codigo']"
        class="p-datatable-sm"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0 font-bold text-xl text-gray-700">
              Tipos de Incidencias
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
        <Column
          field="codigo"
          header="Código"
          sortable
          style="width: 8rem"
        ></Column>

        <Column
          field="requiere_aprobacion"
          header="Aprobación"
          sortable
          style="width: 8rem"
        >
          <template #body="slotProps">
            <i
              class="pi"
              :class="{
                'pi-check-circle text-green-500':
                  slotProps.data.requiere_aprobacion,
                'pi-times-circle text-gray-400':
                  !slotProps.data.requiere_aprobacion,
              }"
            ></i>
          </template>
        </Column>

        <Column
          field="requiere_documento"
          header="Documento"
          sortable
          style="width: 8rem"
        >
          <template #body="slotProps">
            <i
              class="pi"
              :class="{
                'pi-check-circle text-green-500':
                  slotProps.data.requiere_documento,
                'pi-times-circle text-gray-400':
                  !slotProps.data.requiere_documento,
              }"
            ></i>
          </template>
        </Column>

        <Column
          field="esta_activo"
          header="Estado"
          sortable
          style="width: 8rem"
        >
          <template #body="slotProps">
            <span
              :class="
                slotProps.data.esta_activo
                  ? 'text-green-600 font-bold'
                  : 'text-red-500'
              "
            >
              {{ slotProps.data.esta_activo ? "Activo" : "Inactivo" }}
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

      <ModalTipoIncidencia
        :visible="modalCreateEditVisible"
        @update:visible="(val) => (modalCreateEditVisible = val)"
        :typeToEdit="selectedType"
        @save="loadTypes"
      />
    </div>
  </Dialog>
</template>
