'use client';

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Loader2,
  Stethoscope,
  Calendar,
  Syringe,
  Pill,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SaludFilters } from "./salud-filters";
import { TratamientoDetailsSheet } from "./tratamiento-details-sheet";

type Tratamiento = {
  id: number;
  tipo_tratamiento?: { id: number; nombre: string };
  animal?: { animal_id: number; arete: string; nombre: string };
  estado: string;
  fecha: string;
  descripcion?: string;
};

export function SaludSection() {
  const router = useRouter();
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedTratamiento, setSelectedTratamiento] = useState<Tratamiento | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [filters, setFilters] = useState({
    tipos: [] as string[],
    estados: [] as string[],
    search: '',
    fechaInicio: '',
    fechaFin: '',
  });
  const { toast } = useToast();

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

  const tratamientosFiltrados = useMemo(() => {
    return tratamientos.filter((t) => {
      // Filtro por búsqueda
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          t.animal?.arete?.toLowerCase().includes(searchLower) ||
          t.animal?.nombre?.toLowerCase().includes(searchLower) ||
          t.tipo_tratamiento?.nombre?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Filtro por tipo de tratamiento
      if (filters.tipos.length > 0) {
        if (!filters.tipos.includes(t.tipo_tratamiento?.nombre || '')) return false;
      }

      // Filtro por estado
      if (filters.estados.length > 0) {
        if (!filters.estados.includes(t.estado)) return false;
      }

      // Filtro por fecha
      if (filters.fechaInicio) {
        const fechaTratamiento = new Date(t.fecha).setHours(0,0,0,0);
        const fechaInicio = new Date(filters.fechaInicio).setHours(0,0,0,0);
        if (fechaTratamiento < fechaInicio) return false;
      }

      if (filters.fechaFin) {
        const fechaTratamiento = new Date(t.fecha).setHours(0,0,0,0);
        const fechaFin = new Date(filters.fechaFin).setHours(0,0,0,0);
        if (fechaTratamiento > fechaFin) return false;
      }

      return true;
    });
  }, [tratamientos, filters]);

  const opcionesTipos = [...new Set(tratamientos.map(t => t.tipo_tratamiento?.nombre).filter(Boolean))] as string[];
  const opcionesEstados = [...new Set(tratamientos.map(t => t.estado))].filter(Boolean);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "ACTIVO":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "PENDIENTE":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "COMPLETADO":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "CANCELADO":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getIcono = (tipoNombre?: string) => {
    if (tipoNombre?.toLowerCase().includes("vacuna")) return <Syringe className="h-4 w-4" />;
    if (tipoNombre?.toLowerCase().includes("desparasit")) return <Pill className="h-4 w-4" />;
    return <Stethoscope className="h-4 w-4" />;
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
                {cargando
                  ? "Cargando..."
                  : `${tratamientosFiltrados.length} tratamientos registrados`}
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
                  <Plus className="w-4 h-4" /> Registrar Tratamiento
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <SaludFilters 
          onFiltersChange={setFilters}
          tipos={opcionesTipos}
          estados={opcionesEstados}
        />

        {cargando ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tratamientosFiltrados.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    setSelectedTratamiento(t);
                    setIsSheetOpen(true);
                  }}
                  className="cursor-pointer"
                >
                  <Card className="hover:border-emerald-500 transition-colors h-full">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-xs text-zinc-500 font-medium">ANIMAL</p>
                          <p className="font-bold text-lg text-zinc-900">
                            {t.animal?.arete || "Sin arete"}
                          </p>
                          <p className="text-sm text-zinc-600">
                            {t.animal?.nombre || "Sin nombre"}
                          </p>
                        </div>
                        <Badge className={getEstadoColor(t.estado)}>
                          {t.estado}
                        </Badge>
                      </div>

                      <div className="space-y-2 border-t pt-4">
                        <div className="flex items-center text-sm text-zinc-600 font-medium gap-2">
                          {getIcono(t.tipo_tratamiento?.nombre)}
                          {t.tipo_tratamiento?.nombre || "Sin tipo"}
                        </div>
                        <div className="flex items-center text-sm text-zinc-600">
                          <Calendar className="w-4 h-4 mr-2 text-zinc-400" />
                          {new Date(t.fecha).toLocaleDateString()}
                        </div>
                        {t.descripcion && (
                          <p className="text-xs text-zinc-500 mt-2 line-clamp-2">
                            {t.descripcion}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {tratamientosFiltrados.length === 0 && (
              <div className="text-center py-16 bg-white rounded-lg border border-dashed border-zinc-300 mt-6">
                <Stethoscope className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
                <p className="text-zinc-500 font-medium">No hay tratamientos registrados</p>
              </div>
            )}
          </>
        )}
      </div>

      <TratamientoDetailsSheet
        tratamiento={selectedTratamiento}
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onDelete={cargarTratamientos}
      />
    </div>
  );
}