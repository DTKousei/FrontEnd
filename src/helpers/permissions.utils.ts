import type { Permiso } from "@/api/types/permissions.types";
import type { BiometricUser } from "@/api/types/users.types";

/**
 * Determina las etiquetas y campos de firma según el rol del solicitante.
 * 
 * Lógica:
 * 1. Empleado Normal -> Firma Jefe Área + Firma RRHH
 * 2. Supervisor -> Firma RRHH + Firma Director (en slot 'institucion')
 * 3. Jefe RRHH -> Firma Jefe Administración (en slot 'institucion')
 */
export const getSignatureConfig = (permiso: Permiso, solicitante?: BiometricUser | any) => {
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
