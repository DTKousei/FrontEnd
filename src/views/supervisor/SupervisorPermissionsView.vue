<template>
  <div class="container">
    <!-- Navbar -->
    <AdminNavbar />

    <!-- Main Content -->
    <div class="main-content">
      <!-- Header -->
      <HeaderView />

      <!-- Page Content -->
      <div class="page-content">
        <div class="page-title">
          <h1>Gestión de Papeletas (Supervisor)</h1>
          <button
            class="btn btn-success"
            id="nueva-papeleta-btn"
            @click="showModal = true"
          >
            <i class="fas fa-plus"></i> Nueva Papeleta
          </button>
        </div>

        <!-- Estadísticas (Optional: Add filtered stats later) -->
        <div class="stats-cards">
          <div class="stat-card">
            <div class="stat-header">
              <div class="stat-title">Pendientes Área</div>
              <div class="stat-icon pendientes">
                <i class="fas fa-clock"></i>
              </div>
            </div>
            <div class="stat-value">{{ pendientesCount }}</div>
            <div class="stat-change">Total pendientes</div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <div class="stat-title">Aprobadas Hoy</div>
              <div class="stat-icon aprobadas">
                <i class="fas fa-check-circle"></i>
              </div>
            </div>
            <div class="stat-value">{{ aprobadasHoyCount }}</div>
            <div class="stat-change">Solicitadas hoy</div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <div class="stat-title">Rechazadas</div>
              <div class="stat-icon rechazadas">
                <i class="fas fa-times-circle"></i>
              </div>
            </div>
            <div class="stat-value">{{ rechazadasCount }}</div>
            <div class="stat-change">Total rechazadas</div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <div class="stat-title">Comisiones</div>
              <div class="stat-icon comision">
                <i class="fas fa-briefcase"></i>
              </div>
            </div>
            <div class="stat-value">{{ comisionesCount }}</div>
            <div class="stat-change">Total activas</div>
          </div>
        </div>

        <!-- Tabla de Papeletas Supervisor -->
        <div class="papeletas-container">
          <TableSuperm
            :data="permissions"
            :loading="loading"
            @view="handleView"
            @approve="handleApprove"
            @reject="handleReject"
          />
        </div>
      </div>
    </div>
  </div>

  <ModalSuperPerm
    v-model:visible="showModal"
    @save="handleSavePapeleta"
    :supervisorId="currentUser?.user_id || currentUser?.usuario"
  />

  <!-- Reusing ModalFirmaOnpe for signing -->
  <ModalFirmaOnpe
    v-model:visible="showFirmaModal"
    :permiso="selectedPermiso"
    @signed="handleSigned"
    forcedRole="jefe_area"
  />
  <!-- forcedRole='jefe_area' assumes supervisor acts as boss -->
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import ModalSuperPerm from "@/components/Supervisor/ModalSuperPerm.vue";
import TableSuperm from "@/components/Supervisor/TableSuperm.vue";
import ModalFirmaOnpe from "@/components/Modals/ModalFirmaOnpe.vue"; // Reuse signing modal
import AdminNavbar from "@/components/Admin/NavbarView.vue";
import HeaderView from "@/components/header/HeaderView.vue";
import { permissionService } from "@/api/services/permission.service";
import type { Permiso } from "@/api/types/permissions.types";
import Swal from "sweetalert2";
import { userService } from "@/api/services/user.service";
import { DepartmentService } from "@/api/services/department.service";

const showModal = ref(false);
const showFirmaModal = ref(false);
const selectedPermiso = ref<Permiso | null>(null);
const permissions = ref<Permiso[]>([]);
const loading = ref(false);

const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      return JSON.parse(userStr);
    }
  } catch (e) {
    console.error("Error reading user", e);
  }
  return null;
};

const currentUser = computed(() => getCurrentUser());

const pendientesCount = computed(() => {
  return permissions.value.filter((p) =>
    p.estado?.nombre?.toLowerCase().includes("pend"),
  ).length;
});

const aprobadasHoyCount = computed(() => {
  const hoy = new Date();
  return permissions.value.filter((p) => {
    const isAprobada = p.estado?.nombre?.toLowerCase().includes("aprob");

    if (!p.fecha_hora_inicio) return false;

    const fechaPermiso = new Date(p.fecha_hora_inicio);
    const esHoy =
      fechaPermiso.getDate() === hoy.getDate() &&
      fechaPermiso.getMonth() === hoy.getMonth() &&
      fechaPermiso.getFullYear() === hoy.getFullYear();

    return isAprobada && esHoy;
  }).length;
});

const rechazadasCount = computed(() => {
  return permissions.value.filter((p) =>
    p.estado?.nombre?.toLowerCase().includes("rechaz"),
  ).length;
});

const comisionesCount = computed(() => {
  return permissions.value.filter((p) =>
    p.tipo_permiso?.nombre?.toLowerCase().includes("comisi"),
  ).length;
});

