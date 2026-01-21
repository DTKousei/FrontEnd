<script setup lang="ts">
import { ref, computed, watch } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import FileUpload from "primevue/fileupload";
import Image from "primevue/image";
import RadioButton from "primevue/radiobutton";
import { permissionService } from "@/api/services/permission.service";
import Swal from "sweetalert2";
import type { Permiso, TipoFirma } from "@/api/types/permissions.types";
import { getSignatureConfig } from "@/helpers/permissions.utils";

const props = defineProps<{
  visible: boolean;
  permiso: Permiso | null;
  forcedRole?: string; // Optional: Force a specific role (e.g. 'solicitante')
}>();

const emit = defineEmits(["update:visible", "signed"]);

const selectedRole = ref<string>("solicitante");

// Init role logic
watch(
  [() => props.visible, () => props.permiso],
  ([newVisible, newPermiso]) => {
    if (newVisible) {
      if (newPermiso) {
        const currentUserId = getCurrentUserId();
        const permisoUserId = String(newPermiso.empleado_id);

        // Si el usuario actual es el solicitante
        if (currentUserId && currentUserId === permisoUserId) {
          const hasSigned =
            newPermiso.firma_solicitante ||
            newPermiso.firma_solicitante_digital;

          if (hasSigned) {
            Swal.fire({
              icon: "warning",
              title: "Ya firmado",
              text: "Usted ya ha firmado esta solicitud como solicitante.",
              allowOutsideClick: false,
            }).then(() => {
              emit("update:visible", false);
            });
            return;
          }
        }
      }

      if (effectiveForcedRole.value) {
        selectedRole.value = effectiveForcedRole.value;
      } else {
        selectedRole.value = "solicitante";
      }
    }
  },
  { immediate: true },
);
const loading = ref(false);
const signatureImage = ref<string | null>(null);

// Computed roles based on permission context
// Computed signature configuration
const signatureConfig = computed(() => {
  if (!props.permiso) return { firma1: null, firma2: null };
  // @ts-ignore
  return getSignatureConfig(props.permiso, props.permiso.empleado || {});
});

// Stepper Logic
const signatureSteps = computed(() => {
  if (!props.permiso) return [];
  const p = props.permiso;
  const config = signatureConfig.value;

  const steps = [];

  // Step 1: Solicitante (Always)
  const solicitanteSigned = !!(
    p.firma_solicitante || p.firma_solicitante_digital
  );
  steps.push({
    label: "Solicitante",
    roleKey: "solicitante",
    signed: solicitanteSigned,
  });

  // Step 2: First Authority
  if (config.firma1) {
    let signed = false;
    if (config.firma1.roleKey === "jefe_area") {
      signed = !!(p.firma_jefe_area || p.firma_jefe_area_digital);
    } else if (config.firma1.roleKey === "rrhh") {
      signed = !!(p.firma_rrhh || p.firma_rrhh_digital);
    }
    steps.push({
      label: config.firma1.label,
      roleKey: config.firma1.roleKey,
      signed: signed,
    });
  }

  // Step 3: Second Authority
  if (config.firma2) {
    let signed = false;
    if (config.firma2.roleKey === "rrhh") {
      signed = !!(p.firma_rrhh || p.firma_rrhh_digital);
    } else if (config.firma2.roleKey === "institucion") {
      signed = !!(p.firma_institucion || p.firma_institucion_digital);
    }
    steps.push({
      label: config.firma2.label,
      roleKey: config.firma2.roleKey,
      signed: signed,
    });
  }

  return steps;
});

const isNextToSign = (index: number) => {
  // Check if previous steps are signed and this one is not
  if (index === 0) return !signatureSteps.value[0].signed;
  const prevSigned = signatureSteps.value[index - 1].signed;
  return prevSigned && !signatureSteps.value[index].signed;
};

// Helper to get current user ID
const getCurrentUserId = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const u = JSON.parse(userStr);
      return String(u.usuario || u.id || u.user_id);
    }
  } catch (e) {
    console.error("Error reading user", e);
  }
  return null;
};

