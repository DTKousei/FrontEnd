<script setup lang="ts">
import { ref, computed, watch } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import InputNumber from "primevue/inputnumber";
import Checkbox from "primevue/checkbox";
import Calendar from "primevue/calendar"; // Para hora
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Swal from "sweetalert2";
import { scheduleService } from "@/api/services/schedule.service";
import type { Schedule, ScheduleSegment } from "@/api/types/schedules.types";
import { LISTA_DIAS, DIAS_SEMANA_MAP } from "@/api/types/schedules.types";

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  scheduleToEdit: {
    type: Object as () => Schedule | null,
    default: null,
  },
});

const emit = defineEmits(["update:visible", "saved"]);

const visibleModel = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val),
});

const loading = ref(false);

// Formulario Cabecera
const headerForm = ref({
  nombre: "",
  descripcion: "",
  activo: true,
});

// Estructura interna para el frontend (Agrupada)
interface GroupedSegment {
  ui_id: string; // Identificador temporal para UI
  ids_map: Record<number, number>; // Mapa: dia_semana -> backend_segment_id (para ediciones)
  dias_semana: number[]; // [0, 1, 2...]
  hora_inicio: Date | null;
  hora_fin: Date | null;
  tolerancia_minutos: number;
  orden_turno: number;
}

const segments = ref<GroupedSegment[]>([]);
const editingSegmentUiId = ref<string | null>(null);

// Formulario para añadir/editar segmento
const newSegment = ref({
  dias_semana: [] as number[],
  hora_inicio: null as Date | null,
  hora_fin: null as Date | null,
  tolerancia_minutos: 0,
  orden_turno: 1,
});

// Helpers
const generateUiId = () => Math.random().toString(36).substring(2, 9);

const parseTimeString = (timeStr: string): Date => {
  const [h, m, s] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m, s || 0, 0);
  return date;
};

const formatTime = (date: Date | null | string): string => {
  if (!date) return "00:00:00";
  if (typeof date === "string") return date;
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  const s = "00"; // Segundos opcionales
  return `${h}:${m}:${s}`;
};

// Lógica de Agrupación (Backend -> Frontend)
const groupSegments = (backendSegments: any[]): GroupedSegment[] => {
  // backendSegments items tienen: id, dia_semana, hora_inicio, hora_fin, tolerancia, orden
  const groups: Record<string, GroupedSegment> = {};

  backendSegments.forEach((seg) => {
    // Clave de agrupación: hora_inicio + hora_fin + orden + tolerancia
    // Nota: Si un usuario tiene el mismo turno en lunes y martes, los agrupamos.
    const key = `${seg.hora_inicio}-${seg.hora_fin}-${seg.orden_turno}-${seg.tolerancia_minutos}`;

    if (!groups[key]) {
      groups[key] = {
        ui_id: generateUiId(),
        ids_map: {},
        dias_semana: [],
        hora_inicio: parseTimeString(seg.hora_inicio),
        hora_fin: parseTimeString(seg.hora_fin),
        tolerancia_minutos: seg.tolerancia_minutos,
        orden_turno: seg.orden_turno,
      };
    }
    groups[key].dias_semana.push(seg.dia_semana);
    groups[key].ids_map[seg.dia_semana] = seg.id;
  });

  // Convertir a array y ordenar dias
  return Object.values(groups).map((g) => {
    g.dias_semana.sort((a, b) => a - b);
    return g;
  });
};

const resetForm = () => {
  headerForm.value = { nombre: "", descripcion: "", activo: true };
  segments.value = [];
  resetNewSegment();
  editingSegmentUiId.value = null;
};

const resetNewSegment = () => {
  newSegment.value = {
    dias_semana: [],
    hora_inicio: null,
    hora_fin: null,
    tolerancia_minutos: 0,
    orden_turno: 1,
  };
  editingSegmentUiId.value = null;
};

