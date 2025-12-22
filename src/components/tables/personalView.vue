<script setup lang="ts">
import { ref, onMounted } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { userService } from "@/api/services/user.service";
import { authService } from "@/api/services/auth.service";
import type { BiometricUser } from "@/api/types/users.types";
import type { User as AuthUser } from "@/api/types/auth.types";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import Tag from "primevue/tag";
import Avatar from "primevue/avatar";
import Swal from "sweetalert2";

interface ExtendedUser extends BiometricUser {
  rol?: string;
  estado?: string;
  initials?: string;
  auth_id?: string;
  esta_activo?: boolean;
  raw_created_at?: Date;
}

const emit = defineEmits(["edit-user", "update-stats"]);

const users = ref<ExtendedUser[]>([]);
const loading = ref(true);
const filters = ref<any>({
  global: { value: null, matchMode: "contains" },
});

const getInitials = (name: string) => {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

const getSeverity = (status: string) => {
  switch (status) {
    case "Activo":
      return "success";
    case "Inactivo":
      return "danger";
    case "Pendiente":
      return "warn";
    default:
      return "info";
  }
};

const getRoleSeverity = (role: string) => {
  // Determina el color de la etiqueta (badge) basándose en el rol del usuario
  // Utilizado para visualización rápida de jerarquías en la interfaz
  switch (role?.toUpperCase()) {
    case "ADMINISTRADOR":
    case "ADMIN":
      return "info";
    case "SUPERVISOR":
      return "warn";
    case "EMPLEADO":
      return "success";
    default:
      return "secondary";
  }
};

const loadUsers = async () => {
  try {
    loading.value = true;

    // Ejecución paralela de solicitudes para optimizar el rendimiento.
    // Utilizamos Promise.allSettled para garantizar que la falla de un servicio
    // no bloquee la carga de datos del otro, permitiendo una degradación elegante.
    const results = await Promise.allSettled([
      userService.getAll(),
      authService.getAllUsers(),
    ]);

    const biometricResult = results[0];
    const authResult = results[1];

    // Procesamiento de datos del servicio Biométrico
    let biometricUsers: BiometricUser[] = [];

    if (biometricResult.status === "fulfilled") {
      const response = biometricResult.value;
      // Verificación de integridad estructural de la respuesta
      // @ts-ignore
      if (response.data && Array.isArray(response.data.data)) {
        // @ts-ignore
        biometricUsers = response.data.data;
        // @ts-ignore
      } else if (Array.isArray(response.data)) {
        // @ts-ignore
        biometricUsers = response.data;
      } else {
        console.warn(
          "Estructura de respuesta biométrica no reconocida:",
          response
        );
      }
    } else {
      console.error(
        "Fallo en la obtención de usuarios del biométrico:",
        biometricResult.reason
      );
    }

    // Procesamiento de datos del servicio de Autenticación (Roles y Estados)
    // Estos datos enriquecen la información base del biométrico
    let authUsers: AuthUser[] = [];
    if (authResult.status === "fulfilled") {
      const response = authResult.value;
      // @ts-ignore
      if (response.data && Array.isArray(response.data.users)) {
        // @ts-ignore
        authUsers = response.data.users;
        // @ts-ignore
      } else if (response.data && Array.isArray(response.data.data)) {
        // Estructura común donde los datos están en una propiedad 'data' anidada
        // @ts-ignore
        authUsers = response.data.data;
        // @ts-ignore
      } else if (Array.isArray(response.data)) {
        // Respaldo para casos donde el array de usuarios se devuelve directamente
        // @ts-ignore
        authUsers = response.data;
      } else {
        console.warn(
          "Estructura de respuesta de autenticación no reconocida:",
          response
        );
      }
    } else {
      console.error(
        "Error cargando usuarios de autenticación (puede que el endpoint no exista):",
        authResult.reason
      );
    }

    console.log("Biometric Users Count:", biometricUsers.length);
    console.log("Auth Users Count:", authUsers.length);
    if (biometricUsers.length > 0)
      console.log("Sample Biometric User:", biometricUsers[0]);
    if (authUsers.length > 0) console.log("Sample Auth User:", authUsers[0]);

    if (biometricUsers.length === 0) {
      users.value = [];
      return;
    }

    // Lógica de Fusión (Merge) de Datos
    // Se combinan los datos biométricos con la información de roles y estado
    users.value = biometricUsers.map((bUser) => {
      // Vinculación mediante DNI:
      // Se asume que 'user_id' en el sistema biométrico corresponde al 'usuario' (DNI) en el sistema de autenticación.
      // Se realiza una comparación de cadenas normalizada para evitar errores de tipo.
      const aUser = authUsers.find(
        (a) => String(a.usuario).trim() === String(bUser.user_id).trim()
      );

      return {
        ...bUser,
        // Si no se encuentra usuario en Auth, se asigna rol por defecto "Empleado"
        rol: aUser?.rol?.nombre || "Empleado",
        // Determinación del estado: Se prioriza el estado del sistema de autenticación
        estado: aUser?.esta_activo ? "Activo" : "Inactivo",
        auth_id: aUser?.id, // Capture Auth UUID
        initials: getInitials(bUser.nombre),
        raw_created_at: bUser.fecha_creacion
          ? new Date(bUser.fecha_creacion)
          : undefined,
        // Formateo de fecha para presentación en UI
        fecha_creacion: bUser.fecha_creacion
          ? new Date(bUser.fecha_creacion).toLocaleDateString()
          : "-",
      };
    });

    // Calcular Estadísticas
    const total = users.value.length;
    const active = users.value.filter((u) => u.estado === "Activo").length;
    const inactive = users.value.filter((u) => u.estado === "Inactivo").length;

    // Nuevos este mes
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const newCount = users.value.filter((u) => {
      if (!u.raw_created_at) return false;
      return (
        u.raw_created_at.getMonth() === currentMonth &&
        u.raw_created_at.getFullYear() === currentYear
      );
    }).length;

    emit("update-stats", {
      total,
      active,
      inactive,
      pending: 0, // Pendiente de definir lógica para 'Pendientes'
      newMonth: newCount,
    });
  } catch (error) {
    console.error("Error crítico cargando usuarios:", error);
  } finally {
    loading.value = false;
  }
};

const toggleUserStatus = async (user: ExtendedUser) => {
  const isActive = user.estado === "Activo";
  const action = isActive ? "desactivar" : "activar";
  const confirmBtnText = isActive ? "Sí, desactivar" : "Sí, activar";
  const confirmBtnColor = isActive ? "#d33" : "#3085d6";

  const result = await Swal.fire({
    title: `¿Estás seguro de ${action} a ${user.nombre}?`,
    text: isActive
      ? "El usuario perderá acceso al sistema."
      : "El usuario recuperará su acceso al sistema.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: confirmBtnColor,
    cancelButtonColor: "#aaa",
    confirmButtonText: confirmBtnText,
    cancelButtonText: "Cancelar",
  });

  if (result.isConfirmed) {
    try {
      // Invertir estado actual
      // Se utiliza !isActive para determinar el nuevo valor booleano a enviar a la API.
      // Si isActive es true, enviamos false (desactivar), y viceversa.

      // Nota: authService.updateUserByDNI espera { esta_activo: boolean }
      await authService.updateUserByDNI(user.user_id, {
        esta_activo: !isActive,
      });

      Swal.fire({
        title: isActive ? "¡Desactivado!" : "¡Activado!",
        text: `El usuario ha sido ${
          isActive ? "desactivado" : "activado"
        } correctamente.`,
        icon: "success",
      });

      // Recargar tabla para reflejar el cambio en la UI
      loadUsers();
    } catch (error) {
      console.error("Error cambiando estado:", error);
      Swal.fire({
        title: "Error",
        text: "Hubo un problema al cambiar el estado del usuario.",
        icon: "error",
      });
    }
  }
};

onMounted(() => {
  loadUsers();
});
defineExpose({
  loadUsers,
});
</script>

<template>
  <div class="card">
    <DataTable
      :value="users"
      :paginator="true"
      :rows="10"
      dataKey="id"
      :loading="loading"
      stripedRows
      tableStyle="min-width: 40rem"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :rowsPerPageOptions="[5, 10, 25]"
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} empleados"
      :globalFilterFields="['nombre', 'cargo', 'departamento', 'user_id']"
      v-model:filters="filters"
    >
      <template #header>
        <div class="flex flex-wrap gap-2 items-center justify-between">
          <h4 class="m-0 font-bold text-xl text-gray-700">
            Gestión de Personal
          </h4>
          <IconField>
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText
              v-model="filters['global'].value"
              placeholder="Buscar por nombre, cargo o área..."
              class="w-full sm:w-80"
            />
          </IconField>
        </div>
      </template>

      <!-- Empleado Column with Avatar -->
      <Column
        field="nombre"
        header="Empleado"
        sortable
        style="min-width: 14rem"
      >
        <template #body="slotProps">
          <div class="flex items-center gap-3">
            <Avatar
              :label="slotProps.data.initials"
              shape="circle"
              size="large"
              :style="{ backgroundColor: 'var(--blue-500)', color: '#ffffff' }"
            />
            <div class="flex flex-col">
              <span class="font-bold text-gray-800">{{
                slotProps.data.nombre
              }}</span>
            </div>
          </div>
        </template>
      </Column>

      <!-- DNI Column -->
      <Column
        field="user_id"
        header="DNI"
        sortable
        style="min-width: 8rem"
      ></Column>

      <Column
        field="cargo"
        header="Cargo"
        sortable
        style="min-width: 12rem"
      ></Column>
      <Column
        field="departamento"
        header="Área"
        sortable
        style="min-width: 10rem"
      ></Column>

      <!-- Rol Column -->
      <Column field="rol" header="Rol" sortable style="min-width: 8rem">
        <template #body="slotProps">
          <Tag
            :value="slotProps.data.rol"
            :severity="getRoleSeverity(slotProps.data.rol)"
          />
        </template>
      </Column>

      <!-- Estado Column -->
      <Column field="estado" header="Estado" sortable style="min-width: 8rem">
        <template #body="slotProps">
          <Tag
            :value="slotProps.data.estado"
            :severity="getSeverity(slotProps.data.estado)"
            rounded
          />
        </template>
      </Column>

      <!-- Fecha Ingreso Column -->
      <Column
        field="fecha_creacion"
        header="Fecha Ingreso"
        sortable
        style="min-width: 10rem"
      ></Column>

      <!-- Actions Column -->
      <Column header="Acciones" style="min-width: 8rem; text-align: right">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button
              icon="pi pi-pencil"
              outlined
              rounded
              severity="warning"
              aria-label="Editar"
              @click="$emit('edit-user', slotProps.data)"
            />
            <Button
              icon="pi pi-eye"
              outlined
              rounded
              severity="info"
              aria-label="Ver"
            />
            <Button
              :icon="
                slotProps.data.estado === 'Activo'
                  ? 'pi pi-trash'
                  : 'pi pi-check'
              "
              outlined
              rounded
              :severity="slotProps.data.estado === 'Activo' ? 'danger' : 'info'"
              :aria-label="
                slotProps.data.estado === 'Activo' ? 'Desactivar' : 'Activar'
              "
              :title="
                slotProps.data.estado === 'Activo'
                  ? 'Desactivar usuario'
                  : 'Activar usuario'
              "
              @click="toggleUserStatus(slotProps.data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>
/* Minimal override, rely on PrimeVue theme */
:deep(.p-datatable-header) {
  background: #fff;
  border-top: none;
  padding: 1.5rem;
}
:deep(.p-datatable-thead > tr > th) {
  background: #f8f9fa;
  color: #34495e;
  font-weight: 600;
}
</style>
