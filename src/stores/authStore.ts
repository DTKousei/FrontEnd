import { defineStore } from 'pinia';
import { ref } from 'vue';
import { authService } from '@/api/services/auth.service';
import { userService } from '@/api/services/user.service';


// Interface for the user state in the store
// We extend or map the API User to include UI-friendly fields like 'nombre'
export interface StoreUser {
  id?: string;
  dni: string;
  nombre: string;
  correo: string;
  rol: string;
  [key: string]: any; // Allow other properties from API if needed
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<StoreUser | null>(null);
  const isAuthenticated = ref(false);
  const loading = ref(false);

  // Initialize from LocalStorage
  const init = () => {
     const storedUser = localStorage.getItem('user');
     const token = localStorage.getItem('token');
     if (token && storedUser) {
        try {
            const parsed = JSON.parse(storedUser);
            user.value = parsed;
            isAuthenticated.value = true;
        } catch (e) {
            console.error("AuthStore: Error parsing stored user", e);
            logout();
        }
     }
  };

  const fetchProfile = async () => {
    loading.value = true;
    try {
        // 1. Get Auth Profile
        const authRes = await authService.getProfile();
        // @ts-ignore
        const authData = authRes.data?.user || authRes.data;
        
        if (authData) {
             // Cast to any to access potentially loose properties from API
             const rawData = authData as any;
             const dni = rawData.usuario || rawData.dni;
             let realName = rawData.nombre || 'Usuario';
             let email = rawData.correo_electronico || rawData.email || '';

             // 2. Try to get Real Name from UserService (Biometric/Personal Data)
             if (dni) {
                try {
                    const userRes = await userService.getByUserId(dni);
                    // @ts-ignore
                    const userData = userRes.data?.data || userRes.data;
                    if (userData && userData.nombre) {
                        realName = userData.nombre;
                        email = userData.email || email;
                    }
                } catch (e) {
                    console.warn("AuthStore: Could not fetch detailed user info", e);
                }
             }

             // Update State
             // Spread rawData first, then overwrite with normalized fields
             user.value = {
                 ...rawData,
                 id: rawData.id,
                 dni: dni,
                 nombre: realName,
                 correo: email,
                 rol: rawData.rol?.nombre || (typeof rawData.rol === 'string' ? rawData.rol : '') || '', // Handle object or string role
             };
             // Ensure 'rol' property is string for UI consistency
             
             isAuthenticated.value = true;
             
             // Update LocalStorage to keep in sync
             localStorage.setItem('user', JSON.stringify(user.value));
        }
    } catch (error) {
        console.error("AuthStore: Error fetching profile", error);
    } finally {
        loading.value = false;
    }
  };

  const logout = () => {
      user.value = null;
      isAuthenticated.value = false;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
  };

  return {
      user,
      isAuthenticated,
      loading,
      init,
      fetchProfile,
      logout
  };
});
