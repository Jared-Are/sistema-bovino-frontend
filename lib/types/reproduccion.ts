// --- Backend response types (Exactamente como tus entidades de NestJS) ---
export interface ReproduccionBackend {
  id: number; // 👈 Cambiado de string a number
  finca_id: number;
  numero_monta: string;
  tipo_monta: string;
  estado: string;
  fecha_programacion: string;
  hembra?: {
    animal_id: number;
    arete: string;
    nombre: string;
  };
}

// --- Frontend unified type (Lo que usan tus componentes) ---
export interface RegistroReproduccion {
  id: number; // 👈 Debe ser number para coincidir
  numeroMonta: string;
  fecha: string;
  tipoMonta: string;
  estado: string;
  animalId: string;
  arete: string;
  nombreAnimal: string;
}