<script setup lang="ts">
import { ref, computed } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Swal from "sweetalert2";
import { authService } from "@/api/services/auth.service";

interface ExtendedUser {
  id: number;
  user_id: string; // DNI
  nombre: string;
  email?: string;
  telefono?: string;
  departamento?: string | any;
  cargo?: string;
  fecha_nacimiento?: string;
  direccion?: string;
  estado?: string; // "Activo" | "Inactivo"
  rol?: string;
  fecha_creacion?: string;
}

const props = defineProps<{
  visible: boolean;
  user: ExtendedUser | null;
}>();

const emit = defineEmits(["update:visible"]);

const visibleModel = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val),
});

const loadingReset = ref(false);

const handleResetPassword = async () => {
  if (!props.user) return;

  const result = await Swal.fire({
    title: "¿Restablecer contraseña?",
    text: `La contraseña se restablecerá al formato por defecto: Ugel${props.user.user_id}@`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, restablecer",
  });

  if (result.isConfirmed) {
    loadingReset.value = true;
    try {
      // El endpoint espera usuario (DNI) y data (aunque sea vacía si el backend lo maneja auto, o la pass si se envía desde front)
      // Según task anterior, se usa /api/auth/change-pass/:usuario
      // Asumiremos que el backend genera la pass o la enviamos calculada.
      // Re-leyendo historial: endpoint should automatically generate a new password following the pattern Ugel<DNI>@ if logic is in backend.
      // Si el backend lo hace auto, enviamos {} vacio.
      await authService.changePasswordByDNI(props.user.user_id, {});

      Swal.fire(
        "¡Restablecido!",
        "La contraseña ha sido restablecida correctamente.",
        "success"
      );
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo restablecer la contraseña.", "error");
    } finally {
      loadingReset.value = false;
    }
  }
};
</script>

<template>
  <Dialog
    v-model:visible="visibleModel"
    modal
    header="Detalle del Empleado"
    :style="{ width: '70vw' }"
    :breakpoints="{ '960px': '85vw', '640px': '95vw' }"
    class="p-fluid"
  >
    <div v-if="user" class="grid">
      <!-- Columna Izquierda: Espacio para Gráfico Radar -->
      <div
        class="col-12 md:col-5 flex flex-column align-items-center justify-content-center border-right-1 surface-border p-4"
      >
        <div
          class="w-full h-20rem bg-gray-50 border-round flex align-items-center justify-content-center text-gray-500"
        >
          <!-- Espacio reservado para gráfico de radar -->
          <div class="text-center">
            <i class="pi pi-chart-pie text-5xl mb-3"></i>
            <p>Gráfico de Desempeño (Próximamente)</p>
          </div>
        </div>
      </div>

      <!-- Columna Derecha: Datos del Empleado -->
      <div class="col-12 md:col-7 p-4">
        <h3
          class="text-xl font-bold text-gray-800 mb-4 border-bottom-1 surface-border pb-2"
        >
          Información Personal
        </h3>

        <div class="grid">
          <div class="col-12 md:col-6 mb-3">
            <label class="block text-500 font-medium mb-1"
              >Nombre Completo</label
            >
            <div class="text-900 font-bold">{{ user.nombre }}</div>
          </div>
          <div class="col-12 md:col-6 mb-3">
            <label class="block text-500 font-medium mb-1">DNI / Usuario</label>
            <div class="text-900">{{ user.user_id }}</div>
          </div>
          <div class="col-12 md:col-6 mb-3">
            <label class="block text-500 font-medium mb-1"
              >Correo Electrónico</label
            >
            <div class="text-900">{{ user.email || "-" }}</div>
          </div>
          <div class="col-12 md:col-6 mb-3">
            <label class="block text-500 font-medium mb-1">Teléfono</label>
            <div class="text-900">{{ user.telefono || "-" }}</div>
          </div>
          <div class="col-12 md:col-6 mb-3">
            <label class="block text-500 font-medium mb-1"
              >Departamento / Área</label
            >
            <div class="text-900">{{ user.departamento || "-" }}</div>
          </div>
          <div class="col-12 md:col-6 mb-3">
            <label class="block text-500 font-medium mb-1">Cargo</label>
            <div class="text-900">{{ user.cargo || "-" }}</div>
          </div>
          <div class="col-12 md:col-6 mb-3">
            <label class="block text-500 font-medium mb-1">Estado</label>
            <span
              :class="{
                'text-green-600': user.estado === 'Activo',
                'text-red-500': user.estado !== 'Activo',
                'text-orange-500': user.estado === 'Pendiente',
              }"
              class="font-bold"
            >
              {{ user.estado }}
            </span>
          </div>
          <div class="col-12 md:col-6 mb-3">
            <label class="block text-500 font-medium mb-1">Rol de Acceso</label>
            <div class="text-900">{{ user.rol }}</div>
          </div>
        </div>

        <h3
          class="text-xl font-bold text-gray-800 mt-4 mb-4 border-bottom-1 surface-border pb-2"
        >
          Acciones de Seguridad
        </h3>
        <div class="flex gap-3">
          <Button
            label="Restablecer Contraseña"
            icon="pi pi-key"
            severity="warning"
            outlined
            @click="handleResetPassword"
            :loading="loadingReset"
          />
        </div>
      </div>
    </div>
  </Dialog>
</template>
