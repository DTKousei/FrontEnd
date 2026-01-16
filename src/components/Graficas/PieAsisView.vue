<template>
  <div class="chart-wrapper">
    <apexchart
      type="pie"
      width="380"
      :options="chartOptions"
      :series="series"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ApexOptions } from "apexcharts";

const props = defineProps<{
  series: number[];
  labels: string[];
}>();

const chartOptions = computed<ApexOptions>(
  () =>
    ({
      chart: {
        width: 380,
        type: "pie",
        fontFamily: "Segoe UI, sans-serif",
      },
      labels: props.labels,
      // @ts-ignore
      legend: {
        position: "right",
        fontSize: "14px",
        markers: {
          width: 12,
          height: 12,
        },
        itemMargin: {
          vertical: 5,
        },
      },
      colors: [
        "#007bff",
        "#28a745",
        "#ffc107",
        "#dc3545",
        "#6c757d",
        "#17a2b8",
      ],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 300,
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
    } as any)
);
</script>

<style scoped>
.chart-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 10px;
  background: #fff;
  border-radius: 8px;
}
</style>