const loadPermissions = async () => {
  const user = getCurrentUser();
  if (!user || !user.usuario) return;

  try {
    loading.value = true;
    const allUsersResponse = await userService.getAll();
    // @ts-ignore
    const allUsers = allUsersResponse.data?.data || allUsersResponse.data || [];
    const supervisor = allUsers.find(
      (u: any) =>
        String(u.user_id) === String(user.usuario) ||
        String(u.id) === String(user.usuario),
    );

    if (!supervisor || !supervisor.departamento_id) {
      console.warn("Supervisor has no department assigned.");
      permissions.value = [];
      return;
    }

    const deptId = supervisor.departamento_id;
    let isDirector = false;

    // Check if Department is 'DIRECCION'
    try {
      const deptsResponse = await DepartmentService.getAll();
      // @ts-ignore
      const depts = deptsResponse.data || [];
      const myDept = depts.find((d: any) => d.id === deptId);
      // Flexible check for 'DIRECCI' (Dirección, Direccion, DIRECCION REGIONAL, etc.)
      if (
        myDept &&
        myDept.nombre &&
        myDept.nombre.toUpperCase().includes("DIRECCI")
      ) {
        isDirector = true;
        console.log(
          "Modo Director Activado: Puede ver solicitudes de otros Jefes.",
        );
      }
    } catch (e) {
      console.error("Error checking director role", e);
    }

    // Get all permissions
    const response = await permissionService.getPermisos({});
    // @ts-ignore
    const allPermisos = response.data?.data || response.data || [];

    // 1. Employees in my department
    const deptEmployeesIds = allUsers
      .filter((u: any) => u.departamento_id === deptId)
      .map((u: any) => String(u.user_id));

    // 2. Supervisors/Jefes from ANY department (Only if Director)
    let otherJefesIds: string[] = [];
    if (isDirector) {
      otherJefesIds = allUsers
        .filter((u: any) => {
          const cargo = (u.cargo || "").toLowerCase();
          const esJefe =
            u.es_jefe === true || u.es_jefe === 1 || u.es_jefe === "1";
          const esSupervisorCargo =
            cargo.includes("jefe") ||
            cargo.includes("supervisor") ||
            cargo.includes("director") ||
            cargo.includes("gerente");

          // Exclude myself (already in dept list logically, but safe to include)
          return esJefe || esSupervisorCargo;
        })
        .map((u: any) => String(u.user_id));
    }

    permissions.value = allPermisos.filter((p: Permiso) => {
      const empId = String(p.empleado_id);

      // Criterion A: Employee belongs to my department (Standard Supervisor logic)
      if (deptEmployeesIds.includes(empId)) return true;

      // Criterion B: I am Director AND Employee is a Boss/Supervisor (Cross-department approval)
      if (isDirector && otherJefesIds.includes(empId)) return true;

      return false;
    });
  } catch (error) {
    console.error("Error loading permissions:", error);
    permissions.value = [];
  } finally {
    loading.value = false;
  }
};

const handleSavePapeleta = () => {
  loadPermissions();
};

const handleView = async (permiso: Permiso) => {
  try {
    loading.value = true;
    const response = await permissionService.verPDF(permiso.id);
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank");
  } catch (error) {
    console.error("Error al visualizar PDF:", error);
    Swal.fire({
      icon: "warning",
      title: "Documento no disponible",
      text: "El documento PDF no se encuentra disponible.",
    });
  } finally {
    loading.value = false;
  }
};

const handleApprove = (permiso: Permiso) => {
  // Supervisor signs as 'jefe_area'
  selectedPermiso.value = permiso;
  showFirmaModal.value = true;
};

const handleSigned = async () => {
  // After signing, usually status updates automatically or we trigger it.
  // If Jefe Area signs, status might go to 'PENDIENTE_RRHH' or 'APROBADO' depending on flow.
  // Let's assume standard flow: PENDIENTE_JEFE -> PENDIENTE_RRHH (or APROBADO if RRHH not needed)

  // Check permission type to see if it needs RRHH.
  // For now, refreshing list.
  loadPermissions();
};

const handleReject = async (permiso: Permiso) => {
  try {
    const result = await Swal.fire({
      title: "¿Rechazar Papeleta?",
      text: "Esta acción cambiará el estado a RECHAZADO. ¿Desea continuar?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, Rechazar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      loading.value = true;
      await permissionService.cambiarEstado(permiso.id, "RECHAZADO");
      Swal.fire("Rechazado", "La papeleta ha sido rechazada.", "success");
      loadPermissions();
    }
  } catch (error) {
    console.error("Error al rechazar:", error);
    Swal.fire("Error", "No se pudo rechazar la papeleta.", "error");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadPermissions();
});
</script>

<style scoped>
/* Reusing styles from MyPermissionsView */
.container {
  display: flex;
  min-height: 100vh;
} /* Sidebar */
.sidebar {
  width: 250px;
  background-color: var(--primary);
  color: white;
  transition: all 0.3s;
} /* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
} /* Page
Content */
.page-content {
  padding: 30px;
  flex: 1;
  overflow-x: auto;
}
.page-title {
  margin-bottom: 20px;
  color: var(--primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
} /* Stats Cards */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}
.stat-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}
.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.stat-title {
  font-size: 0.9rem;
  color: #7f8c8d;
  font-weight: 600;
}
.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}
.stat-icon.pendientes {
  background-color: #f39c12; /* var(--warning) */
}
.stat-icon.aprobadas {
  background-color: #27ae60; /* var(--success) */
}
.stat-icon.rechazadas {
  background-color: #e74c3c; /* var(--danger) */
}
.stat-icon.comision {
  background-color: #3498db; /* var(--secondary) */
}
.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 5px;
}
.stat-change {
  font-size: 0.8rem;
  color: #7f8c8d;
} /* Table Container */
.papeletas-container {
  background-color: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}
.btn-success {
  background-color: #27ae60; /*
var(--success) */
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.btn-success:hover {
  background-color: #219a52;
}
</style>
