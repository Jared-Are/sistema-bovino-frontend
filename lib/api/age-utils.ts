
export function formatEdad(fechaNacimiento: string | Date): string {
  if (!fechaNacimiento) return 'Fecha no disponible';
  
  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();
  
  // Calcular diferencia en meses
  let meses = (hoy.getFullYear() - nacimiento.getFullYear()) * 12;
  meses -= nacimiento.getMonth();
  meses += hoy.getMonth();
  
  // Ajustar por días
  if (hoy.getDate() < nacimiento.getDate()) {
    meses--;
  }
  
  if (meses < 0) return 'No nacido';
  
  if (meses < 12) {
    return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
  }
  
  const años = Math.floor(meses / 12);
  const mesesRestantes = meses % 12;
  
  if (mesesRestantes === 0) {
    return `${años} ${años === 1 ? 'año' : 'años'}`;
  }
  
  return `${años} ${años === 1 ? 'año' : 'años'} y ${mesesRestantes} ${mesesRestantes === 1 ? 'mes' : 'meses'}`;
}

// Versión más detallada si necesitas la edad en meses para cálculos
export function getEdadEnMeses(fechaNacimiento: string | Date): number {
  if (!fechaNacimiento) return 0;
  
  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();
  
  let meses = (hoy.getFullYear() - nacimiento.getFullYear()) * 12;
  meses -= nacimiento.getMonth();
  meses += hoy.getMonth();
  
  if (hoy.getDate() < nacimiento.getDate()) {
    meses--;
  }
  
  return Math.max(0, meses);
}