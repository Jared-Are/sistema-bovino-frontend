'use client';

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Loader2,
  Stethoscope,
  LayoutGrid,
  Calendar as CalendarIcon,
  Kanban
} from "lucide-react";
import { SaludFilters } from "./salud-filters";
import { TratamientoCard } from "./tratamiento-card";
import { KanbanSalud } from "./kanban-salud";
import { CalendarioSalud } from "./calendario-salud";
import { TratamientoDetailsSheet } from "./tratamiento-details-sheet";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

// En salud-section.tsx, actualiza el tipo
type Tratamiento = {
  id: number;
  numero_tratamiento?: string;  // ← Agregar esta línea
  tipo_tratamiento?: { id: number; nombre: string };
  animal?: { animal_id: number; arete: string; nombre: string };
  estado: string;
  fecha: string;
  descripcion?: string;
};

type GlobalFilters = {
  tipos: string[];
  estados: string[];
  search: string;
  mes?: string;
};

export function SaludSection() {
  const router = useRouter();
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedTratamiento, setSelectedTratamiento] = useState<Tratamiento | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('cards');
  const { toast } = useToast();

//filtros globales
  const [globalFilters, setGlobalFilters] = useState<GlobalFilters>({
    tipos: [],
    estados: [],
    search: '',
    mes: undefined,
  });


  const cargarTratamientos = async () => {
    try {
      setCargando(true);
      setError('');
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/salud/tratamientos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Error al cargar tratamientos');

      const data = await response.json();
      setTratamientos(data);
    } catch (err: any) {
      setError(err.message || "No se pudieron cargar los tratamientos");
      toast({
        title: "Error",
        description: err.message || "No se pudieron cargar los tratamientos",
        variant: "destructive",
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarTratamientos();
  }, []);

  const fechasDisponibles = useMemo(() => {
    const meses = new Set<string>();
    tratamientos.forEach(t => {
      const fecha = new Date(t.fecha);
      meses.add(`${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`);
    });
    return Array.from(meses).sort().reverse();
  }, [tratamientos]);


  const tratamientosFiltrados = useMemo(() => {
    return tratamientos.filter((t) => {
      if (globalFilters.search) {
        const searchLower = globalFilters.search.toLowerCase();
        const matchesSearch = 
          t.numero_tratamiento?.toLowerCase().includes(searchLower) ||  // ← Agregar esta línea
          t.animal?.arete?.toLowerCase().includes(searchLower) ||
          t.animal?.nombre?.toLowerCase().includes(searchLower) ||
          t.tipo_tratamiento?.nombre?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      if (globalFilters.tipos.length > 0) {
        if (!globalFilters.tipos.includes(t.tipo_tratamiento?.nombre || '')) return false;
      }

      if (globalFilters.estados.length > 0) {
        if (!globalFilters.estados.includes(t.estado)) return false;
      }

      if (globalFilters.mes) {
        const fecha = new Date(t.fecha);
        const mesTratamiento = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
        if (mesTratamiento !== globalFilters.mes) return false;
      }

      return true;
    });
  }, [tratamientos, globalFilters]);
  const opcionesTipos = [...new Set(tratamientos.map(t => t.tipo_tratamiento?.nombre).filter(Boolean))] as string[];
  const opcionesEstados = [...new Set(tratamientos.map(t => t.estado))].filter(Boolean);

  const handleEstadoChange = async (id: number, nuevoEstado: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/salud/tratamientos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!response.ok) throw new Error('Error al actualizar estado');

      setTratamientos(prev => prev.map(t => 
        t.id === id ? { ...t, estado: nuevoEstado } : t
      ));

      toast({ title: "Estado actualizado", description: "El tratamiento cambió de estado" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/salud/tratamientos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) throw new Error('Error al eliminar');

      setTratamientos(prev => prev.filter(t => t.id !== id));
      toast({ title: "Tratamiento eliminado" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleEdit = (tratamiento: Tratamiento) => {
    router.push(`/salud/${tratamiento.id}`);
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                <Stethoscope className="h-6 w-6 text-emerald-600" />
                Control Sanitario
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                {cargando ? 'Cargando...' : `${tratamientosFiltrados.length} tratamientos registrados`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {error && (
                <span className="text-sm text-red-600">{error}</span>
              )}
              
              <div className="flex items-center gap-2 mr-2 border-r pr-4 border-zinc-200">
                <Link href="/salud/tipos">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    <Plus className="w-3 h-3" />
                    Tipos
                  </Button>
                </Link>
              </div>

              <Button 
                variant="outline" 
                size="sm"
                onClick={cargarTratamientos}
                disabled={cargando}
              >
                {cargando ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Actualizar
              </Button>
              
              <Link href="/salud/nuevo">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                  <Plus className="w-4 h-4" />
                  Registrar Tratamiento
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <SaludFilters 
          onFiltersChange={setGlobalFilters}
          tipos={opcionesTipos}
          estados={opcionesEstados}
          fechasDisponibles={fechasDisponibles}
          showDateFilter={true}
        />

        {cargando ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
                <TabsTrigger value="cards" className="gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  Tarjetas
                </TabsTrigger>
                <TabsTrigger value="kanban" className="gap-2">
                  <Kanban className="h-4 w-4" />
                  Kanban
                </TabsTrigger>
                <TabsTrigger value="calendario" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Calendario
                </TabsTrigger>
              </TabsList>

              <TabsContent value="cards" className="mt-0">
                {tratamientosFiltrados.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {tratamientosFiltrados.map((tratamiento) => (
                      <TratamientoCard
                        key={tratamiento.id}
                        tratamiento={tratamiento}
                        onClick={() => {
                          setSelectedTratamiento(tratamiento);
                          setIsSheetOpen(true);
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-lg">
                    <LayoutGrid className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
                    <p className="text-zinc-500">No hay tratamientos con los filtros seleccionados</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="kanban" className="mt-0">
                <KanbanSalud
                  tratamientos={tratamientosFiltrados} 
                  onTratamientoClick={(tratamiento) => {
                    setSelectedTratamiento(tratamiento);
                    setIsSheetOpen(true);
                  }}
                  onEstadoChange={handleEstadoChange}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </TabsContent>

              <TabsContent value="calendario" className="mt-0">
                <CalendarioSalud
                  tratamientos={tratamientosFiltrados} 
                  onTratamientoClick={(tratamiento) => {
                    setSelectedTratamiento(tratamiento);
                    setIsSheetOpen(true);
                  }}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      <TratamientoDetailsSheet
        tratamiento={selectedTratamiento}
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onDelete={cargarTratamientos}
      />
      <Toaster /> 
    </div>
  );
}