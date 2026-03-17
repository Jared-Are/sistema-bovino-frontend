"use client";

import { ReproduccionDetailsSheet } from "./reproduccion-details-sheet";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Loader2,
  Search,
  Activity,
  Calendar,
  Stethoscope,
  Syringe,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Definición del tipo de datos que viene del Backend de Alex
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
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estados para controlar el Panel Lateral (Sheet)
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
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) throw new Error("Error al cargar");

      const data = await response.json();
      setRegistros(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los registros",
        variant: "destructive",
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarRegistros();
  }, [router, toast]);

  const registrosFiltrados = useMemo(() => {
    return registros.filter((reg) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        reg.numero_monta?.toLowerCase().includes(searchLower) ||
        reg.hembra?.arete?.toLowerCase().includes(searchLower) ||
        reg.hembra?.nombre?.toLowerCase().includes(searchLower) ||
        reg.tipo_monta?.toLowerCase().includes(searchLower) ||
        reg.estado?.toLowerCase().includes(searchLower)
      );
    });
  }, [registros, searchTerm]);

  const getBadgeColor = (estado: string) => {
    switch (estado) {
      case "Confirmada":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Fallida":
        return "bg-red-100 text-red-800 border-red-200";
      case "Aborto":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "Parto Exitoso":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-amber-100 text-amber-800 border-amber-200";
    }
  };

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
                {cargando
                  ? "Cargando..."
                  : `${registrosFiltrados.length} registros encontrados`}
              </p>
            </div>
            <div className="flex items-center gap-3">
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
        <div className="mb-6 max-w-md relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Buscar por arete o número de monta..."
            className="pl-9 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {cargando ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {registrosFiltrados.map((reg) => (
                <div
                  key={reg.id || reg.numero_monta}
                  onClick={() => {
                    setSelectedRegistro(reg);
                    setIsSheetOpen(true);
                  }}
                >
                  <Card className="hover:border-emerald-500 transition-colors cursor-pointer h-full">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-xs text-zinc-500 font-medium">VACA / NOVILLA</p>
                          <p className="font-bold text-lg text-zinc-900">
                            {reg.hembra?.arete || "Sin arete"}
                          </p>
                          <p className="text-sm text-zinc-600">
                            {reg.hembra?.nombre || "Sin nombre"}
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getBadgeColor(reg.estado)}`}>
                          {reg.estado}
                        </span>
                      </div>

                      <div className="space-y-2 border-t pt-4">
                        <div className="flex items-center text-sm text-zinc-600 font-medium">
                          {reg.numero_monta}
                        </div>
                        <div className="flex items-center text-sm text-zinc-600">
                          <Calendar className="w-4 h-4 mr-2 text-zinc-400" />
                          {new Date(reg.fecha_programacion).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-zinc-600">
                          {reg.tipo_monta === "Monta Natural" ? (
                            <Stethoscope className="w-4 h-4 mr-2 text-zinc-400" />
                          ) : (
                            <Syringe className="w-4 h-4 mr-2 text-zinc-400" />
                          )}
                          {reg.tipo_monta}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {registrosFiltrados.length === 0 && (
              <div className="text-center py-16 bg-white rounded-lg border border-dashed border-zinc-300 mt-6">
                <Activity className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
                <p className="text-zinc-500 font-medium">No hay registros reproductivos</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* PANEL LATERAL DE DETALLES */}
      <ReproduccionDetailsSheet 
        registro={selectedRegistro} 
        isOpen={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
      />
    </div>
  );
}