<script setup lang="ts">
import { ref } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Tag from "primevue/tag";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import type { Incidencia } from "@/api/types/incidents.types";

const props = defineProps<{
  data: Incidencia[];
  loading?: boolean;
}>();

const emit = defineEmits(["approve", "reject", "delete", "view"]);

// Filtros de la tabla (Búsqueda global)
const filters = ref({
  global: { value: null, matchMode: "contains" },
});

/**
 * Formatea una fecha a string visual (dd/mm/yyyy).
 * Soporta formato ISO y formato simple 'YYYY-MM-DD'.
 */
const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  // Ajuste para evitar desfase de zona horaria (UTC -> Local)
  const date = new Date(dateString);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Determina el color (severidad) del tag de estado basado en el nombre del estado.
 * 'aprob' -> success (verde)
 * 'rechaz' -> danger (rojo)
 * Default -> warning (amarillo/naranja)
 */
const getSeverity = (statusName: string | undefined) => {
  if (!statusName) return "warning";
  const s = statusName.toLowerCase();
  if (s.includes("aprob")) return "success";
  if (s.includes("rechaz")) return "danger";
  return "warning";
};
</script>

<template>
  <div class="card">
    <DataTable
      v-model:filters="filters"
      :value="props.data"
      :loading="props.loading"
      paginator
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      stripedRows
      :globalFilterFields="[
        'empleado_id',
        'empleado_nombre',
        'tipo_incidencia.nombre',
        'estado.nombre',
      ]"
    >
      <template #header>
        <div class="flex justify-content-end">
          <IconField iconPosition="left">
            <InputIcon class="pi pi-search"></InputIcon>
            <InputText
              v-model="filters['global'].value"
              placeholder="Buscar..."
            />
          </IconField>
        </div>
      </template>
      <template #empty>No hay incidencias registradas.</template>

      <Column field="empleado_id" header="Empleado" sortable>
        <!-- 
           Nota: El componente padre inyecta 'empleado_nombre' en los datos antes de pasarlos.
           Aquí mostramos el nombre si existe, o el ID como respaldo.
        -->
        <template #body="slotProps">
          <div class="font-bold">
            {{ slotProps.data.empleado_nombre || slotProps.data.empleado_id }}
          </div>
        </template>
      </Column>

      <Column field="tipo_incidencia.nombre" header="Tipo" sortable></Column>

      <Column field="fecha_inicio" header="Fecha Inicio" sortable>
        <template #body="slotProps">
          {{ formatDate(slotProps.data.fecha_inicio) }}
        </template>
      </Column>

      <Column field="fecha_fin" header="Fecha Fin" sortable>
        <template #body="slotProps">
          {{ formatDate(slotProps.data.fecha_fin) }}
        </template>
      </Column>

      <Column field="estado.nombre" header="Estado" sortable>
        <template #body="slotProps">
          <Tag
            :value="slotProps.data.estado?.nombre || 'Pendiente'"
            :severity="getSeverity(slotProps.data.estado?.nombre)"
          />
        </template>
      </Column>

      <Column header="Acciones">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button
              icon="pi pi-check"
              text
              rounded
              severity="success"
              aria-label="Aprobar"
              @click="$emit('approve', slotProps.data)"
              v-if="
                slotProps.data.estado?.nombre
                  ?.toLowerCase()
                  .includes('pendiente')
              "
            />
            <Button
              icon="pi pi-times"
              text
              rounded
              severity="danger"
              aria-label="Rechazar"
              @click="$emit('reject', slotProps.data)"
              v-if="
                slotProps.data.estado?.nombre
                  ?.toLowerCase()
                  .includes('pendiente')
              "
            />
            <Button
              icon="pi pi-trash"
              text
              rounded
              severity="secondary"
              aria-label="Eliminar"
              @click="$emit('delete', slotProps.data)"
            />
            <Button
              icon="pi pi-eye"
              text
              rounded
              severity="info"
              aria-label="Ver"
              @click="$emit('view', slotProps.data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
