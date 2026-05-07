'use client';

import { Badge } from '@/components/ui/badge';
import { Droplets, Beef, Calendar } from 'lucide-react';
import type { RegistroProduccion } from '@/lib/types/produccion';

interface ProduccionCardsProps {
  registros: RegistroProduccion[];
  onSelect: (id: string) => void;
}

export function ProduccionCards({ registros, onSelect }: ProduccionCardsProps) {
  if (registros.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {registros.map((reg) => {
        const isLeche = reg.tipo === 'leche';

        return (
          <div
            key={`${reg.tipo}-${reg.id}`}
            onClick={() => onSelect(reg.id)}
            className="cursor-pointer rounded-xl border border-zinc-200 bg-white p-4 transition-all shadow-sm hover:shadow-md hover:border-emerald-300 group"
          >
            <div className="flex items-center justify-between mb-3">
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 font-mono text-xs">
                {reg.arete}
              </Badge>
              {reg.numeroProduccion && (
                <Badge variant="secondary" className={`text-xs font-mono ${isLeche ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                  {reg.numeroProduccion}
                </Badge>
              )}
            </div>

            <h3 className="text-lg font-bold text-zinc-900 mb-1 truncate">
              {reg.nombreAnimal}
            </h3>

            <div className="flex items-end gap-1 mb-4">
              {isLeche ? (
                <>
                  <span className="text-3xl font-black text-zinc-900">{reg.cantidad || 0}</span>
                  <span className="text-sm text-zinc-500 mb-1 font-medium">Litros</span>
                </>
              ) : (
                <>
                  <span className="text-3xl font-black text-zinc-900">{reg.pesoCanal || 0}</span>
                  <span className="text-sm text-zinc-500 mb-1 font-medium">kg canal</span>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
              <div className="flex items-center text-xs text-zinc-500 gap-1">
                <Calendar className="w-3 h-3" />
                {reg.fecha}
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                isLeche 
                  ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' 
                  : 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white'
              }`}>
                {isLeche ? <Droplets className="w-4 h-4" /> : <Beef className="w-4 h-4" />}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
