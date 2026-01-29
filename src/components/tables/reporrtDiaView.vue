<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Tag from "primevue/tag";
import { attendanceService } from "@/api/services/attendance.service";
import { deviceService } from "@/api/services/device.service";
import type { Device } from "@/api/types/devices.types";

const props = defineProps<{
  userId: string;
  fecha: string; // YYYY-MM-DD
}>();

const records = ref<any[]>([]);
const devices = ref<Device[]>([]);
const loading = ref(false);

const loadDevices = async () => {
  try {
    const response = await deviceService.getAll();
    // Manejo robusto de respuesta como en ModalSyncDevice
    // @ts-ignore
    if (response.data && Array.isArray(response.data)) {
      // @ts-ignore
      devices.value = response.data;
      // @ts-ignore
    } else if (Array.isArray(response)) {
      // @ts-ignore
      devices.value = response;
      // @ts-ignore
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      // @ts-ignore
      devices.value = response.data.data;
    }
  } catch (error) {
    console.error("Error loading devices:", error);
  }
};

const loadRecords = async () => {
  if (!props.userId || !props.fecha) return;

  loading.value = true;
  try {
    const response = await attendanceService.getDailyPunches(
      props.userId,
      props.fecha,
    );
    records.value = response.data || [];
  } catch (error) {
    console.error("Error loading punches:", error);
    records.value = [];
  } finally {
    loading.value = false;
  }
};

const getDeviceName = (deviceId: number) => {
  if (!deviceId) return "Desconocido";
  // Check if devices list is populated
  if (devices.value.length === 0) return `ID: ${deviceId}`;

  const device = devices.value.find((d) => d.id === deviceId);
  return device ? device.nombre : `ID: ${deviceId}`;
};

const formatTime = (isoString: string) => {
  if (!isoString) return "-";
  return new Date(isoString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

watch(
  () => props.userId,
  () => {
    loadRecords();
  },
);

watch(
  () => props.fecha,
  () => {
    loadRecords();
  },
);

onMounted(async () => {
  await loadDevices();
  await loadRecords();
});
</script>

<template>
  <div class="p-3">
    <DataTable
      :value="records"
      :loading="loading"
      stripedRows
      responsiveLayout="scroll"
      class="p-datatable-sm"
      :rows="10"
      paginator
    >
      <template #empty>No hay marcaciones registradas para este día.</template>

      <Column header="Hora">
        <template #body="slotProps">
          <span class="font-bold text-xl text-blue-600">
            {{ formatTime(slotProps.data.timestamp) }}
          </span>
        </template>
      </Column>

      <Column header="Dispositivo">
        <template #body="slotProps">
          <div class="flex align-items-center">
            <i class="pi pi-desktop mr-2 text-gray-500"></i>
            <span>{{ getDeviceName(slotProps.data.dispositivo_id) }}</span>
          </div>
        </template>
      </Column>

      <Column header="Estado">
        <template #body>
          <Tag value="Registrado" severity="success" icon="pi pi-check" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>
