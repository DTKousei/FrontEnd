<template>
  <div class="chart-wrapper">
    <div class="chart-header">
      <h3>Tendencia de Asistencia del Equipo</h3>
    </div>
    <div id="chart">
      <apexchart
        type="area"
        height="350"
        :options="chartOptions"
        :series="series"
      ></apexchart>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ApexOptions } from "apexcharts";

interface DailyStats {
  date: string; // YYYY-MM-DD
  present: number;
  absent: number;
  late: number;
}

const props = defineProps<{
  stats: DailyStats[];
}>();

const series = computed(() => [
  {
    name: "Presentes",
    data: props.stats.map((s) => s.present),
  },
  {
    name: "Tardanzas",
    data: props.stats.map((s) => s.late),
  },
  {
    name: "Ausencias",
    data: props.stats.map((s) => s.absent),
  },
]);

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    height: 350,
    type: "area",
    fontFamily: "Segoe UI, sans-serif",
    toolbar: {
      show: false,
    },
  },
  colors: ["#2ecc71", "#f1c40f", "#e74c3c"],
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: "smooth",
    width: 2,
  },
  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.3,
      stops: [0, 90, 100],
    },
  },
  xaxis: {
    type: "datetime",
    categories: props.stats.map((s) => s.date),
    labels: {
      format: "dd MMM",
      style: {
        colors: "#9ca3af",
      },
    },
  },
  yaxis: {
    title: {
      text: "Cantidad de Empleados",
    },
    min: 0,
    forceNiceScale: true,
  },
  tooltip: {
    x: {
      format: "dd MMM yyyy",
    },
  },
  legend: {
    position: "top",
    horizontalAlign: "right",
  },
  grid: {
    borderColor: "#f3f4f6",
  },
}));
</script>

<style scoped>
.chart-wrapper {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  height: 100%;
}

.chart-header h3 {
  margin: 0 0 1.5rem 0;
  color: #1f2937;
  font-size: 1.1rem;
  font-weight: 600;
}
</style>
