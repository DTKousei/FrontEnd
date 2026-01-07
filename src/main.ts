import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import VueApexCharts from "vue3-apexcharts";

const app = createApp(App)

app.use(router)
app.use(VueApexCharts)
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.app-dark'
        }
    }
});

app.mount('#app')
