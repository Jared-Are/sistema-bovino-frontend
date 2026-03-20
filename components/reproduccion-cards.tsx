"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Stethoscope, Syringe, Activity, Baby } from "lucide-react";

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
    const est = estado?.toLowerCase() || "";
    if (est.includes("confirmada") || est.includes("gestante")) return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (est.includes("fallida")) return "bg-red-100 text-red-800 border-red-200";
    if (est.includes("aborto")) return "bg-rose-100 text-rose-800 border-rose-200";
    if (est.includes("parto")) return "bg-blue-100 text-blue-800 border-blue-200";
    return "bg-amber-100 text-amber-800 border-amber-200"; // Programada
  };

  // 👇 Magia: Calcular 283 días automáticamente
  const calcularFechaParto = (fechaMonta: string) => {
    if (!fechaMonta) return "Sin fecha";
    const fecha = new Date(fechaMonta);
    fecha.setDate(fecha.getDate() + 283); // Sumar 283 días de gestación bovina
    return fecha.toLocaleDateString("es-ES", { day: '2-digit', month: 'short', year: 'numeric' });
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
      {registros.map((reg) => {
        const estadoLower = reg.estado?.toLowerCase() || "";
        const estaPreñada = estadoLower.includes("confirmada") || estadoLower.includes("gestante");

        return (
          <div key={reg.id} onClick={() => onRegistroSelect(reg)} className="h-full">
            <Card className={`transition-all cursor-pointer h-full hover:shadow-md ${selectedRegistro === reg.id ? "border-emerald-500 ring-2 ring-emerald-100" : "hover:border-emerald-300"}`}>
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs text-zinc-500 font-medium uppercase">Arete: {reg.arete}</p>
                      <p className="font-bold text-lg text-zinc-900 truncate">{reg.nombreAnimal}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border text-center ${getBadgeColor(reg.estado)}`}>
                      {reg.estado}
                    </span>
                  </div>

                  <div className="space-y-2 border-t border-zinc-100 pt-4">
                    {/* 👇 Número de monta agregado correctamente (sin romper el HTML) */}
                    <div className="flex items-center text-sm text-zinc-600 font-medium">
                       {reg.numeroMonta}
                    </div>
                    <div className="flex items-center text-sm text-zinc-600">
                      <Calendar className="w-4 h-4 mr-2 text-zinc-400" />
                      Monta: {reg.fecha ? new Date(reg.fecha).toLocaleDateString() : 'Sin fecha'}
                    </div>
                    <div className="flex items-center text-sm text-zinc-600">
                      {reg.tipoMonta === "Monta Natural" ? <Stethoscope className="w-4 h-4 mr-2 text-zinc-400" /> : <Syringe className="w-4 h-4 mr-2 text-zinc-400" />}
                      {reg.tipoMonta}
                    </div>
                  </div>
                </div>

                {/* 👇 Si está preñada, renderizamos la etiqueta de Fecha Probable de Parto */}
                {estaPreñada && (
                  <div className="mt-4 bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <Baby className="w-4 h-4 text-emerald-600" /> 
                      Probable Parto:
                    </span>
                    <span className="text-sm font-black text-emerald-900">
                      {calcularFechaParto(reg.fecha)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}