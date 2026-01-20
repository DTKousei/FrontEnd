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

// Helper to get last 7 days labels and dates
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

// Process Data
const chartData = computed(() => {
  const days = getLast7Days();
  const dayLabels = days.map((d) =>
    d.toLocaleDateString("es-PE", { weekday: "short" }),
  ); // Lun, Mar...

  const dataPoints = days.map((day) => {
    // Find attendance for this day
    const dayStr = day.toISOString().split("T")[0]; // YYYY-MM-DD

    // Filter attendances for this day
    // Supports both old structure (timestamp) and new structure (fecha + entrada_real)
    const dailyAtt = props.attendances.find((a) => {
      // Check for 'fecha' (from daily report)
      if (a.fecha) {
        return a.fecha.startsWith(dayStr);
      }
      // Check for 'timestamp' (from raw attendance)
      if (a.timestamp) {
        return a.timestamp.startsWith(dayStr);
      }
      return false;
    });

    if (!dailyAtt) return null;

    let timeValue = null;

    // Case A: New structure (Daily Report)
    if (dailyAtt.fecha) {
      if (!dailyAtt.entrada_real) return null; // No entry time
      // entrada_real might be "08:05:00" or ISO. Assuming "HH:MM:SS" or ISO.
      // If it's just time "HH:MM:SS", we parse it.
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
    // Case B: Old structure (Raw Attendance)
    else if (dailyAtt.timestamp) {
      // If we have multiple raw records, find the earliest one for this day
      // But here we just found *one*. Ideally we should filter *all* matching for the day and sort.
      // Let's re-implement filter logical properly if raw list is passed.

      // RE-DO FILTER LOGIC for Raw List
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
    text: "", // Handled in template
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
    min: 7, // Start at 7:00 AM approximately
    max: 9, // End at 09:00 AM (or dynamic?)
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
