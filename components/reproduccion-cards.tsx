"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Stethoscope, Syringe, Activity } from "lucide-react";

interface ReproduccionCardsProps {
  registros: any[];
  selectedRegistro?: string | number;
  onRegistroSelect: (registro: any) => void;
}

export function ReproduccionCards({
  registros,
  selectedRegistro,
  onRegistroSelect,
}: ReproduccionCardsProps) {
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

  if (registros.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg border border-dashed border-zinc-300 mt-6">
        <Activity className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
        <p className="text-zinc-500 font-medium">
          No hay registros reproductivos que coincidan con la búsqueda
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {registros.map((reg) => (
        <div
          key={reg.id}
          onClick={() => onRegistroSelect(reg)}
          className="h-full"
        >
          <Card
            className={`transition-all cursor-pointer h-full hover:shadow-md ${
              selectedRegistro === reg.id
                ? "border-emerald-500 ring-2 ring-emerald-100"
                : "hover:border-emerald-300"
            }`}
          >
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs text-zinc-500 font-medium">
                    VACA / NOVILLA
                  </p>
                  <p className="font-bold text-lg text-zinc-900">{reg.arete}</p>
                  <p className="text-sm text-zinc-600">{reg.nombreAnimal}</p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getBadgeColor(reg.estado)}`}
                >
                  {reg.estado}
                </span>
              </div>

              <div className="space-y-2 border-t border-zinc-100 pt-4">
                <div className="flex items-center text-sm text-zinc-600 font-medium">
                   {reg.numeroMonta}
                </div>
                <div className="flex items-center text-sm text-zinc-600">
                  <Calendar className="w-4 h-4 mr-2 text-zinc-400" />
                  {/* Validamos que exista la fecha antes de formatear */}
                  {reg.fecha ? new Date(reg.fecha).toLocaleDateString() : 'Sin fecha'}
                </div>
                <div className="flex items-center text-sm text-zinc-600">
                  {/* Corregido el icono según el tipo de monta mapeado */}
                  {reg.tipoMonta === "Monta Natural" ? (
                    <Stethoscope className="w-4 h-4 mr-2 text-zinc-400" />
                  ) : (
                    <Syringe className="w-4 h-4 mr-2 text-zinc-400" />
                  )}
                  {reg.tipoMonta}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}