<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="fas fa-user-circle mr-2"></i> Mi Perfil
        </h3>
        <button class="close-btn" @click="close">&times;</button>
      </div>

      <div class="modal-body">
        <!-- Tabs Navigation -->
        <div class="tabs">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'datos' }"
            @click="activeTab = 'datos'"
          >
            <i class="fas fa-id-card"></i> Datos Generales
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'seguridad' }"
            @click="activeTab = 'seguridad'"
          >
            <i class="fas fa-lock"></i> Seguridad
          </button>
        </div>

        <!-- Tab Content: Datos -->
        <div v-if="activeTab === 'datos'" class="tab-pane">
          <div class="profile-card">
            <div class="profile-avatar">
              <img
                :src="`https://ui-avatars.com/api/?name=${authStore.user?.nombre || 'Usuario'}&background=2c5aa0&color=fff&size=128`"
                alt="Avatar"
              />
            </div>
            <div class="profile-info">
              <div class="info-group">
                <label>Nombre Completo</label>
                <div class="info-value">
                  {{ authStore.user?.nombre || "-" }}
                </div>
              </div>
              <div class="info-group">
                <label>DNI / Usuario</label>
                <div class="info-value">{{ authStore.user?.dni || "-" }}</div>
              </div>
              <div class="info-group">
                <label>Correo Electrónico</label>
                <div class="info-value">
                  {{ authStore.user?.correo || "No registrado" }}
                </div>
              </div>
              <div class="info-group">
                <label>Rol</label>
                <div class="info-value role-badge">
                  {{ authStore.user?.rol || "-" }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab Content: Seguridad -->
        <div v-if="activeTab === 'seguridad'" class="tab-pane">
          <form @submit.prevent="handleChangePassword" class="security-form">
            <div class="form-group">
              <label>Contraseña Actual</label>
              <div class="input-wrapper">
                <i class="fas fa-key"></i>
                <input
                  type="password"
                  v-model="passwordForm.current"
                  placeholder="Ingrese su contraseña actual"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label>Nueva Contraseña</label>
              <div class="input-wrapper">
                <i class="fas fa-lock"></i>
                <input
                  type="password"
                  v-model="passwordForm.new"
                  placeholder="Mínimo 6 caracteres"
                  minlength="6"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label>Confirmar Nueva Contraseña</label>
              <div class="input-wrapper">
                <i class="fas fa-check-circle"></i>
                <input
                  type="password"
                  v-model="passwordForm.confirm"
                  placeholder="Repita la nueva contraseña"
                  required
                />
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-save" :disabled="loading">
                <i
                  class="fas"
                  :class="loading ? 'fa-spinner fa-spin' : 'fa-save'"
                ></i>
                {{ loading ? "Guardando..." : "Actualizar Contraseña" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { authService } from "@/api/services/auth.service";
import Swal from "sweetalert2";

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits(["update:visible"]);

const authStore = useAuthStore();
const activeTab = ref("datos");
const loading = ref(false);

const passwordForm = reactive({
  current: "",
  new: "",
  confirm: "",
});

const close = () => {
  emit("update:visible", false);
  // Reset form on close
  passwordForm.current = "";
  passwordForm.new = "";
  passwordForm.confirm = "";
  activeTab.value = "datos";
};

const handleChangePassword = async () => {
  if (passwordForm.new !== passwordForm.confirm) {
    Swal.fire("Error", "Las contraseñas nuevas no coinciden", "error");
    return;
  }

  if (passwordForm.new.length < 6) {
    Swal.fire(
      "Error",
      "La nueva contraseña debe tener al menos 6 caracteres",
      "error",
    );
    return;
  }

  try {
    loading.value = true;
    const dni = authStore.user?.dni;

    if (!dni) {
      Swal.fire("Error", "No se pudo identificar al usuario", "error");
      return;
    }

    // Call service
    await authService.changePasswordByDNI(dni, {
      currentPassword: passwordForm.current, // Assuming backend requires this for security
      newPassword: passwordForm.new,
    });

    Swal.fire({
      icon: "success",
      title: "Contraseña Actualizada",
      text: "Su contraseña ha sido modificada correctamente",
      timer: 2000,
    });

    close();
  } catch (error: any) {
    console.error("Error changing password", error);
    // Handle error message from backend if available
    const msg =
      error.response?.data?.message ||
      "No se pudo actualizar la contraseña. Verifique su contraseña actual.";
    Swal.fire("Error", msg, "error");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  background-color: var(--primary);
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.close-btn:hover {
  opacity: 1;
}

.modal-body {
  padding: 0;
}

/* Tabs */
.tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
}

.tab-btn {
  flex: 1;
  padding: 15px;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 600;
  color: #7f8c8d;
  transition: all 0.3s;
  border-bottom: 3px solid transparent;
}

.tab-btn:hover {
  color: var(--primary);
  background: #ecf0f1;
}

.tab-btn.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
  background: white;
}

.tab-pane {
  padding: 25px;
}

/* Profile Details */
.profile-card {
  text-align: center;
}

.profile-avatar img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 4px solid #f0f2f5;
  margin-bottom: 20px;
}

.profile-info {
  text-align: left;
}

.info-group {
  margin-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 10px;
}

.info-group:last-child {
  border-bottom: none;
}

.info-group label {
  display: block;
  font-size: 0.8rem;
  color: #95a5a6;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 1rem;
  color: #2c3e50;
  font-weight: 500;
}

.role-badge {
  display: inline-block;
  background-color: var(--secondary);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
}

/* Security Form */
.security-form .form-group {
  margin-bottom: 20px;
}

.security-form label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #34495e;
}

.input-wrapper {
  position: relative;
}

.input-wrapper i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #95a5a6;
}

.input-wrapper input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  transition: border-color 0.3s;
}

.input-wrapper input:focus {
  border-color: var(--primary);
  outline: none;
}

.btn-save {
  width: 100%;
  padding: 12px;
  background-color: var(--success);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.btn-save:hover:not(:disabled) {
  background-color: #219a52;
}

.btn-save:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

/* Variables fallback */
:root {
  --primary: #2c5aa0;
  --secondary: #3498db;
  --success: #27ae60;
}
</style>
