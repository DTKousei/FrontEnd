<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import VueApexCharts from "vue3-apexcharts";

const props = defineProps<{
  metrics: {
    puntualidad: number;
    asistencia: number;
    tardanzas: number;
    horas_extras: number;
    uso_beneficios: number;
  };
}>();

const series = ref<{ name: string; data: number[] }[]>([
  {
    name: "Desempeño",
    data: [0, 0, 0, 0, 0],
  },
]);

const chartOptions = ref({
  chart: {
    height: 500,
    type: "radar",
    toolbar: {
      show: false,
    },
  },
  xaxis: {
    categories: [
      "Puntualidad",
      "Asistencia (Faltas)",
      "Tardanzas",
      "Horas Extra",
      "Beneficios (Días)",
    ],
    labels: {
      show: true,
      style: {
        colors: ["#64748b", "#64748b", "#64748b", "#64748b", "#64748b"],
        fontSize: "14px",
        fontFamily: "Inter, sans-serif",
      },
    },
  },
  title: {
    text: "Métricas del Mes",
    align: "center",
    style: {
      fontSize: "18px",
      fontWeight: "bold",
      color: "#263238",
    },
  },
  stroke: {
    width: 2,
    colors: ["#3b82f6"],
  },
  fill: {
    opacity: 0.2, // Fondo transparente con leve color
    colors: ["#3b82f6"],
  },
  markers: {
    size: 4,
    colors: ["#fff"],
    strokeColors: ["#3b82f6"],
    strokeWidth: 2,
  },
  yaxis: {
    show: false, // Ocultar números del eje Y para limpieza
  },
  tooltip: {
    theme: "light",
    y: {
      formatter: function (val: number) {
        return val;
      },
    },
  },
});

const updateChart = () => {
  // Nota: ApexCharts actualiza automáticamente, solo necesitamos actualizar la serie
  series.value = [
    {
      name: "Desempeño",
      data: [
        props.metrics.puntualidad,
        props.metrics.asistencia,
        props.metrics.tardanzas,
        props.metrics.horas_extras,
        props.metrics.uso_beneficios,
      ],
    },
  ];
};

watch(() => props.metrics, updateChart, { deep: true, immediate: true });

onMounted(() => {
  updateChart();
});
</script>

<template>
  <div class="card flex justify-content-center w-full">
    <VueApexCharts
      type="radar"
      height="450"
      :options="chartOptions as any"
      :series="series"
      class="w-full"
    />
  </div>
</template>
