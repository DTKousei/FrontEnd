<template>
  <div class="container">
    <!-- Barra Lateral (Sidebar) -->

    <AdminNavbar />

    <!-- Contenido Principal -->
    <div class="main-content">
      <!-- Encabezado (Header) -->
      <HeaderView />

      <!-- Contenido del Dashboard -->
      <div class="dashboard-content">
        <h1 class="page-title">Dashboard de Asistencia</h1>

        <!-- Tarjetas de Resumen (Cards) -->
        <div class="cards">
          <div class="card">
            <div class="card-header">
              <div class="card-title">Personal Presente</div>
              <div class="card-icon present">
                <i class="fas fa-user-check"></i>
              </div>
            </div>
            <div class="card-value">{{ totalPresent }}</div>
            <div class="card-footer">Hoy</div>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="card-title">Personal Ausente</div>
              <div class="card-icon absent">
                <i class="fas fa-user-times"></i>
              </div>
            </div>
            <div class="card-value">{{ totalAbsent }}</div>
            <div class="card-footer">Hoy</div>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="card-title">Tardanzas</div>
              <div class="card-icon late">
                <i class="fas fa-clock"></i>
              </div>
            </div>
            <div class="card-value">{{ totalLate }}</div>
            <div class="card-footer">Hoy</div>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="card-title">Total Personal</div>
              <div class="card-icon total">
                <i class="fas fa-users"></i>
              </div>
            </div>
            <div class="card-value">{{ totalPersonnel }}</div>
            <div class="card-footer">Activos</div>
          </div>
        </div>

        <!-- Gráficos y Tablas -->
        <div class="dashboard-row">
          <div class="chart-container">
            <div
              class="flex justify-content-between align-items-center mb-3 flex-wrap gap-2"
              style="
                display: flex;
                justify-content: space-between;
                align-items: center;
              "
            >
              <h3 class="chart-title m-0">Asistencia Semanal por Área</h3>
              <div class="flex align-items-center gap-2">
                <span class="text-gray-600 mr-2 font-semibold">{{
                  dateRangeText
                }}</span>
                <DatePicker
                  v-model="selectedChartDate"
                  showIcon
                  dateFormat="dd/mm/yy"
                  placeholder="Seleccionar semana"
                />
              </div>
            </div>
            <div id="attendance-chart">
              <LineaAsisView :data="chartData" />
            </div>
          </div>

          <div class="table-container">
            <h3 class="table-title">Incidencias Recientes</h3>
            <InsiRecView />
          </div>
        </div>

        <div class="dashboard-row">
          <div class="table-container">
            <h3 class="table-title">Registro de Asistencia de Hoy</h3>
            <AsisRecView />
          </div>

          <div class="chart-container">
            <!-- Gráfico Circular Hoy -->
            <div class="dashboard-row">
              <div
                class="chart-container"
                style="
                  width: 100%;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                "
              >
                <h3 class="chart-title mb-3">Asistencia Hoy por Área</h3>
                <PieAsisView :series="pieSeries" :labels="pieLabels" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import AdminNavbar from "@/components/Admin/NavbarView.vue";
import HeaderView from "@/components/header/HeaderView.vue";

import { attendanceService } from "@/api/services/attendance.service";
import { userService } from "@/api/services/user.service";
import { DepartmentService } from "@/api/services/department.service";
import InsiRecView from "@/components/tables/InsiRecView.vue";
import AsisRecView from "@/components/tables/AsisRecView.vue";
import LineaAsisView from "@/components/Graficas/LineaAsisView.vue";
import DatePicker from "primevue/datepicker";
import PieAsisView from "@/components/Graficas/PieAsisView.vue";

const totalPresent = ref(0);
const totalAbsent = ref(0);
const totalLate = ref(0);
const totalPersonnel = ref(0);
const chartData = ref([]);
const pieSeries = ref<number[]>([]);
const pieLabels = ref<string[]>([]);
const selectedChartDate = ref(new Date());

// Computed para mostrar el rango seleccionado
const dateRangeText = computed(() => {
  const { start, end } = getWeekRange(selectedChartDate.value);
  return `${start.toLocaleDateString("es-ES")} - ${end.toLocaleDateString(
    "es-ES"
  )}`;
});

const getWeekRange = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  // Ajustar para que el 0 sea Domingo, pero queremos Lunes (1) como inicio.
  // diff: si es lunes (1) -> 1 - 1 = 0. si es domingo (0) -> 0 - 1 = -1 (lo cual iría al lunes pasado? no, domingo suele ser final o inicio).
  // Asumiremos Domingo es el día 0. Queremos el Lunes PREVIO o el mismo si es Lunes.
  // Si day es 0 (domingo), diff = -6 (lunes pasado).
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);

  const start = new Date(d.setDate(diff));
  const end = new Date(d);
  end.setDate(start.getDate() + 4); // Viernes (+4 días desde Lunes)

  return { start, end };
};

