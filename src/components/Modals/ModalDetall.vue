<script setup lang="ts">
import { ref, computed } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Select from "primevue/select";

interface UserCompact {
  user_id: string;
  nombre: string;
}

const props = defineProps<{
  visible: boolean;
  users: UserCompact[];
}>();

const emit = defineEmits(["update:visible", "generate-report"]);

const visibleModel = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val),
});

const anio = ref(new Date().getFullYear());
const selectedUserId = ref<string>("");

const handleGenerate = () => {
  emit("generate-report", {
    anio: anio.value,
    empleado_id: selectedUserId.value || undefined,
  });
  visibleModel.value = false;
};
</script>

<template>
  <Dialog
    v-model:visible="visibleModel"
    modal
    header="Reporte de Incidencias detallado"
    :style="{ width: '500px' }"
    :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
    class="p-fluid"
  >
    <div class="field mb-4">
      <label for="anio" class="font-bold block mb-2">Año</label>
      <input
        id="anio"
        type="number"
        class="w-full p-2 border-1 border-gray-300 border-round"
        v-model="anio"
      />
    </div>

    <div class="field mb-4">
      <label for="empleado" class="font-bold block mb-2"
        >Empleado (Opcional)</label
      >
      <Select
        v-model="selectedUserId"
        :options="users"
        optionLabel="nombre"
        optionValue="user_id"
        filter
        placeholder="Todos los empleados"
        class="w-full"
        emptyMessage="No se encontraron empleados"
        showClear
      >
        <template #option="slotProps">
          <div class="flex flex-column">
            <span class="font-bold">{{ slotProps.option.nombre }}</span>
            <span class="text-sm text-gray-500"
              >DNI: {{ slotProps.option.user_id }}</span
            >
          </div>
        </template>
      </Select>
    </div>

    <template #footer>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        text
        severity="secondary"
        @click="visibleModel = false"
      />
      <Button
        label="Generar PDF"
        icon="pi pi-file-pdf"
        severity="danger"
        @click="handleGenerate"
      />
    </template>
  </Dialog>
</template>

<style scoped>
.field {
  margin-bottom: 1.5rem;
}
</style>
