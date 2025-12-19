<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Calendar from "primevue/calendar";
import Dropdown from "primevue/dropdown";
import Textarea from "primevue/textarea";
import { roleService } from "@/api/services/role.service";
import { userService } from "@/api/services/user.service";
import { authService } from "@/api/services/auth.service";
import Swal from "sweetalert2";
import type { CreateUserData, BiometricUser } from "@/api/types/users.types";
import type { RegisterData, Role } from "@/api/types/auth.types";

const emit = defineEmits(["saved", "close"]);
const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  userToEdit: {
    type: Object as () =>
      | (BiometricUser & { auth_id?: string; rol?: string })
      | null,
    default: null,
  },
});

// Estado para formatear fechas al formato de API
const formatDate = (date: Date) => {
  if (!date) return undefined;
  // Formato YYYY-MM-DD
  const d = new Date(date);
  let month = "" + (d.getMonth() + 1);
  let day = "" + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};

const loading = ref(false);
const roles = ref<Role[]>([]);

const form = ref({
  nombres: "",
  apellidos: "",
  dni: "",
  fecha_nacimiento: null as Date | null,
  cargo: "",
  area: "", // Departamento
  fecha_ingreso: new Date(),
  email: "",
  telefono: "",
  direccion: "",
  rol_id: "",
  observaciones: "", // This maps to 'comentarios' in API
});

// Observar cambios (Abrir modal o cambiar usuario)
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      if (props.userToEdit) {
        // Modo Edición
        populateForm(props.userToEdit);
      } else {
        // Modo Creación
        resetForm();
      }
    }
  }
);

watch(
  () => props.userToEdit,
  (newUser) => {
    if (props.visible && newUser) {
      populateForm(newUser);
    }
  }
);

const populateForm = (
  user: BiometricUser & { auth_id?: string; rol?: string }
) => {
  // Campos del Biomético
  // Dado que el biométrico almacena el nombre completo, puede que no se divida perfectamente.
  // Intentamos dividir por el último espacio.
  const parts = user.nombre.split(" ");
  if (parts.length > 1) {
    form.value.apellidos = parts.pop() || "";
    form.value.nombres = parts.join(" ");
  } else {
    form.value.nombres = user.nombre;
    form.value.apellidos = "";
  }

  form.value.dni = user.user_id; // user_id in biometric is DNI
  form.value.cargo = user.cargo || "";
  form.value.area = user.departamento || "";
  form.value.email = user.email || "";
  form.value.telefono = user.telefono || "";
  form.value.direccion = user.direccion || "";
  form.value.observaciones = user.comentarios || "";

  if (user.fecha_nacimiento) {
    form.value.fecha_nacimiento = new Date(user.fecha_nacimiento);
  } else {
    form.value.fecha_nacimiento = null;
  }

  // user.fecha_creacion is likely string
  if (user.fecha_creacion) {
    form.value.fecha_ingreso = new Date(user.fecha_creacion);
  } else {
    form.value.fecha_ingreso = new Date(); // Default to now if not available
  }

  // Campos de Autenticación
  if (user.rol) {
    // Buscar ID del rol por nombre si es necesario, o pasarlo si está disponible.
    // En personalView, solo mapeamos el nombre del 'rol'.
    // Idealmente deberíamos haber mapeado 'rol_id' o mantenido el objeto rol completo.
    // Sin embargo, podemos intentar coincidir por nombre desde la lista de 'roles'.
    const matchingRole = roles.value.find((r) => r.nombre === user.rol);
    if (matchingRole) {
      form.value.rol_id = matchingRole.id;
    }
  }
};

// Cargar roles al montar
onMounted(async () => {
  try {
    const response = await roleService.getAllRoles();
    if (response.data.success) {
      roles.value = response.data.data;
    } else {
      console.error("Error fetching roles:", response.data.message);
    }
  } catch (error) {
    console.error("Error loading roles:", error);
  }
});

onMounted(() => {
  console.log("Modal Mounted. UserToEdit:", props.userToEdit);
});

const handleClose = () => {
  emit("close");
  resetForm();
};

const resetForm = () => {
  form.value = {
    nombres: "",
    apellidos: "",
    dni: "",
    fecha_nacimiento: null,
    cargo: "",
    area: "",
    fecha_ingreso: new Date(),
    email: "",
    telefono: "",
    direccion: "",
    rol_id: "",
    observaciones: "",
  };
};

const generatePassword = (dni: string, nombre: string) => {
  const firstName = nombre.split(" ")[0] || "";
  const cleanName =
    firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

  return `${dni}${cleanName}@`;
};

