<script setup lang="ts">
import { ref, computed, watch } from "vue";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import InputNumber from "primevue/inputnumber";
import Swal from "sweetalert2";
import { incidentService } from "@/api/services/incident.service";
import type { TipoIncidencia } from "@/api/types/incidents.types";

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

const form = ref<any>({
  nombre: "",
  codigo: "",
  requiere_aprobacion: false,
  requiere_documento: false,
  descuenta_salario: false,
  esta_activo: true,
  max_dias_anual: null,
  max_solicitudes_anual: null,
  toma_dias_calendario: false,
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
          max_dias_anual: props.typeToEdit.max_dias_anual || null,
          max_solicitudes_anual: props.typeToEdit.max_solicitudes_anual || null,
          toma_dias_calendario: props.typeToEdit.toma_dias_calendario || false,
        };
      } else {
        resetForm();
      }
    }
  },
);

const resetForm = () => {
  form.value = {
    nombre: "",
    codigo: "",
    requiere_aprobacion: false,
    requiere_documento: false,
    descuenta_salario: false,
    esta_activo: true,
    max_dias_anual: null,
    max_solicitudes_anual: null,
    toma_dias_calendario: false,
  };
};

const handleSubmit = async () => {
  if (!form.value.nombre || !form.value.codigo) {
    Swal.fire("Incompleto", "Nombre y Código son obligatorios.", "warning");
    return;
  }

  loadingSubmit.value = true;
  try {
    const payload = { ...form.value };

    // Sanitize payload: valid numbers or undefined, strict boolean for checkboxes
    if (payload.max_dias_anual === null || payload.max_dias_anual === "") {
      delete payload.max_dias_anual;
    }
    if (
      payload.max_solicitudes_anual === null ||
      payload.max_solicitudes_anual === ""
    ) {
      delete payload.max_solicitudes_anual;
    }

    // Ensure booleans are booleans
    payload.requiere_aprobacion = !!payload.requiere_aprobacion;
    payload.requiere_documento = !!payload.requiere_documento;
    payload.descuenta_salario = !!payload.descuenta_salario;
    payload.esta_activo = !!payload.esta_activo;
    payload.toma_dias_calendario = !!payload.toma_dias_calendario;

    if (props.typeToEdit) {
      await incidentService.updateTipoIncidencia(props.typeToEdit.id, payload);
      Swal.fire(
        "Actualizado",
        "Tipo de incidencia actualizado correctamente",
        "success",
      );
    } else {
      await incidentService.createTipoIncidencia(payload);
      Swal.fire(
        "Registrado",
        "Tipo de incidencia creado correctamente",
        "success",
      );
    }
    emit("save");
    handleCancel();
  } catch (error: any) {
    console.error("Error saving incident type:", error);
    // Show more specific error details if available from Axios error response
    const errorMessage =
      error.response?.data?.message ||
      "No se pudo guardar el tipo de incidencia";
    Swal.fire("Error", errorMessage, "error");
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

      <div class="field col-12 md:col-6">
        <label class="font-bold">Máx. Días/Año</label>
        <InputNumber v-model="form.max_dias_anual" placeholder="Opcional" />
      </div>

      <div class="field col-12 md:col-6">
        <label class="font-bold">Máx. Solicitudes/Año</label>
        <InputNumber
          v-model="form.max_solicitudes_anual"
          placeholder="Opcional"
        />
      </div>

      <div class="field col-12 flex flex-column gap-3 mt-3">
        <div class="flex align-items-center">
          <Checkbox v-model="form.requiere_documento" binary inputId="doc" />
          <label for="doc" class="ml-2">Requiere Documento</label>
        </div>
        <div class="flex align-items-center">
          <Checkbox
            v-model="form.toma_dias_calendario"
            binary
            inputId="calendario"
          />
          <label for="calendario" class="ml-2"
            >Toma Días Calendario (Sab/Dom)</label
          >
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
