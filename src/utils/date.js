// Función para obtener la fecha actual en formato ISO (YYYY-MM-DD) ajustada a la zona horaria local
export const today = () => {
  const now = new Date();
  const localOffset = now.getTimezoneOffset() * 60000;
  const adjustedNow = new Date(now.getTime() - localOffset)
    .toISOString()
    .split("T")[0];
  return adjustedNow;
};

export default today;
