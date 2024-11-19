//Validar cedula ecuatoriana
export const validarCedulaEcuatoriana = (cedula) => {
  if (cedula.length !== 10) return false;
  const provincia = parseInt(cedula.slice(0, 2), 10);
  if (provincia < 1 || provincia > 24) return false;

  let suma = 0;
  for (let i = 0; i < 9; i++) {
    let digito = parseInt(cedula[i], 10);
    if (i % 2 === 0) {
      digito *= 2;
      if (digito > 9) digito -= 9;
    }
    suma += digito;
  }

  const digitoVerificador = (10 - (suma % 10)) % 10;
  return digitoVerificador === parseInt(cedula[9], 10);
};
// Validar fecha de fin de evento
export const validarFechaFin = (fechaFin, fechaInicioEvento) => {
  if (!fechaInicioEvento) {
    return "Primero seleccione la fecha de inicio del evento.";
  } else if (!fechaFin) {
    return "Debe seleccionar la fecha de fin del evento.";
  }
  return (
    fechaFin >= fechaInicioEvento ||
    "La fecha de fin debe ser mayor o igual a la fecha de inicio."
  );
};

// Validar fecha de salida con respecto a la fecha de fin del evento
export const validateFechaSalidaRegreso = (value, fechaFinEvento) => {
  if (fechaFinEvento) {
    const fechaFin = new Date(fechaFinEvento);
    const fechaSalida = new Date(value);

    // Añadir un día a la fecha de fin del evento
    fechaFin.setDate(fechaFin.getDate() + 1);

    // Comparar fechas: la fecha de salida no puede ser después de la fecha de fin + 1 día
    if (fechaSalida > fechaFin) {
      return "La fecha de retorno como máximo debe ser un día después del evento.";
    }
  }
  return true;
};

// Validar fecha de llegada con respecto a la fecha de inicio del evento
export const validateFechaLlegadaIda = (value, fechaInicioEvento) => {
  if (fechaInicioEvento) {
    const fechaInicio = new Date(fechaInicioEvento);
    const fechaLlegada = new Date(value);

    // Restar un día a la fecha de inicio del evento
    fechaInicio.setDate(fechaInicio.getDate() - 1);

    // Comparar fechas: la fecha de llegada no puede ser antes de un día antes del evento
    if (fechaLlegada < fechaInicio) {
      return "La fecha de llegada como máximo debe ser un día antes del evento.";
    }
  }
  return true;
};

// Formatear la fecha en formato dd/mm/yyyy
export function formatDate(dateString) {
  if (!dateString) return "";
  
  // Si es un objeto Date, lo convertimos a formato ISO (yyyy-mm-dd)
  if (dateString instanceof Date) {
    dateString = dateString.toISOString().split('T')[0];
  }
  
  // Convertimos cualquier valor a string para evitar errores
  const [year, month, day] = String(dateString).split("-");
  
  if (!year || !month || !day) return ""; // Para casos donde no haya una fecha válida
  
  return `${day}-${month}-${year}`;
}


// Capitalizar cada palabra en una cadena
export function capitalizeWords(str) {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function sumarDias(fecha, dias) {
let nuevaFecha = new Date(fecha);
nuevaFecha.setDate(nuevaFecha.getDate() + dias);
return nuevaFecha;
}