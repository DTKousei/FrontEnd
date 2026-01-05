<script setup lang="ts">
import { ref, computed } from "vue";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import Swal from "sweetalert2";
import { incidentService } from "@/api/services/incident.service";

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["update:visible", "save"]);

const loadingSubmit = ref(false); // Indicador de carga durante el envío

// Estado inicial del formulario para crear un Tipo de Incidencia
const form = ref({
  nombre: "",
  codigo: "",
  requiere_aprobacion: false,
  requiere_documento: false,
  descuenta_salario: false,
  esta_activo: true,
});

// Modelo computado para sincronizar la visibilidad con el componente padre
const visibleModel = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val),
});

/**
 * Maneja el envío del formulario para crear un nuevo tipo de incidencia.
 * Realiza validaciones básicas y llama al servicio de incidencias.
 */
const handleSubmit = async () => {
  // Validación de campos obligatorios
  if (!form.value.nombre || !form.value.codigo) {
    Swal.fire("Incompleto", "Nombre y Código son obligatorios.", "warning");
    return;
  }

  try {
    loadingSubmit.value = true;
    await incidentService.createTipoIncidencia(form.value);
    Swal.fire(
      "Registrado",
      "Tipo de incidencia creado correctamente",
      "success"
    );
    emit("save"); // Notificar al padre para recargar la lista
    handleCancel(); // Cerrar y limpiar
  } catch (error: any) {
    console.error("Error creando tipo", error);
    Swal.fire("Error", "No se pudo crear el tipo de incidencia", "error");
  } finally {
    loadingSubmit.value = false;
  }
};

/**
 * Cancela la operación, cierra el modal y reinicia el formulario.
 */
const handleCancel = () => {
  visibleModel.value = false;
  // Reiniciar formulario a valores por defecto
  form.value = {
    nombre: "",
    codigo: "",
    requiere_aprobacion: false,
    requiere_documento: false,
    descuenta_salario: false,
    esta_activo: true,
  };
};
</script>

<template>
  <Dialog
    v-model:visible="visibleModel"
    modal
    header="Nuevo Tipo de Incidencia"
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
          <Checkbox v-model="form.descuenta_salario" binary inputId="desc" />
          <label for="desc" class="ml-2">Descuenta Salario</label>
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
