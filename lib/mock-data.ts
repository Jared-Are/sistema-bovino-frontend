export interface Animal {
  id: string;
  arete: string;
  nombre: string;
  lote: string;
  estadoReproductivo: 'vacia' | 'gestacion' | 'lactancia' | 'seco' | 'preparto';
  estadoSalud: 'sano' | 'enfermo' | 'tratamiento' | 'critico';
  ultimoPeso: number;
  raza: string;
  edad: number;
  sexo: 'Hembra' | 'Macho';
  fechaNacimiento: string;
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

export const mockAnimals: Animal[] = [
  {
    id: '1',
    arete: 'V-001',
    nombre: 'Mariposa',
    lote: 'Lote 2 - Vacas Lecheras',
    estadoReproductivo: 'lactancia',
    estadoSalud: 'sano',
    ultimoPeso: 420,
    raza: 'Holsteín',
    edad: 4,
    sexo: 'Hembra',
    fechaNacimiento: '2020-03-15',
    padre: 'Toro Negro',
    madre: 'Luna',
    montas: [
      {
        id: 'm1',
        fecha: '2024-01-10',
        semental: 'Toro Negro',
        tipo: 'inseminacion',
        diagnostico: 'positivo',
        diagnosticoFecha: '2024-02-10',
      },
    ],
    vacunas: [
      {
        id: 'v1',
        nombre: 'Brucelosis',
        fecha: '2024-01-15',
        proximaFecha: '2025-01-15',
        veterinario: 'Dr. García',
      },
      {
        id: 'v2',
        nombre: 'Fiebre Aftosa',
        fecha: '2024-02-20',
        proximaFecha: '2024-08-20',
        veterinario: 'Dr. García',
      },
    ],
    tratamientos: [],
    pesajes: [
      { id: 'p1', fecha: '2024-03-10', peso: 420 },
      { id: 'p2', fecha: '2024-02-10', peso: 415 },
    ],
    produccionDiaria: 22,
  },
  {
    id: '2',
    arete: 'V-002',
    nombre: 'Toro Negro',
    lote: 'Lote 3 - Toros Reproductores',
    estadoReproductivo: 'seco',
    estadoSalud: 'sano',
    ultimoPeso: 580,
    raza: 'Angus',
    edad: 6,
    sexo: 'Macho',
    fechaNacimiento: '2018-06-20',
    padre: 'Oro',
    madre: 'Blanca',
    montas: [],
    vacunas: [
      {
        id: 'v3',
        nombre: 'Brucelosis',
        fecha: '2024-01-15',
        proximaFecha: '2025-01-15',
        veterinario: 'Dr. García',
      },
    ],
    tratamientos: [],
    pesajes: [
      { id: 'p3', fecha: '2024-03-10', peso: 580 },
    ],
  },
  {
    id: '3',
    arete: 'V-003',
    nombre: 'Perlita',
    lote: 'Lote 1 - Terneras',
    estadoReproductivo: 'gestacion',
    estadoSalud: 'sano',
    ultimoPeso: 395,
    raza: 'Holsteín',
    edad: 2,
    sexo: 'Hembra',
    fechaNacimiento: '2022-10-05',
    padre: 'Toro Negro',
    madre: 'Mariposa',
    montas: [
      {
        id: 'm2',
        fecha: '2024-01-20',
        semental: 'Toro Negro',
        tipo: 'natural',
        diagnostico: 'positivo',
        diagnosticoFecha: '2024-02-15',
      },
    ],
    vacunas: [],
    tratamientos: [],
    pesajes: [
      { id: 'p4', fecha: '2024-03-10', peso: 395 },
    ],
  },
  {
    id: '4',
    arete: 'V-004',
    nombre: 'Café',
    lote: 'Lote 4 - Engorde',
    estadoReproductivo: 'seco',
    estadoSalud: 'sano',
    ultimoPeso: 520,
    raza: 'Brahman',
    edad: 3,
    sexo: 'Macho',
    fechaNacimiento: '2021-05-10',
    padre: 'Toro Negro',
    madre: 'Perlita',
    montas: [],
    vacunas: [],
    tratamientos: [],
    pesajes: [
      { id: 'p5', fecha: '2024-03-10', peso: 520 },
    ],
  },
  {
    id: '5',
    arete: 'V-005',
    nombre: 'Luna',
    lote: 'Lote 2 - Vacas Lecheras',
    estadoReproductivo: 'seco',
    estadoSalud: 'sano',
    ultimoPeso: 440,
    raza: 'Holsteín',
    edad: 5,
    sexo: 'Hembra',
    fechaNacimiento: '2019-08-12',
    padre: 'Oro',
    madre: 'Blanca',
    montas: [],
    vacunas: [
      {
        id: 'v4',
        nombre: 'Brucelosis',
        fecha: '2024-01-15',
        proximaFecha: '2025-01-15',
        veterinario: 'Dr. García',
      },
    ],
    tratamientos: [],
    pesajes: [
      { id: 'p6', fecha: '2024-03-10', peso: 440 },
    ],
    produccionDiaria: 18,
  },
  {
    id: '6',
    arete: 'V-006',
    nombre: 'Oro',
    lote: 'Lote 3 - Toros Reproductores',
    estadoReproductivo: 'seco',
    estadoSalud: 'sano',
    ultimoPeso: 600,
    raza: 'Simmental',
    edad: 7,
    sexo: 'Macho',
    fechaNacimiento: '2017-03-08',
    padre: undefined,
    madre: undefined,
    montas: [],
    vacunas: [],
    tratamientos: [],
    pesajes: [
      { id: 'p7', fecha: '2024-03-10', peso: 600 },
    ],
  },
  {
    id: '7',
    arete: 'V-007',
    nombre: 'Blanca',
    lote: 'Lote 1 - Terneras',
    estadoReproductivo: 'vacia',
    estadoSalud: 'tratamiento',
    ultimoPeso: 380,
    raza: 'Jersey',
    edad: 1,
    sexo: 'Hembra',
    fechaNacimiento: '2023-09-20',
    padre: 'Toro Negro',
    madre: 'Luna',
    montas: [],
    vacunas: [],
    tratamientos: [
      {
        id: 't1',
        tipo: 'Antibiótico',
        fecha: '2024-03-05',
        veterinario: 'Dra. López',
        estado: 'activo',
      },
    ],
    pesajes: [
      { id: 'p8', fecha: '2024-03-10', peso: 380 },
    ],
  },
  {
    id: '8',
    arete: 'V-008',
    nombre: 'Rojo',
    lote: 'Lote 4 - Engorde',
    estadoReproductivo: 'seco',
    estadoSalud: 'sano',
    ultimoPeso: 510,
    raza: 'Brahman',
    edad: 2,
    sexo: 'Macho',
    fechaNacimiento: '2022-07-15',
    padre: 'Toro Negro',
    madre: 'Mariposa',
    montas: [],
    vacunas: [],
    tratamientos: [],
    pesajes: [
      { id: 'p9', fecha: '2024-03-10', peso: 510 },
    ],
  },
];
