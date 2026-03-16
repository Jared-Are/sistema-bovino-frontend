'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { AnimalFilters } from './animal-filters';
import { AnimalDetailsSheet } from './animal-details-sheet';
import { AnimalCards } from './animal-cards';
import { animalesApi } from '@/lib/api/animales';
import type { Animal, AnimalBackend, EstadoReproductivo } from '@/lib/types/animal';
import Link from 'next/link';

const calcularEdadEnAños = (fechaNacimiento: string): number => {
  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  
  return edad;
};

// Mapear estados del backend al formato del frontend
const mapEstadoReproductivo = (estadoBackend: string): EstadoReproductivo => {
  const mapa: Record<string, EstadoReproductivo> = {
    'Vacía': 'vacia',
    'Gestación': 'gestacion',
    'Lactancia': 'lactancia',
    'Seca': 'seco',
    'Preparto': 'preparto',
    'vacia': 'vacia',
    'gestacion': 'gestacion',
    'lactancia': 'lactancia',
    'seco': 'seco',
    'preparto': 'preparto',
  };
  
  return mapa[estadoBackend] || 'vacia';
};

// Mapear datos del backend al frontend
const mapBackendToFrontend = (backend: AnimalBackend): Animal => ({
  id: backend.animal_id.toString(),
  arete: backend.arete,
  nombre: backend.nombre || 'Sin nombre',
  sexo: backend.sexo,
  raza: backend.raza?.nombre || 'Sin raza',
  fechaNacimiento: backend.fecha_nacimiento.split('T')[0],
  fechaDestete: backend.fecha_destete ? backend.fecha_destete.split('T')[0] : undefined, // 👈 AHORA RECONOCE
  edad: calcularEdadEnAños(backend.fecha_nacimiento),
  ultimoPeso: backend.peso_actual,
  pesoNacimiento: backend.peso_nacimiento,
  lote: backend.lote?.nombre || 'Sin lote',
  potrero: backend.potrero?.nombre || undefined,
  estadoReproductivo: mapEstadoReproductivo(backend.estado_reproductivo),
  estadoSalud: 'sano',
  imagen: backend.imagen,
  padre: backend.padre?.nombre || undefined,
  madre: backend.madre?.nombre || undefined,
  montas: [],
  tratamientos: [],
  vacunas: [],
  pesajes: [],
  produccionDiaria: backend.sexo === 'Hembra' ? 15 : undefined,
});

export function AnimalSection() {
  const router = useRouter();
  const [animales, setAnimales] = useState<Animal[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [filters, setFilters] = useState({
    lotes: [] as string[],
    estados: [] as string[],
    search: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const cargarAnimales = async () => {
    try {
      setCargando(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const data = await animalesApi.getAll(token);
      const animalesMapeados = data.map(mapBackendToFrontend);
      setAnimales(animalesMapeados);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Error al cargar los animales');
      
      if (err.message === 'No autorizado') {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        router.push('/login');
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarAnimales();
  }, []);

  const filteredAnimals = useMemo(() => {
    return animales.filter((animal) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          animal.arete.toLowerCase().includes(searchLower) ||
          animal.nombre.toLowerCase().includes(searchLower) ||
          animal.lote.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      if (filters.lotes.length > 0) {
        if (!filters.lotes.includes(animal.lote)) return false;
      }

      if (filters.estados.length > 0) {
        if (!filters.estados.includes(animal.estadoReproductivo)) return false;
      }

      return true;
    });
  }, [animales, filters]);

  const selectedAnimal = animales.find((a) => a.id === selectedAnimalId);

  const opcionesLotes = [...new Set(animales.map(a => a.lote))].filter(Boolean);
  const opcionesEstados = [...new Set(animales.map(a => a.estadoReproductivo))].filter(Boolean);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">
                Animales
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                {cargando ? 'Cargando...' : `${filteredAnimals.length} animales encontrados`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {error && (
                <span className="text-sm text-red-600">{error}</span>
              )}
              
              <div className="flex items-center gap-2 mr-2 border-r pr-4 border-zinc-200">
                <Link href="/parametros/razas">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    <Plus className="w-3 h-3" />
                    Razas
                  </Button>
                </Link>
                <Link href="/parametros/lotes">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    <Plus className="w-3 h-3" />
                    Lotes
                  </Button>
                </Link>
                <Link href="/parametros/potreros">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    <Plus className="w-3 h-3" />
                    Potreros
                  </Button>
                </Link>
              </div>

              <Button 
                variant="outline" 
                size="sm"
                onClick={cargarAnimales}
                disabled={cargando}
              >
                {cargando ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Actualizar
              </Button>
              
              <Link href="/animales/nuevo">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                  <Plus className="w-4 h-4" />
                  Registrar Animal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <AnimalFilters 
          onFiltersChange={setFilters}
          lotes={opcionesLotes}
          estados={opcionesEstados}
        />

        {cargando ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <>
            <div className="mt-6">
              <AnimalCards
                animals={filteredAnimals}
                selectedAnimal={selectedAnimalId || undefined}
                onAnimalSelect={(id) => {
                  setSelectedAnimalId(id);
                  setIsSheetOpen(true);
                }}
              />
            </div>

            {filteredAnimals.length === 0 && !cargando && (
              <div className="text-center py-12">
                <p className="text-zinc-500">No se encontraron animales</p>
                <Link href="/animales/nuevo">
                  <Button 
                    variant="link" 
                    className="text-emerald-600 mt-2"
                  >
                    Registrar tu primer animal
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div> 

      <AnimalDetailsSheet
        animal={selectedAnimal || null}
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
    </div>
  );
}