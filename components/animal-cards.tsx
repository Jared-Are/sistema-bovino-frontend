'use client';

import { Badge } from '@/components/ui/badge';
import { Weight, MapPin } from 'lucide-react';
import { useState } from 'react';
import { formatEdad } from '@/lib/api/age-utils';
interface Animal {
  id: string;
  arete: string;
  nombre: string;
  lote: string;
  potrero?: string;
  ultimoPeso: number;
  pesoNacimiento: number;
  raza: string;
  edad: number;
  sexo: string;
  fechaNacimiento: string;
  fechaDestete?: string;
  imagen?: string;
  padre?: string;
  madre?: string;
}

interface AnimalCardsProps {
  animals: Animal[];
  selectedAnimal?: string;
  onAnimalSelect: (animalId: string) => void;
}


export function AnimalCards({ animals, selectedAnimal, onAnimalSelect }: AnimalCardsProps) {
  const [imagesError, setImagesError] = useState<Record<string, boolean>>({});

  if (animals.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <p className="text-zinc-500">No hay animales para mostrar</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {animals.map((animal) => {
        const imagenFalló = imagesError[animal.id];
        const tieneImagen = animal.imagen && !imagenFalló;

        return (
          <div
            key={animal.id}
            onClick={() => onAnimalSelect(animal.id)}
            className={`cursor-pointer rounded-xl border transition-all shadow-sm hover:shadow-md overflow-hidden ${
              selectedAnimal === animal.id 
                ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-200' 
                : 'border-zinc-200 bg-white hover:border-emerald-300'
            }`}
          >
            <div className="w-full h-48 bg-gradient-to-br from-emerald-50 to-emerald-100 relative overflow-hidden">
              {tieneImagen ? (
                <div className="w-full h-full flex items-center justify-center bg-zinc-100">
                  <img
                    src={animal.imagen}
                    alt={animal.nombre}
                    className="w-full h-full object-cover"
                    style={{ 
                      maxHeight: '192px',
                      minHeight: '192px',
                      objectFit: 'cover'
                    }}
                    onError={() => {
                      setImagesError(prev => ({ ...prev, [animal.id]: true }));
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-zinc-100" />
              )}
              
              <div className="absolute top-3 right-3">
                <Badge className="bg-white/90 text-emerald-700 border border-emerald-200 shadow-sm">
                  {animal.sexo}
                </Badge>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className="text-lg font-bold text-zinc-900 truncate">{animal.nombre}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant="secondary" className="bg-zinc-100 text-zinc-700 font-mono text-xs">
                      {animal.arete}
                    </Badge>
                    <span className="text-xs text-zinc-400">·</span>
                    <span className="text-xs text-zinc-500 truncate">{animal.raza}</span>
                  </div>
                </div>
              
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center text-sm text-zinc-600">
                  <MapPin className="w-4 h-4 mr-2 text-zinc-400 shrink-0" />
                  <span className="truncate">{animal.lote}</span>
                </div>
                <div className="flex items-center text-sm text-zinc-600">
                  <Weight className="w-4 h-4 mr-2 text-zinc-400 shrink-0" />
                  <span>{animal.ultimoPeso} kg</span>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-100 flex justify-between items-center">
                <span className="text-xs text-zinc-500">{formatEdad(animal.fechaNacimiento)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}