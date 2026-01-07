<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import DatePicker from "primevue/datepicker";
import Select from "primevue/select";
import Textarea from "primevue/textarea";
import { roleService } from "@/api/services/role.service";
import { userService } from "@/api/services/user.service";
import { authService } from "@/api/services/auth.service";
import { scheduleService } from "@/api/services/schedule.service";
import { DepartmentService } from "@/api/services/department.service";
import Swal from "sweetalert2";
import type { CreateUserData, BiometricUser } from "@/api/types/users.types";
import type { Department } from "@/api/types/department.types";
import type { RegisterData, Role } from "@/api/types/auth.types";
import type { Schedule } from "@/api/types/schedules.types";

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
const schedules = ref<Schedule[]>([]); // Lista de horarios
const departments = ref<Department[]>([]); // Lista de departamentos

const form = ref({
  nombres: "",
  apellidos: "",
  dni: "",
  fecha_nacimiento: null as Date | null,
  cargo: "",
  departamento_id: null as number | null, // Reemplaza 'area' (string)
  horario_id: null as number | null, // Reemplaza fecha_ingreso
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

const populateForm = async (
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
  form.value.departamento_id = user.departamento_id || null;
  // Fallback: si viene 'departamento' como objeto o string, intentar mapear si departamento_id es nulo?
  // Por ahora confiamos en departamento_id.
  form.value.email = user.email || "";
  form.value.telefono = user.telefono || "";
  form.value.direccion = user.direccion || "";
  form.value.observaciones = user.comentarios || "";

  if (user.fecha_nacimiento) {
    // Solución para evitar el desfase de zona horaria (UTC a Local)
    // Extraemos partes y creamos fecha al mediodía local
    const parts = user.fecha_nacimiento.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      form.value.fecha_nacimiento = new Date(year, month, day, 12, 0, 0);
    } else {
      // Fallback
      form.value.fecha_nacimiento = new Date(
        user.fecha_nacimiento + "T12:00:00"
      );
    }
  } else {
    form.value.fecha_nacimiento = null;
  }

  // fecha_creacion / fecha_ingreso logic removed as replaced by schedule assignment

  // Campos de Autenticación
  if (user.rol) {
    const matchingRole = roles.value.find((r) => r.nombre === user.rol);
    if (matchingRole) {
      form.value.rol_id = matchingRole.id;
    }
  }

  // Cargar Horario Asignado
  if (user.user_id) {
    // 1. Fetch Schedule
    try {
      const response = await scheduleService.getUserAssignment(user.user_id);
      console.log("Respuesta asignación horario:", response.data);

      const data = response.data;
      // Manejar respuesta tipo array [{...}] o objeto {...}
      const assignment = Array.isArray(data) ? data[0] : data.data || data;

      if (assignment && assignment.horario_id) {
        console.log("Horario encontrado:", assignment.horario_id);
        form.value.horario_id = assignment.horario_id;
      } else {
        console.log("No se encontró asignación válida en la respuesta");
        form.value.horario_id = null;
      }
    } catch (error) {
      console.warn("No se pudo cargar el horario asignado:", error);
      form.value.horario_id = null;
    }

    // 2. Fetch Department by User DNI
    try {
      const resp = await DepartmentService.getByUserDni(user.user_id);
      // Explicitly cast to 'any' to handle runtime wrapping not reflected in strict types
      const d = resp.data as any;
      const dept = d && d.data ? d.data : d;

      console.log("Departamento encontrado por DNI (raw):", dept);

      if (dept && dept.id) {
        form.value.departamento_id = dept.id;
      } else {
        form.value.departamento_id = null;
      }
    } catch (deptError) {
      console.warn(
        "User has no department assigned or error fetching it:",
        deptError
      );
      // Fallback: keep existing value if any, or null
      if (!form.value.departamento_id) form.value.departamento_id = null;
    }
  }
};

// Cargar roles y horarios al montar
// Cargar roles y horarios al montar
onMounted(async () => {
  console.log("Modal Mounted. UserToEdit:", props.userToEdit);
  try {
    const [rolesResponse, schedulesResponse]: [any, any] = await Promise.all([
      roleService.getAllRoles(),
      scheduleService.getAll(),
    ]);

    // Load Departments separately or in parallel
    // "uses the same logic as schedule" -> Expecting AxiosResponse
    // Load Departments separately or in parallel
    // "uses the same logic as schedule" -> Expecting AxiosResponse
    try {
      const deptResponse = await DepartmentService.getAll();
      const dData = deptResponse.data as any; // Cast for safety against wrapper types
      // Handle array or wrapped array
      if (Array.isArray(dData)) {
        departments.value = dData;
      } else if (dData && Array.isArray(dData.data)) {
        departments.value = dData.data;
      } else {
        departments.value = [];
      }
    } catch (deptError) {
      console.error("Error loading departments:", deptError);
      departments.value = [];
    }

    if (rolesResponse.data.success) {
      roles.value = rolesResponse.data.data;
    } else {
      console.error("Error fetching roles:", rolesResponse.data.message);
    }

    // Schedules response might be direct array or wrapped
    if (schedulesResponse.data) {
      // @ts-ignore
      schedules.value = Array.isArray(schedulesResponse.data)
        ? schedulesResponse.data
        : schedulesResponse.data.data || [];
    }
  } catch (error) {
    console.error("Error loading initial data:", error);
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
    departamento_id: null,
    horario_id: null,
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
      departamento_id: form.value.departamento_id || undefined, // Send ID
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
    // OPERACIÓN BIOMÉTRICA (Secuenciada para obtener ID)
    let biometricResult;
    try {
      const bioResponse = await (isEdit && props.userToEdit?.id
        ? userService.update(props.userToEdit.id, biometricData) // Devuelve Promise<BiometricUser>
        : userService.create(biometricData)); // Devuelve Promise<BiometricUser>

      // Manejo del envoltorio de respuesta de Axios
      // @ts-ignore
      biometricResult = bioResponse.data || bioResponse;
      console.log("Resultado Operación Biométrica:", biometricResult);
    } catch (bioError) {
      console.error("Falló la Operación Biométrica:", bioError);
      throw bioError;
    }
    // Las operaciones de autenticación siguen...

    // OPERACIÓN DE AUTENTICACIÓN
    let generatedPassword = "";
    if (isEdit) {
      // Usar nuevo endpoint PUT /api/users/usuario/:DNI
      const authData: any = {
        correo_electronico: form.value.email,
        rol_id: form.value.rol_id,
        esta_activo: true, // O mapear desde el form si agregamos campo
      };
      console.log("Carga útil Actualización Auth (DNI):", authData);
      promises.push(authService.updateUserByDNI(form.value.dni, authData));
    } else {
      // Crear nuevo
      generatedPassword = generatePassword(form.value.dni, form.value.nombres);
      const authData: RegisterData = {
        usuario: form.value.dni,
        correo_electronico: form.value.email || `${form.value.dni}@example.com`,
        contrasena: generatedPassword,
        rol_id: form.value.rol_id,
      };
      console.log("Carga útil Registro Auth:", authData);
      promises.push(authService.register(authData));
    }

    await Promise.all(promises);

    // 3. Asignar Horario (si se seleccionó uno)
    // -----------------------------------------
    if (form.value.horario_id) {
      try {
        console.log(
          "Asignando horario user_id(DNI):",
          form.value.dni,
          "Horario:",
          form.value.horario_id
        );
        await scheduleService.assignToUser({
          user_id: form.value.dni, // USAR DNI COMO PIDE EL USUARIO / BACKEND
          horario_id: form.value.horario_id,
          fecha_inicio: `${new Date().toISOString().split("T")[0]}T00:00:00`, // Fecha actual con hora
        });
        console.log("Horario asignado correctamente");
      } catch (scheduleError) {
        console.error("Error al asignar horario:", scheduleError);
        // No fallamos toda la operación, pero avisamos (o logueamos)
        Swal.fire({
          icon: "warning",
          title: "Advertencia",
          text: "El empleado fue guardado, pero hubo un error al asignar el horario.",
        });
      }
    }

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
    <div class="formgrid grid mt-2">
      <!-- Nombres -->

      <div class="field col-12 md:col-6">
        <label for="nombres" class="font-bold block mb-2">Nombres *</label>
        <InputText
          id="nombres"
          v-model="form.nombres"
          placeholder="Ingrese nombres"
          class="w-full"
        />
      </div>

      <!-- Apellidos -->
      <div class="field col-12 md:col-6">
        <label for="apellidos" class="font-bold block mb-2">Apellidos *</label>
        <InputText
          id="apellidos"
          v-model="form.apellidos"
          placeholder="Ingrese apellidos"
          class="w-full"
        />
      </div>

      <!-- DNI -->
      <div class="field col-12 md:col-6">
        <label for="dni" class="font-bold block mb-2">DNI *</label>
        <InputText
          id="dni"
          v-model="form.dni"
          placeholder="Número de documento"
          maxlength="8"
          class="w-full"
        />
        <small class="text-gray-500">Debe tener 8 dígitos</small>
      </div>

      <!-- Fecha Nacimiento -->
      <div class="field col-12 md:col-6">
        <label for="fecha_nacimiento" class="font-bold block mb-2"
          >Fecha Nacimiento</label
        >
        <DatePicker
          id="fecha_nacimiento"
          v-model="form.fecha_nacimiento"
          placeholder="dd/mm/aaaa"
          dateFormat="dd/mm/yy"
          class="w-full"
        />
      </div>

      <!-- Cargo -->
      <div class="field col-12 md:col-6">
        <label for="cargo" class="font-bold block mb-2">Cargo *</label>
        <InputText
          id="cargo"
          v-model="form.cargo"
          placeholder="Ej. Director"
          class="w-full"
        />
      </div>

      <!-- Área / Departamento -->
      <div class="field col-12 md:col-6">
        <label for="departamento" class="font-bold block mb-2">Área *</label>
        <Select
          id="departamento"
          v-model="form.departamento_id"
          :options="departments"
          optionLabel="nombre"
          optionValue="id"
          placeholder="Seleccionar departamento"
          class="w-full"
        />
      </div>

      <!-- Horario Asignado -->
      <div class="field col-12 md:col-6">
        <label for="horario" class="font-bold block mb-2"
          >Horario de Trabajo</label
        >
        <Select
          id="horario"
          v-model="form.horario_id"
          :options="schedules"
          optionLabel="nombre"
          optionValue="id"
          placeholder="Seleccionar horario"
          class="w-full"
        />
      </div>

      <!-- Rol Sistema -->
      <div class="field col-12 md:col-6">
        <label for="rol" class="font-bold block mb-2">Rol en Sistema *</label>
        <Select
          id="rol"
          v-model="form.rol_id"
          :options="roles"
          optionLabel="nombre"
          optionValue="id"
          placeholder="Seleccionar rol"
          :loading="loading"
          class="w-full"
        />
      </div>

      <!-- Email (Full width on mobile, span 2 on desktop if needed, or keep grid) -->
      <!-- Email (Full width on mobile, span 2 on desktop if needed, or keep grid) -->
      <div class="field col-12">
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
      <!-- Teléfono -->
      <div class="field col-12">
        <label for="telefono" class="font-bold block mb-2">Teléfono</label>
        <InputText
          id="telefono"
          v-model="form.telefono"
          placeholder="999 999 999"
          class="w-full"
        />
      </div>

      <!-- Dirección -->
      <!-- Dirección -->
      <div class="field col-12">
        <label for="direccion" class="font-bold block mb-2">Dirección</label>
        <InputText id="direccion" v-model="form.direccion" class="w-full" />
      </div>

      <!-- Observaciones -->
      <!-- Observaciones -->
      <div class="field col-12">
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