const fetchDashboardStats = async () => {
  try {
    const today = new Date();
    const fToday = today.toLocaleDateString("en-CA");

    // 1. Asegurar cálculo de asistencia para hoy
    try {
      await attendanceService.calculateAttendance({
        fecha_inicio: fToday,
        fecha_fin: fToday,
      });
    } catch (err) {
      console.warn("Auto-calculation for today failed or already done:", err);
    }

    // 2. Fetch de Datos (Reporte Hoy, Usuarios, Depts)
    const [reportRes, usersRes, deptRes] = await Promise.all([
      attendanceService.getDailyReport({
        fecha_inicio: fToday,
        fecha_fin: fToday,
      }),
      userService.getAll(),
      DepartmentService.getAll(),
    ]);

    // 3. Procesar Usuarios y Depts map
    let usersList: any[] = [];
    if (usersRes.data) {
      // @ts-ignore
      usersList = Array.isArray(usersRes.data.data)
        ? usersRes.data.data
        : Array.isArray(usersRes.data)
        ? usersRes.data
        : [];
    }
    totalPersonnel.value = usersList.length;

    const deptMap = new Map<number, string>();
    const safeDeptRes = deptRes as any;
    if (safeDeptRes.data) {
      // @ts-ignore
      const depts = Array.isArray(safeDeptRes.data)
        ? safeDeptRes.data
        : safeDeptRes.data.data || [];
      depts.forEach((d: any) => {
        if (d.id && d.nombre) deptMap.set(d.id, d.nombre);
      });
    }

    // 4. Procesar Registros
    const records = reportRes.data || [];

    let p = 0; // Puntual
    let l = 0; // Tarde
    let a = 0; // Falta
    const areaCounts = new Map<string, number>();

    records.forEach((rec: any) => {
      // Identificar Área
      const user = usersList.find(
        (u: any) => String(u.user_id) === String(rec.user_id)
      );
      let deptName = "Sin Área";
      if (user) {
        if (user.departamento_id && deptMap.has(user.departamento_id)) {
          deptName = deptMap.get(user.departamento_id)!;
        } else if (
          user.departamento &&
          typeof user.departamento === "object" &&
          user.departamento.nombre
        ) {
          deptName = user.departamento.nombre;
        } else if (typeof user.departamento === "string") {
          deptName = user.departamento;
        } else if (user.area) {
          deptName = user.area;
        }
      }

      // Identificar Estado
      const estado = (rec.estado_asistencia || rec.estado || "").toLowerCase();

      let isPresent = false;

      if (
        estado === "presente" ||
        estado === "asistencia" ||
        estado === "puntual"
      ) {
        p++;
        isPresent = true;
      } else if (estado === "tardanza" || estado === "tarde") {
        l++;
        isPresent = true;
      } else if (estado === "falta" || estado === "ausente") {
        a++;
      }

      // Pie Chart: Conteo por Área (Solo presentes/tardanzas)
      if (isPresent && deptName !== "Sin Área") {
        areaCounts.set(deptName, (areaCounts.get(deptName) || 0) + 1);
      }
    });

    // Actualizar Refs Cards
    totalPresent.value = p + l;
    totalLate.value = l;
    totalAbsent.value = a;

    // Actualizar Pie Chart
    pieLabels.value = Array.from(areaCounts.keys());
    pieSeries.value = Array.from(areaCounts.values());
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
  }
};

