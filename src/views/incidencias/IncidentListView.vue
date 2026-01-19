<template>
  <div class="container">
    <!-- Sidebar -->
    <!-- Sidebar -->
    <AdminNavbar />

    <!-- Main Content -->
    <div class="main-content">
      <!-- Header -->
      <!-- Header -->
      <HeaderView />

      <!-- Page Content -->
      <div class="page-content">
        <div class="flex justify-content-between align-items-center mb-4">
          <h1 class="text-3xl font-bold text-blue-800 m-0">
            Gestión de Incidencias
          </h1>
          <Button
            label="Nuevo Tipo de Incidencia"
            icon="pi pi-plus"
            severity="secondary"
            @click="showModalType = true"
            outlined
          />
        </div>

        <!-- Estadísticas -->
        <div class="grid mb-4">
          <div class="col-12 md:col-3">
            <div
              class="card mb-0 flex align-items-center justify-content-between p-3 border-round shadow-1 bg-white"
            >
              <div>
                <span class="block text-blue-600 font-medium mb-1">Total</span>
                <div class="text-900 font-medium text-xl">
                  {{ computedStats.total }}
                </div>
              </div>
              <div
                class="flex align-items-center justify-content-center bg-blue-200 border-round"
                style="width: 2.5rem; height: 2.5rem"
              >
                <i class="pi pi-list text-blue-600 text-xl"></i>
              </div>
            </div>
          </div>
          <div class="col-12 md:col-3">
            <div
              class="card mb-0 flex align-items-center justify-content-between p-3 border-round shadow-1 bg-white"
            >
              <div>
                <span class="block text-orange-600 font-medium mb-1"
                  >Pendientes</span
                >
                <div class="text-900 font-medium text-xl">
                  {{ computedStats.pendientes }}
                </div>
              </div>
              <div
                class="flex align-items-center justify-content-center bg-orange-200 border-round"
                style="width: 2.5rem; height: 2.5rem"
              >
                <i class="pi pi-clock text-orange-600 text-xl"></i>
              </div>
            </div>
          </div>
          <div class="col-12 md:col-3">
            <div
              class="card mb-0 flex align-items-center justify-content-between p-3 border-round shadow-1 bg-white"
            >
              <div>
                <span class="block text-green-600 font-medium mb-1"
                  >Aprobadas</span
                >
                <div class="text-900 font-medium text-xl">
                  {{ computedStats.aprobadas }}
                </div>
              </div>
              <div
                class="flex align-items-center justify-content-center bg-green-200 border-round"
                style="width: 2.5rem; height: 2.5rem"
              >
                <i class="pi pi-check-circle text-green-600 text-xl"></i>
              </div>
            </div>
          </div>
          <div class="col-12 md:col-3">
            <div
              class="card mb-0 flex align-items-center justify-content-between p-3 border-round shadow-1 bg-white"
            >
              <div>
                <span class="block text-red-600 font-medium mb-1"
                  >Rechazadas</span
                >
                <div class="text-900 font-medium text-xl">
                  {{ computedStats.rechazadas }}
                </div>
              </div>
              <div
                class="flex align-items-center justify-content-center bg-red-200 border-round"
                style="width: 2.5rem; height: 2.5rem"
              >
                <i class="pi pi-times-circle text-red-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- FORMULARIO DE CREACIÓN (Inline) -->
        <div class="card mb-5 border-round incidencias-container">
          <h3 class="mb-3 text-blue-800">
            <i class="pi pi-plus-circle mr-2"></i>Registrar Nueva Incidencia
          </h3>
          <div class="formgrid grid">
            <div class="field col-12 md:col-6 lg:col-4">
              <label class="font-bold">Empleado</label>
              <Select
                v-model="form.empleado_id"
                :options="employees"
                optionLabel="nombre"
                optionValue="id"
                filter
                placeholder="Seleccionar Empleado"
                class="w-full"
                :loading="loadingEmployees"
              />
            </div>
            <div class="field col-12 md:col-6 lg:col-4">
              <label class="font-bold">Tipo de Incidencia</label>
              <Select
                v-model="form.tipo_incidencia"
                :options="incidentTypes"
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccionar Tipo"
                class="w-full"
                showClear
              />
            </div>
            <div class="field col-12 md:col-6 lg:col-4">
              <label class="font-bold">Estado Inicial</label>
              <Select
                v-model="form.estado_id"
                :options="incidentStates"
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccionar Estado"
                class="w-full"
              />
            </div>
            <div class="field col-12 md:col-6 lg:col-3">
              <label class="font-bold">Fecha Inicio</label>
              <DatePicker
                v-model="form.fecha_inicio"
                dateFormat="dd/mm/yy"
                showIcon
                class="w-full"
              />
            </div>
            <div class="field col-12 md:col-6 lg:col-3">
              <label class="font-bold">Fecha Fin</label>
              <DatePicker
                v-model="form.fecha_fin"
                dateFormat="dd/mm/yy"
                showIcon
                class="w-full"
              />
            </div>

            <div class="field col-12">
              <label class="font-bold">Descripción / Motivo</label>
              <Textarea
                v-model="form.descripcion"
                rows="2"
                class="w-full"
                placeholder="Detalle la incidencia..."
              />
            </div>

            <div class="field col-12 lg:col-6">
              <label class="font-bold">Adjuntar Evidencia</label>
              <FileUpload
                mode="basic"
                name="documento"
                accept="image/*,application/pdf"
                :maxFileSize="5000000"
                @select="handleFileUpload"
                chooseLabel="Seleccionar Archivo"
                class="bg-blue-700"
              />
            </div>
          </div>
          <div class="flex justify-content-end">
            <Button
              label="Guardar Incidencia"
              icon="pi pi-check"
              @click="handleSubmit"
              :loading="loadingSubmit"
            />
          </div>
        </div>

        <!-- Lista de Incidencias (Componente Tabla) -->
        <h2 class="mb-3 text-blue-800 font-bold">Historial de Incidencias</h2>
        <IncidenciaView
          :data="incidencias"
          :loading="loading"
          @approve="handleApprove"
          @reject="handleReject"
          @delete="handleDelete"
          @view="handleView"
        />
      </div>
    </div>
  </div>

  <ModalTipoIncidencia v-model:visible="showModalType" @save="loadMetadata" />
  <ModalIncidencia
    v-model="showModalDetail"
    :incidencia="selectedIncidencia"
    @approve="handleApprove"
    @reject="handleReject"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import Button from "primevue/button";
