<script setup lang="ts">
import { ref, watch, computed } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import InputNumber from "primevue/inputnumber";
import Checkbox from "primevue/checkbox";
import Swal from "sweetalert2";
import { permissionService } from "@/api/services/permission.service";
import type {
  TipoPermiso,
  CreateTipoPermisoRequest,
  UpdateTipoPermisoRequest,
} from "@/api/types/permissions.types";

const emit = defineEmits(["saved", "close"]);
const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  typeToEdit: {
    type: Object as () => TipoPermiso | null,
    default: null,
  },
});

const loading = ref(false);
const form = ref<CreateTipoPermisoRequest & { id?: string }>({
  nombre: "",
  codigo: "",
  descripcion: "",
  tiempo_maximo_horas: null,
  requiere_firma_institucion: false,
  esta_activo: true,
});

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      if (props.typeToEdit) {
        form.value = {
          id: props.typeToEdit.id,
          nombre: props.typeToEdit.nombre,
          codigo: props.typeToEdit.codigo,
          descripcion: props.typeToEdit.descripcion || "",
          tiempo_maximo_horas: props.typeToEdit.tiempo_maximo_horas,
          requiere_firma_institucion:
            props.typeToEdit.requiere_firma_institucion,
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
    descripcion: "",
    tiempo_maximo_horas: null,
    requiere_firma_institucion: false,
    esta_activo: true,
  };
};

const handleClose = () => {
  emit("close");
  resetForm();
};

const handleSubmit = async () => {
  if (!form.value.nombre || !form.value.codigo) {
    Swal.fire({
      icon: "warning",
      title: "Campos requeridos",
      text: "Por favor complete el nombre y el código.",
    });
    return;
  }

  loading.value = true;
  try {
    if (props.typeToEdit && form.value.id) {
      const updateData: UpdateTipoPermisoRequest = {
        nombre: form.value.nombre,
        codigo: form.value.codigo,
        descripcion: form.value.descripcion,
        tiempo_maximo_horas: form.value.tiempo_maximo_horas,
        requiere_firma_institucion: form.value.requiere_firma_institucion,
        esta_activo: form.value.esta_activo,
      };
      await permissionService.updateTipoPermiso(form.value.id, updateData);
      Swal.fire(
        "Actualizado",
        "Tipo de permiso actualizado correctamente",
        "success"
      );
    } else {
      const createData: CreateTipoPermisoRequest = {
        nombre: form.value.nombre,
        codigo: form.value.codigo,
        descripcion: form.value.descripcion,
        tiempo_maximo_horas: form.value.tiempo_maximo_horas,
        requiere_firma_institucion: form.value.requiere_firma_institucion,
        esta_activo: form.value.esta_activo,
      };
      await permissionService.createTipoPermiso(createData);
      Swal.fire("Creado", "Tipo de permiso creado correctamente", "success");
    }
    emit("saved");
    handleClose();
  } catch (error: any) {
    console.error("Error saving permission type:", error);
    Swal.fire("Error", "No se pudo guardar el tipo de permiso", "error");
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
    :header="typeToEdit ? 'Editar Tipo de Papeleta' : 'Nueva Tipo de Papeleta'"
    :style="{ width: '35rem' }"
    class="p-fluid"
  >
    <div class="formgrid grid mt-3">
      <div class="field col-12 md:col-6">
        <label for="nombre" class="font-bold block mb-2">Nombre *</label>
        <InputText id="nombre" v-model="form.nombre" class="w-full" autofocus />
      </div>

      <div class="field col-12 md:col-6">
        <label for="codigo" class="font-bold block mb-2">Código *</label>
        <InputText id="codigo" v-model="form.codigo" class="w-full" />
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

      <div class="field col-12 md:col-6">
        <label for="tiempo" class="font-bold block mb-2"
          >Tiempo Máximo (Horas)</label
        >
        <InputNumber
          id="tiempo"
          v-model="form.tiempo_maximo_horas"
          showButtons
          :min="0"
          :max="24"
          suffix=" hrs"
          class="w-full"
        />
        <small class="text-gray-500">Dejar vacío si no aplica límite.</small>
      </div>

      <div class="field col-12 flex flex-column gap-3 mt-2">
        <div class="flex align-items-center gap-2">
          <Checkbox
            v-model="form.requiere_firma_institucion"
            :binary="true"
            inputId="firmaInst"
          />
          <label for="firmaInst" class="font-bold"
            >Requiere Firma Institución Visitada</label
          >
        </div>

        <div class="flex align-items-center gap-2">
          <Checkbox
            v-model="form.esta_activo"
            :binary="true"
            inputId="activo"
          />
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