const fetchChartStats = async () => {
  try {
    const { start, end } = getWeekRange(selectedChartDate.value);

    // Formato YYYY-MM-DD para API
    const fStart = start.toLocaleDateString("en-CA");
    const fEnd = end.toLocaleDateString("en-CA");

    // Fetch en paralelo: Reportes, Usuarios y Departamentos
    console.log(`[Chart Debug] Selected Date: ${selectedChartDate.value}`);
    console.log(`[Chart Debug] Range: ${fStart} to ${fEnd}`);

    // Asegurar cálculo de asistencia antes de pedir reporte
    try {
      await attendanceService.calculateAttendance({
        fecha_inicio: fStart,
        fecha_fin: fEnd,
      });
    } catch (err) {
      console.warn("Error calculating attendance range:", err);
    }

    const [reportRes, usersRes, deptRes] = await Promise.all([
      attendanceService.getDailyReport({
        fecha_inicio: fStart,
        fecha_fin: fEnd,
      }),
      userService.getAll(),
      DepartmentService.getAll(),
    ]);

    const rawRecords = reportRes.data || [];
    console.log(`[Chart Debug] Records found: ${rawRecords.length}`);

    let usersList: any[] = [];
    if (usersRes.data) {
      // @ts-ignore
      usersList = Array.isArray(usersRes.data.data)
        ? usersRes.data.data
        : Array.isArray(usersRes.data)
        ? usersRes.data
        : [];
    }

    // Crear mapa de departamentos
    const deptMap = new Map<number, string>();
    const safeDeptRes = deptRes as any;
    if (safeDeptRes.data) {
      // @ts-ignore
      const depts = Array.isArray(safeDeptRes.data)
        ? safeDeptRes.data
        : safeDeptRes.data.data || [];
      depts.forEach((d: any) => {
        if (d.id && d.nombre) deptMap.set(d.id, d.nombre);
      });
    }

    // Mapear registros con el departamento del usuario
    // @ts-ignore
    chartData.value = rawRecords.map((rec: any) => {
      const user = usersList.find(
        (u: any) => String(u.user_id) === String(rec.user_id)
      );

      let deptName = "Sin Área";
      if (user) {
        // Prioridad 1: ID de departamento macheado con lista de departamentos
        if (user.departamento_id && deptMap.has(user.departamento_id)) {
          deptName = deptMap.get(user.departamento_id)!;
        }
        // Prioridad 2: Objeto departamento anidado
        else if (
          user.departamento &&
          typeof user.departamento === "object" &&
          user.departamento.nombre
        ) {
          deptName = user.departamento.nombre;
        }
        // Prioridad 3: String directo
        else if (typeof user.departamento === "string") {
          deptName = user.departamento;
        }
        // Prioridad 4: Propiedad 'area'
        else if (user.area) {
          deptName = user.area;
        }
      }

      return {
        ...rec,
        departamento: deptName,
      };
    });
  } catch (error) {
    console.error("Error fetching chart stats:", error);
  }
};

watch(selectedChartDate, () => {
  fetchChartStats();
});

onMounted(() => {
  fetchDashboardStats();
  fetchChartStats();
});
</script>

<style>
:root {
  --primary: #2c5aa0;
  --secondary: #3498db;
  --success: #27ae60;
  --warning: #f39c12;
  --danger: #e74c3c;
  --light: #ecf0f1;
  --dark: #34495e;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

body {
  background-color: #f5f7fa;
  color: #333;
}

.container {
  display: flex;
  min-height: 100vh;
}

/* Sidebar */
.sidebar {
  width: 250px;
  background-color: var(--primary);
  color: white;
  transition: all 0.3s;
}

.logo {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo h2 {
  font-size: 1.5rem;
}

.nav-links {
  padding: 20px 0;
}

.nav-links li {
  list-style: none;
}

.nav-links a {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  color: white;
  text-decoration: none;
  transition: all 0.3s;
}

.nav-links a:hover,
.nav-links a.active {
  background-color: rgba(255, 255, 255, 0.1);
  border-left: 4px solid var(--secondary);
}

.nav-links i {
  margin-right: 10px;
  font-size: 1.2rem;
}

/* btn logout */
.logout-btn {
  margin-left: auto; /* Empuja el botón hacia la derecha */
  background: transparent;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 5px;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-btn svg {
  width: 20px;
  height: 20px;
}

.logout-btn:hover {
  background-color: #fee2e2; /* Un fondo rojo suave al pasar el mouse */
  color: #ef4444; /* Icono rojo */
}
/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Header */
.header {
  background-color: white;
  padding: 15px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
}

.user-info img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

/* Dashboard Content */
.dashboard-content {
  padding: 30px;
  flex: 1;
}

.page-title {
  margin-bottom: 20px;
  color: var(--primary);
}

/* Cards */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.card-title {
  font-size: 1rem;
  color: var(--dark);
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.card-icon.present {
  background-color: var(--success);
}

.card-icon.absent {
  background-color: var(--danger);
}

.card-icon.late {
  background-color: var(--warning);
}

.card-icon.total {
  background-color: var(--secondary);
}

.card-value {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.card-footer {
  font-size: 0.8rem;
  color: #7f8c8d;
}

/* Charts and Tables */
.dashboard-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.chart-container,
.table-container {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.chart-title,
.table-title {
  margin-bottom: 15px;
  color: var(--primary);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.status {
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-present {
  background-color: #e8f5e9;
  color: var(--success);
}

.status-absent {
  background-color: #ffebee;
  color: var(--danger);
}

.status-late {
  background-color: #fff8e1;
  color: var(--warning);
}

/* Responsive */
@media (max-width: 992px) {
  .dashboard-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
  }

  .nav-links {
    display: flex;
    overflow-x: auto;
  }

  .nav-links li {
    flex: 0 0 auto;
  }

  .nav-links a {
    padding: 15px;
  }
}
</style>
