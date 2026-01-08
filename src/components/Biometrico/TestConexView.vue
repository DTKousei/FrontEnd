<template>
  <div class="biometrico-management">
    <div class="header-actions mb-4 flex justify-between items-center">
      <h3 class="text-xl font-semibold text-gray-700">
        Dispositivos Biométricos
      </h3>
      <Button
        label="Nuevo Dispositivo"
        icon="pi pi-plus"
        @click="openCreateModal"
        class="p-button-primary"
      />
    </div>

    <!-- Tabla de Biométricos -->
    <DataTable
      :value="devices"
      :loading="loading"
      stripedRows
      tableStyle="min-width: 50rem"
      class="p-datatable-sm"
    >
      <Column field="nombre" header="Nombre"></Column>
      <Column field="ip_address" header="Dirección IP"></Column>
      <Column field="puerto" header="Puerto"></Column>
      <Column field="ubicacion" header="Ubicación">
        <template #body="slotProps">
          {{ slotProps.data.ubicacion || "No especificada" }}
        </template>
      </Column>
      <Column field="activo" header="Estado">
        <template #body="slotProps">
          <span
            :class="
              slotProps.data.activo
                ? 'text-green-600 font-bold'
                : 'text-red-500'
            "
          >
            {{ slotProps.data.activo ? "Activo" : "Inactivo" }}
          </span>
        </template>
      </Column>
      <Column header="Conexión" style="width: 120px">
        <template #body="slotProps">
          <Button
            icon="pi pi-wifi"
            label="Test"
            size="small"
            severity="info"
            :loading="testingConnection === slotProps.data.id"
            @click="testConnection(slotProps.data)"
            title="Probar Conexión"
          />
        </template>
      </Column>
      <Column header="Acciones" style="min-width: 150px">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button
              icon="pi pi-eye"
              size="small"
              severity="secondary"
              text
              @click="openDetailsModal(slotProps.data)"
              title="Ver Detalles Técnicos"
            />
            <Button
              icon="pi pi-pencil"
              size="small"
              severity="warning"
              text
              @click="openEditModal(slotProps.data)"
              title="Editar"
            />
            <Button
              icon="pi pi-trash"
              size="small"
              severity="danger"
              text
              @click="deleteDevice(slotProps.data)"
              title="Eliminar"
            />
          </div>
        </template>
      </Column>
      <template #empty>No hay dispositivos registrados.</template>
    </DataTable>

    <!-- Modal de Creación/Edición -->
    <Dialog
      v-model:visible="modalVisible"
      :header="isEditing ? 'Editar Dispositivo' : 'Nuevo Dispositivo'"
      :modal="true"
      class="p-fluid"
      :style="{ width: '450px' }"
    >
      <div class="field mb-3">
        <label for="nombre" class="font-bold block mb-2">Nombre</label>
        <InputText id="nombre" v-model.trim="form.nombre" required autofocus />
        <small class="p-error" v-if="submitted && !form.nombre"
          >El nombre es requerido.</small
        >
      </div>

      <div class="formgrid grid">
        <div class="field col-8 mb-3">
          <label for="ip" class="font-bold block mb-2">Dirección IP</label>
          <InputText
            id="ip"
            v-model.trim="form.ip_address"
            required
            placeholder="192.168.1.201"
          />
          <small class="p-error" v-if="submitted && !form.ip_address"
            >La IP es requerida.</small
          >
        </div>
        <div class="field col-4 mb-3">
          <label for="puerto" class="font-bold block mb-2">Puerto</label>
          <InputNumber
            id="puerto"
            v-model="form.puerto"
            required
            :useGrouping="false"
          />
          <small class="p-error" v-if="submitted && !form.puerto"
            >El puerto es requerido.</small
          >
        </div>
      </div>

      <div class="field mb-3">
        <label for="ubicacion" class="font-bold block mb-2"
          >Ubicación (Opcional)</label
        >
        <InputText id="ubicacion" v-model.trim="form.ubicacion" />
      </div>

      <div class="field mb-3 flex align-items-center gap-2">
        <Checkbox v-model="form.activo" :binary="true" inputId="activo" />
        <label for="activo">Dispositivo Activo</label>
      </div>

      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" text @click="hideModal" />
        <Button
          label="Guardar"
          icon="pi pi-check"
          @click="saveDevice"
          :loading="saving"
        />
      </template>
    </Dialog>

    <!-- Modal de Detalles Técnicos -->
    <DatosBio
      v-model:visible="detailsModalVisible"
      :device="selectedDeviceForDetails"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import Swal from "sweetalert2";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Checkbox from "primevue/checkbox";
