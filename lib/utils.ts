import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Retorna la fecha actual local de la máquina en formato YYYY-MM-DD
export function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parsea una cadena de fecha YYYY-MM-DD o ISO a un objeto Date local para evitar offsets UTC
export function parseLocalDate(fechaStr: string): Date | null {
  if (!fechaStr) return null;
  const cleanDateStr = fechaStr.split('T')[0];
  const [year, month, day] = cleanDateStr.split('-');
  if (!year || !month || !day) return null;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

// Formatea una fecha de forma segura y sin desfases horarios
export function formatFechaLocal(
  fechaStr?: string, 
  options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' }
): string {
  if (!fechaStr) return 'Sin fecha';
  const localDate = parseLocalDate(fechaStr);
  if (!localDate) return 'Sin fecha';
  return localDate.toLocaleDateString('es-ES', options);
}
