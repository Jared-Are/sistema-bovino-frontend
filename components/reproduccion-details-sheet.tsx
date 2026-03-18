"use client";

import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Calendar,
  Stethoscope,
  Syringe,
  Trash2,
  Pencil,
  Info,
  User,
} from "lucide-react";

interface ReproduccionData {
  id: number;
  numero_monta: string;
  fecha_programacion: string;
  tipo_monta: string;
  estado: string;
  hembra: { arete: string; nombre: string };
}

interface ReproduccionDetailsSheetProps {
  registro: ReproduccionData | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReproduccionDetailsSheet({
  registro,
  isOpen,
  onOpenChange,
}: ReproduccionDetailsSheetProps) {
  if (!registro) return null;

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

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        // 👇 Aquí igualamos el ancho y el scroll al de Sherly
        className="w-full sm:w-[85%] md:w-[75%] lg:w-[60%] xl:w-[50%] max-w-4xl overflow-y-auto p-0"
      >
        <div className="relative">
          {/* 👇 Encabezado pegajoso con degradado igual al de animales */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 border-b border-zinc-200 sticky top-0 z-10">
            <SheetHeader className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <SheetTitle className="text-3xl font-bold text-zinc-900 flex items-center gap-2">
                    <Activity className="h-6 w-6 text-emerald-600" />
                    Monta: {registro.numero_monta}
                  </SheetTitle>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge className={getBadgeColor(registro.estado)}>
                      {registro.estado}
                    </Badge>
                    <Badge variant="outline" className="bg-white">
                      {registro.tipo_monta}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Link href={`/reproduccion/${registro.id}`}>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Pencil className="w-4 h-4" />
                      <span className="hidden sm:inline">Editar</span>
                    </Button>
                  </Link>
                  <Button size="sm" variant="destructive" className="gap-2">
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Eliminar</span>
                  </Button>
                </div>
              </div>

              {/* 👇 Grid de estadísticas rápidas como el de la Edad/Sexo/Lote */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                <div className="bg-white rounded-lg p-3 border border-zinc-200">
                  <p className="text-xs text-zinc-500 font-medium">Arete</p>
                  <p className="text-lg font-bold text-zinc-900">{registro.hembra?.arete}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-zinc-200">
                  <p className="text-xs text-zinc-500 font-medium">Nombre</p>
                  <p className="text-lg font-bold text-zinc-900 truncate">
                    {registro.hembra?.nombre || "N/A"}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-zinc-200">
                  <p className="text-xs text-zinc-500 font-medium">Método</p>
                  <p className="text-sm font-bold text-zinc-900 mt-1 flex items-center gap-1">
                    {registro.tipo_monta === "Monta Natural" ? (
                      <Stethoscope className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <Syringe className="w-4 h-4 text-zinc-400" />
                    )}
                    <span className="truncate">{registro.tipo_monta}</span>
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-zinc-200">
                  <p className="text-xs text-zinc-500 font-medium">Fecha Programada</p>
                  <p className="text-sm font-bold text-zinc-900 mt-1 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    {new Date(registro.fecha_programacion).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </SheetHeader>
          </div>
        </div>

        {/* 👇 Contenido Principal (Cajas blancas con bordes) */}
        <div className="p-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide flex items-center gap-2">
              <Info className="w-4 h-4" /> Detalles del Servicio
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-zinc-200 rounded-lg p-4 bg-white">
                <p className="text-xs text-zinc-500 font-medium mb-1">Hembra Receptora</p>
                <p className="text-base font-bold text-zinc-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-zinc-400" />
                  {registro.hembra?.arete} - {registro.hembra?.nombre || "Sin nombre"}
                </p>
              </div>
              <div className="border border-zinc-200 rounded-lg p-4 bg-white">
                <p className="text-xs text-zinc-500 font-medium mb-1">Estado de Gestación</p>
                <p className="text-base font-bold text-zinc-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-zinc-400" />
                  {registro.estado}
                </p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}