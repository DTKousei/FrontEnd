<template>
  <div class="calendar-wrapper">
    <!-- Cabecera del calendario con título y leyenda -->
    <div
      class="flex flex-wrap justify-content-between align-items-center mb-4 gap-3"
    >
      <div>
        <h3 class="text-xl font-bold text-900 m-0">Calendario de Feriados</h3>
        <p class="text-sm text-500 m-0 mt-1">
          Gestiona los días festivos y no laborables
        </p>
      </div>

      <!-- Acciones y Leyenda -->
      <div class="flex flex-column sm:flex-row gap-3 align-items-center">
        <!-- Botón Importar -->
        <button
          @click="importarFeriadosPeru"
          class="px-3 py-2 bg-indigo-600 text-white border-round border-none cursor-pointer hover:bg-indigo-700 transition-colors font-medium text-sm flex align-items-center gap-2"
        >
          <i class="pi pi-cloud-download"></i>
          Sincronizar Feriados Perú
        </button>

        <!-- Leyenda -->
        <div class="flex gap-3">
          <div class="flex align-items-center gap-2">
            <span class="w-1rem h-1rem border-circle bg-red-500 block"></span>
            <span class="text-sm">Feriado</span>
          </div>
          <div class="flex align-items-center gap-2">
            <span class="w-1rem h-1rem border-circle bg-blue-500 block"></span>
            <span class="text-sm">Día No Laborable</span>
          </div>
          <div class="flex align-items-center gap-2">
            <span
              class="w-1rem h-1rem border-circle bg-yellow-400 block"
            ></span>
            <span class="text-sm">Cumpleaños</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenedor del componente VCalendar -->
    <div class="calendar-card">
      <VCalendar
        expanded
        :attributes="attributes"
        @dayclick="onDayClick"
        transparent
        borderless
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { scheduleService } from "@/api/services/schedule.service";
import { userService } from "@/api/services/user.service";
import type { Holiday } from "@/api/types/schedules.types";
import type { BiometricUser } from "@/api/types/users.types";
import Swal from "sweetalert2";

// Estado reactivo para almacenar la lista de feriados y usuarios
const holidays = ref<Holiday[]>([]);
const users = ref<BiometricUser[]>([]);

/**
 * Carga la lista de feriados desde el backend
 */
const loadHolidays = async () => {
  try {
    const response = await scheduleService.getHolidays();
    // @ts-ignore
    holidays.value = response.data || [];
  } catch (error) {
    console.error("Error cargando feriados", error);
  }
};

/**
 * Carga la lista de empleados para obtener sus fechas de nacimiento
 */
const loadEmployees = async () => {
  try {
    const response = await userService.getAll({ limit: 1000, activo: true });

    // @ts-ignore - Handle 'results' property if it exists at runtime, otherwise use 'data'
    const list = response.data.data || response.data.results;

    if (Array.isArray(list)) {
      users.value = list;
    } else if (Array.isArray(response.data)) {
      // @ts-ignore
      users.value = response.data;
    }
  } catch (error) {
    console.error("Error cargando empleados para cumpleaños", error);
  }
};

/**
 * Calcula la fecha de Domingo de Ramos/Semana Santa para un año dado
 * Algoritmo de Gauss simplificado para computadoras
 */
const getEasterDate = (year: number) => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);

  // Mes y Día de Pascua
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; // 0-indexed (3=Abril, 2=Marzo)
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(year, month, day);
};

/**
 * Función para importar/sincronizar feriados de Perú automáticamente
 */
