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
import { permissionService } from "@/api/services/permission.service";
import type { TipoPermiso } from "@/api/types/permissions.types";
import ModalTipoPerForm from "./ModalTipoPerForm.vue";

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["update:visible"]);

const types = ref<TipoPermiso[]>([]);
const loading = ref(true);
const modalCreateEditVisible = ref(false);
const selectedType = ref<TipoPermiso | null>(null);
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
    const response = await permissionService.getTiposPermiso();
    const data = response.data as any; // Type check might be needed depending on response wrapper

    if (data.data && Array.isArray(data.data)) {
      types.value = data.data;
    } else if (Array.isArray(data)) {
      types.value = data;
    } else {
      types.value = [];
    }
  } catch (error) {
    console.error("Error loading permission types:", error);
    // Silent error or notify user
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  selectedType.value = null;
  modalCreateEditVisible.value = true;
};

const openEditModal = (type: TipoPermiso) => {
  selectedType.value = type;
  modalCreateEditVisible.value = true;
};

const handleDelete = async (type: TipoPermiso) => {
  const result = await Swal.fire({
    title: "¿Estás seguro?",
    text: `Eliminarás el tipo de papeleta "${type.nombre}".`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#d33",
  });

  if (result.isConfirmed) {
    try {
      await permissionService.deleteTipoPermiso(type.id);
      Swal.fire(
        "Eliminado",
        "El tipo de papeleta ha sido eliminado.",
        "success"
      );
      loadTypes();
    } catch (error) {
      console.error("Error deleting permission type:", error);
      Swal.fire("Error", "No se pudo eliminar el tipo de permiso.", "error");
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

onMounted(() => {
  // loadTypes(); // Load implicitly on visible
});
</script>

<template>
  <Dialog
    v-model:visible="visibleModel"
    modal
    header="Gestión de Tipos de Papeletas"
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
        :globalFilterFields="['nombre', 'codigo', 'descripcion']"
        class="p-datatable-sm"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0 font-bold text-xl text-gray-700">
              Tipos de Papeletas
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
          field="tiempo_maximo_horas"
          header="Max Horas"
          sortable
          style="width: 8rem"
        >
          <template #body="slotProps">
            {{
              slotProps.data.tiempo_maximo_horas
                ? slotProps.data.tiempo_maximo_horas + " hrs"
                : "Ilimitado"
            }}
          </template>
        </Column>
        <Column
          field="requiere_firma_institucion"
          header="Firma Inst."
          sortable
          style="width: 8rem"
        >
          <template #body="slotProps">
            <i
              class="pi"
              :class="{
                'pi-check-circle text-green-500':
                  slotProps.data.requiere_firma_institucion,
                'pi-times-circle text-red-500':
                  !slotProps.data.requiere_firma_institucion,
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

      <ModalTipoPerForm
        :visible="modalCreateEditVisible"
        :typeToEdit="selectedType"
        @close="modalCreateEditVisible = false"
        @saved="loadTypes"
      />
    </div>
  </Dialog>
</template>
