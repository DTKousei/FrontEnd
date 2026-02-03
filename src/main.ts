import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import ToastService from 'primevue/toastservice';
import VueApexCharts from "vue3-apexcharts";
import VCalendar from 'v-calendar';
import 'v-calendar/style.css';

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueApexCharts)
app.use(VCalendar, {})
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.app-dark'
        }
    },
    locale: {
        firstDayOfWeek: 1,
        dayNames: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
        dayNamesShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
        dayNamesMin: ["D", "L", "M", "X", "J", "V", "S"],
        monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
        monthNamesShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
        today: 'Hoy',
        clear: 'Limpiar',
        dateFormat: 'dd/mm/yy',
        weekHeader: 'Sem',
        weak: 'Débil',
        medium: 'Medio',
        strong: 'Fuerte',
        passwordPrompt: 'Ingrese una contraseña'
    }
});
app.use(ToastService);

app.mount('#app')