watch(
  () => props.visible,
  async (isVisible) => {
    if (isVisible) {
      if (props.scheduleToEdit) {
        headerForm.value = {
          nombre: props.scheduleToEdit.nombre,
          descripcion: props.scheduleToEdit.descripcion || "",
          activo: props.scheduleToEdit.activo,
        };
        try {
          const response = await scheduleService.getSegments(
            props.scheduleToEdit.id
          );
          // @ts-ignore
          const data = response.data || [];
          const rawSegments = Array.isArray(data) ? data : [];
          segments.value = groupSegments(rawSegments);
        } catch (error) {
          console.error("Error cargando segmentos", error);
          segments.value = [];
        }
      } else {
        resetForm();
      }
    }
  }
);

// Acciones UI
const addOrUpdateSegment = () => {
  if (
    newSegment.value.dias_semana.length === 0 ||
    !newSegment.value.hora_inicio ||
    !newSegment.value.hora_fin
  ) {
    Swal.fire("Atención", "Seleccione días, hora inicio y hora fin", "warning");
    return;
  }

  if (editingSegmentUiId.value) {
    // Modo Edición: Actualizar el grupo existente
    const index = segments.value.findIndex(
      (s) => s.ui_id === editingSegmentUiId.value
    );
    if (index !== -1) {
      // Preservar ids_map para los días que se mantienen
      const existingGroup = segments.value[index];
      const newIdsMap: Record<number, number> = {};

      newSegment.value.dias_semana.forEach((dia) => {
        if (existingGroup.ids_map[dia]) {
          newIdsMap[dia] = existingGroup.ids_map[dia];
        }
      });

      segments.value[index] = {
        ...existingGroup,
        dias_semana: [...newSegment.value.dias_semana].sort((a, b) => a - b),
        hora_inicio: newSegment.value.hora_inicio,
        hora_fin: newSegment.value.hora_fin,
        tolerancia_minutos: newSegment.value.tolerancia_minutos,
        orden_turno: newSegment.value.orden_turno,
        ids_map: newIdsMap,
      };
    }
    Swal.fire(
      "Actualizado",
      "Segmento actualizado en la lista (Guardar para aplicar)",
      "success"
    );
  } else {
    // Modo Creación
    const segment: GroupedSegment = {
      ui_id: generateUiId(),
      ids_map: {}, // Sin IDs backend todavía
      dias_semana: [...newSegment.value.dias_semana].sort((a, b) => a - b),
      hora_inicio: newSegment.value.hora_inicio,
      hora_fin: newSegment.value.hora_fin,
      tolerancia_minutos: newSegment.value.tolerancia_minutos,
      orden_turno: newSegment.value.orden_turno,
    };
    segments.value.push(segment);
  }

  resetNewSegment();
};

const editSegment = (segment: GroupedSegment) => {
  newSegment.value = {
    dias_semana: [...segment.dias_semana],
    hora_inicio: segment.hora_inicio, // Ya es objeto Date
    hora_fin: segment.hora_fin,
    tolerancia_minutos: segment.tolerancia_minutos,
    orden_turno: segment.orden_turno,
  };
  editingSegmentUiId.value = segment.ui_id;
};

const removeSegment = (index: number) => {
  // Simplemente quitamos de la lista visual.
  // Al guardar, la lógica de sincronización detectará la ausencia de IDs y borrará en BD.
  segments.value.splice(index, 1);
};

const cancelEdit = () => {
  resetNewSegment();
};

const getDiasLabel = (dias: number[]) => {
  if (!dias || dias.length === 0) return "Sin días";
  return dias.map((d) => DIAS_SEMANA_MAP[d]).join(", ");
};

