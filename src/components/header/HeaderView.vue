<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { authService } from "@/api/services/auth.service";
import { useAuthStore } from "@/stores/authStore";
import ModalPerfil from "@/components/Modals/ModalPerfil.vue";
import Swal from "sweetalert2";

const router = useRouter();
const authStore = useAuthStore();
const showProfileModal = ref(false);
const showDropdown = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const closeDropdown = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    showDropdown.value = false;
  }
};

const openProfile = () => {
  showProfileModal.value = true;
  showDropdown.value = false;
};

const logout = async () => {
  showDropdown.value = false;
  const result = await Swal.fire({
    title: "¿Cerrar Sesión?",
    text: "¿Estás seguro que deseas salir del sistema?",
    icon: "warning", // Changed to warning for better visibility
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, cerrar sesión",
    cancelButtonText: "Cancelar",
  });

  if (result.isConfirmed) {
    try {
      authStore.logout();
      await authService.logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });

      Toast.fire({
        icon: "success",
        title: "Sesión cerrada correctamente",
      });

      router.push("/");
    }
  }
};

onMounted(() => {
  authStore.init();
  authStore.fetchProfile();
  document.addEventListener("click", closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener("click", closeDropdown);
});
</script>

<template>
  <div class="header">
    <!-- Modal Perfil -->
    <ModalPerfil v-model:visible="showProfileModal" />

    <div class="search-bar">
      <h2 class="text-xl font-bold text-gray-700">
        Sistema de Control de Asistencia
      </h2>
    </div>

    <!-- User Profile Dropdown -->
    <div class="user-info-container" ref="dropdownRef">
      <div class="user-info" @click.stop="toggleDropdown">
        <img
          :src="`https://ui-avatars.com/api/?name=${authStore.user?.nombre || 'Usuario'}&background=3498db&color=fff`"
          alt="Usuario"
        />
        <div class="user-details">
          <div class="user-name">
            {{ authStore.user?.nombre || "Cargando..." }}
          </div>
          <div class="user-role">{{ authStore.user?.rol || "" }}</div>
        </div>
        <i
          class="fas fa-chevron-down dropdown-icon"
          :class="{ rotate: showDropdown }"
        ></i>
      </div>

      <!-- Dropdown Menu -->
      <transition name="fade">
        <div v-if="showDropdown" class="dropdown-menu">
          <div class="dropdown-header-mobile">
            <span class="text-sm font-bold text-gray-600">Cuenta</span>
          </div>
          <ul class="dropdown-list">
            <li>
              <a href="#" @click.prevent="openProfile" class="dropdown-item">
                <i class="fas fa-user-circle item-icon"></i>
                <span>Mi Perfil</span>
              </a>
            </li>
            <div class="dropdown-divider"></div>
            <li>
              <a
                href="#"
                @click.prevent="logout"
                class="dropdown-item logout-item"
              >
                <i class="fas fa-sign-out-alt item-icon"></i>
                <span>Cerrar Sesión</span>
              </a>
            </li>
          </ul>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
/* Header Styles */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background-color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.search-bar h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.25rem;
}

/* User Info Container & Dropdown */
.user-info-container {
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 8px;
  transition: background-color 0.2s;
  user-select: none;
}

.user-info:hover {
  background-color: #f8f9fa;
}

.user-info img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  border: 2px solid var(--secondary);
}

.user-details {
  margin-right: 15px;
  text-align: right;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
}

.user-role {
  font-size: 0.75rem;
  color: #7f8c8d;
}

.dropdown-icon {
  color: #95a5a6;
  font-size: 0.8rem;
  transition: transform 0.3s ease;
}

.dropdown-icon.rotate {
  transform: rotate(180deg);
}

/* Dropdown Menu Styles */
.dropdown-menu {
  position: absolute;
  top: 120%;
  right: 0;
  width: 200px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
  overflow: hidden;
  z-index: 101;
  animation: slideDown 0.2s ease-out;
}

.dropdown-list {
  list-style: none;
  padding: 5px 0;
  margin: 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: #2c3e50;
  text-decoration: none;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  color: var(--primary);
  padding-left: 25px; /* Subtle slide effect */
}

.item-icon {
  margin-right: 12px;
  width: 20px;
  text-align: center;
  font-size: 1.1rem;
}

.dropdown-divider {
  height: 1px;
  background-color: #eee;
  margin: 5px 0;
}

.logout-item {
  color: #e74c3c;
}

.logout-item:hover {
  background-color: #fce4e4;
  color: #c0392b;
}

.logout-item .item-icon {
  color: #e74c3c;
}

.dropdown-header-mobile {
  display: none; /* Only for mobile if needed later */
}

/* Animations */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .user-details {
    display: none;
  }

  .user-info {
    padding: 0;
  }

  .user-info img {
    margin-right: 5px;
  }
}
</style>
