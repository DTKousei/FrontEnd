<script setup lang="ts">
import { ref, onMounted } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Swal from "sweetalert2";
import { reportService } from "@/api/services/report.service";
import type { GeneratedReport } from "@/api/types/reports.types";

// State
const reports = ref<GeneratedReport[]>([]);
const loading = ref(false);

// Helper: Calcular Periodo (Mes Año)
const getPeriodo = (report: GeneratedReport) => {
  const data = report.parametros || report.filtros;
  if (!data || !data.mes || !data.anio) return "-";

  const mes = parseInt(data.mes, 10);
  const anio = data.anio;

  if (isNaN(mes) || mes < 1 || mes > 12) return "-";

  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  return `${meses[mes - 1]} ${anio}`;
};

// Helper: Formatear Fecha (Solo fecha)
const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString();
};

// Helper: Formatear Hora (Solo hora)
const formatTime = (dateString: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const loadReports = async () => {
  try {
    loading.value = true;
    const response = await reportService.listGenerated();
    // @ts-ignore
    reports.value = response.data?.data || response.data || [];
  } catch (error) {
    console.error("Error loading reports:", error);
    // Silent fail or toast
  } finally {
    loading.value = false;
  }
};

const viewReport = async (
  report: GeneratedReport,
  requestFormat: "PDF" | "EXCEL"
) => {
  try {
    Swal.fire({
      title: "Cargando visualización...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const response = await reportService.downloadGenerated(
      report.id,
      requestFormat
    );

    // Crear Blob
    const mimeType =
      requestFormat === "PDF"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    // @ts-ignore
    const blob = new Blob([response.data], { type: mimeType });
    const url = window.URL.createObjectURL(blob);

    // Abrir en nueva pestaña
    window.open(url, "_blank");

    // Cleanup simple - en SPA real idealmente revocar al cerrar, pero _blank es async
    setTimeout(() => window.URL.revokeObjectURL(url), 60000);

    Swal.close();
  } catch (error) {
    console.error("Error viewing:", error);
    Swal.fire("Error", "No se pudo visualizar el archivo", "error");
  }
};

const generateMissingFormat = async (
  report: GeneratedReport,
  targetFormat: "PDF" | "EXCEL"
) => {
  // Extract params from original report filters
  const data = report.parametros || report.filtros || {};
  const { mes, anio, user_ids, area } = data;

  if (!mes || !anio || !user_ids) {
    Swal.fire(
      "Error",
      "No se pueden recuperar los filtros originales para generar este formato.",
      "error"
    );
    return;
  }

  const payload = { mes, anio, user_ids, area };

  try {
    Swal.fire({
      title: `Generando ${targetFormat}...`,
      text: "Creando el reporte en el nuevo formato.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    if (targetFormat === "PDF") {
      await reportService.exportPdf(payload);
    } else {
      await reportService.exportExcel(payload);
    }

    Swal.fire("Éxito", "Reporte generado y agregado al historial.", "success");
    loadReports(); // Refresh list
  } catch (error) {
    console.error(`Error generating ${targetFormat}:`, error);
    Swal.fire("Error", "No se pudo generar el formato solicitado.", "error");
  }
};

const deleteReport = async (id: number) => {
  const result = await Swal.fire({
    title: "¿Eliminar reporte?",
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#d33",
  });

  if (result.isConfirmed) {
    try {
      await reportService.deleteGenerated(id);
      Swal.fire("Eliminado", "Reporte eliminado correctamente", "success");
      loadReports();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo eliminar el reporte", "error");
    }
  }
};

onMounted(() => {
  loadReports();
});

defineExpose({
  loadReports,
});
</script>

<template>
  <div class="card p-0 shadow-none border-none">
    <DataTable
      :value="reports"
      :loading="loading"
      :paginator="true"
      :rows="5"
      stripedRows
      responsiveLayout="scroll"
      class="p-datatable-sm"
    >
      <template #header>
        <div class="flex justify-content-between align-items-center">
          <h4 class="m-0 text-blue-700 font-bold">
            Historial de Reportes Generados
          </h4>
          <Button
            icon="pi pi-refresh"
            text
            rounded
            @click="loadReports"
            tooltip="Actualizar"
          />
        </div>
      </template>

      <template #empty> No hay reportes generados. </template>

      <!-- Columna Tipo -->
      <Column header="Tipo de Reporte" sortable field="report_type_name">
        <template #body="{ data }">
          <span class="font-semibold">{{
            data.report_type_name || "Asistencia General"
          }}</span>
        </template>
      </Column>

      <!-- Columna Área -->
      <Column header="Área" sortable field="area">
        <template #body="{ data }">
          <span class="font-medium">{{
            data.parametros?.area || data.area || "-"
          }}</span>
        </template>
      </Column>

      <!-- Columna Periodo -->
      <Column header="Periodo">
        <template #body="{ data }">
          <span class="font-medium">{{ getPeriodo(data) }}</span>
        </template>
      </Column>

      <!-- Columna Fecha -->
      <Column header="Fecha" sortable field="fecha_generacion">
        <template #body="{ data }">
          {{ formatDate(data.fecha_generacion) }}
        </template>
      </Column>

      <!-- Columna Hora -->
      <Column header="Hora">
        <template #body="{ data }">
          {{ formatTime(data.fecha_generacion) }}
        </template>
      </Column>

      <!-- Columna Acciones -->
      <Column
        header="Acciones"
        headerStyle="text-align: right"
        bodyStyle="text-align: right"
      >
        <template #body="{ data }">
          <div class="flex gap-2 justify-content-end">
            <!-- PDF Button -->
            <!-- If has PDF: View. If not: Generate -->
            <Button
              icon="pi pi-file-pdf"
              rounded
              :outlined="data.formato !== 'PDF'"
              :severity="data.formato === 'PDF' ? 'danger' : 'secondary'"
              :tooltip="data.formato === 'PDF' ? 'Ver PDF' : 'Generar PDF'"
              @click="
                data.formato === 'PDF'
                  ? viewReport(data, 'PDF')
                  : generateMissingFormat(data, 'PDF')
              "
              class="p-button-sm"
            />

            <!-- Excel Button -->
            <!-- If has Excel: View. If not: Generate -->
            <Button
              icon="pi pi-file-excel"
              rounded
              :outlined="data.formato !== 'EXCEL'"
              :severity="data.formato === 'EXCEL' ? 'success' : 'secondary'"
              :tooltip="
                data.formato === 'EXCEL' ? 'Ver Excel' : 'Generar Excel'
              "
              @click="
                data.formato === 'EXCEL'
                  ? viewReport(data, 'EXCEL')
                  : generateMissingFormat(data, 'EXCEL')
              "
              class="p-button-sm"
            />

            <!-- Delete Button -->
            <Button
              icon="pi pi-trash"
              text
              severity="danger"
              rounded
              tooltip="Eliminar"
              @click="deleteReport(data.id)"
              class="p-button-sm"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>
/* Optional styling tweaks */
</style>
