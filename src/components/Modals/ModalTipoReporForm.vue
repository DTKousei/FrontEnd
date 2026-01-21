<script setup lang="ts">
import { ref, watch, computed } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Checkbox from "primevue/checkbox";
import Swal from "sweetalert2";
import { reportService } from "@/api/services/report.service";
import type { ReportType, ReportTypeCreate } from "@/api/types/reports.types";

const emit = defineEmits(["saved", "close"]);
const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  typeToEdit: {
    type: Object as () => ReportType | null,
    default: null,
  },
});

const loading = ref(false);
const form = ref<ReportTypeCreate & { id?: number }>({
  nombre: "",
  descripcion: "",
  activo: true,
});

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      if (props.typeToEdit) {
        form.value = {
          id: props.typeToEdit.id,
          nombre: props.typeToEdit.nombre,
          descripcion: props.typeToEdit.descripcion,
          activo: props.typeToEdit.activo,
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
    descripcion: "",
    activo: true,
  };
};

const handleClose = () => {
  emit("close");
  resetForm();
};

const handleSubmit = async () => {
  if (!form.value.nombre) {
    Swal.fire({
      icon: "warning",
      title: "Campos requeridos",
      text: "Por favor complete el nombre.",
    });
    return;
  }

  loading.value = true;
  try {
    if (props.typeToEdit && form.value.id) {
      await reportService.updateReportType(form.value.id, form.value);
      Swal.fire(
        "Actualizado",
        "Tipo de reporte actualizado correctamente",
        "success",
      );
    } else {
      await reportService.createReportType(form.value);
      Swal.fire("Creado", "Tipo de reporte creado correctamente", "success");
    }
    emit("saved");
    handleClose();
  } catch (error: any) {
    console.error("Error saving report type:", error);
    Swal.fire("Error", "No se pudo guardar el tipo de reporte", "error");
  } finally {
    loading.value = false;
  }
};

const visibleModel = computed({
  get: () => props.visible,
  set: (value) => {
    if (!value) handleClose();
  },
});
</script>

<template>
  <Dialog
    v-model:visible="visibleModel"
    modal
    :header="typeToEdit ? 'Editar Tipo de Reporte' : 'Nuevo Tipo de Reporte'"
    :style="{ width: '35rem' }"
    class="p-fluid"
  >
    <div class="formgrid grid mt-3">
      <div class="field col-12">
        <label for="nombre" class="font-bold block mb-2">Nombre *</label>
        <InputText id="nombre" v-model="form.nombre" class="w-full" autofocus />
      </div>

      <div class="field col-12">
        <label for="descripcion" class="font-bold block mb-2"
          >Descripción</label
        >
        <Textarea
          id="descripcion"
          v-model="form.descripcion"
          rows="3"
          class="w-full"
        />
      </div>

      <div class="field col-12 flex flex-column gap-3 mt-2">
        <div class="flex align-items-center gap-2">
          <Checkbox v-model="form.activo" :binary="true" inputId="activo" />
          <label for="activo" class="font-bold">Activo</label>
        </div>
      </div>
    </div>

    <template #footer>
      <Button label="Cancelar" icon="pi pi-times" text @click="handleClose" />
      <Button
        label="Guardar"
        icon="pi pi-check"
        @click="handleSubmit"
        :loading="loading"
        severity="success"
      />
    </template>
  </Dialog>
</template>
