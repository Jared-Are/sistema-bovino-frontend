export interface LoteBackend {
  lote_id: number;
  nombre: string;
  finca_id: number;
  fecha_eliminacion: string | null;
}

export interface Lote {
  id: number;
  nombre: string;
}

export interface LoteFormData {
  nombre: string;
}