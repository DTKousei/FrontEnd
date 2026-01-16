<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Detalle de Incidencia"
    :style="{ width: '50vw' }"
    :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
  >
    <div v-if="incidencia" class="p-fluid grid">
      <!-- Información General -->
      <div class="col-12 md:col-6">
        <label class="font-bold block mb-2 text-900">Empleado</label>
        <div class="p-2 surface-100 border-round">
          {{ incidencia.empleado_nombre || incidencia.empleado_id }}
        </div>
      </div>
      <div class="col-12 md:col-6">
        <label class="font-bold block mb-2 text-900">Tipo</label>
        <div class="p-2 surface-100 border-round">
          {{ incidencia.tipo_incidencia?.nombre || "N/A" }}
        </div>
      </div>

      <div class="col-12 md:col-6">
        <label class="font-bold block mb-2 text-900">Fecha Inicio</label>
        <div class="p-2 surface-100 border-round">
          {{ formatDate(incidencia.fecha_inicio) }}
        </div>
      </div>
      <div class="col-12 md:col-6">
        <label class="font-bold block mb-2 text-900">Fecha Fin</label>
        <div class="p-2 surface-100 border-round">
          {{ formatDate(incidencia.fecha_fin) }}
        </div>
      </div>

      <div class="col-12">
        <label class="font-bold block mb-2 text-900">Descripción</label>
        <div
          class="p-3 surface-100 border-round text-800"
          style="min-height: 60px"
        >
          {{ incidencia.descripcion }}
        </div>
      </div>

      <div class="col-12" v-if="incidencia.estado">
        <label class="font-bold block mb-2 text-900">Estado Actual</label>
        <Tag
          :value="incidencia.estado.nombre"
          :severity="getSeverity(incidencia.estado.nombre)"
        />
        <div
          v-if="
            incidencia.estado.nombre.toUpperCase().includes('RECHAZADO') &&
            incidencia.motivo_rechazo
          "
          class="mt-2 p-2 border-1 border-red-200 bg-red-50 text-red-800 border-round"
        >
          <strong>Motivo Rechazo:</strong> {{ incidencia.motivo_rechazo }}
        </div>
        <div
          v-if="
            incidencia.estado.nombre.toUpperCase().includes('APROBADO') &&
            incidencia.aprobado_por
          "
          class="mt-2 p-2 border-1 border-green-200 bg-green-50 text-green-800 border-round"
        >
          <strong>Aprobado por:</strong> {{ incidencia.aprobado_por }}
        </div>
      </div>

      <!-- Vista Previa de Evidencia -->
      <div class="col-12 mt-4">
        <label
          class="font-bold block mb-2 text-blue-800 border-bottom-1 border-blue-200 pb-1"
        >
          <i class="pi pi-file mr-2"></i>Evidencia Adjunta
        </label>

        <div
          v-if="previewUrl"
          class="flex justify-content-center align-items-center bg-gray-100 p-3 border-round border-1 border-gray-300"
          style="min-height: 200px"
        >
          <!-- Imagen -->
          <img
            v-if="isImage"
            :src="previewUrl"
            alt="Evidencia"
            style="max-width: 100%; max-height: 400px; object-fit: contain"
            class="shadow-2 border-round"
          />

          <!-- PDF -->
          <iframe
            v-else-if="isPdf"
            :src="previewUrl"
            width="100%"
            height="400px"
            class="border-0 shadow-2"
          ></iframe>

          <!-- Other -->
          <div v-else class="text-center p-4">
            <i class="pi pi-file text-5xl text-gray-400 mb-3"></i>
            <p>
              Archivo descargable:
              <a
                :href="previewUrl"
                target="_blank"
                class="text-blue-600 hover:underline"
                >Descargar</a
              >
            </p>
          </div>
        </div>
        <div
          v-else
          class="text-center p-4 bg-gray-50 border-round border-dashed border-gray-300"
        >
          <p class="text-gray-500 m-0">
            No hay evidencia adjunta visualizable.
          </p>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-content-between w-full">
        <Button
          label="Cerrar"
          icon="pi pi-times"
          @click="visible = false"
          text
          severity="secondary"
        />

        <div v-if="incidencia && isPending" class="flex gap-2">
          <Button
            label="Rechazar"
            icon="pi pi-times-circle"
            severity="danger"
            @click="handleReject"
            outlined
          />
          <Button
            label="Aprobar"
            icon="pi pi-check-circle"
            severity="success"
            @click="handleApprove"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, watch, ref } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Tag from "primevue/tag";

