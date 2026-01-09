<template>
  <div class="chart-wrapper">
    <apexchart
      type="line"
      height="350"
      :options="chartOptionsWithCategories"
      :series="series"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { ApexOptions } from "apexcharts";

interface AttendanceRecord {
  fecha: string;
  estado: string;
  departamento: string;
  area?: string; // Fallback if departamento is undefined
  [key: string]: any;
}

const props = defineProps<{
  data: AttendanceRecord[];
}>();

const series = ref<{ name: string; data: number[] }[]>([]);

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    height: 350,
    type: "line",
    zoom: {
      enabled: false,
    },
    fontFamily: "Segoe UI, sans-serif",
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    width: 3,
    curve: "straight",
    // Generamos dashArray dinámico en base a la cantidad de series si es posible,
    // o dejamos un patrón fijo. El usuario pidió "Dashed".
    // Si ponemos 5, 5, 5 todos serán dashed. Si ponemos 0 son solidos.
    // El ejemplo del usuario: dashArray: [0, 8, 5] (Sólido, Dashed Largo, Dashed Corto)
    dashArray: series.value.map((_, i) => (i === 0 ? 0 : i % 2 === 0 ? 8 : 5)),
  },
  title: {
    text: "Asistencia por Área - Última Semana",
    align: "left",
    style: {
      fontSize: "16px",
      fontWeight: "bold",
      color: "#263238",
    },
  },
  legend: {
    tooltipHoverFormatter: function (val, opts) {
      return (
        val +
        " - <strong>" +
        opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] +
        "</strong>"
      );
    },
  },
  markers: {
    size: 4,
    hover: {
      sizeOffset: 6,
    },
  },
  xaxis: {
    // Categories se llenan dinámicamente en processData, pero aquí definimos la estructura
    categories: [], // Se llenará con las fechas
    title: {
      text: "Fecha",
    },
  },
  tooltip: {
    y: [
      {
        title: {
          formatter: function (val) {
            return val + " asistentes";
          },
        },
      },
    ],
  },
  grid: {
    borderColor: "#f1f1f1",
  },
  colors: ["#008FFB", "#00E396", "#FEB019", "#FF4560", "#775DD0"], // Colores base
}));

const processData = (records: AttendanceRecord[]) => {
  if (!records || records.length === 0) {
    series.value = [];
    return;
  }

  // 1. Obtener todas las fechas únicas y ordenarlas (Últimos X días)
  // Asumimos que records trae datos de la última semana
  const uniqueDates = Array.from(new Set(records.map((r) => r.fecha))).sort();

  // 2. Obtener todas las áreas únicas
  const uniqueAreas = new Set<string>();
  records.forEach((r) => {
    const area = r.departamento || r.area || "Sin Área";
    uniqueAreas.add(area);
  });
  const areas = Array.from(uniqueAreas);

  // 3. Construir Series
  const tempSeries: { name: string; data: number[] }[] = [];

  areas.forEach((areaName) => {
    const dataPoints: number[] = [];
    uniqueDates.forEach((date) => {
      // Contar asistencias para este Área en esta Fecha
      const count = records.filter((r) => {
        const rArea = r.departamento || r.area || "Sin Área";
        const rDate = r.fecha;

        // Lógica de "Asistencia": Estado Puntual, Tardanza, o 'P', 'T'
        const estado = (r.estado || "").toLowerCase();
        const isPresent =
          estado.includes("puntual") ||
          estado.includes("asistencia") ||
          estado.includes("tardanza") ||
          estado === "p" ||
          estado === "t";

        return rArea === areaName && rDate === date && isPresent;
      }).length;

      dataPoints.push(count);
    });
    tempSeries.push({ name: areaName, data: dataPoints });
  });

  // Actualizar Chart
  series.value = tempSeries;

  // Actualizar Categorías (Fechas)
  // ApexCharts reactivo requiere actualizar options completo o referenciarlo si es computed
  // Al ser computed, dependemos de que detecte el cambio.
  // Pero xaxis.categories está dentro de options.
  // Vamos a forzar la actualización de options inyectando las categorías en el computed o ref.
  // La mejor forma con vue3-apexcharts es tener options como ref mutado o computed dependiente.
  // Modificaremos el computed para depender de un ref de categorias.
  categories.value = uniqueDates.map((d) => {
    // Formato DD MMM si es posible, o dejar YYYY-MM-DD
    try {
      const date = new Date(d + "T00:00:00"); // Asegurar interpretación local
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
      });
    } catch {
      return d;
    }
  });
};

const categories = ref<string[]>([]);

// Redefinimos el computed para que incluya categories.value
const chartOptionsWithCategories = computed<ApexOptions>(() => ({
  ...chartOptions.value,
  xaxis: {
    ...chartOptions.value.xaxis,
    categories: categories.value,
  },
  // Recalcular dashArray based on series length
  stroke: {
    width: 3,
    curve: "straight",
    dashArray: series.value.map((_, i) => (i === 0 ? 0 : i % 2 === 0 ? 8 : 5)),
  },
}));

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
