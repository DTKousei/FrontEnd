<template>
  <div class="chart-wrapper">
    <apexchart
      type="polarArea"
      height="350"
      :options="chartOptions"
      :series="series"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { ApexOptions } from "apexcharts";

// Definimos la estructura básica de un registro de asistencia
// Ajusta 'estado' y 'departamento'/'area' según la respuesta real de tu API
interface AttendanceRecord {
  estado: string;
  departamento?: string;
  area?: string;
  [key: string]: any;
}

const props = defineProps<{
  data: AttendanceRecord[];
}>();

const series = ref<number[]>([]);
const labels = ref<string[]>([]);

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: "polarArea",
  },
  labels: labels.value,
  stroke: {
    colors: ["#fff"],
  },
  fill: {
    opacity: 0.8,
  },
  legend: {
    position: "bottom",
  },
  responsive: [
    {
      breakpoint: 480,
      options: {
        chart: {
          width: 200,
        },
        legend: {
          position: "bottom",
        },
      },
    },
  ],
  tooltip: {
    y: {
      formatter: function (val: number) {
        return val + " asistentes";
      },
    },
  },
  title: {
    text: "Asistencia por Área",
    align: "center",
    style: {
      fontSize: "16px",
      fontWeight: "bold",
      color: "#263238",
    },
  },
}));

const processData = (records: AttendanceRecord[]) => {
  console.log("PolarChart - Raw Data:", records);
  const deptCounts: Record<string, number> = {};

  records.forEach((record) => {
    // Filtrar solo Asistencia (Puntual) y Tardanza
    // Asumimos que los strings pueden variar, ajusta según tu backend (ej. 'Puntual', 'Tardanza')
    const estado = (record.estado || "").toLowerCase();
    const isPresent =
      estado.includes("puntual") ||
      estado.includes("asistencia") ||
      estado.includes("tardanza") ||
      estado === "p" ||
      estado === "t";

    if (!isPresent) return;

    let deptName = "Otros";
    if (record.departamento) {
      deptName = record.departamento;
    } else if (record.area) {
      deptName = record.area;
    }

    if (!deptCounts[deptName]) deptCounts[deptName] = 0;
    deptCounts[deptName]++;
  });

  console.log("PolarChart - Processed Counts:", deptCounts);
  labels.value = Object.keys(deptCounts);
  series.value = Object.values(deptCounts);
};

// Watch debe ir DESPUÉS de definir processData
watch(
  () => props.data,
  (newData) => {
    processData(newData);
  },
  { deep: true, immediate: true }
);
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  padding: 10px;
  background: #fff;
  border-radius: 8px;
}
</style>
