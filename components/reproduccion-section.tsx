"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ReproduccionDetailsSheet } from "./reproduccion-details-sheet";
import { ReproduccionCards } from "./reproduccion-cards";
import { ReproduccionFilters } from "./reproduccion-filters";
import { reproduccionApi } from "@/lib/api/reproduccion";
import type {
  RegistroReproduccion,
  ReproduccionBackend,
} from "@/lib/types/reproduccion";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
const mapBackendToFrontend = (
  item: ReproduccionBackend,
): RegistroReproduccion => ({
  id: item.id,
  numeroMonta: item.numero_monta,
  fecha: item.fecha_programacion,
  tipoMonta: item.tipo_monta,
  estado: item.estado,
  animalId: item.hembra?.animal_id.toString() || "0",
  arete: item.hembra?.arete || "Sin arete",
  nombreAnimal: item.hembra?.nombre || "Sin nombre",
});

export function ReproduccionSection() {
  const router = useRouter();
  const { toast } = useToast();

  const [registros, setRegistros] = useState<RegistroReproduccion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filters, setFilters] = useState({
    estados: [] as string[],
    search: "",
  });
  const [selectedRegistro, setSelectedRegistro] =
    useState<RegistroReproduccion | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const cargarRegistros = async () => {
    try {
      setCargando(true);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const data: ReproduccionBackend[] =
        await reproduccionApi.getMontas(token);


      const datosMapeados = data.map(mapBackendToFrontend);
      setRegistros(datosMapeados);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar los registros",
        variant: "destructive",
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarRegistros();
  }, [router]);

  const registrosFiltrados = useMemo(() => {
    return registros.filter((reg) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          reg.numeroMonta?.toLowerCase().includes(searchLower) ||
          reg.arete?.toLowerCase().includes(searchLower) ||
          reg.nombreAnimal?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (filters.estados.length > 0) {
        const estadoReg = reg.estado?.toLowerCase() || "";
        const matchEstado = filters.estados.some(
          (e) => e.toLowerCase() === estadoReg,
        );
        if (!matchEstado) return false;
      }

      return true;
    });
  }, [registros, filters]);

  const opcionesEstados = [...new Set(registros.map((r) => r.estado))].filter(
    Boolean,
  );

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-10 shadow-sm">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                <Activity className="h-6 w-6 text-emerald-600" />
                Control Reproductivo
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                {cargando
                  ? "Cargando..."
                  : `${registrosFiltrados.length} registros encontrados`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 mr-2 border-r pr-4 border-zinc-200">
                <Link href="/reproduccion/partos">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-xs font-bold text-zinc-700 hover:bg-zinc-100"
                  >
                    <Plus className="w-3 h-3" />
                    Partos
                  </Button>
                </Link>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={cargarRegistros}
                disabled={cargando}
              >
                {cargando ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Actualizar
              </Button>

              <Link href="/reproduccion/nuevo">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm">
                  <Plus className="w-4 h-4" /> Registrar Servicio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-[1600px] mx-auto">
        <ReproduccionFilters
          onFiltersChange={setFilters}
          estados={opcionesEstados}
        />

        {cargando ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
            <p className="text-zinc-500 text-sm font-medium animate-pulse">
              Consultando registros...
            </p>
          </div>
        ) : (
          <ReproduccionCards
            registros={registrosFiltrados}
            selectedRegistro={selectedRegistro?.id}
            onRegistroSelect={(reg) => {
              setSelectedRegistro(reg);
              setIsSheetOpen(true);
            }}
          />
        )}
      </div>

      <ReproduccionDetailsSheet
        registro={selectedRegistro as any}
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onSuccess={cargarRegistros}
      />
    </div>
  );
}