import Select from "primevue/select";
import DatePicker from "primevue/datepicker";
import Textarea from "primevue/textarea";
import FileUpload from "primevue/fileupload";
import Swal from "sweetalert2";

import ModalTipoIncidencia from "@/components/Modals/ModalTipoIncidencia.vue"; // Para Tipos
import ModalIncidencia from "@/components/Modals/ModalIncidencia.vue"; // Para Detalle
import IncidenciaView from "@/components/tables/IncidenciaView.vue";
import AdminNavbar from "@/components/Admin/NavbarView.vue";
import HeaderView from "@/components/header/HeaderView.vue";
import { incidentService } from "@/api/services/incident.service";
import { userService } from "@/api/services/user.service";
import type { BiometricUser } from "@/api/types/users.types";

// Estado de la aplicación
const showModalType = ref(false); // Controla la visibilidad del modal para crear tipos de incidencia
const showModalDetail = ref(false); // Controla la visibilidad del modal de detalle
const selectedIncidencia = ref<any>(null); // Almacena la incidencia seleccionada para ver detalles
const loading = ref(false); // Indicador de carga general (tabla)
const loadingSubmit = ref(false); // Indicador de carga al enviar formularios
const loadingEmployees = ref(false); // Indicador de carga de empleados

/**
 * Obtiene el nombre del usuario actual desde el almacenamiento local.
 * Se utiliza para registrar quién realiza acciones como aprobar.
 */
const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.nombre || user.nombres || "Administrador";
    }
  } catch (e) {
    console.error("Error leyendo usuario", e);
  }
  return "Administrador";
};

// Datos reactivos
const incidencias = ref<any[]>([]); // Lista principal de incidencias
const employees = ref<BiometricUser[]>([]); // Lista de empleados para el selector
const incidentTypes = ref<{ label: string; value: string }[]>([]); // Tipos de incidencia para el selector
const incidentStates = ref<{ label: string; value: string }[]>([]); // Estados posibles para el selector
const userMap = ref<Record<string, string>>({}); // Mapa para acceso rápido a nombres de empleados por ID

// Estado del Formulario de Creación
const form = ref({
  empleado_id: null as number | null,
  tipo_incidencia: null as string | null,
  fecha_inicio: null as Date | null,
  fecha_fin: null as Date | null,
  descripcion: "",
  estado_id: null as string | null,
  documento: null as File | null,
});

// --- CARGA DE DATOS ---

/**
 * Carga la lista de todos los empleados desde el servicio de usuarios.
 * Crea un mapa (userMap) para mostrar nombres rápidamente en la tabla.
 */
const loadUsers = async () => {
  try {
    loadingEmployees.value = true;
    const res = await userService.getAll();
    // @ts-ignore
    const users = res.data?.data || res.data || [];
    employees.value = users;

    // Crear mapa para nombres en la tabla
    users.forEach((u: any) => {
      if (u.user_id) userMap.value[String(u.user_id)] = u.nombre || "";
    });
  } catch (e) {
    console.error("Error cargando usuarios", e);
  } finally {
    loadingEmployees.value = false;
  }
};

