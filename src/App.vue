<template>
  <div class="app-container">
    <!-- 
      Ideally, we would have a layout component here that includes the sidebar 
      if the user is authenticated. For now, we just render the route.
    -->
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { deviceService } from "@/api/services/device.service";
import { attendanceService } from "@/api/services/attendance.service";

// Global app logic

// Intervalo para sincronización automática (ej. cada 5 minutos)
const SYNC_INTERVAL_MS = 300000;
let syncInterval: any;

const runAutoSync = async () => {
  console.log("Running Auto-Sync Check...");
  try {
    const response = await deviceService.getAll();
    // Manejo de respuesta flexible (data array o data.data)
    const devices = (response.data as any)?.data || response.data || [];

    if (Array.isArray(devices)) {
      for (const device of devices) {
        try {
          // Solo si tiene IP configurada
          if (device.ip) {
            const connResponse = await deviceService.testConnection(device.id);
            if (connResponse.data.success) {
              console.log(
                `Dispositivo ${device.nombre} conectado. Sincronizando hoy...`
              );
              await attendanceService.syncToday(device.id);
              console.log(
                `Sincronización automática exitosa para ${device.nombre}`
              );
            } else {
              console.log(
                `Dispositivo ${device.nombre} no accesible para auto-sync.`
              );
            }
          }
        } catch (devError) {
          console.error(
            `Error procesando auto-sync para dispositivo ${
              device.nombre || device.id
            }:`,
            devError
          );
        }
      }
    }
  } catch (error) {
    console.error("Error en ciclo de auto-sincronización:", error);
  }
};

onMounted(() => {
  // Iniciar ciclo
  syncInterval = setInterval(runAutoSync, SYNC_INTERVAL_MS);

  // Ejecutar una vez al inicio (opcional, tras unos segundos para no bloquear carga inicial)
  setTimeout(runAutoSync, 10000);
});

onUnmounted(() => {
  if (syncInterval) clearInterval(syncInterval);
});
</script>

<style>
/* Reset and Base Styles */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  background-color: #f4f6f8;
}

.app-container {
  min-height: 100vh;
}
</style>
