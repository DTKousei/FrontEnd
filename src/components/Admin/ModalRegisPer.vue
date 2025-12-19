<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Calendar from "primevue/calendar";
import Textarea from "primevue/textarea";
import Swal from "sweetalert2";
import { roleService } from "@/api/services/role.service";
import { authService } from "@/api/services/auth.service";
import { userService } from "@/api/services/user.service";
import type { Role } from "@/api/types/auth.types";

const emit = defineEmits(["saved", "close"]);
const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
});

// State for formatting dates to API format
const formatDate = (date: Date) => {
  if (!date) return undefined;
  // Format YYYY-MM-DD
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
  observaciones: "",
});

// Load roles on mount
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
  // Logic: DNI + FirstName + @
  // Example: 75146985 + Diomar + @ -> 75146985Diomar@
  const firstName = nombre.split(" ")[0] || "";
  // ¿Poner en mayúscula la primera letra del nombre por si acaso? El ejemplo de usuario «Diomar» implica el uso de mayúsculas estándar.
  // ¿Mantenerlo tal y como se ha escrito o ponerlo estrictamente en mayúsculas? «Diomar»
  const cleanName =
    firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

  return `${dni}${cleanName}@`;
};

const handleSubmit = async () => {
  // Basic Validation
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

  loading.value = true;

  try {
    const fullName = `${form.value.nombres} ${form.value.apellidos}`.trim();
    const password = generatePassword(form.value.dni, form.value.nombres);

    // 1. Prepare Data for Biometric (Module 2)
    const biometricData = {
      user_id: form.value.dni,
      nombre: fullName,
      privilegio: 0, // Default User
      dispositivo_id: 1, // Default Device ID
      email: form.value.email,
      telefono: form.value.telefono,
      departamento: form.value.area,
      cargo: form.value.cargo,
      fecha_nacimiento: formatDate(form.value.fecha_nacimiento!) || "",
      direccion: form.value.direccion,
      comentarios: form.value.observaciones,
    };

    // 2. Prepare Data for Auth (Module 1)
    const authData = {
      usuario: form.value.dni,
      correo_electronico: form.value.email,
      contrasena: password,
      rol_id: form.value.rol_id,
    };

    // 3. Execute Parallel Requests
    // Note: Using Promise.all allows both to run. If one fails, we catch it.
    // Ideally we might want transactional behavior but these are separate services.
    await Promise.all([
      userService.create(biometricData),
      authService.register(authData),
    ]);

    // Success
    Swal.fire({
      icon: "success",
      title: "Empleado Registrado",
      text: `El empleado ha sido registrado correctamente.\nContraseña generada: ${password}`,
      confirmButtonColor: "var(--primary-color)",
    });

    emit("saved");
    handleClose();
  } catch (error: any) {
    console.error("Error registering employee:", error);
    // Extract error message if possible
    const msg =
      error.response?.data?.message ||
      error.message ||
      "Hubo un error al registrar el empleado.";

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
            />
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