/**
 * Carga metadatos necesarios: Tipos de Incidencia y Estados.
 * Se ejecuta al montar el componente.
 */
const loadMetadata = async () => {
  try {
    // Cargar Tipos de Incidencia Activos
    const typesRes = await incidentService.getAllTiposIncidencia({
      esta_activo: true,
    });
    // @ts-ignore
    const types = typesRes.data?.data || typesRes.data || [];
    incidentTypes.value = types.map((t: any) => ({
      label: t.nombre,
      value: t.id,
    }));

    // Cargar Estados
    const statesRes = await incidentService.getAllEstados();
    // @ts-ignore
    const states = statesRes.data?.data || statesRes.data || [];
    incidentStates.value = states.map((s: any) => ({
      label: s.nombre,
      value: s.id,
    }));

    // Establecer estado por defecto 'Pendiente' en el formulario
    const pending = states.find((s: any) =>
      s.nombre.toLowerCase().includes("pendiente"),
    );
    if (pending) form.value.estado_id = pending.id;
  } catch (e) {
    console.error("Error cargando metadatos", e);
  }
};

/**
 * Carga el historial completo de incidencias.
 * Mapea los IDs de empleados a sus nombres usando `userMap`.
 */
const loadIncidencias = async () => {
  try {
    loading.value = true;
    const response = await incidentService.getAllIncidencias();
    // @ts-ignore
    const data = response.data?.data || response.data || [];
    incidencias.value = data.map((inc: any) => ({
      ...inc,
      // Resolver nombre del empleado
      empleado_nombre: userMap.value[inc.empleado_id] || inc.empleado_id,
    }));
  } catch (error) {
    console.error("Error cargando incidencias", error);
  } finally {
    loading.value = false;
  }
};

// --- ESTADÍSTICAS COMPUTADAS ---

/**
 * Calcula estadísticas en tiempo real basadas en la lista de incidencias cargada.
 * Retorna contadores para: Total, Pendientes, Aprobadas y Rechazadas.
 */
const computedStats = computed(() => {
  const total = incidencias.value.length;
  const pendientes = incidencias.value.filter((i) =>
    i.estado?.nombre?.toLowerCase().includes("pendiente"),
  ).length;
  const aprobadas = incidencias.value.filter((i) =>
    i.estado?.nombre?.toLowerCase().includes("aprobado"),
  ).length;
  const rechazadas = incidencias.value.filter((i) =>
    i.estado?.nombre?.toLowerCase().includes("rechazado"),
  ).length;
  return { total, pendientes, aprobadas, rechazadas };
});

// --- ACCIONES DEL FORMULARIO ---

/**
 * Maneja la selección de archivos en el componente FileUpload.
 * Almacena el archivo seleccionado en el estado del formulario.
 */
const handleFileUpload = (event: any) => {
  form.value.documento = event.files[0];
};

/**
 * Envía el formulario para crear una nueva incidencia.
 * Realiza validaciones, formateo de fechas y llama al servicio.
 */
const handleSubmit = async () => {
  // Validación de campos obligatorios
  if (
    !form.value.empleado_id ||
    !form.value.tipo_incidencia ||
    !form.value.fecha_inicio ||
    !form.value.descripcion
  ) {
    Swal.fire("Incompleto", "Complete los campos obligatorios", "warning");
    return;
  }

  try {
    loadingSubmit.value = true;

    // Obtener DNI del empleado seleccionado
    const employee = employees.value.find(
      (e) => e.id === form.value.empleado_id,
    );
    const dni = employee?.user_id ? String(employee.user_id) : null;
    if (!dni) throw new Error("Empleado sin DNI");

    // Función auxiliar para formatear fecha a YYYY-MM-DD local
    const formatDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    // Construir payload para el API
    const payload = {
      empleado_id: dni,
      tipo_incidencia_id: form.value.tipo_incidencia!,
      fecha_inicio: formatDate(form.value.fecha_inicio!),
      fecha_fin: form.value.fecha_fin
        ? formatDate(form.value.fecha_fin)
        : formatDate(form.value.fecha_inicio!), // Si no hay fin, es el mismo día
      descripcion: form.value.descripcion,
      estado_id: form.value.estado_id || "",
      documento: form.value.documento || undefined,
    };

    // @ts-ignore
    await incidentService.createIncidencia(payload);
    Swal.fire("Registrado", "Incidencia creada existosamente", "success");

    // Limpiar formulario y recargar lista
    resetForm();
    await loadIncidencias();
  } catch (e: any) {
    console.error(e);
    const msg =
      e.response?.data?.message ||
      e.message ||
      "No se pudo crear la incidencia";
    Swal.fire("Error", msg, "error");
  } finally {
    loadingSubmit.value = false;
  }
};

