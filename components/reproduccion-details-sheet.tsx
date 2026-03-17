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
        className="w-full sm:w-[500px] overflow-y-auto p-0"
      >
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 border-b border-zinc-200">
          <SheetHeader className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <SheetTitle className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-emerald-600" />
                  {registro.numero_monta}
                </SheetTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getBadgeColor(registro.estado)}>
                    {registro.estado}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                {/* 👇 Envolvemos el botón en un Link que apunte a la ruta de edición */}
                <Link href={`/reproduccion/${registro.id}`}>
                  <Button size="icon" variant="outline" className="h-8 w-8">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>

                <Button size="icon" variant="destructive" className="h-8 w-8">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SheetHeader>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide flex items-center gap-2">
              <Info className="w-4 h-4" /> Información del Servicio
            </h3>

            <div className="border border-zinc-200 rounded-lg p-4 bg-white space-y-4">
              <div>
                <p className="text-xs text-zinc-500 font-medium mb-1">
                  Vaca / Novilla (Hembra)
                </p>
                <p className="text-base font-bold text-zinc-900">
                  {registro.hembra?.arete} -{" "}
                  {registro.hembra?.nombre || "Sin nombre"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100">
                <div>
                  <p className="text-xs text-zinc-500 font-medium mb-1">
                    Tipo de Servicio
                  </p>
                  <p className="text-sm font-medium text-zinc-900 flex items-center gap-2">
                    {registro.tipo_monta === "Monta Natural" ? (
                      <Stethoscope className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <Syringe className="w-4 h-4 text-zinc-400" />
                    )}
                    {registro.tipo_monta}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 font-medium mb-1">
                    Fecha Programada
                  </p>
                  <p className="text-sm font-medium text-zinc-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    {formatFecha(registro.fecha_programacion)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
