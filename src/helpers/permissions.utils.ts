import type { Permiso } from "@/api/types/permissions.types";


/**
 * Determina las etiquetas y campos de firma según el rol del solicitante.
 * 
 * Lógica:
 * 1. Empleado Normal -> Firma Jefe Área + Firma RRHH
 * 2. Supervisor -> Firma RRHH + Firma Director (en slot 'institucion')
 * 3. Jefe RRHH -> Firma Jefe Administración (en slot 'institucion')
 */
export const getSignatureConfig = (_permiso: Permiso, solicitante?: any) => {
  // Intentar determinar si el solicitante es jefe/supervisor o RRHH
  // Esto depende de cómo tengas estructurados los roles o datos del usuario.
  // Asumiremos que 'solicitante' tiene propiedades como 'cargo', 'es_jefe', etc.
  
  const cargo = (solicitante?.cargo || "").toLowerCase();
  const esJefe = solicitante?.es_jefe || false; // Si tienes este campo
  const esRRHH = cargo.includes("recursos humanos") || cargo.includes("rrhh");
  const esJefeRRHH = esRRHH && (esJefe || cargo.includes("jefe") || cargo.includes("gerente"));
  const esSupervisor = esJefe || cargo.includes("supervisor") || cargo.includes("coordinador") || cargo.includes("director");
  
  // CASO 3: JEFE DE RRHH
  if (esJefeRRHH) {
    return {
      firma1: {
        label: "SOLICITANTE",
        field: "firma_solicitante",
        roleKey: "solicitante"
      },
      firma2: {
        label: "JEFE DE ADMINISTRACIÓN", 
        field: "firma_institucion", // Usamos este slot para el Admin/Director
        roleKey: "institucion"
      },
      // El jefe de RRHH no necesita una firma intermedia de RRHH (él mismo)
      firma3: null 
    };
  }

  // CASO 2: SUPERVISOR / JEFE DE AREA (Que no es RRHH)
  if (esSupervisor) {
    return {
      firma1: {
        label: "JEFE DE RRHH",
        field: "firma_rrhh",
        roleKey: "rrhh"
      },
      firma2: {
        label: "DIRECTOR / ADMINISTRACIÓN",
        field: "firma_institucion",
        roleKey: "institucion"
      },
      firma3: null
    };
  }

  // CASO 1: EMPLEADO NORMAL (Default)
  return {
    firma1: {
      label: "JEFE DE ÁREA",
      field: "firma_jefe_area",
      roleKey: "jefe_area"
    },
    firma2: {
      label: "JEFE DE RRHH",
      field: "firma_rrhh",
      roleKey: "rrhh"
    },
    firma3: null
  };
};

/**
 * Obtiene el rol de firma disponible para el usuario actual dado un permiso.
 * Retorna 'jefe_area', 'rrhh', 'institucion' o null si no puede firmar.
 */
export const getAvailableSignatureRole = (
  permiso: Permiso, 
  currentUser: any, 
  signatureConfig: any
): string | null => {
  if (!currentUser) return null;
  const userRole = (currentUser.rol?.nombre || "").toUpperCase();
  const cargo = (currentUser.cargo || "").toUpperCase();
  
  // Lógica simplificada de coincidencia
  // En una app real, chequearías IDs de departamento, etc.

  // Si soy RRHH
  if (userRole === "RRHH" || cargo.includes("RECURSOS HUMANOS")) {
    if (signatureConfig.firma1?.roleKey === "rrhh" && !permiso.firma_rrhh) return "rrhh";
    if (signatureConfig.firma2?.roleKey === "rrhh" && !permiso.firma_rrhh) return "rrhh";
  }

  // Si soy Director/Admin
  if (userRole === "ADMIN" || cargo.includes("DIRECTOR") || cargo.includes("ADMINISTRACION")) {
    if (signatureConfig.firma2?.roleKey === "institucion" && !permiso.firma_institucion) return "institucion";
  }

  // Si soy Jefe de Área (y no soy el solicitante)
  // Aquí deberías validar que sea SU jefe, pero por ahora check de rol
  if (userRole === "SUPERVISOR" || userRole === "JEFE") {
     if (signatureConfig.firma1?.roleKey === "jefe_area" && !permiso.firma_jefe_area) return "jefe_area";
  }

  return null;
};