/**
 * Reinicia el formulario a su estado inicial.
 */
const resetForm = () => {
  form.value.empleado_id = null;
  form.value.tipo_incidencia = null;
  form.value.fecha_inicio = null;
  form.value.fecha_fin = null;
  form.value.descripcion = "";
  form.value.documento = null;

  // Restablecer estado 'Pendiente' por defecto
  const pending = incidentStates.value.find((s: any) =>
    s.label.toLowerCase().includes("pendiente"),
  );
  if (pending) form.value.estado_id = pending.value;
};

// --- ACCIONES DE LA TABLA ---

/**
 * Maneja la aprobación de una incidencia.
 * Solicita confirmación y registra el nombre del usuario logueado.
 */
const handleApprove = async (data: any) => {
  try {
    const result = await Swal.fire({
      title: "¿Aprobar?",
      text: "La incidencia cambiará a estado Aprobado.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, Aprobar",
    });

    if (result.isConfirmed) {
      loading.value = true;
      const aprobadoPor = getCurrentUser();

      // 1. Registrar quién aprobó
      await incidentService.aprobarIncidencia(data.id, {
        aprobado_por: aprobadoPor,
      });

      // 2. Actualizar el estado a 'Aprobado' explícitamente
      const approvedState = incidentStates.value.find((s) =>
        s.label.toLowerCase().includes("aprob"),
      );
      if (approvedState) {
        await incidentService.updateIncidencia(data.id, {
          estado_id: approvedState.value,
        });
      }

      Swal.fire("Aprobado", `Aprobado por: ${aprobadoPor}`, "success");
      await loadIncidencias();
    }
  } catch (e) {
    console.error(e);
    Swal.fire("Error", "Falló la aprobación", "error");
  } finally {
    loading.value = false;
  }
};

/**
 * Maneja el rechazo de una incidencia.
 * Solicita un motivo de rechazo obligatorio.
 */
const handleReject = async (data: any) => {
  try {
    const { value: motivo } = await Swal.fire({
      title: "Rechazar",
      input: "textarea",
      inputLabel: "Motivo del rechazo",
      showCancelButton: true,
      confirmButtonText: "Rechazar",
      inputValidator: (v) => (!v ? "Debe escribir un motivo" : null),
    });

    if (motivo) {
      loading.value = true;

      // 1. Registrar el motivo de rechazo
      await incidentService.rechazarIncidencia(data.id, {
        motivo_rechazo: motivo,
      });

      // 2. Actualizar el estado a 'Rechazado' explícitamente
      const rejectedState = incidentStates.value.find((s) =>
        s.label.toLowerCase().includes("rechaz"),
      );
      if (rejectedState) {
        await incidentService.updateIncidencia(data.id, {
          estado_id: rejectedState.value,
        });
      }

      Swal.fire("Rechazado", "La incidencia ha sido rechazada.", "success");
      await loadIncidencias();
    }
  } catch (e) {
    console.error(e);
    Swal.fire("Error", "Falló el rechazo", "error");
  } finally {
    loading.value = false;
  }
};

/**
 * Maneja la eliminación física de una incidencia.
 * Acción irreversible.
 */
const handleDelete = async (data: any) => {
  try {
    const result = await Swal.fire({
      title: "¿Eliminar?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Eliminar",
    });

    if (result.isConfirmed) {
      loading.value = true;
      await incidentService.deleteIncidencia(data.id);
      Swal.fire("Eliminado", "La incidencia ha sido eliminada.", "success");
      await loadIncidencias();
    }
  } catch (e) {
    Swal.fire("Error", "Falló la eliminación", "error");
  } finally {
    loading.value = false;
  }
};

/**
 * Abre el modal de detalle para visualizar la incidencia seleccionada.
 */
const handleView = (data: any) => {
  selectedIncidencia.value = data;
  showModalDetail.value = true;
};

// Cerrar sesión

// Inicialización
onMounted(async () => {
  await loadUsers();
  await loadMetadata();
  await loadIncidencias();
});
</script>

<style scoped>
:root {
  --primary: #2c5aa0;
  --secondary: #3498db;
}

.container {
  display: flex;
  min-height: 100vh;
}

/* Sidebar (Common Layout) */
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

.nav-links a {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  color: white;
  text-decoration: none;
}
.nav-links a:hover,
.nav-links a.active {
  background-color: rgba(255, 255, 255, 0.1);
  border-left: 4px solid var(--secondary);
}
.nav-links i {
  margin-right: 10px;
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

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
  gap: 10px;
}
.user-info img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.page-content {
  padding: 30px;
}
.logout-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: #7f8c8d;
}

.incidencias-container {
  background-color: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}
</style>