// Roles using shared config logic
const roles = computed(() => {
  if (!props.permiso) return [];
  const config = signatureConfig.value;
  const currentUserId = getCurrentUserId();
  const permisoUserId = String(props.permiso.empleado_id);

  const dynamicRoles = [];
  dynamicRoles.push({ label: "Solicitante", value: "solicitante" });

  // CRITICAL: If current user IS the applicant, they cannot sign as authority
  if (currentUserId && currentUserId === permisoUserId) {
    return dynamicRoles;
  }

  if (config.firma1) {
    dynamicRoles.push({
      label: config.firma1.label,
      value: config.firma1.roleKey,
    });
  }
  if (config.firma2) {
    dynamicRoles.push({
      label: config.firma2.label,
      value: config.firma2.roleKey,
    });
  }
  return dynamicRoles;
});

// Determine if we should ignore forcedRole property
// If user is applicant, we MUST force 'solicitante' regardless of prop
const effectiveForcedRole = computed(() => {
  const currentUserId = getCurrentUserId();
  const permisoUserId = props.permiso ? String(props.permiso.empleado_id) : "";

  if (currentUserId && currentUserId === permisoUserId) {
    return null; // Don't force 'jefe_area', let them pick (but roles are restricted to only 'solicitante' anyway)
    // Or better, logic below handles it.
  }
  return props.forcedRole;
});

const visibleModel = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val),
});