const handleSubmit = async () => {
  // Validación Básica
  if (
    !form.value.nombres ||
    !form.value.apellidos ||
    !form.value.dni ||
    !form.value.rol_id
  ) {
    Swal.fire({
      icon: "warning",
      title: "Campos requeridos",
      text: "Por favor complete Nombres, Apellidos, DNI y Rol.",
    });
    return;
  }

  // Validación de DNI (8 dígitos numéricos)
  if (!/^\d{8}$/.test(form.value.dni)) {
    Swal.fire({
      icon: "warning",
      title: "DNI Inválido",
      text: "El DNI debe tener exactamente 8 dígitos numéricos.",
    });
    return;
  }

  loading.value = true;
  const isEdit = !!props.userToEdit;

  try {
    // 1. Preparar Datos del Biométrico
    // -------------------------
    // Combinar nombres para el campo 'nombre' del biométrico
    const fullName = `${form.value.nombres} ${form.value.apellidos}`.trim();

    const biometricData: CreateUserData = {
      user_id: form.value.dni, // DNI se relaciona con ID Biométrico
      nombre: fullName,
      privilegio: 0, // Default
      dispositivo_id: 1, // Default
      cargo: form.value.cargo,
      departamento: form.value.area,
      telefono: form.value.telefono,
      email: form.value.email,
      fecha_nacimiento: form.value.fecha_nacimiento
        ? formatDate(form.value.fecha_nacimiento)
        : undefined,
      direccion: form.value.direccion,
      comentarios: form.value.observaciones,
    };

    console.log("Carga útil Biométrica:", biometricData);

    // 2. Preparar Datos de Autenticación (solo para crear o si existe auth_id para actualizar)
    // --------------------
    const promises = [];

    // OPERACIÓN BIOMÉTRICA
    const biometricPromise =
      isEdit && props.userToEdit?.id
        ? userService.update(props.userToEdit.id, biometricData)
        : userService.create(biometricData);

    console.log("Edit Mode:", isEdit);
    console.log("Biometric ID to update:", props.userToEdit?.id);

    promises.push(biometricPromise);

    promises.push(biometricPromise);

    // OPERACIÓN DE AUTENTICACIÓN
    let generatedPassword = "";
    if (isEdit && props.userToEdit?.auth_id) {
      const authData: any = {
        usuario: form.value.dni,
        correo_electronico: form.value.email,
        rol_id: form.value.rol_id,
      };
      console.log("Carga útil Actualización Auth:", authData);
      promises.push(authService.updateUser(props.userToEdit.auth_id, authData));
    } else if (isEdit && !props.userToEdit?.auth_id) {
      // Modo EDICIÓN pero falta usuario en módulo Auth -> REGISTRARLO
      // Esto maneja el problema de no poder actualizar si no existe en auth.
      generatedPassword = generatePassword(form.value.dni, form.value.nombres);
      const authData: RegisterData = {
        usuario: form.value.dni,
        correo_electronico: form.value.email || `${form.value.dni}@example.com`,
        contrasena: generatedPassword,
        rol_id: form.value.rol_id,
      };
      console.log("Carga útil Registro Auth (Faltante):", authData);

      // Envolvemos esto en un bloque catch específico para evitar fallar toda la operación
      // si el usuario ya existe (posible si auth_id no se pasó correctamente)
      const registerPromise = authService.register(authData).catch((err) => {
        // Si el error es 400 y dice "registrado", asumimos que existe y está bien.
        // No podemos actualizar sin ID, pero al menos no rompemos el flujo.
        if (
          err.response &&
          err.response.status === 400 &&
          (err.response.data?.message?.includes("ya está registrado") ||
            err.response.data?.message?.includes("already registered"))
        ) {
          console.warn(
            "El usuario ya existe en Auth. Se asume vinculación exitosa."
          );
          return { success: true, message: "Usuario existe" }; // Éxito simulado
        }
        throw err; // Re-lanzar otros errores
      });
      promises.push(registerPromise);
    } else if (!isEdit) {
      // Modo CREACIÓN
      generatedPassword = generatePassword(form.value.dni, form.value.nombres);
      const authData: RegisterData = {
        usuario: form.value.dni,
        correo_electronico: form.value.email || `${form.value.dni}@example.com`, // Email de respaldo
        contrasena: generatedPassword,
        rol_id: form.value.rol_id,
      };
      console.log("Carga útil Registro Auth:", authData);
      promises.push(authService.register(authData));
    }

    await Promise.all(promises);

    Swal.fire({
      icon: "success",
      title: isEdit ? "Empleado Actualizado" : "Empleado Registrado",
      text: isEdit
        ? "Los datos han sido actualizados correctamente."
        : `Usuario creado. Contraseña inicial: ${generatedPassword}`,
      confirmButtonColor: "var(--primary-color)",
    });

    emit("saved");
    handleClose();
  } catch (error: any) {
    console.error("Error submitting form:", error);
    if (error.response) {
      console.error("Response Data:", error.response.data);
      console.error("Response Status:", error.response.status);
    }
    // Extract error message if possible
    const msg =
      error.response?.data?.message ||
      error.message ||
      "Hubo un error al guardar los datos.";

    Swal.fire({
      icon: "error",
      title: "Error",
      text: msg,
    });
  } finally {
    loading.value = false;
  }
};

