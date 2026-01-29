<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import Swal from "sweetalert2";
import { deviceService } from "@/api/services/device.service";

import { attendanceService } from "@/api/services/attendance.service";
import type { Device } from "@/api/types/devices.types";

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits(["update:visible", "sync-complete"]);

const visibleModel = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val),
});

const devices = ref<Device[]>([]);
const selectedDevice = ref<Device | null>(null);
const loadingDevices = ref(false);
const syncing = ref(false);
const syncingToday = ref(false); // Added for today's sync

const loadDevices = async () => {
  loadingDevices.value = true;
  try {
    const response = await deviceService.getAll();
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
    Swal.fire(
      "Error",
      "No se pudieron cargar los dispositivos biométricos",
      "error",
    );
  } finally {
    loadingDevices.value = false;
  }
};

const handleSync = async () => {
  if (!selectedDevice.value) {
    Swal.fire("Atención", "Por favor seleccione un dispositivo", "warning");
    return;
  }

  try {
    syncing.value = true;
    // La API espera el ID del dispositivo
    await attendanceService.syncDevice(selectedDevice.value.id);

    await Swal.fire(
      "Éxito",
      "Sincronización completada correctamente",
      "success",
    );
    emit("sync-complete");
    visibleModel.value = false;
  } catch (error) {
    console.error("Error syncing device:", error);
    Swal.fire(
      "Error",
      "Error durante la sincronización. Verifique la conexión con el dispositivo.",
      "error",
    );
  } finally {
    syncing.value = false;
  }
};

// Added handleSyncToday function
const handleSyncToday = async () => {
  if (!selectedDevice.value) {
    Swal.fire("Atención", "Por favor seleccione un dispositivo", "warning");
    return;
  }

  try {
    syncingToday.value = true;
    await attendanceService.syncToday(selectedDevice.value.id);

    await Swal.fire(
      "Éxito",
      "Sincronización de asistencias de hoy completada correctamente",
      "success",
    );
    emit("sync-complete");
    visibleModel.value = false;
  } catch (error) {
    console.error("Error syncing today's attendance:", error);
    Swal.fire(
      "Error",
      "Error durante la sincronización de asistencias de hoy. Verifique la conexión con el dispositivo.",
      "error",
    );
  } finally {
    syncingToday.value = false;
  }
};

onMounted(() => {
  loadDevices();
});
</script>

<template>
  <Dialog
    v-model:visible="visibleModel"
    modal
    header="Sincronizar Biométrico"
    :style="{ width: '400px' }"
    class="p-fluid"
  >
    <div class="flex flex-column gap-3">
      <div class="text-center mb-3">
        <i class="pi pi-sync text-5xl text-blue-500 mb-2"></i>
        <p class="text-gray-600 m-0">
          Seleccione el dispositivo desde el cual desea descargar los registros
          de asistencia.
        </p>
      </div>

      <div class="field">
        <label class="font-bold">Dispositivo</label>
        <Dropdown
          v-model="selectedDevice"
          :options="devices"
          optionLabel="nombre"
          placeholder="Seleccione un dispositivo"
          class="w-full"
          :loading="loadingDevices"
        >
          <template #option="slotProps">
            <div class="flex align-items-center">
              <i class="pi pi-mobile mr-2"></i>
              <div>
                <div>{{ slotProps.option.nombre }}</div>
                <small class="text-gray-500">{{ slotProps.option.ip }}</small>
              </div>
            </div>
          </template>
        </Dropdown>
      </div>

      <div class="flex justify-content-end gap-2 mt-2">
        <Button
          label="Cancelar"
          icon="pi pi-times"
          text
          severity="secondary"
          @click="visibleModel = false"
        />
        <Button
          label="Sincronizar"
          icon="pi pi-cloud-download"
          severity="primary"
          :loading="syncing"
          :disabled="!selectedDevice"
          @click="handleSync"
        />
        <Button
          label="Sync Hoy"
          icon="pi pi-calendar"
          :loading="syncingToday"
          :disabled="!selectedDevice"
          @click="handleSyncToday"
          severity="info"
        />
      </div>
    </div>
  </Dialog>
</template>
