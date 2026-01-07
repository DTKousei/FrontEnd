<script setup lang="ts">
import { ref, watch, computed } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Select from "primevue/select";
import Swal from "sweetalert2";
import { DepartmentService } from "@/api/services/department.service";
import type {
  Department,
  UpdateDepartmentDto,
} from "@/api/types/department.types";
import type { BiometricUser } from "@/api/types/users.types";

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
const employees = ref<BiometricUser[]>([]);
const form = ref<UpdateDepartmentDto & { nombre: string; descripcion: string }>(
  {
    nombre: "",
    descripcion: "",
    jefe_id: null,
  }
);

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      if (props.departmentToEdit) {
        form.value = {
          nombre: props.departmentToEdit.nombre,
          descripcion: props.departmentToEdit.descripcion,
          jefe_id: props.departmentToEdit.jefe_id,
        };
        loadEmployees(props.departmentToEdit.id);
      } else {
        resetForm();
        employees.value = []; // Reset employees for new creation
      }
    }
  }
);

const loadEmployees = async (deptId: number) => {
  try {
    const response = await DepartmentService.getUsers(deptId);
    // @ts-ignore
    const data = response.data?.data || response.data || [];
    employees.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error loading employees for department:", error);
    employees.value = [];
  }
};

const resetForm = () => {
  form.value = {
    nombre: "",
    descripcion: "",
    jefe_id: null,
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
      // Pasamos el payload completo incluyendo jefe_id
      await DepartmentService.update(props.departmentToEdit.id, form.value);
      Swal.fire(
        "Actualizado",
        "Departamento actualizado correctamente",
        "success"
      );
    } else {
      await DepartmentService.create({
        nombre: form.value.nombre,
        descripcion: form.value.descripcion,
        // Al crear normalmente no asignamos jefe inmediatamente porque no hay empleados aun asignados,
        // pero depende de la lógica del backend.
      });
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

    <div class="field mt-3" v-if="departmentToEdit">
      <label for="jefe" class="font-bold block mb-2">Jefe de Área</label>
      <Select
        v-model="form.jefe_id"
        :options="employees"
        optionLabel="nombre"
        optionValue="user_id"
        filter
        placeholder="Seleccionar Jefe"
        class="w-full"
        emptyMessage="No hay empleados en esta área"
      >
        <template #option="slotProps">
          <div class="flex flex-column">
            <span class="font-bold">{{ slotProps.option.nombre }}</span>
            <span class="text-sm text-gray-500"
              >DNI: {{ slotProps.option.user_id }}</span
            >
          </div>
        </template>
      </Select>
      <small class="text-gray-500" v-if="employees.length === 0"
        >Para asignar un jefe, primero deben haber empleados asignados a este
        departamento.</small
      >
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
