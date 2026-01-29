<template>
  <div class="chart-wrapper">
    <!-- El título se maneja dentro del gráfico, pero podríamos tener un header externo si se prefiere -->
    <div class="chart-header">
      <!-- <h3>Asistencia por Área</h3> -->
    </div>
    <div id="chart-area-bar">
      <apexchart
        type="bar"
        height="350"
        :options="chartOptions"
        :series="series"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { ApexOptions } from "apexcharts";

interface DataRecord {
  estado?: string;
  departamento?: string | { nombre: string; [key: string]: any };
  area?: string;
  [key: string]: any;
}

const props = defineProps<{
  data: DataRecord[];
}>();

// Series ahora será un array de objetos para gráfico de barras
const series = ref<{ name: string; data: number[] }[]>([]);
const labels = ref<string[]>([]); // Categorías (Nombres de Áreas)

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: "bar", // Cambiado a Barra
    height: 350,
    fontFamily: "Segoe UI, sans-serif",
    toolbar: {
      show: false,
    },
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      horizontal: true, // Barras horizontales
      distributed: true, // Colores distintos por barra
      dataLabels: {
        position: "bottom",
      },
    },
  },
  colors: [
    "#2E93fA",
    "#66DA26",
    "#546E7A",
    "#E91E63",
    "#FF9800",
    "#1ABC9C",
    "#9B59B6",
    "#34495E",
    "#F1C40F",
    "#E74C3C",
  ], // Paleta variada
  dataLabels: {
    enabled: true,
    textAnchor: "start",
    style: {
      colors: ["#fff"],
    },
    formatter: function (val: number, opt: any) {
      return opt.w.globals.labels[opt.dataPointIndex] + ":  " + val;
    },
    offsetX: 0,
    dropShadow: {
      enabled: true,
    },
  },
  stroke: {
    width: 1,
    colors: ["#fff"],
  },
  xaxis: {
    categories: labels.value,
    labels: {
      style: {
        fontSize: "12px",
      },
    },
  },
  yaxis: {
    labels: {
      show: false,
    },
  },
  tooltip: {
    theme: "light",
    y: {
      formatter: function (val: number) {
        return val + " empleados";
      },
    },
  },
  title: {
    align: "left",
    style: {
      fontSize: "16px",
      fontWeight: "bold",
      color: "#263238",
    },
  },
  legend: {
    show: false,
  },
}));

const processData = (records: DataRecord[]) => {
  const deptCounts: Record<string, number> = {};

  records.forEach((record) => {
    // 3. Obtener nombre del departamento de forma robusta
    let deptName = "Otros";
    if (record.departamento && typeof record.departamento === "object") {
      deptName = (record.departamento as any).nombre || "Otros";
    } else if (typeof record.departamento === "string") {
      deptName = record.departamento;
    } else if (record.area) {
      deptName = record.area;
    }

    // Normalizar nombre
    deptName = deptName.trim();
    if (!deptName || deptName === "-") deptName = "Sin Asignar";

    if (!deptCounts[deptName]) deptCounts[deptName] = 0;
    deptCounts[deptName]++;
  });

  // Convertir a arrays para ApexCharts
  const keys = Object.keys(deptCounts);
  const values = Object.values(deptCounts);

  labels.value = keys;
  series.value = [
    {
      name: "Empleados",
      data: values,
    },
  ];
};

watch(
  () => props.data,
  (newData) => {
    processData(newData);
  },
  { deep: true, immediate: true },
);
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  padding: 10px;
  background: #fff;
  border-radius: 8px;
  /* box-shadow opcional si no lo tiene el contenedor padre */
}
</style>
