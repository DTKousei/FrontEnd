<template>
  <div class="chart-wrapper">
    <apexchart
      type="donut"
      height="300"
      :options="chartOptions"
      :series="series"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { ApexOptions } from "apexcharts";

interface Metrics {
  puntual: number;
  tardanzas: number;
  faltas: number;
  horas_extras: number;
}

const props = defineProps<{
  metrics: Metrics;
}>();

const series = computed(() => [
  props.metrics.puntual,
  props.metrics.tardanzas,
  props.metrics.faltas,
]);

const chartOptions = ref<ApexOptions>({
  chart: { type: "donut" },
  labels: ["Puntual", "Tardanzas", "Faltas"],
  colors: ["#27ae60", "#f39c12", "#e74c3c"],
  legend: { position: "bottom" },
  dataLabels: { enabled: true },
  plotOptions: {
    pie: {
      donut: {
        size: "65%",
        labels: {
          show: true,
          total: {
            show: true,
            label: "Total",
            formatter: function (w: any) {
              return w.globals.seriesTotals.reduce(
                (a: any, b: any) => a + b,
                0
              );
            },
          },
        },
      },
    },
  },
});
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
}
</style>
