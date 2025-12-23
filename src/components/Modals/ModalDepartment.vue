<script setup lang="ts">
import { ref, watch, computed } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Swal from "sweetalert2";
import { DepartmentService } from "@/api/services/department.service";
import type {
  Department,
  CreateDepartmentDto,
} from "@/api/types/department.types";

const emit = defineEmits(["saved", "close"]);
const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  departmentToEdit: {
    type: Object as () => Department | null,
    default: null,
  },
});

const loading = ref(false);
const form = ref<CreateDepartmentDto>({
  nombre: "",
  descripcion: "",
});

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      if (props.departmentToEdit) {
        form.value = {
          nombre: props.departmentToEdit.nombre,
          descripcion: props.departmentToEdit.descripcion,
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
    descripcion: "",
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
      title: "Campo requerido",
      text: "Por favor ingrese el nombre del departamento.",
    });
    return;
  }

  loading.value = true;
  try {
    if (props.departmentToEdit) {
      await DepartmentService.update(props.departmentToEdit.id, form.value);
      Swal.fire(
        "Actualizado",
        "Departamento actualizado correctamente",
        "success"
      );
    } else {
      await DepartmentService.create(form.value);
      Swal.fire("Creado", "Departamento creado correctamente", "success");
    }
    emit("saved");
    handleClose();
  } catch (error: any) {
    console.error("Error saving department:", error);
    Swal.fire("Error", "No se pudo guardar el departamento", "error");
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
    :header="departmentToEdit ? 'Editar Departamento' : 'Nuevo Departamento'"
    :style="{ width: '30rem' }"
    class="p-fluid"
  >
    <div class="field mt-3">
      <label for="nombre" class="font-bold block mb-2">Nombre *</label>
      <InputText id="nombre" v-model="form.nombre" class="w-full" autofocus />
    </div>

    <div class="field mt-3">
      <label for="descripcion" class="font-bold block mb-2">Descripción</label>
      <Textarea
        id="descripcion"
        v-model="form.descripcion"
        rows="3"
        class="w-full"
      />
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
