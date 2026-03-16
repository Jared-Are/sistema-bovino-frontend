export interface PotreroBackend {
  potrero_id: number;
  nombre: string;
  ubicacion: string | null;
  finca_id: number;
  fecha_eliminacion: string | null;
}

export interface Potrero {
  id: number;
  nombre: string;
  ubicacion: string;
}

export interface PotreroFormData {
  nombre: string;
  ubicacion?: string;
}