const props = defineProps<{
  modelValue: boolean;
  incidencia: any | null;
}>();

const emit = defineEmits(["update:modelValue", "approve", "reject"]);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const previewUrl = ref<string | null>(null);
const isImage = ref(false);
const isPdf = ref(false);

const isPending = computed(() => {
  return (
    props.incidencia?.estado?.nombre?.toUpperCase().includes("PENDIENTE") ||
    false
  );
});

import { incidentService } from "@/api/services/incident.service";

// ... (code)

// Watch incidencia change to load document
// --- MANEJO DE VISTA PREVIA DE DOCUMENTOS ---

// Observador para detectar cambios en la incidencia seleccionada y cargar su documento
watch(
  () => props.incidencia,
  async (newVal) => {
    // 1. Limpiar URL anterior para liberar memoria
    if (previewUrl.value && previewUrl.value.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl.value);
    }

    if (newVal && newVal.url_documento) {
      try {
        // 2. Obtener el contenido del archivo como Blob desde el servicio
        // Esto evita problemas de CORS y bloqueos de seguridad del navegador para archivos locales/externos
        const response = await incidentService.getIncidenciaDocumento(
          newVal.id
        );

        // 3. Crear Blob con el tipo MIME correcto
        // @ts-ignore
        const blob = new Blob([response.data], {
          type: response.headers["content-type"] || "application/pdf",
        });

        // 4. Generar URL temporal local para visualización
        const blobUrl = URL.createObjectURL(blob);
        previewUrl.value = blobUrl;

        // 5. Determinar tipo de archivo para renderizado (Imagen vs PDF)
        const type = response.headers["content-type"];
        isImage.value = type && type.startsWith("image/");
        isPdf.value = type === "application/pdf";

        // Fallback: Verificar extensión si el tipo MIME falla
        if (!type) {
          const ext = newVal.url_documento.split(".").pop()?.toLowerCase();
          isImage.value = ["jpg", "jpeg", "png", "gif", "webp"].includes(
            ext || ""
          );
          isPdf.value = ext === "pdf";
        }
      } catch (e) {
        console.error("Error al obtener vista previa del documento", e);
        previewUrl.value = null;
        isImage.value = false;
        isPdf.value = false;
      }
    } else {
      previewUrl.value = null;
      isImage.value = false;
      isPdf.value = false;
    }
  },
  { immediate: true }
);

// --- FUNCIONES AUXILIARES DE VISUALIZACIÓN ---

/**
 * Formatea una fecha ISO o YYYY-MM-DD a formato local legible (dd/mm/yyyy).
 * Maneja zonas horarias agregando hora fija si es necesario.
 */
const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  // Ajuste para evitar desfase de zona horaria (UTC -> Local)
  // Usamos getUTC* para mantener la fecha original del string.
  const date = new Date(dateString);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Retorna la severidad (color) para el Tag de estado.
 */
const getSeverity = (status: string) => {
  if (!status) return "info";
  const s = status.toUpperCase();
  if (s.includes("APROB")) return "success";
  if (s.includes("RECHAZ")) return "danger";
  if (s.includes("PENDIENTE")) return "warning";
  return "info";
};

// --- MANEJO DE ACCIONES ---

const handleApprove = () => {
  emit("approve", props.incidencia);
  visible.value = false;
};

const handleReject = () => {
  emit("reject", props.incidencia);
  visible.value = false;
};
</script>

<style scoped>
/* Styling handled by PrimeFlex */
</style>