const handleFileSelect = async (event: any) => {
  const file = event.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      signatureImage.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const handleClearImage = () => {
  signatureImage.value = null;
};

// Validation Logic
const validateSignatureOrder = (roleByKey: string): string | null => {
  const steps = signatureSteps.value;
  const targetStepIndex = steps.findIndex((s) => s.roleKey === roleByKey);

  if (targetStepIndex === -1) return null; // Role not in flow?

  // Solicitante (Index 0) always can sign first
  if (targetStepIndex === 0) return null;

  // Check all previous steps
  for (let i = 0; i < targetStepIndex; i++) {
    if (!steps[i].signed) {
      return `Falta la firma de: ${steps[i].label}. No puede firmar todavía.`;
    }
  }
  return null;
};

const handleSaveSignature = async () => {
  if (!props.permiso || !signatureImage.value) {
    Swal.fire("Error", "Debe seleccionar una imagen de firma", "warning");
    return;
  }

  // 1. Validate Order
  const validationError = validateSignatureOrder(selectedRole.value);
  if (validationError) {
    Swal.fire({
      icon: "warning",
      title: "Orden Incorrecto",
      text: validationError,
    });
    return;
  }

  // 1.5 Validate Double Sign (Backup)
  if (selectedRole.value === "solicitante") {
    const p = props.permiso;
    if (p.firma_solicitante || p.firma_solicitante_digital) {
      Swal.fire(
        "Aviso",
        "Usted ya tiene una firma registrada como solicitante.",
        "warning",
      );
      return;
    }
  }

  try {
    loading.value = true;

    // Preparar payload Base64
    // IMPORTANTE: Muchos backends fallan con el prefijo "data:image/...".
    // Enviamos solo la cadena Base64 pura.
    const rawBase64 = signatureImage.value.includes(",")
      ? signatureImage.value.split(",")[1]
      : signatureImage.value;

    const payload = {
      tipo_firma: selectedRole.value as TipoFirma,
      firma: rawBase64,
    };

    // Llamar al endpoint /firmar (PATCH)
    await permissionService.firmarPermiso(props.permiso.id, payload);

    Swal.fire({
      icon: "success",
      title: "Firmado Exitosamente",
      text: "La firma se ha guardado correctamente.",
      timer: 2000,
    });

    emit("signed");
    visibleModel.value = false;
    signatureImage.value = null; // Reset
  } catch (error) {
    console.error("Error al guardar firma:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo guardar la firma. Verifique la conexión.",
    });
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  visibleModel.value = false;
  signatureImage.value = null;
};
</script>

<template>
  <Dialog
    v-model:visible="visibleModel"
    modal
    header="Firma Digital (Cargar Imagen)"
    :style="{ width: '500px' }"
    class="p-fluid"
  >
    <!-- Stepper de Progreso de Firmas -->
    <div class="stepper-container mb-4" v-if="signatureSteps.length > 0">
      <div
        v-for="(step, index) in signatureSteps"
        :key="index"
        class="step-item"
        :class="{
          active: step.signed,
          current: !step.signed && isNextToSign(index),
        }"
      >
        <div class="step-circle">
          <i v-if="step.signed" class="pi pi-check text-xs"></i>
          <span v-else>{{ index + 1 }}</span>
        </div>
        <span class="step-label">{{ step.label }}</span>
        <!-- Line connector (except last item) -->
        <div
          v-if="index < signatureSteps.length - 1"
          class="step-line"
          :class="{ active: step.signed }"
        ></div>
      </div>
    </div>

    <div class="flex flex-column gap-4 py-4">
      <!-- Selección de Rol (Solo si no está forzado o si es auto-firma) -->
      <div v-if="!effectiveForcedRole">
        <div class="font-bold text-center mb-2">
          Seleccione el rol con el que desea firmar:
        </div>
        <div class="flex justify-content-center gap-3 mb-3">
          <div
            v-for="role in roles"
            :key="role.value"
            class="field-checkbox flex align-items-center gap-2"
          >
            <RadioButton
              v-model="selectedRole"
              :inputId="role.value"
              :value="role.value"
            />
            <label :for="role.value" class="cursor-pointer">{{
              role.label
            }}</label>
          </div>
        </div>
      </div>
      <div v-else class="text-center font-bold text-xl text-primary mb-3">
        Firmando como:
        {{
          effectiveForcedRole === "jefe_area"
            ? "SUPERVISOR"
            : roles.find((r) => r.value === effectiveForcedRole)?.label ||
              effectiveForcedRole.toUpperCase()
        }}
      </div>

      <!-- Carga de Imagen -->
      <div class="flex flex-column align-items-center gap-3">
        <div v-if="!signatureImage" class="w-full">
          <FileUpload
            mode="basic"
            name="firma"
            accept="image/*"
            :maxFileSize="1000000"
            @select="handleFileSelect"
            chooseLabel="Seleccionar Imagen de Firma"
            class="w-full"
            :auto="true"
          />
          <small class="text-gray-500 block text-center mt-2">
            Formatos: PNG, JPG (Máx 1MB)
          </small>
        </div>

        <div
          v-else
          class="flex flex-column align-items-center gap-2 border-1 surface-border border-round p-3 w-full"
        >
          <span class="font-bold text-primary">Vista Previa:</span>
          <Image :src="signatureImage" alt="Firma" width="250" preview />
          <Button
            label="Cambiar Imagen"
            icon="pi pi-refresh"
            class="p-button-text p-button-sm mt-2"
            @click="handleClearImage"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-content-end gap-2">
        <Button
          label="Cancelar"
          icon="pi pi-times"
          severity="secondary"
          @click="handleCancel"
          outlined
        />
        <Button
          label="Guardar Firma"
          icon="pi pi-check"
          severity="primary"
          @click="handleSaveSignature"
          :loading="loading"
          :disabled="!signatureImage"
        />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.field-checkbox {
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s;
}
.field-checkbox:hover {
  background-color: #f8f9fa;
}

/* Stepper Styles */
.stepper-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  padding: 0 20px;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
  z-index: 1;
}

.step-circle {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background-color: #e5e7eb;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
  z-index: 2;
  background-clip: padding-box;
}

.step-item.active .step-circle {
  background-color: #10b981; /* Green */
  border-color: #10b981;
  color: white;
}

.step-item.current .step-circle {
  border-color: #3b82f6; /* Blue border */
  color: #3b82f6;
  background-color: white;
}

.step-label {
  margin-top: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #6b7280;
  text-align: center;
  max-width: 100px;
}

.step-item.active .step-label {
  color: #10b981;
}

.step-line {
  position: absolute;
  top: 17.5px;
  left: 50%;
  width: 100%;
  height: 2px;
  background-color: #e5e7eb;
  transform: translateY(-50%);
  z-index: 0;
}

.step-item:last-child .step-line {
  display: none;
}

/* Connect active steps with green line */
.step-item .step-line.active {
  background-color: #10b981;
}
</style>