const importarFeriadosPeru = async () => {
  const result = await Swal.fire({
    title: "Sincronizar Feriados Perú",
    text: "Se agregarán los feriados nacionales estándar para el año actual si no existen. ¿Continuar?",
    icon: "info",
    showCancelButton: true,
    confirmButtonText: "Sí, Sincronizar",
    cancelButtonText: "Cancelar",
  });

  if (!result.isConfirmed) return;

  const currentYear = new Date().getFullYear();
  const fixedHolidays = [
    { d: "01-01", n: "Año Nuevo" },
    { d: "05-01", n: "Día del Trabajo" },
    { d: "06-29", n: "San Pedro y San Pablo" },
    { d: "07-28", n: "Fiestas Patrias" },
    { d: "07-29", n: "Fiestas Patrias" },
    { d: "08-06", n: "Batalla de Junín" },
    { d: "08-30", n: "Santa Rosa de Lima" },
    { d: "10-08", n: "Combate de Angamos" },
    { d: "11-01", n: "Todos los Santos" },
    { d: "12-08", n: "Inmaculada Concepción" },
    { d: "12-09", n: "Batalla de Ayacucho" },
    { d: "12-25", n: "Navidad" },
  ];

  // Calcular Jueves y Viernes Santo
  const easter = getEasterDate(currentYear);
  // Jueves Santo: -3 días desde Pascua (Domingo)
  const juevesSanto = new Date(easter);
  juevesSanto.setDate(easter.getDate() - 3);
  // Viernes Santo: -2 días desde Pascua
  const viernesSanto = new Date(easter);
  viernesSanto.setDate(easter.getDate() - 2);

  const movableHolidays = [
    { date: juevesSanto, n: "Jueves Santo" },
    { date: viernesSanto, n: "Viernes Santo" },
  ];

  let addedCount = 0;
  const errors = [];

  // Procesar Fijos
  for (const fh of fixedHolidays) {
    const fullDate = `${currentYear}-${fh.d}`; // YYYY-MM-DD
    if (!holidays.value.some((h) => h.fecha === fullDate)) {
      try {
        await scheduleService.createHoliday({
          fecha: fullDate,
          nombre: fh.n,
          tipo: "FERIADO",
          repetir_anual: true,
        });
        addedCount++;
      } catch (e) {
        errors.push(fh.n);
      }
    }
  }

  // Procesar Movibles (Semana Santa)
  for (const mh of movableHolidays) {
    const y = mh.date.getFullYear();
    const m = (mh.date.getMonth() + 1).toString().padStart(2, "0");
    const d = mh.date.getDate().toString().padStart(2, "0");
    const fullDate = `${y}-${m}-${d}`;

    if (!holidays.value.some((h) => h.fecha === fullDate)) {
      try {
        await scheduleService.createHoliday({
          fecha: fullDate,
          nombre: mh.n,
          tipo: "FERIADO",
          repetir_anual: false, // Estos cambian cada año
        });
        addedCount++;
      } catch (e) {
        errors.push(mh.n);
      }
    }
  }

  await loadHolidays();

  if (addedCount > 0) {
    Swal.fire(
      "Sincronizado",
      `Se agregaron ${addedCount} feriados nuevos.`,
      "success"
    );
  } else {
    Swal.fire("Información", "Los feriados ya están actualizados.", "info");
  }
};

/**
 * Computada que transforma los feriados en "atributos" para VCalendar.
 * Define el color, el modo de resaltado y los datos asociados a cada fecha.
 */
const attributes = computed(() => {
  // 1. Mapear Feriados (Highlights)
  const holidayAttrs = holidays.value.map((h) => ({
    key: h.id,
    highlight: {
      color: h.tipo?.toUpperCase() === "FERIADO" ? "red" : "blue",
      fillMode: "solid",
    },
    // Ajustar zona horaria añadiendo T00:00:00 para asegurar que la fecha sea correcta localmente
    dates: new Date(h.fecha + "T00:00:00"),
    popover: {
      label: h.nombre,
      visibility: "hover",
    },
    customData: h,
  }));

  // 2. Mapear Cumpleaños (Dots)
  const currentYear = new Date().getFullYear();
  // Mostrar cumpleaños del año actual y el siguiente
  const yearsToShow = [currentYear, currentYear + 1];

  const birthdayAttrs: any[] = [];

  users.value.forEach((user) => {
    if (user.fecha_nacimiento) {
      // Asumiendo formato YYYY-MM-DD
      const parts = user.fecha_nacimiento.split("-");
      if (parts.length === 3) {
        const month = parseInt(parts[1], 10) - 1; // 0-based
        const day = parseInt(parts[2], 10);

        yearsToShow.forEach((y) => {
          birthdayAttrs.push({
            key: `bday-${user.id}-${y}`,
            dot: {
              color: "yellow",
              class: "bg-yellow-400",
            },
            // Usar Date para el año específico
            dates: new Date(y, month, day),
            popover: {
              label: `🎉 Cumpleaños de ${user.nombre}`,
              visibility: "hover",
            },
            customData: { type: "birthday", user },
          });
        });
      }
    }
  });

  return [...holidayAttrs, ...birthdayAttrs];
});

/**
 * Manejador del evento clic en un día del calendario.
 * - Si el día es feriado: Abre modal gestión feriado.
 * - Si el día es cumpleaños (y no feriado): No hace nada especial, solo muestra el popover visual.
 * - Si el día está libre: Abre modal para crear un nuevo feriado.
 * @param day Objeto del día proporcionado por VCalendar (contiene id 'YYYY-MM-DD')
 */
