'use client';

import { Badge } from '@/components/ui/badge';
import { Calendar, Stethoscope, Syringe, Pill, Hash } from 'lucide-react';

type Tratamiento = {
  id: number;
  numero_tratamiento?: string;
  tipo_tratamiento?: { id: number; nombre: string };
  animal?: { animal_id: number; arete: string; nombre: string };
  estado: string;
  fecha: string;
  descripcion?: string;
};

interface TratamientoCardProps {
  tratamiento: Tratamiento;
  onClick?: () => void;
}

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
  if (tipoNombre?.toLowerCase().includes("vacuna")) return <Syringe className="h-4 w-4 text-emerald-600" />;
  if (tipoNombre?.toLowerCase().includes("desparasit")) return <Pill className="h-4 w-4 text-emerald-600" />;
  return <Stethoscope className="h-4 w-4 text-emerald-600" />;
};

export function TratamientoCard({ tratamiento, onClick }: TratamientoCardProps) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-xl border transition-all shadow-sm hover:shadow-md overflow-hidden bg-white hover:border-emerald-300 h-full flex flex-col"
    >
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {getIcono(tratamiento.tipo_tratamiento?.nombre)}
            <span className="font-medium text-sm text-zinc-700">
              {tratamiento.tipo_tratamiento?.nombre || "Tratamiento"}
            </span>
          </div>
          <Badge className={getEstadoColor(tratamiento.estado)}>
            {tratamiento.estado}
          </Badge>
        </div>

        {tratamiento.numero_tratamiento && (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs font-mono text-zinc-500">
              {tratamiento.numero_tratamiento}
            </span>
          </div>
        )}

        <div className="mt-2">
          <p className="text-xs text-zinc-500 font-medium">ANIMAL</p>
          <p className="font-bold text-lg text-zinc-900 truncate">
            {tratamiento.animal?.arete || "Sin arete"}
          </p>
          <p className="text-sm text-zinc-600 truncate">
            {tratamiento.animal?.nombre || "Sin nombre"}
          </p>
        </div>
      </div>

      <div className="p-4 pt-2 border-t border-zinc-100 mt-auto">
        <div className="flex items-center text-sm text-zinc-600 mb-2">
          <Calendar className="w-4 h-4 mr-2 text-zinc-400 shrink-0" />
          <span>{tratamiento.fecha}</span>
        </div>
        {tratamiento.descripcion && (
          <p className="text-xs text-zinc-500 line-clamp-2">
            {tratamiento.descripcion}
          </p>
        )}
      </div>
    </div>
  );
}