const saveSchedule = async () => {
  if (!headerForm.value.nombre) {
    Swal.fire("Error", "El nombre es obligatorio", "error");
    return;
  }

  loading.value = true;
  try {
    let scheduleId = props.scheduleToEdit?.id;

    // 1. Guardar/Crear Cabecera
    if (scheduleId) {
      await scheduleService.update(scheduleId, headerForm.value);
    } else {
      const resp = await scheduleService.create(headerForm.value);
      // @ts-ignore
      scheduleId = resp.data.id || resp.data.data?.id || resp.data.data;
    }

    if (!scheduleId) throw new Error("No se obtuvo ID del horario");

    // 2. Sincronización Inteligente de Segmentos (Smart Sync)
    // Obtenemos el estado actual REAL de la BD para comparar
    const currentSegmentsResp = await scheduleService.getSegments(scheduleId);
    // @ts-ignore
    const currentSegmentsBackend = currentSegmentsResp.data || [];

    // Preparar lista deseada (flat) basada en UI
    // Cada día en cada grupo UI es un segmento deseado
    interface DesiredSegment {
      dia: number;
      grupo: GroupedSegment;
    }
    const desiredSegments: DesiredSegment[] = [];
    segments.value.forEach((g) => {
      g.dias_semana.forEach((d) => {
        desiredSegments.push({ dia: d, grupo: g });
      });
    });

    // A. Detectar Eliminar: Segmentos en BD que NO están en Desired (coincidiendo dia y turno)
    // Ojo: Turno (orden_turno) es clave aqui.
    // Estrategia: "Marcar" los de BD que coinciden con alguno deseado. Los no marcados se borran.
    // Coincidencia estricta por ID si existe en ids_map, O coincidencia funcional?
    // Mejor usar ids_map si existe.

    const idsToKeep = new Set<number>();
    const operationsPromises = [];

    // Procesar Desired Segments
    for (const desired of desiredSegments) {
      const mappedId = desired.grupo.ids_map[desired.dia];

      if (mappedId) {
        // Existe ID mapeado -> UPDATE
        idsToKeep.add(mappedId);
        operationsPromises.push(
          scheduleService.updateSegment(mappedId, {
            hora_inicio: formatTime(desired.grupo.hora_inicio),
            hora_fin: formatTime(desired.grupo.hora_fin),
            tolerancia_minutos: desired.grupo.tolerancia_minutos,
            orden_turno: desired.grupo.orden_turno,
          })
        );
      } else {
        // No existe ID -> CREATE
        operationsPromises.push(
          scheduleService.createSegment({
            horario_id: scheduleId!,
            dia_semana: desired.dia,
            hora_inicio: formatTime(desired.grupo.hora_inicio),
            hora_fin: formatTime(desired.grupo.hora_fin),
            tolerancia_minutos: desired.grupo.tolerancia_minutos,
            orden_turno: desired.grupo.orden_turno,
          })
        );
      }
    }

    // Detectar Borrados
    // Todos los de backend que NO estén en idsToKeep
    const idsToDelete = currentSegmentsBackend
      .filter((bdSeg: any) => !idsToKeep.has(bdSeg.id))
      .map((bdSeg: any) => bdSeg.id);

    for (const idDel of idsToDelete) {
      operationsPromises.push(scheduleService.deleteSegment(idDel));
    }

    // Ejecutar todo
    await Promise.all(operationsPromises);

    Swal.fire("Éxito", "Horario guardado correctamente", "success");
    emit("saved");
    emit("update:visible", false);
  } catch (error) {
    console.error(error);
    Swal.fire("Error", "No se pudo guardar el horario", "error");
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <Dialog
    v-model:visible="visibleModel"
    modal
    :header="scheduleToEdit ? 'Editar Horario' : 'Nuevo Horario'"
    :style="{ width: '50vw' }"
    :breakpoints="{ '960px': '75vw', '641px': '90vw' }"
    class="p-fluid"
  >
    <!-- Datos Principales -->
    <div class="grid grid-cols-1 gap-4 mb-4">
      <div class="field">
        <label class="font-bold block mb-1">Nombre del Horario</label>
        <InputText
          v-model="headerForm.nombre"
          placeholder="Ej. Horario Oficina General"
        />
      </div>
      <div class="field">
        <label class="font-bold block mb-1">Descripción</label>
        <Textarea v-model="headerForm.descripcion" rows="2" />
      </div>
    </div>

    <!-- Gestión de Segmentos -->
    <div class="border-t pt-4 mt-4">
      <h3 class="font-bold text-lg mb-3">Segmentos y Turnos</h3>

      <!-- Formulario Agregar Segmento -->
      <div class="p-4 bg-gray-50 border rounded mb-4">
        <h4 class="font-semibold mb-2 text-sm text-gray-600">Nuevo Segmento</h4>
        <div class="flex flex-wrap gap-4">
          <!-- Días -->
          <div class="w-full">
            <label class="block text-sm font-bold mb-1">Días:</label>
            <div class="flex flex-wrap gap-3">
              <div
                v-for="dia in LISTA_DIAS"
                :key="dia.id"
                class="flex items-center"
              >
                <Checkbox
                  v-model="newSegment.dias_semana"
                  :value="dia.id"
                  :inputId="'d' + dia.id"
                />
                <label
                  :for="'d' + dia.id"
                  class="ml-1 text-sm cursor-pointer"
                  >{{ dia.nombre }}</label
                >
              </div>
            </div>
          </div>

          <!-- Horas -->
          <div class="flex gap-4 w-full">
            <div class="flex-1">
              <label class="block text-sm font-bold mb-1">Hora Ingreso</label>
              <Calendar
                v-model="newSegment.hora_inicio"
                timeOnly
                showTime
                hourFormat="24"
                :stepMinute="15"
              />
            </div>
            <div class="flex-1">
              <label class="block text-sm font-bold mb-1">Hora Salida</label>
              <Calendar
                v-model="newSegment.hora_fin"
                timeOnly
                showTime
                hourFormat="24"
                :stepMinute="15"
              />
            </div>
            <div class="w-32">
              <label class="block text-sm font-bold mb-1"
                >Tolerancia (min)</label
              >
              <InputNumber
                v-model="newSegment.tolerancia_minutos"
                :min="0"
                :max="60"
              />
            </div>
            <div class="w-32">
              <label class="block text-sm font-bold mb-1">Orden (Turno)</label>
              <InputNumber
                v-model="newSegment.orden_turno"
                :min="1"
                :max="5"
                showButtons
              />
            </div>
          </div>

          <div class="w-full text-right flex gap-2 justify-end">
            <Button
              v-if="editingSegmentUiId"
              label="Cancelar Edición"
              icon="pi pi-times"
              severity="secondary"
              size="small"
              @click="cancelEdit"
            />
            <Button
              :label="
                editingSegmentUiId ? 'Actualizar Segmento' : 'Agregar Segmento'
              "
              :icon="editingSegmentUiId ? 'pi pi-check' : 'pi pi-plus'"
              :severity="editingSegmentUiId ? 'warning' : 'primary'"
              size="small"
              @click="addOrUpdateSegment"
            />
          </div>
        </div>
      </div>

      <!-- Tabla de Segmentos -->
      <DataTable :value="segments" size="small" stripedRows class="text-sm">
        <Column header="Orden" field="orden_turno" style="width: 50px"></Column>
        <Column header="Días">
          <template #body="slotProps">
            {{ getDiasLabel(slotProps.data.dias_semana) }}
          </template>
        </Column>
        <Column header="Entrada">
          <template #body="slotProps">
            {{ formatTime(slotProps.data.hora_inicio) }}
          </template>
        </Column>
        <Column header="Salida">
          <template #body="slotProps">
            {{ formatTime(slotProps.data.hora_fin) }}
          </template>
        </Column>
        <Column header="Tolerancia" field="tolerancia_minutos"></Column>
        <Column style="width: 90px" header="Acciones">
          <template #body="slotProps">
            <div class="flex gap-1">
              <Button
                icon="pi pi-pencil"
                text
                severity="warning"
                size="small"
                @click="editSegment(slotProps.data)"
              />
              <Button
                icon="pi pi-trash"
                text
                severity="danger"
                size="small"
                @click="removeSegment(slotProps.index)"
              />
            </div>
          </template>
        </Column>
        <template #empty>
          <div class="text-center p-2">No hay segmentos definidos.</div>
        </template>
      </DataTable>
    </div>

    <template #footer>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        text
        @click="visibleModel = false"
      />
      <Button
        label="Guardar Todo"
        icon="pi pi-save"
        severity="success"
        :loading="loading"
        @click="saveSchedule"
      />
    </template>
  </Dialog>
</template>
