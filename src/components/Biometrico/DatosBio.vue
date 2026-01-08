<template>
  <Dialog
    v-model:visible="localVisible"
    :header="'Detalles del Biométrico: ' + (device?.nombre || '')"
    :modal="true"
    :style="{ width: '500px' }"
    @hide="onHide"
  >
    <div
      v-if="loading"
      class="flex flex-column align-items-center justify-content-center p-4"
    >
      <i class="pi pi-spin pi-spinner text-4xl mb-3 text-primary"></i>
      <span>Obteniendo información del dispositivo...</span>
    </div>

    <div v-else-if="deviceInfo" class="device-details">
      <div class="detail-group">
        <label>Nombre:</label>
        <span>{{ device?.nombre }}</span>
      </div>

      <div class="detail-group">
        <label>IP:</label>
        <span>{{ deviceInfo.ip_address }}</span>
      </div>

      <div class="detail-group">
        <label>Puerto:</label>
        <span>{{ deviceInfo.puerto }}</span>
      </div>

      <div class="detail-group">
        <label>Número de Serie:</label>
        <span class="font-mono text-primary">{{
          deviceInfo.serial_number
        }}</span>
      </div>

      <div class="detail-group">
        <label>Firmware:</label>
        <span>{{ deviceInfo.firmware_version }}</span>
      </div>

      <div class="detail-group">
        <label>Plataforma:</label>
        <span>{{ deviceInfo.platform }}</span>
      </div>

      <div class="detail-group">
        <label>Hora del Dispositivo:</label>
        <span>{{ deviceInfo.hora_dispositivo }}</span>
      </div>

      <div class="detail-group mt-3" v-if="device?.ubicacion">
        <label>Ubicación:</label>
        <span>{{ device.ubicacion }}</span>
      </div>
    </div>

    <div v-else class="text-center p-4 text-gray-500">
      <i class="pi pi-exclamation-triangle block text-4xl mb-3"></i>
      <p>No se pudo obtener la información técnica del dispositivo.</p>
      <p class="text-sm">
        Verifique que el dispositivo esté conectado y accesible en la red.
      </p>
    </div>

    <template #footer>
      <Button label="Cerrar" icon="pi pi-times" text @click="onHide" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import { deviceService } from "@/api/services/device.service";
import type { Device, DeviceConnectionInfo } from "@/api/types/devices.types";

const props = defineProps<{
  visible: boolean;
  device: Device | null;
}>();

const emit = defineEmits(["update:visible"]);

const localVisible = ref(props.visible);
const loading = ref(false);
const deviceInfo = ref<DeviceConnectionInfo | null>(null);

watch(
  () => props.visible,
  async (newVal) => {
    localVisible.value = newVal;
    if (newVal && props.device) {
      await fetchDeviceInfo(props.device.id);
    } else {
      deviceInfo.value = null;
    }
  }
);

const onHide = () => {
  localVisible.value = false;
  emit("update:visible", false);
};

const fetchDeviceInfo = async (id: number) => {
  loading.value = true;
  deviceInfo.value = null;
  try {
    const response = await deviceService.getInfo(id);
    // @ts-ignore
    deviceInfo.value = response.data || null;
  } catch (error) {
    console.error("Error fetching device info:", error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.device-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 10px;
}

.detail-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-group:last-child {
  border-bottom: none;
}

.detail-group label {
  font-weight: 600;
  color: #555;
  width: 40%;
}

.detail-group span {
  width: 60%;
  text-align: right;
  word-break: break-all;
}

.font-mono {
  font-family: monospace;
}
</style>