import DatosBio from "./DatosBio.vue";
import { deviceService } from "@/api/services/device.service";
import type {
  Device,
  CreateDeviceData,
  UpdateDeviceData,
} from "@/api/types/devices.types";

const devices = ref<Device[]>([]);
const loading = ref(false);
const modalVisible = ref(false);
const isEditing = ref(false);
const submitted = ref(false);
const saving = ref(false);
const testingConnection = ref<number | null>(null);

// State for Details Modal
const detailsModalVisible = ref(false);
const selectedDeviceForDetails = ref<Device | null>(null);

const form = reactive({
  id: 0,
  nombre: "",
  ip_address: "",
  puerto: 4370,
  ubicacion: "",
  activo: true,
});

const loadDevices = async () => {
  loading.value = true;
  try {
    const response = await deviceService.getAll();
    // @ts-ignore
    const data = response.data?.data || response.data || [];
    devices.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error loading devices:", error);
    Swal.fire(
      "Error",
      "No se pudieron cargar los dispositivos biométricos.",
      "error"
    );
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  form.id = 0;
  form.nombre = "";
  form.ip_address = "";
  form.puerto = 4370;
  form.ubicacion = "";
  form.activo = true;
  isEditing.value = false;
  submitted.value = false;
  modalVisible.value = true;
};

const openEditModal = (device: Device) => {
  form.id = device.id;
  form.nombre = device.nombre;
  form.ip_address = device.ip_address;
  form.puerto = device.puerto;
  form.ubicacion = device.ubicacion || "";
  form.activo = device.activo;
  isEditing.value = true;
  submitted.value = false;
  modalVisible.value = true;
};

const openDetailsModal = (device: Device) => {
  selectedDeviceForDetails.value = device;
  detailsModalVisible.value = true;
};

const hideModal = () => {
  modalVisible.value = false;
  submitted.value = false;
};

const saveDevice = async () => {
  submitted.value = true;

  if (!form.nombre || !form.ip_address || !form.puerto) {
    return;
  }

  saving.value = true;
  try {
    if (isEditing.value) {
      const updateData: UpdateDeviceData = {
        nombre: form.nombre,
        ip_address: form.ip_address,
        puerto: form.puerto,
        ubicacion: form.ubicacion,
        activo: form.activo,
      };
      await deviceService.update(form.id, updateData);
      Swal.fire("Éxito", "Dispositivo actualizado correctamente.", "success");
    } else {
      const createData: CreateDeviceData = {
        nombre: form.nombre,
        ip_address: form.ip_address,
        puerto: form.puerto,
        ubicacion: form.ubicacion,
        activo: form.activo,
      };
      await deviceService.create(createData);
      Swal.fire("Éxito", "Dispositivo creado correctamente.", "success");
    }

    modalVisible.value = false;
    await loadDevices();
  } catch (error) {
    console.error("Error saving device:", error);
    Swal.fire("Error", "No se pudo guardar el dispositivo.", "error");
  } finally {
    saving.value = false;
  }
};

const deleteDevice = async (device: Device) => {
  const result = await Swal.fire({
    title: "¿Estás seguro?",
    text: `Vas a eliminar el dispositivo "${device.nombre}".`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  });

  if (result.isConfirmed) {
    try {
      loading.value = true;
      await deviceService.delete(device.id);
      Swal.fire("Eliminado", "El dispositivo ha sido eliminado.", "success");
      await loadDevices();
    } catch (error) {
      console.error("Error deleting device:", error);
      Swal.fire("Error", "No se pudo eliminar el dispositivo.", "error");
    } finally {
      loading.value = false;
    }
  }
};

const testConnection = async (device: Device) => {
  testingConnection.value = device.id;
  try {
    const response = await deviceService.testConnection(device.id);
    const success = response.data.success;
    const message = response.data.message || "Conexión exitosa";

    if (success) {
      Swal.fire({
        title: "Conexión Exitosa",
        text: message,
        icon: "success",
        timer: 3000,
      });
    } else {
      Swal.fire("Error de Conexión", message, "error");
    }
  } catch (error) {
    console.error("Connection test error:", error);
    Swal.fire(
      "Error",
      "Falló la prueba de conexión. Verifique la IP y que el dispositivo esté en red.",
      "error"
    );
  } finally {
    testingConnection.value = null;
  }
};

onMounted(() => {
  loadDevices();
});
</script>

<style scoped>
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.p-button.p-button-sm {
  font-size: 0.875rem;
  padding: 0.4rem 0.6rem;
}
</style>
