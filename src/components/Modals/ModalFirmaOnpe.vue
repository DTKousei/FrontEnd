<script setup lang="ts">
import { ref, computed } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import RadioButton from "primevue/radiobutton";
import { permissionService } from "@/api/services/permission.service";
import Swal from "sweetalert2";
import type { Permiso } from "@/api/types/permissions.types";

const props = defineProps<{
  visible: boolean;
  permiso: Permiso | null;
}>();

const emit = defineEmits(["update:visible", "signed"]);

const selectedRole = ref<string>("solicitante");
const loading = ref(false);

const roles = [
  { label: "Solicitante", value: "solicitante" },
  { label: "Jefe de Área / Supervisor", value: "jefe_area" },
  { label: "Jefe de RRHH", value: "rrhh" },
];

const visibleModel = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val),
});

const handleSign = async () => {
  if (!props.permiso) return;

  try {
    loading.value = true;

    // 1. Obtener Base URL.
    // Nota: En producción, esto debería venir de variables de entorno.
    // Usamos la misma base que la API de papeletas.
    const baseUrl = "http://localhost:3002";

    // 2. Definir URLs para ReFirma
    // downloadUrl: Endpoint que devuelve el PDF original (binary)
    const downloadUrl = `${baseUrl}/api/permisos/${props.permiso.id}/pdf`;

    // uploadUrl: Endpoint POST donde ReFirma subirá el PDF firmado automáticamente
    const uploadUrl = `${baseUrl}/api/permisos/callback`;

    // 3. Construir Parámetros ReFirma
    const params = {
      app: "pdf",
      clientId: "CLIENT_ID_DUMMY", // Configurar en producción
      clientSecret: "CLIENT_SECRET_DUMMY", // Configurar en producción
      idFile: `papeleta_${props.permiso.id}`,
      type: "W", // Web Download & Upload
      protocol: "T", // HTTP (usar 'S' para HTTPS en prod)
      fileDownloadUrl: downloadUrl,
      fileUploadUrl: uploadUrl,
      reason: "Soy el autor del documento / Doy mi conformidad",
      pageNumber: 0, // 0 = última página? O usar coordenadas específicas
      posx: 100,
      posy: 100,
      outputFile: `papeleta_firmada_${props.permiso.id}.pdf`,
    };

    // 4. Codificar a Base64
    const jsonParams = JSON.stringify(params);
    const base64Params = btoa(jsonParams);

    // 5. Invocar Protocolo
    const refirmaUrl = `refirma://${base64Params}`;
    console.log("Invocando ReFirma con:", refirmaUrl);

    // Abrir ReFirma
    window.location.href = refirmaUrl;

    // 6. Iniciar Polling (Esperar respuesta del servidor)
    startPolling(props.permiso.id);

    Swal.fire({
      title: "Esperando Firma...",
      text: "La aplicación ReFirma se ha ejecutado. Por favor firme el documento. El sistema detectará automáticamente cuando termine.",
      icon: "info",
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  } catch (error) {
    console.error("Error al iniciar proceso de firma:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo iniciar el proceso de firma.",
    });
    loading.value = false;
  }
};

const pollingInterval = ref<number | null>(null);

const startPolling = (permisoId: string) => {
  // Limpiar intervalo anterior si existe
  if (pollingInterval.value) clearInterval(pollingInterval.value);

  let attempts = 0;
  const maxAttempts = 60; // 3 minutos aprox (60 * 3s)

  pollingInterval.value = window.setInterval(async () => {
    attempts++;
    try {
      const response = await permissionService.getPermisoById(permisoId);
      // La respuesta es PermisoResponse, y el objeto Permiso está en .data.data
      const permisoData = response.data.data;

      if (!permisoData) return;

      // Verificar si ya fue firmado según el rol seleccionado
      let yaFirmado = false;
      const role = selectedRole.value;

      if (role === "solicitante") {
        yaFirmado =
          !!permisoData.firma_solicitante_digital ||
          !!permisoData.firma_solicitante;
      } else if (role === "jefe_area") {
        yaFirmado =
          !!permisoData.firma_jefe_area_digital ||
          !!permisoData.firma_jefe_area;
      } else if (role === "rrhh") {
        yaFirmado =
          !!permisoData.firma_rrhh_digital || !!permisoData.firma_rrhh;
      }

      // Alternativamente, verificar si el estado cambió a algo que implique firma completa,
      // pero es mejor ser específico con el rol actual.
      // Si el backend marca firmas_completas:
      if (response.data.firmas_completas) {
        yaFirmado = true;
      }

      if (yaFirmado) {
        stopPolling();
        Swal.fire({
          icon: "success",
          title: "Firma Detectada",
          text: "El documento ha sido firmado exitosamente.",
          timer: 2000,
        });
        emit("signed");
        visibleModel.value = false;
      }
    } catch (err) {
      console.warn("Error poll status:", err);
    }

    if (attempts >= maxAttempts) {
      stopPolling();
      Swal.fire({
        icon: "warning",
        title: "Tiempo de espera agotado",
        text: "No detectamos la firma automáticamente. Si ya firmó, por favor actualice la página.",
        showConfirmButton: true,
      });
      loading.value = false;
    }
  }, 3000); // Cada 3 segundos
};

const stopPolling = () => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value);
    pollingInterval.value = null;
  }
  loading.value = false;
};

const handleCancel = () => {
  visibleModel.value = false;
};
</script>

<template>
  <Dialog
    v-model:visible="visibleModel"
    modal
    header="Firma Digital ONPE"
    :style="{ width: '400px' }"
    class="p-fluid"
  >
    <div class="flex flex-column gap-4 py-4">
      <div class="font-bold text-center mb-2">
        Seleccione el rol con el que desea firmar:
      </div>

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
        <label :for="role.value" class="cursor-pointer">{{ role.label }}</label>
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
          label="Abrir en ONPE"
          icon="pi pi-external-link"
          severity="primary"
          @click="handleSign"
          :loading="loading"
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
