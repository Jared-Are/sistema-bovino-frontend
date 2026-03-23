'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Beef} from 'lucide-react';
import { AnimalFilters } from './animal-filters';
import { AnimalDetailsSheet } from './animal-details-sheet';
import { AnimalCards } from './animal-cards';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

type SexoAnimal = 'Macho' | 'Hembra';
type EstadoReproductivo = 'vacia' | 'gestante' | 'lactando' | 'seca' | 'en celo' | 'inseminada' | 'parida';

interface AnimalBackend {
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

interface Animal {
  id: string;
  arete: string;
  nombre: string;
  lote: string;
  potrero?: string;
  estadoReproductivo: EstadoReproductivo;
  estadoSalud: 'sano' | 'enfermo' | 'tratamiento' | 'critico';
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
  montas: any[];
  vacunas: any[];
  tratamientos: any[];
  pesajes: any[];
  produccionDiaria?: number;
}

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

const mapEstadoReproductivo = (estadoBackend: string): EstadoReproductivo => {
  const mapa: Record<string, EstadoReproductivo> = {
    'Vacía': 'vacia',
    'Gestante': 'gestante',     
    'Lactando': 'lactando',       
    'Seca': 'seca',
    'En celo': 'en celo',           
    'Inseminada': 'inseminada',    
    'Parida': 'parida',
  };
  
  return mapa[estadoBackend] || 'vacia';
};

const mapBackendToFrontend = (backend: AnimalBackend): Animal => ({
  id: backend.animal_id.toString(),
  arete: backend.arete,
  nombre: backend.nombre || 'Sin nombre',
  sexo: backend.sexo,
  raza: backend.raza?.nombre || 'Sin raza',
  fechaNacimiento: backend.fecha_nacimiento.split('T')[0],
  fechaDestete: backend.fecha_destete ? backend.fecha_destete.split('T')[0] : undefined,
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
  const { toast } = useToast();
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
      router.push('/');
    }
  }, [router]);

  const cargarAnimales = async () => {
    try {
      setCargando(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/animales`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('No autorizado');
        throw new Error('Error al cargar animales');
      }

      const data = await response.json();
      const animalesMapeados = data.map(mapBackendToFrontend);
      setAnimales(animalesMapeados);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Error al cargar los animales');
      
      toast({
        title: "Error al cargar",
        description: err.message || 'No se pudieron cargar los animales',
        variant: "destructive",
        duration: 5000,
      });
      
      if (err.message === 'No autorizado') {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        router.push('/');
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
              <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                <Beef className="h-6 w-6 text-emerald-600" />
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
      
      <Toaster />
    </div>
  );
}