/**
 * Verifica si un empleado tiene una papeleta pendiente o sin cerrar (sin hora de retorno).
 * Se debe pasar la lista de permisos del empleado.
 */
export const hasPendingOrOpenPermission = (employeeId: string, allPermissions: Permiso[]): boolean => {
    if (!allPermissions || allPermissions.length === 0) return false;

    return allPermissions.some(p => {
        // Ignorar permisos de otros empleados
        if (String(p.empleado_id) !== String(employeeId)) return false;

        // Ignorar permisos rechazados o cancelados
        const status = p.estado?.nombre?.toUpperCase() || "";
        if (status.includes("RECHAZADO") || status.includes("CANCELADO")) return false;

        // CRITERIO 1: Estado Pendiente (cualquier tipo de pendiente)
        if (status.includes("PENDIENTE")) return true;

        // CRITERIO 2: Aprobado pero SIN hora de retorno (y es papeleta de salida temporal)
        // Asumimos que si tiene hora de inicio pero NO fin, está abierta.
        // Pero ojo, 'fecha_hora_fin' a veces se usa como "hora estimada de retorno". 
        // El usuario dice: "si aun no firmo el solicitante ... o no tiene hora de regreso".
        // Si el sistema guarda la hora estimada en fecha_hora_fin al crear, entonces este campo NO es null.
        // Necesitamos saber si hay un campo 'retorno_real' o si se actualiza 'fecha_hora_fin' al volver.
        // Según api.service -> registrarRetorno actualiza fecha_hora_fin. 
        // Entonces, al CREAR, fecha_hora_fin debería ser NULL o ser la estimada?
        // El prompt anterior decía "no lo llenes automaticamente".
        // Si no se llena, es NULL. Entonces si es NULL, está abierta.
        
        // Si fecha_hora_fin es null/undefined, asume pendiente de retorno.
        if (!p.fecha_hora_fin) return true;

        return false;
    });
};

/**
 * Valida manualmente la hora de retorno contra el tiempo máximo.
 * Retorna string de error o null si es válido.
 */
export const validateManualReturnTime = (
    startTime: string | Date, 
    endTime: string | Date, 
    maxHours: number | null
): string | null => {
    if (!startTime || !endTime) return null;
    if (!maxHours || maxHours <= 0) return null;

    const start = new Date(startTime);
    const end = new Date(endTime);
    
    // Diferencia en horas
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours > maxHours) {
        // Verificar configuración de notificaciones
        const notify = localStorage.getItem("notifyMaxTimeExceeded") === "true";
        if (notify) {
             return `El tiempo excede el máximo permitido (${maxHours}h). Se enviará una notificación.`;
        }
        // Si no está activada la notificación, ¿bloqueamos o advertimos?
        // El usuario dijo: "si no paso no hay ninguna notificacion".
        // O sea, si se PASA, se notifica. Si no, nada.
        // Pero no dijo que se PROHIBA. 
        // "agregaun campo para notificar si el empleado paso el tiempo maximo de retorno si no paso no hay ninguna notificacion"
        // Esto sugiere que es informativo.
        
        // Pero antes dijo: "sino has una diferencia si cumple con la hora de retorno que sera registrado manualmente".
        // Asumiremos que es validación blanda (advertencia) o dura dependiendo del requerimiento.
        // Retornaremos un mensaje especial.
        return `ADVERTENCIA: El tiempo excede el máximo permitido (${maxHours}h).`;
    }
    
    return null;
};
