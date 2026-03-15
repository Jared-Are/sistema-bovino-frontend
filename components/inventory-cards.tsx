'use client';

import { Badge } from '@/components/ui/badge';
import { Animal } from '@/lib/mock-data';
import { Weight, MapPin } from 'lucide-react';

const getEstadoReproductivoBadge = (estado: string) => {
  const config: Record<string, { className: string; label: string }> = {
    vacia: { className: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Vacía' },
    gestacion: { className: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Gestación' },
    lactancia: { className: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Lactancia' },
    seco: { className: 'bg-gray-50 text-gray-700 border-gray-200', label: 'Seco' },
    preparto: { className: 'bg-orange-50 text-orange-700 border-orange-200', label: 'Preparto' },
  };
  return config[estado] || config['vacia'];
};

const getEstadoSaludBadge = (estado: string) => {
  const config: Record<string, { className: string; label: string }> = {
    sano: { className: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Sano' },
    enfermo: { className: 'bg-red-50 text-red-700 border-red-200', label: 'Enfermo' },
    tratamiento: { className: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'Tratamiento' },
    critico: { className: 'bg-red-100 text-red-800 border-red-300', label: 'Crítico' },
  };
  return config[estado] || config['sano'];
};

interface InventoryCardsProps {
  animals?: Animal[];
  selectedAnimal?: string;
  onAnimalSelect?: (animalId: string) => void;
}

export function InventoryCards({ animals = [], selectedAnimal, onAnimalSelect }: InventoryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {animals.map((animal) => {
        const reproductivoBadge = getEstadoReproductivoBadge(animal.estadoReproductivo);
        const saludBadge = getEstadoSaludBadge(animal.estadoSalud);
        const isSelected = selectedAnimal === animal.id;

        return (
          <div
            key={animal.id}
            onClick={() => onAnimalSelect?.(animal.id)}
            className={`cursor-pointer rounded-xl border transition-all duration-200 p-5 shadow-sm hover:shadow-md ${
              isSelected ? 'border-emerald-500 bg-emerald-50/30' : 'border-zinc-200 bg-white hover:border-emerald-300'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-zinc-900">{animal.nombre}</h3>
                <Badge variant="secondary" className="mt-1 bg-zinc-100 text-zinc-700 font-mono text-xs">
                  {animal.arete}
                </Badge>
              </div>
              <Badge variant="outline" className={saludBadge.className}>
                {saludBadge.label}
              </Badge>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-zinc-600">
                <MapPin className="w-4 h-4 mr-2 text-zinc-400" />
                {animal.lote}
              </div>
              <div className="flex items-center text-sm text-zinc-600">
                <Weight className="w-4 h-4 mr-2 text-zinc-400" />
                {animal.ultimoPeso} kg
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex justify-between items-center">
              <span className="text-xs text-zinc-500">{animal.sexo}</span>
              <Badge variant="outline" className={reproductivoBadge.className}>
                {reproductivoBadge.label}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}