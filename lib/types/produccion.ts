export type TipoProduccion = 'leche' | 'carne';

// --- Backend response types ---

export interface LecheBackend {
  id: number;
  fincaId: number;
  numero_produccion: string;
  cantidad: number; // litros
  fecha_creacion: string;
  animal?: {
    animal_id: number;
    arete: string;
    nombre: string;
  };
}

export interface CarneBackend {
  id: number;
  fincaId: number;
  peso_canal: number;
  fecha_creacion: string;
  animal?: {
    animal_id: number;
    arete: string;
    nombre: string;
  };
}

// --- Frontend unified type ---

export interface RegistroProduccion {
  id: string;
  tipo: TipoProduccion;
  animalId: string;
  arete: string;
  nombreAnimal: string;
  // Leche
  numeroProduccion?: string;
  cantidad?: number; // litros
  // Carne
  pesoCanal?: number;
  // Common
  fecha: string;
}
