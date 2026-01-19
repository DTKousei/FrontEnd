import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  // --- Auth & Public ---
  {
    path: '/',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { requiresAuth: false }
  },

  // --- Dashboard ---
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard/dashboaardView.vue'),
    meta: { requiresAuth: true, roles: ['ADMINISTRADOR', 'JEFE'] }
  },

  // --- Biometrico (Registro Asistencia) ---
  {
    path: '/biometrico',
    name: 'Biometrico',
    component: () => import('@/views/biometrico/BiometricoVIew.vue'),
    meta: { requiresAuth: true, roles: ['ADMINISTRADOR'] }
  },

   // --- Biometrico (Registro Personal) ---
  {
    path: '/Personal',
    name: 'personal',
    component: () => import('@/views/Personal/PersonalView.vue'),
    meta: { requiresAuth: true, roles: ['ADMINISTRADOR', 'JEFE'] }
  },
  // --- Papeletas ---
  {
    path: '/papeletas',
    name: 'Papeletas',
    component: () => import('@/views/papeletas/PermissionListView.vue'),
    meta: { requiresAuth: true, roles: ['ADMINISTRADOR', 'JEFE'] }
  },

  // --- Incidencias ---
  {
    path: '/incidencias',
    name: 'Incidencias',
    component: () => import('@/views/incidencias/IncidentListView.vue'),
    meta: { requiresAuth: true, roles: ['ADMINISTRADOR', 'JEFE'] }
  },

  // --- Reportes ---
  {
    path: '/reportes',
    name: 'Reportes',
    component: () => import('@/views/reportes/ReportGeneratorView.vue'),
    meta: { requiresAuth: true, roles: ['ADMINISTRADOR', 'JEFE'] }
  },

  // --- Configuración ---
  {
    path: '/configuracion',
    name: 'Configuracion',
    component: () => import('@/views/configuracion/ConfigView.vue'),
    meta: { requiresAuth: true, roles: ['ADMINISTRADOR'] }
  },
  
  // --- Departamentos ---
  {
      path: '/departamentos',
      name: 'Departamentos',
      component: () => import('@/views/DepartmentsView.vue'),
      meta: { requiresAuth: true, roles: ['ADMINISTRADOR'] }
  },
  
  // --- Empleados (Self Service) ---
  {
      path: '/mis-asistencias',
      name: 'MisAsistencias',
      component: () => import('@/views/employee/MyAttendanceView.vue'),
      meta: { requiresAuth: true, roles: ['EMPLEADO', 'ADMINISTRADOR'] }
  },
  {
      path: '/mis-papeletas',
      name: 'MisPapeletas',
      component: () => import('@/views/employee/MyPermissionsView.vue'),
      meta: { requiresAuth: true, roles: ['EMPLEADO', 'ADMINISTRADOR'] }
  },
  // --- Supervisor ---
  {
      path: '/supervisor/dashboard',
      name: 'SupervisorDashboard',
      component: () => import('@/views/supervisor/SupervisorDashboardView.vue'),
      meta: { requiresAuth: true, roles: ['SUPERVISOR'] }
  },
  {
      path: '/supervisor/papeletas',
      name: 'SupervisorPapeletas',
      component: () => import('@/views/supervisor/SupervisorPermissionsView.vue'),
      meta: { requiresAuth: true, roles: ['SUPERVISOR'] }
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Navigation Guard
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (to.meta.requiresAuth) {
    if (!token) {
      // No autenticado
      next({ name: 'Login' });
    } else {
       // Autenticado: Verificar Roles
       if (to.meta.roles && Array.isArray(to.meta.roles)) {
          let userRole = '';
          try {
             if (userStr) {
                const user = JSON.parse(userStr);
                userRole = user.rol?.nombre?.toUpperCase() || '';
             }
          } catch(e) {}

          if ((to.meta.roles as string[]).includes(userRole)) {
             next(); // Rol permitido
          } else {
             // Rol no permitido: Redirigir según rol
             if (userRole === 'EMPLEADO') {
                 next({ name: 'MisAsistencias' });
             } else if (userRole === 'SUPERVISOR') {
                 next({ name: 'SupervisorDashboard' });
             } else {
                 // Si es otro rol (ej. Admin), al Dashboard general
                 next({ name: 'Dashboard' }); 
             }
          }
       } else {
          // Ruta no requiere rol especifico (solo auth)
          next();
       }
    }
  } else if ((to.name === 'Login') && token) {
     // Ya logueado, redirigir al home correcto
     let userRole = '';
      try {
          if (userStr) {
            const user = JSON.parse(userStr);
            userRole = user.rol?.nombre?.toUpperCase() || '';
          }
      } catch(e) {}
      
     if (userRole === 'EMPLEADO') {
         next({ name: 'MisAsistencias' });
     } else if (userRole === 'SUPERVISOR') {
         next({ name: 'SupervisorDashboard' });
     } else {
        next({ name: 'Dashboard' });
     }
  } else {
    next();
  }
});

export default router;