const visibleModel = computed({
  get: () => props.visible,
  set: (value) => {
    if (!value) handleClose();
  },
});
</script>

<template>
  <Dialog
    v-model:visible="visibleModel"
    modal
    header="Nuevo Empleado"
    :style="{ width: '40rem' }"
    :breakpoints="{ '960px': '75vw', '641px': '90vw' }"
    class="p-fluid"
  >
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
      <div class="form-row">
        <!-- Nombres -->
        <div class="form-group">
          <div class="field">
            <label for="nombres" class="font-bold block mb-2">Nombres *</label>
            <InputText
              id="nombres"
              v-model="form.nombres"
              placeholder="Ingrese nombres"
            />
          </div>
        </div>

        <!-- Apellidos -->
        <div class="field">
          <label for="apellidos" class="font-bold block mb-2"
            >Apellidos *</label
          >
          <InputText
            id="apellidos"
            v-model="form.apellidos"
            placeholder="Ingrese apellidos"
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <!-- DNI -->
          <div class="field">
            <label for="dni" class="font-bold block mb-2">DNI *</label>
            <InputText
              id="dni"
              v-model="form.dni"
              placeholder="Número de documento"
              maxlength="8"
            />
            <small class="text-gray-500">Debe tener 8 dígitos</small>
          </div>
        </div>
        <div class="form-group">
          <!-- Fecha Nacimiento -->
          <div class="field">
            <label for="fecha_nacimiento" class="font-bold block mb-2"
              >Fecha Nacimiento</label
            >
            <Calendar
              id="fecha_nacimiento"
              v-model="form.fecha_nacimiento"
              placeholder="dd/mm/aaaa"
              dateFormat="dd/mm/yy"
            />
          </div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <!-- Cargo -->
          <div class="field">
            <label for="cargo" class="font-bold block mb-2">Cargo *</label>
            <InputText
              id="cargo"
              v-model="form.cargo"
              placeholder="Ej. Director"
            />
          </div>
        </div>
        <div class="form-group">
          <!-- Área -->
          <div class="field">
            <label for="area" class="font-bold block mb-2">Área *</label>
            <InputText
              id="area"
              v-model="form.area"
              placeholder="Ej. Direccion"
            />
          </div>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <!-- Fecha Ingreso -->
          <div class="field">
            <label for="fecha_ingreso" class="font-bold block mb-2"
              >Fecha Ingreso *</label
            >
            <Calendar
              id="fecha_ingreso"
              v-model="form.fecha_ingreso"
              placeholder="dd/mm/aaaa"
              dateFormat="dd/mm/yy"
            />
          </div>
        </div>
        <div class="form-group">
          <!-- Rol Sistema -->
          <div class="field">
            <label for="rol" class="font-bold block mb-2"
              >Rol en Sistema *</label
            >
            <Dropdown
              id="rol"
              v-model="form.rol_id"
              :options="roles"
              optionLabel="nombre"
              optionValue="id"
              placeholder="Seleccionar rol"
              :loading="loading"
            />
          </div>
        </div>
      </div>

      <!-- Email (Full width on mobile, span 2 on desktop if needed, or keep grid) -->
      <div class="field md:col-span-2">
        <label for="email" class="font-bold block mb-2"
          >Email Corporativo</label
        >
        <div class="p-input-icon-right w-full">
          <!-- PrimeVue icon field wrapper manual adjustment as we are inside grid -->
          <InputText
            id="email"
            v-model="form.email"
            class="w-full"
            placeholder="email@ugel.gob.pe"
          />
        </div>
      </div>

      <!-- Teléfono -->
      <div class="field">
        <label for="telefono" class="font-bold block mb-2">Teléfono</label>
        <InputText
          id="telefono"
          v-model="form.telefono"
          placeholder="999 999 999"
        />
      </div>

      <!-- Dirección -->
      <div class="field md:col-span-2">
        <label for="direccion" class="font-bold block mb-2">Dirección</label>
        <InputText id="direccion" v-model="form.direccion" class="w-full" />
      </div>

      <!-- Observaciones -->
      <div class="field md:col-span-2">
        <label for="observaciones" class="font-bold block mb-2"
          >Observaciones</label
        >
        <Textarea
          id="observaciones"
          v-model="form.observaciones"
          rows="3"
          class="w-full"
          placeholder="Información adicional relevante..."
        />
      </div>
    </div>

    <template #footer>
      <Button label="Cancelar" icon="pi pi-times" text @click="handleClose" />
      <Button
        label="Guardar Empleado"
        icon="pi pi-check"
        @click="handleSubmit"
        :loading="loading"
        autofocus
        severity="success"
      />
    </template>
  </Dialog>
</template>

<style scoped>
.field {
  margin-bottom: 1rem;
}
</style>

<style>
/* Sobrescritura global para el z-index de SweetAlert2 para que aparezca sobre el Dialog de PrimeVue */
.swal2-container {
  z-index: 10000 !important;
}
</style>
