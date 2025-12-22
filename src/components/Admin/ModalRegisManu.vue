<script setup lang="ts">
import { ref, computed, watch } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Select from "primevue/select";
import DatePicker from "primevue/datepicker";
import { userService } from "@/api/services/user.service";
import { attendanceService } from "@/api/services/attendance.service";
import Swal from "sweetalert2";

interface Props {
  visible: boolean;
  type: "ENTRADA" | "SALIDA";
}

const props = defineProps<Props>();
const emit = defineEmits(["update:visible", "success"]);

const loading = ref(false);
const submitting = ref(false);
const users = ref<any[]>([]);
const form = ref({
  empleado_id: null as number | null,
  time: new Date(),
});

const formTitle = computed(() =>
  props.type === "ENTRADA"
    ? "Registrar Entrada Manual"
    : "Registrar Salida Manual"
);

const visibleModel = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val),
});

const loadUsers = async () => {
  loading.value = true;
  try {
    const res = await userService.getAll();
    // Ajustar segun estructura real de respuesta
    // @ts-ignore
    users.value = Array.isArray(res.data?.data)
      ? res.data.data
      : Array.isArray(res.data)
      ? res.data
      : [];
  } catch (error) {
    console.error("Error loading users:", error);
    Swal.fire("Error", "No se pudieron cargar los empleados", "error");
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  if (!form.value.empleado_id) {
    Swal.fire("Atención", "Seleccione un empleado", "warning");
    return;
  }
  if (!form.value.time) {
    Swal.fire("Atención", "Seleccione una hora", "warning");
    return;
  }

  submitting.value = true;
  try {
    // Construir fecha_hora: Fecha actual + Hora seleccionada
    const now = new Date();
    const selectedTime = form.value.time;

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const hours = String(selectedTime.getHours()).padStart(2, "0");
    const minutes = String(selectedTime.getMinutes()).padStart(2, "0");
    const seconds = "00"; // Segundos en 00 por simplicidad o tomar actuales

    const fechaHoraIso = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

    await attendanceService.registerAttendance({
      tipo: props.type,
      empleado_id: String(form.value.empleado_id),
      fecha_hora: fechaHoraIso,
    });

    Swal.fire({
      title: "Éxito",
      text: "Registro manual exitoso",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });

    emit("success");
    visibleModel.value = false;
    // Reset form partial
    form.value.empleado_id = null;
    form.value.time = new Date();
  } catch (error) {
    console.error("Error registering attendance:", error);
    Swal.fire("Error", "No se pudo registrar la asistencia", "error");
  } finally {
    submitting.value = false;
  }
};

watch(
  () => props.visible,
  (newVal) => {
    if (newVal && users.value.length === 0) {
      loadUsers();
    }
    // Update time on open
    if (newVal) form.value.time = new Date();
  }
);
</script>

<template>
  <Dialog
    v-model:visible="visibleModel"
    modal
    :header="formTitle"
    :style="{ width: '30rem' }"
    class="p-fluid"
  >
    <div class="field mb-4">
      <label class="font-bold block mb-2">Empleado</label>
      <Select
        v-model="form.empleado_id"
        :options="users"
        optionLabel="nombre"
        optionValue="user_id"
        filter
        placeholder="Buscar empleado..."
        class="w-full"
        :loading="loading"
      />
    </div>

    <div class="field mb-4">
      <label class="font-bold block mb-2">Hora (Fecha Actual: Hoy)</label>
      <DatePicker
        v-model="form.time"
        timeOnly
        hourFormat="24"
        showIcon
        iconDisplay="input"
        class="w-full"
      />
      <small class="text-gray-500"
        >Solo se puede modificar la hora, la fecha es la actual.</small
      >
    </div>

    <template #footer>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        text
        @click="visibleModel = false"
      />
      <Button
        label="Registrar"
        icon="pi pi-check"
        @click="handleSubmit"
        :loading="submitting"
        severity="success"
      />
    </template>
  </Dialog>
</template>
