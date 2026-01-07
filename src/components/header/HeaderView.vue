<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { authService } from "@/api/services/auth.service";
import { userService } from "@/api/services/user.service";

const router = useRouter();

// Estado para el usuario actual
const currentUser = ref<{ nombre: string } | null>(null);
const userRole = ref<string>("Cargando...");

// Función para obtener los datos del usuario actual
const fetchCurrentUser = async () => {
  try {
    // 1. Obtener perfil de autenticación (rol, dni/usuario)
    const authProfile = await authService.getProfile();
    if (authProfile && authProfile.data && authProfile.data.user) {
      const authUser = authProfile.data.user;

      // Asignar rol
      userRole.value = authUser.rol?.nombre || "Usuario";

      // 2. Obtener datos biométricos (nombre real) usando el DNI (usuario)
      if (authUser.usuario) {
        try {
          const bioUser = await userService.getByUserId(authUser.usuario);
          // @ts-ignore - bioUser podría venir anidado según la respuesta
          const userData = bioUser.data || bioUser;

          if (userData && userData.nombre) {
            currentUser.value = { nombre: userData.nombre };
          } else {
            // Fallback si no encuentra en biométrico
            currentUser.value = { nombre: authUser.usuario };
          }
        } catch (bioError) {
          console.warn("No se pudo obtener datos biométricos:", bioError);
          currentUser.value = { nombre: authUser.usuario };
        }
      }
    }
  } catch (error) {
    console.error("Error al cargar perfil:", error);
    userRole.value = "Invitado";
    currentUser.value = { nombre: "Desconocido" };
  }
};

// Función para cerrar sesión
const logout = async () => {
  try {
    await authService.logout();
    router.push("/");
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    // Forzar redirección aunque falle la API
    router.push("/");
  }
};

onMounted(() => {
  fetchCurrentUser();
});
</script>

<template>
  <div class="header">
    <div class="search-bar">
      <!-- Search Placeholder - Puede ser funcional en el futuro -->
      <!-- <input type="text" placeholder="Buscar..." /> -->
      <h2 class="text-xl font-bold text-gray-700">
        Sistema de Control de Asistencia
      </h2>
    </div>
    <div class="user-info">
      <img
        :src="`https://ui-avatars.com/api/?name=${
          currentUser?.nombre || 'Usuario'
        }&background=3498db&color=fff`"
        alt="Usuario"
      />
      <div>
        <div class="user-name">
          {{ currentUser?.nombre || "Cargando..." }}
        </div>
        <div class="user-role">{{ userRole }}</div>
      </div>
      <div>
        <button @click="logout" class="logout-btn" title="Cerrar Sesión">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6 text-gray-500 hover:text-red-500 transition-colors"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
            />
          </svg>
        </button>
      </div>
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

.search-bar input {
  padding: 10px 15px;
  border-radius: 20px;
  border: 1px solid #ddd;
  width: 300px;
  outline: none;
  transition: all 0.3s;
}

.search-bar input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.user-info {
  display: flex;
  align-items: center;
}

.user-info img {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  margin-right: 15px;
  border: 2px solid var(--secondary);
}

.user-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
}

.user-role {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.logout-btn {
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 1rem;
  padding: 5px;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background-color: #fce4e4;
}

.logout-btn svg {
  width: 24px;
  height: 24px;
}
</style>
