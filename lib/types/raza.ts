export interface RazaBackend {
  raza_id: number;
  nombre: string;
  descripcion: string | null;
  finca_id: number;
  fecha_eliminacion: string | null;
}

export interface Raza {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface RazaFormData {
  nombre: string;
  descripcion?: string;
}

export const mapRazaBackendToFrontend = (backend: RazaBackend): Raza => ({
  id: backend.raza_id,
  nombre: backend.nombre,
  descripcion: backend.descripcion || '',
});