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
    meta: { requiresAuth: true }
  },

  // --- Biometrico (Registro Asistencia) ---
  {
    path: '/biometrico',
    name: 'Biometrico',
    component: () => import('@/views/biometrico/BiometricoVIew.vue'),
    meta: { requiresAuth: true }
  },

   // --- Biometrico (Registro Personal) ---
  {
    path: '/Personal',
    name: 'personal',
    component: () => import('@/views/Personal/PersonalView.vue'),
    meta: { requiresAuth: true }
  },
  // --- Papeletas ---
  {
    path: '/papeletas',
    name: 'Papeletas',
    component: () => import('@/views/papeletas/PermissionListView.vue'),
    meta: { requiresAuth: true }
  },

  // --- Incidencias ---
  {
    path: '/incidencias',
    name: 'Incidencias',
    component: () => import('@/views/incidencias/IncidentListView.vue'),
    meta: { requiresAuth: true }
  },

  // --- Reportes ---
  {
    path: '/reportes',
    name: 'Reportes',
    component: () => import('@/views/reportes/ReportGeneratorView.vue'),
    meta: { requiresAuth: true }
  },

  // --- Configuracion ---
  {
    path: '/configuracion',
    name: 'Configuracion',
    component: () => import('@/views/configuracion/ConfigView.vue'),
    meta: { requiresAuth: true }
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Navigation Guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (to.meta.requiresAuth && !token) {
    next({ name: 'Login' });
  } else if ((to.name === 'Login') && token) {
    next({ name: 'Dashboard' });
  } else {
    next();
  }
});

export default router;
