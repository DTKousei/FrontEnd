<template>
  <div class="line-chart-wrapper">
    <div class="chart-header">
      <h3>Mi Asistencia - Últimos 7 Días</h3>
    </div>
    <apexchart
      type="line"
      height="350"
      :options="chartOptions"
      :series="series"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ApexOptions } from "apexcharts";

const props = defineProps<{
  attendances: any[];
}>();

// Helper para obtener las etiquetas y fechas de los últimos 7 días
const getLast7Days = () => {
  const days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }
  return days;
};

// Procesar Datos para el gráfico
const chartData = computed(() => {
  const days = getLast7Days();
  const dayLabels = days.map((d) =>
    d.toLocaleDateString("es-PE", { weekday: "short" }),
  ); // Lun, Mar...

  const dataPoints = days.map((day) => {
    // Encontrar la asistencia para este día específico
    const dayStr = day.toISOString().split("T")[0]; // Formato YYYY-MM-DD

    // Filtrar asistencias para este día
    // Soporta tanto la estructura antigua (timestamp) como la nueva (fecha + entrada_real)
    const dailyAtt = props.attendances.find((a) => {
      // Verificar 'fecha' (desde el reporte diario procesado)
      if (a.fecha) {
        return a.fecha.startsWith(dayStr);
      }
      // Verificar 'timestamp' (desde datos crudos de asistencia)
      if (a.timestamp) {
        return a.timestamp.startsWith(dayStr);
      }
      return false;
    });

    if (!dailyAtt) return null;

    let timeValue = null;

    // Caso A: Nueva estructura (Reporte Diario)
    if (dailyAtt.fecha) {
      if (!dailyAtt.entrada_real) return null; // Sin hora de entrada registrada
      // entrada_real puede ser "08:05:00" o formato ISO. Asumimos "HH:MM:SS" o ISO.
      // Si es solo hora "HH:MM:SS", la parseamos manualmente.
      const timeStr = String(dailyAtt.entrada_real);
      if (timeStr.includes("T")) {
        // ISO
        const d = new Date(timeStr);
        timeValue = d.getHours() + d.getMinutes() / 60;
      } else if (timeStr.includes(":")) {
        // HH:MM:SS
        const [h, m] = timeStr.split(":").map(Number);
        timeValue = h + m / 60;
      }
    }
    // Caso B: Estructura antigua (Asistencia Cruda)
    else if (dailyAtt.timestamp) {
      // Si tenemos múltiples registros crudos, encontramos el más temprano para este día.
      // Aquí re-implementamos la lógica de filtrado correctamente si se pasa una lista cruda.

      // REHACER LÓGICA DE FILTRADO para Lista Cruda
      const allForDay = props.attendances.filter(
        (a) => a.timestamp && a.timestamp.startsWith(dayStr),
      );
      if (allForDay.length > 0) {
        allForDay.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        );
        const first = allForDay[0];
        const d = new Date(first.timestamp);
        timeValue = d.getHours() + d.getMinutes() / 60;
      }
    }

    return timeValue;
  });

  return { labels: dayLabels, data: dataPoints };
});

const series = computed(() => [
  {
    name: "Hora de Entrada",
    data: chartData.value.data,
  },
]);

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: "line",
    height: 350,
    zoom: { enabled: false },
    toolbar: { show: false },
    fontFamily: "Segoe UI, sans-serif",
  },
  colors: ["#3498db"],
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: "smooth",
    width: 3,
  },
  title: {
    text: "", // Manejado en el template HTML
    align: "left",
  },
  grid: {
    row: {
      colors: ["#f3f3f3", "transparent"],
      opacity: 0.5,
    },
  },
  markers: {
    size: 5,
    colors: ["#3498db"],
    strokeColors: "#fff",
    strokeWidth: 2,
    hover: {
      size: 7,
    },
  },
  xaxis: {
    categories: chartData.value.labels,
    labels: {
      style: {
        fontSize: "12px",
      },
    },
  },
  yaxis: {
    min: 7, // Comienza el eje Y a las 7:00 AM aproximadamente
    max: 9, // Termina a las 09:00 AM (¿o dinámico?)
    labels: {
      formatter: (value) => {
        if (value === null) return "";
        const h = Math.floor(value);
        const m = Math.round((value - h) * 60);
        const mStr = m < 10 ? "0" + m : m;
        return `${h}:${mStr}`;
      },
    },
    title: {
      text: "Hora",
    },
  },
  tooltip: {
    y: {
      formatter: function (val) {
        if (typeof val !== "number") return val;
        const h = Math.floor(val);
        const m = Math.round((val - h) * 60);
        const mStr = m < 10 ? "0" + m : m;
        const suffix = h >= 12 ? "PM" : "AM";
        const h12 = h > 12 ? h - 12 : h;
        return `${h12}:${mStr} ${suffix}`;
      },
    },
  },
  annotations: {
    yaxis: [
      {
        y: 8.0, // 8:00 AM
        borderColor: "#27ae60",
        label: {
          borderColor: "#27ae60",
          style: {
            color: "#fff",
            background: "#27ae60",
          },
          text: "Hora ideal: 8:00 AM",
        },
      },
    ],
  },
}));
</script>

<style scoped>
.line-chart-wrapper {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}
.chart-header h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
  font-weight: 600;
}
</style>
