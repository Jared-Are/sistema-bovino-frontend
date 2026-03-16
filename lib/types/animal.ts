export type SexoAnimal = 'Macho' | 'Hembra';
export type EstadoReproductivo = 'vacia' | 'gestacion' | 'lactancia' | 'seco' | 'preparto';
export type EstadoSalud = 'sano' | 'enfermo' | 'tratamiento' | 'critico';

export interface AnimalBackend {
  animal_id: number;
  arete: string;
  nombre: string | null;
  sexo: SexoAnimal;
  peso_nacimiento: number;
  peso_actual: number;
  fecha_nacimiento: string;
  fecha_destete?: string | null;  
  estado_reproductivo: string;
  raza?: { raza_id: number; nombre: string };
  lote?: { lote_id: number; nombre: string };
  potrero?: { potrero_id: number; nombre: string };
  madre?: { animal_id: number; nombre: string };
  padre?: { animal_id: number; nombre: string };
  imagen?: string;
}

export interface Animal {
  id: string;
  arete: string;
  nombre: string;
  lote: string;
  potrero?: string;  
  estadoReproductivo: EstadoReproductivo;
  estadoSalud: EstadoSalud;
  ultimoPeso: number;
  pesoNacimiento: number;  
  raza: string;
  edad: number;
  sexo: SexoAnimal;
  fechaNacimiento: string;
  fechaDestete?: string;  
  imagen?: string;
  padre?: string;
  madre?: string;
  montas: Monta[];
  vacunas: Vacuna[];
  tratamientos: Tratamiento[];
  pesajes: Pesaje[];
  produccionDiaria?: number;
}
export interface Monta {
  id: string;
  fecha: string;
  semental: string;
  tipo: 'natural' | 'inseminacion';
  diagnostico?: string;
  diagnosticoFecha?: string;
}

export interface Vacuna {
  id: string;
  nombre: string;
  fecha: string;
  proximaFecha: string;
  veterinario: string;
}

export interface Tratamiento {
  id: string;
  tipo: string;
  fecha: string;
  veterinario: string;
  estado: 'activo' | 'completado' | 'suspendido';
}

export interface Pesaje {
  id: string;
  fecha: string;
  peso: number;
}