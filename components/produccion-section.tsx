'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, RefreshCcw, Droplets, Beef } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { produccionApi } from '@/lib/api/produccion';
import type { RegistroProduccion, LecheBackend, CarneBackend, TipoProduccion } from '@/lib/types/produccion';
import Link from 'next/link';

import { ProduccionCards } from './produccion-cards';
import { ProduccionFilters } from './produccion-filters';
import { ProduccionDetailsSheet } from './produccion-details-sheet';
import { ProduccionReportDialog } from './produccion-report-dialog';

// Mapear leche del backend al frontend
const mapLecheToFrontend = (b: LecheBackend): RegistroProduccion => ({
  id: b.id.toString(),
  tipo: 'leche',
  animalId: b.animal?.animal_id?.toString() || '',
  arete: b.animal?.arete || 'N/A',
  nombreAnimal: b.animal?.nombre || 'Sin nombre',
  numeroProduccion: b.numero_produccion,
  cantidad: b.cantidad,
  fecha: b.fecha_creacion?.split('T')[0] || '',
  animal: b.animal,
});

// Mapear carne del backend al frontend
const mapCarneToFrontend = (b: CarneBackend): RegistroProduccion => {
  const dateStr = b.fecha_creacion?.split('T')[0] || '';
  let numeroProduccion = b.numero_produccion || (b as any).numeroProduccion || (b as any).etiqueta;

  // Si no viene del backend, reconstruirla: C-DDMMYY-AnimalID (3 dígitos)
  if (!numeroProduccion && b.fecha_creacion && b.animal?.animal_id) {
    const d = new Date(b.fecha_creacion);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear().toString().slice(2);
    const ddmmyy = `${day}${month}${year}`;
    numeroProduccion = `C-${ddmmyy}-${b.animal.animal_id.toString().padStart(3, '0')}`;
  }

  return {
    id: b.id.toString(),
    tipo: 'carne',
    animalId: b.animal?.animal_id?.toString() || '',
    arete: b.animal?.arete || 'N/A',
    nombreAnimal: b.animal?.nombre || 'Sin nombre',
    pesoCanal: b.peso_canal,
    numeroProduccion: numeroProduccion,
    fecha: dateStr,
    animal: b.animal,
  };
};

export function ProduccionSection() {
  const router = useRouter();
  const [registrosLeche, setRegistrosLeche] = useState<RegistroProduccion[]>([]);
  const [registrosCarne, setRegistrosCarne] = useState<RegistroProduccion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [tipoActivo, setTipoActivo] = useState<TipoProduccion>('leche');
  const [sortBy, setSortBy] = useState('fecha');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filterDate, setFilterDate] = useState('');

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const [lecheData, carneData] = await Promise.all([
        produccionApi.getLeche(token).catch(() => []),
        produccionApi.getCarne(token).catch(() => []),
      ]);

      const leche = Array.isArray(lecheData) ? lecheData.map(mapLecheToFrontend) : [];
      const carne = Array.isArray(carneData) ? carneData.map(mapCarneToFrontend) : [];

      setRegistrosLeche(leche);
      setRegistrosCarne(carne);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Error al cargar producción');
    } finally {
      setCargando(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este registro?')) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      if (tipoActivo === 'leche') {
        await produccionApi.deleteLeche(id, token);
      } else {
        await produccionApi.deleteCarne(id, token);
      }

      setIsSheetOpen(false);
      cargarDatos();
    } catch (err: any) {
      console.error('Error al eliminar:', err);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const registrosActivos = tipoActivo === 'leche' ? registrosLeche : registrosCarne;

  const registrosFiltrados = useMemo(() => {
    let result = [...registrosActivos];

    // Búsqueda
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(r =>
        r.arete.toLowerCase().includes(searchLower) ||
        r.nombreAnimal.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por fecha
    if (filterDate) {
      result = result.filter(r => r.fecha === filterDate);
    }

    // Ordenamiento
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'nombre') {
        comparison = a.nombreAnimal.localeCompare(b.nombreAnimal);
      } else if (sortBy === 'cantidad') {
        const valA = a.tipo === 'leche' ? (a.cantidad || 0) : (a.pesoCanal || 0);
        const valB = b.tipo === 'leche' ? (b.cantidad || 0) : (b.pesoCanal || 0);
        comparison = valA - valB;
      } else {
        // Por defecto fecha
        comparison = new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
      }
      return sortDir === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [registrosActivos, search, sortBy, sortDir, filterDate]);

  const registroSeleccionado = registrosActivos.find(r => r.id === selectedId) || null;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">Producción</h1>
              <p className="text-sm text-zinc-500 mt-1">
                {cargando ? 'Cargando...' : `${registrosFiltrados.length} registros encontrados`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={cargarDatos}
                disabled={cargando}
              >
                {cargando ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Actualizar
              </Button>

              <ProduccionReportDialog 
                registrosLeche={registrosLeche}
                registrosCarne={registrosCarne}
                tipoInicial={tipoActivo} 
              />

              <Link href="/produccion/nuevo">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                  <Plus className="w-4 h-4" />
                  Registrar Producción
                </Button>
              </Link>
            </div>
          </div>

          {/* Tabs: Leche / Carne */}
          <div className="mt-4">
            <Tabs value={tipoActivo} onValueChange={(v) => setTipoActivo(v as TipoProduccion)}>
              <TabsList className="bg-zinc-100">
                <TabsTrigger value="leche" className="gap-2 data-[state=active]:bg-white">
                  <Droplets className="w-4 h-4" />
                  Leche
                  <span className="ml-1 text-xs bg-zinc-200 px-1.5 py-0.5 rounded-full">{registrosLeche.length}</span>
                </TabsTrigger>
                <TabsTrigger value="carne" className="gap-2 data-[state=active]:bg-white">
                  <Beef className="w-4 h-4" />
                  Carne
                  <span className="ml-1 text-xs bg-zinc-200 px-1.5 py-0.5 rounded-full">{registrosCarne.length}</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      <div className="p-8">
        <ProduccionFilters
          onSearchChange={setSearch}
          onSortChange={setSortBy}
          onDirectionChange={setSortDir}
          onDateChange={setFilterDate}
          sortValue={sortBy}
          directionValue={sortDir}
          dateValue={filterDate}
        />

        {cargando ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50 rounded-lg border border-red-100">
            <p className="text-red-600 font-medium">{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={cargarDatos}>
              Reintentar
            </Button>
          </div>
        ) : registrosFiltrados.length > 0 ? (
          <ProduccionCards
            registros={registrosFiltrados}
            onSelect={(id) => {
              setSelectedId(id);
              setIsSheetOpen(true);
            }}
          />
        ) : (
          <div className="text-center py-24 bg-white rounded-xl border border-dashed border-zinc-300">
            <div className="mb-4">
              {tipoActivo === 'leche' ? (
                <Droplets className="w-12 h-12 text-zinc-300 mx-auto" />
              ) : (
                <Beef className="w-12 h-12 text-zinc-300 mx-auto" />
              )}
            </div>
            <p className="text-zinc-500 mb-4">
              No hay registros de producción de {tipoActivo === 'leche' ? 'leche' : 'carne'}
            </p>
            <Link href="/produccion/nuevo">
              <Button variant="link" className="text-emerald-600">
                Registrar primer registro
              </Button>
            </Link>
          </div>
        )}
      </div>

      <ProduccionDetailsSheet
        registro={registroSeleccionado}
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onDelete={handleDelete}
      />
    </div>
  );
}