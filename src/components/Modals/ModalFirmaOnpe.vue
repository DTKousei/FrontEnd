<script setup lang="ts">
import { ref, computed } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import FileUpload from "primevue/fileupload";
import Image from "primevue/image";
import RadioButton from "primevue/radiobutton";
import { permissionService } from "@/api/services/permission.service";
import Swal from "sweetalert2";
import type { Permiso, TipoFirma } from "@/api/types/permissions.types";

const props = defineProps<{
  visible: boolean;
  permiso: Permiso | null;
  forcedRole?: string; // Optional: Force a specific role (e.g. 'solicitante')
}>();

const emit = defineEmits(["update:visible", "signed"]);

const selectedRole = ref<string>("solicitante");
// Initialize with forced role if present
if (props.forcedRole) {
  selectedRole.value = props.forcedRole;
}
const loading = ref(false);
const signatureImage = ref<string | null>(null);

const roles = [
  { label: "Solicitante", value: "solicitante" },
  { label: "Jefe de Área / Supervisor", value: "jefe_area" },
  { label: "Jefe de RRHH", value: "rrhh" },
];

const visibleModel = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val),
});

const handleFileSelect = async (event: any) => {
  const file = event.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      signatureImage.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const handleClearImage = () => {
  signatureImage.value = null;
};

const handleSaveSignature = async () => {
  if (!props.permiso || !signatureImage.value) {
    Swal.fire("Error", "Debe seleccionar una imagen de firma", "warning");
    return;
  }

  try {
    loading.value = true;

    // Preparar payload Base64
    // IMPORTANTE: Muchos backends fallan con el prefijo "data:image/...".
    // Enviamos solo la cadena Base64 pura.
    const rawBase64 = signatureImage.value.includes(",")
      ? signatureImage.value.split(",")[1]
      : signatureImage.value;

    const payload = {
      tipo_firma: selectedRole.value as TipoFirma,
      firma: rawBase64,
    };

    // Llamar al endpoint /firmar (PATCH)
    await permissionService.firmarPermiso(props.permiso.id, payload);

    Swal.fire({
      icon: "success",
      title: "Firmado Exitosamente",
      text: "La firma se ha guardado correctamente.",
      timer: 2000,
    });

    emit("signed");
    visibleModel.value = false;
    signatureImage.value = null; // Reset
  } catch (error) {
    console.error("Error al guardar firma:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo guardar la firma. Verifique la conexión.",
    });
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  visibleModel.value = false;
  signatureImage.value = null;
};
</script>

<template>
  <Dialog
    v-model:visible="visibleModel"
    modal
    header="Firma Digital (Cargar Imagen)"
    :style="{ width: '500px' }"
    class="p-fluid"
  >
    <div class="flex flex-column gap-4 py-4">
      <!-- Selección de Rol (Solo si no está forzado) -->
      <div v-if="!forcedRole">
        <div class="font-bold text-center mb-2">
          Seleccione el rol con el que desea firmar:
        </div>
        <div class="flex justify-content-center gap-3 mb-3">
          <div
            v-for="role in roles"
            :key="role.value"
            class="field-checkbox flex align-items-center gap-2"
          >
            <RadioButton
              v-model="selectedRole"
              :inputId="role.value"
              :value="role.value"
            />
            <label :for="role.value" class="cursor-pointer">{{
              role.label
            }}</label>
          </div>
        </div>
      </div>
      <div v-else class="text-center font-bold text-xl text-primary mb-3">
        Firmando como:
        {{
          roles.find((r) => r.value === forcedRole)?.label ||
          forcedRole.toUpperCase()
        }}
      </div>

      <!-- Carga de Imagen -->
      <div class="flex flex-column align-items-center gap-3">
        <div v-if="!signatureImage" class="w-full">
          <FileUpload
            mode="basic"
            name="firma"
            accept="image/*"
            :maxFileSize="1000000"
            @select="handleFileSelect"
            chooseLabel="Seleccionar Imagen de Firma"
            class="w-full"
            :auto="true"
          />
          <small class="text-gray-500 block text-center mt-2">
            Formatos: PNG, JPG (Máx 1MB)
          </small>
        </div>

        <div
          v-else
          class="flex flex-column align-items-center gap-2 border-1 surface-border border-round p-3 w-full"
        >
          <span class="font-bold text-primary">Vista Previa:</span>
          <Image :src="signatureImage" alt="Firma" width="250" preview />
          <Button
            label="Cambiar Imagen"
            icon="pi pi-refresh"
            class="p-button-text p-button-sm mt-2"
            @click="handleClearImage"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-content-end gap-2">
        <Button
          label="Cancelar"
          icon="pi pi-times"
          severity="secondary"
          @click="handleCancel"
          outlined
        />
        <Button
          label="Guardar Firma"
          icon="pi pi-check"
          severity="primary"
          @click="handleSaveSignature"
          :loading="loading"
          :disabled="!signatureImage"
        />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.field-checkbox {
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s;
}
.field-checkbox:hover {
  background-color: #f8f9fa;
}
</style>
