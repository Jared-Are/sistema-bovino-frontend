'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { InventoryFilters } from './inventory-filters';
import { AnimalDetailsSheet } from './animal-details-sheet';
import { mockAnimals } from '@/lib/mock-data';
import { InventoryCards } from './inventory-cards'; 

export function InventorySection() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [filters, setFilters] = useState({
    lotes: [] as string[],
    estados: [] as string[],
    search: '',
  });

  // 🛡️ GUARDIA DEL FRONTEND (Optimizado)
  useEffect(() => {
    const validarSesion = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        router.push('/login');
      } else {
        setIsAuthenticated(true);
      }
    };

    // 1. Revisar al instante de cargar la página
    validarSesion();

    // 2. Revisar si el usuario cierra sesión desde otra pestaña del navegador
    // Esto es muy ligero y no consume recursos como el setInterval
    window.addEventListener('storage', validarSesion);

    return () => {
      window.removeEventListener('storage', validarSesion);
    };
  }, [router]);

  const selectedAnimal = mockAnimals.find((a) => a.id === selectedAnimalId);

  // Filter animals based on active filters
  const filteredAnimals = useMemo(() => {
    return mockAnimals.filter((animal) => {
      // Search filter
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        animal.arete.toLowerCase().includes(searchLower) ||
        animal.nombre.toLowerCase().includes(searchLower) ||
        animal.lote.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // Lote filter
      if (filters.lotes.length > 0) {
        const matchesLote = filters.lotes.some((lote) => animal.lote.includes(lote.replace('lote-', 'Lote ')));
        if (!matchesLote) return false;
      }

      // Estado filter
      if (filters.estados.length > 0) {
        if (!filters.estados.includes(animal.estadoReproductivo)) return false;
      }

      return true;
    });
  }, [filters]);

  const handleAnimalSelect = (animalId: string) => {
    setSelectedAnimalId(animalId);
    setIsSheetOpen(true);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  // Pantalla de carga mientras el Guardia verifica la sesión
  if (!isAuthenticated) {
    return (
      <main className="ml-64 min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="animate-pulse text-emerald-600 font-medium text-lg">
          Verificando credenciales...
        </div>
      </main>
    );
  }

  return (
    <main className="ml-64 min-h-screen bg-zinc-50">
      {/* Header - Fixed */}
      <div className="fixed top-0 right-0 left-64 bg-white border-b border-zinc-200 z-20">
        <div className="h-16 flex items-center justify-between px-8">
          {/* Placeholder for consistent spacing */}
        </div>
        {/* KPI Cards below - handled by Header component */}
      </div>

      {/* Main Content */}
      <div className="pt-32 p-8">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 mb-2">
              Inventario de Animales
            </h1>
            <p className="text-zinc-500">Gestiona el rebaño de tu finca</p>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
            <Plus className="w-4 h-4" />
            Registrar Animal
          </Button>
        </div>

        {/* Filters Section */}
        <InventoryFilters onFiltersChange={handleFilterChange} />

        {/* Cards Section */}
        <div className="mt-6">
          <InventoryCards
            animals={filteredAnimals}
            selectedAnimal={selectedAnimalId || undefined}
            onAnimalSelect={handleAnimalSelect}
          />
        </div>
      </div> 

      {/* Animal Details Sheet */}
      <AnimalDetailsSheet
        animal={selectedAnimal || null}
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
    </main>
  );
}