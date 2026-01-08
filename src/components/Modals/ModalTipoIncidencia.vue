<script setup lang="ts">
import { ref, computed, watch } from "vue";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import Swal from "sweetalert2";
import { incidentService } from "@/api/services/incident.service";
import type {
  CreateTipoIncidenciaRequest,
  TipoIncidencia,
  UpdateTipoIncidenciaRequest,
} from "@/api/types/incidents.types";

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  typeToEdit: {
    type: Object as () => TipoIncidencia | null,
    default: null,
  },
});

const emit = defineEmits(["update:visible", "save"]);

const loadingSubmit = ref(false);

const form = ref({
  nombre: "",
  codigo: "",
  requiere_aprobacion: false,
  requiere_documento: false,
  descuenta_salario: false,
  esta_activo: true,
});

const visibleModel = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val),
});

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      if (props.typeToEdit) {
        form.value = {
          nombre: props.typeToEdit.nombre,
          codigo: props.typeToEdit.codigo,
          requiere_aprobacion: props.typeToEdit.requiere_aprobacion,
          requiere_documento: props.typeToEdit.requiere_documento,
          descuenta_salario: props.typeToEdit.descuenta_salario,
          esta_activo: props.typeToEdit.esta_activo,
        };
      } else {
        resetForm();
      }
    }
  }
);

const resetForm = () => {
  form.value = {
    nombre: "",
    codigo: "",
    requiere_aprobacion: false,
    requiere_documento: false,
    descuenta_salario: false,
    esta_activo: true,
  };
};

const handleSubmit = async () => {
  if (!form.value.nombre || !form.value.codigo) {
    Swal.fire("Incompleto", "Nombre y Código son obligatorios.", "warning");
    return;
  }

  loadingSubmit.value = true;
  try {
    if (props.typeToEdit) {
      const updateData: UpdateTipoIncidenciaRequest = { ...form.value };
      await incidentService.updateTipoIncidencia(
        props.typeToEdit.id,
        updateData
      );
      Swal.fire(
        "Actualizado",
        "Tipo de incidencia actualizado correctamente",
        "success"
      );
    } else {
      const createData: CreateTipoIncidenciaRequest = { ...form.value };
      await incidentService.createTipoIncidencia(createData);
      Swal.fire(
        "Registrado",
        "Tipo de incidencia creado correctamente",
        "success"
      );
    }
    emit("save");
    handleCancel();
  } catch (error: any) {
    console.error("Error saving incident type:", error);
    Swal.fire("Error", "No se pudo guardar el tipo de incidencia", "error");
  } finally {
    loadingSubmit.value = false;
  }
};

const handleCancel = () => {
  visibleModel.value = false;
  resetForm();
};
</script>

<template>
  <Dialog
    v-model:visible="visibleModel"
    modal
    :header="
      typeToEdit ? 'Editar Tipo de Incidencia' : 'Nuevo Tipo de Incidencia'
    "
    :style="{ width: '40vw', minWidth: '400px' }"
    class="p-fluid"
  >
    <div class="formgrid grid mt-2">
      <div class="field col-12">
        <label class="font-bold">Nombre *</label>
        <InputText
          v-model="form.nombre"
          class="w-full"
          placeholder="Ej. Falta Injustificada"
          autofocus
        />
      </div>

      <div class="field col-12 md:col-6">
        <label class="font-bold">Código *</label>
        <InputText
          v-model="form.codigo"
          class="w-full"
          placeholder="Ej. FAL-INJ"
        />
      </div>

      <div class="field col-12 flex flex-column gap-3 mt-3">
        <div class="flex align-items-center">
          <Checkbox v-model="form.requiere_aprobacion" binary inputId="aprob" />
          <label for="aprob" class="ml-2">Requiere Aprobación</label>
        </div>
        <div class="flex align-items-center">
          <Checkbox v-model="form.requiere_documento" binary inputId="doc" />
          <label for="doc" class="ml-2">Requiere Documento</label>
        </div>
        <div class="flex align-items-center">
          <Checkbox v-model="form.esta_activo" binary inputId="activo" />
          <label for="activo" class="ml-2 font-bold">Activo</label>
        </div>
      </div>
    </div>

    <template #footer>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        severity="secondary"
        text
        @click="handleCancel"
      />
      <Button
        label="Guardar"
        icon="pi pi-check"
        @click="handleSubmit"
        :loading="loadingSubmit"
      />
    </template>
  </Dialog>
</template>