const onDayClick = async (day: any) => {
  const dateStr = day.id; // Formato YYYY-MM-DD
  const existingHoliday = holidays.value.find((h) => h.fecha === dateStr);

  if (existingHoliday) {
    // === MODO EDICIÓN / ELIMINACIÓN ===
    const result = await Swal.fire({
      title: "Gestionar Día",
      html: `
        <div class="flex flex-column gap-2 text-center">
          <p class="font-bold text-xl text-900 m-0">${
            existingHoliday.nombre
          }</p>
          <p class="text-sm text-500 m-0">${existingHoliday.fecha}</p>
          <div class="mt-2 inline-flex justify-content-center">
            <span class="${
              existingHoliday.tipo?.toUpperCase() === "FERIADO"
                ? "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800"
            } p-2 border-round text-sm font-bold">
              ${
                existingHoliday.tipo?.toUpperCase() === "FERIADO"
                  ? "Feriado"
                  : "Día No Laborable"
              }
            </span>
          </div>
        </div>
      `,
      showDenyButton: true, // Botón para eliminar
      showCancelButton: true,
      confirmButtonText: "Cerrar",
      denyButtonText: "Eliminar",
      denyButtonColor: "#d33",
      confirmButtonColor: "#3085d6",
    });

    // Si el usuario hace clic en "Eliminar"
    if (result.isDenied) {
      try {
        await scheduleService.deleteHoliday(existingHoliday.id);
        Swal.fire(
          "Eliminado",
          "El día ha sido eliminado correctamente",
          "success"
        );
        loadHolidays(); // Recargar calendario
      } catch (e) {
        Swal.fire("Error", "No se pudo eliminar el día", "error");
      }
    }
  } else {
    // === MODO CREACIÓN ===
    // Verificar si es solo cumpleaños
    // Si el usuario hace clic para crear feriado sobre un cumpleaños, se permite.
    // El punto amarillo se mantendrá visualmente junto con el feriado si coinciden.

    const { value: formValues } = await Swal.fire({
      title:
        '<h3 class="text-xl font-bold text-900 m-0">Agregar Día Festivo</h3>',
      // Formulario con estilos PrimeFlex
      html: `
        <div class="flex flex-column gap-3 text-left p-2">
          
          <!-- Campo: Nombre -->
          <div class="flex flex-column gap-2">
            <label class="text-sm font-semibold text-700">Nombre del Feriado</label>
            <input id="swal-input-name" class="swal2-input m-0 w-full p-2 border-round border-1 border-300" placeholder="Ej. Año Nuevo">
          </div>

          <!-- Campo: Tipo de Día -->
          <div class="flex flex-column gap-2">
            <label class="text-sm font-semibold text-700">Tipo de Día</label>
            <select id="swal-input-type" class="swal2-select m-0 w-full p-2 border-round border-1 border-300">
              <option value="FERIADO">Feriado (Obligatorio)</option>
              <option value="NO_LABORABLE">Día No Laborable (Recuperable)</option>
            </select>
          </div>

          <!-- Campo: Repetir Anualmente -->
          <div class="flex align-items-center gap-3 surface-ground p-3 border-round border-1 border-200 mt-2">
            <input type="checkbox" id="swal-input-repeat" checked class="w-1rem h-1rem">
            <label for="swal-input-repeat" class="text-sm text-700 font-medium cursor-pointer select-none m-0">Repetir cada año</label>
          </div>

        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#6b7280",
      customClass: {
        popup: "border-round-xl shadow-4", // PrimeFlex shadows/border-radius
        confirmButton: "px-4 py-2 border-round",
        cancelButton: "px-4 py-2 border-round",
      },
      width: "400px",
      // Pre-confirmación para extraer valores del DOM del modal
      preConfirm: () => {
        return {
          nombre: (
            document.getElementById("swal-input-name") as HTMLInputElement
          ).value,
          tipo: (
            document.getElementById("swal-input-type") as HTMLSelectElement
          ).value,
          repetir: (
            document.getElementById("swal-input-repeat") as HTMLInputElement
          ).checked,
        };
      },
    });

    // Si se guardó el formulario
    if (formValues) {
      if (!formValues.nombre) {
        Swal.fire("Error", "El nombre es obligatorio", "warning");
        return;
      }

      try {
        await scheduleService.createHoliday({
          fecha: dateStr,
          nombre: formValues.nombre,
          tipo: formValues.tipo,
          repetir_anual: formValues.repetir,
        });
        Swal.fire("Guardado", "Feriado agregado correctamente", "success");
        loadHolidays(); // Recargar calendario
      } catch (e) {
        Swal.fire("Error", "No se pudo guardar el feriado", "error");
      }
    }
  }
};

onMounted(() => {
  loadHolidays();
  loadEmployees();
});
</script>

<style scoped>
.calendar-wrapper {
  background-color: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.calendar-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

/* Estilos personalizados para inputs dentro de SweetAlert */
:deep(.swal2-select) {
  width: 100%;
  margin: 0;
}
</style>
