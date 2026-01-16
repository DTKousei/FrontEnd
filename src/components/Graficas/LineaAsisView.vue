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
  estado?: string;
  estado_asistencia?: string; // Campo correcto del backend
  departamento: string;
  area?: string;
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
    width: [5, 7, 5], // Grosores variados como en el demo
    curve: "straight",
    dashArray: [0, 8, 5], // Solido, Dashed Largo, Dashed Corto
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
    position: "bottom", // Leyenda abajo
    horizontalAlign: "center",
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
    size: 0, // Clean look
    hover: {
      sizeOffset: 6,
    },
  },
  xaxis: {
    categories: [],
    title: {
      text: "Día", // Cambiar label a Día
    },
    labels: {
      style: {
        fontSize: "12px",
      },
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
  colors: ["#007bff", "#28a745", "#ffc107", "#dc3545", "#17a2b8"], // Azul, Verde, Amarillo, Rojo,
}));

const processData = (records: AttendanceRecord[]) => {
  if (!records || records.length === 0) {
    series.value = [];
    return;
  }

  // 1. Obtener todas las fechas únicas y ordenarlas
  // Esto definirá nuestras categorías en el Eje X
  const uniqueDates = Array.from(new Set(records.map((r) => r.fecha))).sort();

  // 2. Obtener todas las áreas únicas presentes en los registros
  const uniqueAreas = Array.from(
    new Set(records.map((r) => r.departamento || "Sin Área"))
  )
    .filter((area) => area !== "Sin Área")
    .sort();

  // 3. Construir Series: Una por cada Área
  const tempSeries: { name: string; data: number[] }[] = [];

  uniqueAreas.forEach((areaName) => {
    // Para este área, generamos un array de conteos alineado con uniqueDates
    const dataPoints = uniqueDates.map((date) => {
      // Filtramos registros que coincidan con Área y Fecha
      const dailyRecords = records.filter((r) => {
        const rArea = r.departamento || "Sin Área";
        return r.fecha === date && rArea === areaName;
      });

      // Contamos validos
      const validCount = dailyRecords.reduce((acc, r) => {
        const estado = (r.estado_asistencia || r.estado || "").toLowerCase();
        const isPresent =
          estado === "presente" ||
          estado === "asistencia" ||
          estado === "tardanza" ||
          estado === "tarde" ||
          estado.includes("presente") ||
          estado.includes("tard");

        return acc + (isPresent ? 1 : 0);
      }, 0);

      return validCount;
    });

    tempSeries.push({ name: areaName, data: dataPoints });
  });

  // 4. Actualizar Series
  series.value = tempSeries;

  // 5. Actualizar Categorías (Nombres de Días)
  categories.value = uniqueDates.map((d) => {
    if (!d) return "";
    try {
      const parts = d.split("-");
      if (parts.length === 3) {
        const date = new Date(
          parseInt(parts[0]),
          parseInt(parts[1]) - 1,
          parseInt(parts[2])
        );
        const dayName = date.toLocaleDateString("es-ES", { weekday: "long" });
        return dayName.charAt(0).toUpperCase() + dayName.slice(1);
      }
      return d;
    } catch {
      return d;
    }
  });
};

const categories = ref<string[]>([]);

// Redefinimos el computed para que incluya categories.value y opciones dinámicas basadas en series
const chartOptionsWithCategories = computed<ApexOptions>(() => {
  const seriesCount = series.value.length;

  // Patrones del demo
  const widthPattern = [5, 7, 5];
  const dashPattern = [0, 8, 5];

  // Generar arrays repetidos para cubrir todas las series
  const widths = Array.from(
    { length: seriesCount },
    (_, i) => widthPattern[i % widthPattern.length]
  );
  const dashes = Array.from(
    { length: seriesCount },
    (_, i) => dashPattern[i % dashPattern.length]
  );

  return {
    ...chartOptions.value,
    xaxis: {
      ...chartOptions.value.xaxis,
      categories: categories.value,
    },
    stroke: {
      curve: "straight",
      width: widths,
      dashArray: dashes,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " asistentes";
        },
      },
    },
  };
});

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
