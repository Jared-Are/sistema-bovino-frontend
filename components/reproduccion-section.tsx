"use client";

import { ReproduccionDetailsSheet } from "./reproduccion-details-sheet";
import { ReproduccionCards } from "./reproduccion-cards";
import { ReproduccionFilters } from "./reproduccion-filters";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ReproduccionData = {
  id: number;
  numero_monta: string;
  fecha_programacion: string;
  tipo_monta: string;
  estado: string;
  hembra: { arete: string; nombre: string };
};

export function ReproduccionSection() {
  const router = useRouter();
  const [registros, setRegistros] = useState<ReproduccionData[]>([]);
  const [cargando, setCargando] = useState(true);
  
  // Estado para los filtros nuevos
  const [filters, setFilters] = useState({ estados: [] as string[], search: "" });
  
  const [selectedRegistro, setSelectedRegistro] = useState<ReproduccionData | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { toast } = useToast();

  const cargarRegistros = async () => {
    try {
      setCargando(true);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reproduccion/montas`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Error al cargar");
      const data = await response.json();
      setRegistros(data);
    } catch (error) {
      toast({ title: "Error", description: "No se pudieron cargar los registros", variant: "destructive" });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarRegistros();
  }, [router, toast]);

  // Lógica de filtrado combinada
  const registrosFiltrados = useMemo(() => {
    return registros.filter((reg) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          reg.numero_monta?.toLowerCase().includes(searchLower) ||
          reg.hembra?.arete?.toLowerCase().includes(searchLower) ||
          reg.hembra?.nombre?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (filters.estados.length > 0) {
        if (!filters.estados.includes(reg.estado)) return false;
      }

      return true;
    });
  }, [registros, filters]);

  // Extraer estados únicos para pasarlos a los filtros
  const opcionesEstados = [...new Set(registros.map(r => r.estado))].filter(Boolean);

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* ENCABEZADO STICKY */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                <Activity className="h-6 w-6 text-emerald-600" />
                Control Reproductivo
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                {cargando ? "Cargando..." : `${registrosFiltrados.length} registros encontrados`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={cargarRegistros} disabled={cargando}>
                {cargando && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Actualizar
              </Button>
              <Link href="/reproduccion/nuevo">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                  <Plus className="w-4 h-4" /> Registrar Servicio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="p-8">
        <ReproduccionFilters 
          onFiltersChange={setFilters} 
          estados={opcionesEstados} 
        />

        {cargando ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <ReproduccionCards 
            registros={registrosFiltrados}
            selectedRegistro={selectedRegistro?.id || selectedRegistro?.numero_monta}
            onRegistroSelect={(reg) => {
              setSelectedRegistro(reg);
              setIsSheetOpen(true);
            }}
          />
        )}
      </div>

      <ReproduccionDetailsSheet 
        registro={selectedRegistro} 
        isOpen={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
      />
    </div>
  );
}