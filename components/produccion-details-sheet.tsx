'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Droplets, 
  Beef,
  User, 
  Trash2, 
  Pencil,
  Scale,
  Hash,
} from 'lucide-react';
import Link from 'next/link';
import type { RegistroProduccion } from '@/lib/types/produccion';

interface ProduccionDetailsSheetProps {
  registro: RegistroProduccion | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (id: string) => void;
}

export function ProduccionDetailsSheet({
  registro,
  isOpen,
  onOpenChange,
  onDelete
}: ProduccionDetailsSheetProps) {
  if (!registro) return null;

  const isLeche = registro.tipo === 'leche';
  const editUrl = `/produccion/${registro.tipo}/${registro.id}`;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Badge className={isLeche ? 'bg-blue-600 text-white' : 'bg-amber-600 text-white'}>
              {isLeche ? 'Producción Lechera' : 'Producción Cárnica'}
            </Badge>
            <div className="flex gap-2">
              <Link href={`/produccion/${registro.id}`}>
                <Button size="icon" variant="outline" className="h-8 w-8 text-zinc-500 hover:text-emerald-600">
                  <Pencil className="w-4 h-4" />
                </Button>
              </Link>
              <Button 
                size="icon" 
                variant="outline" 
                className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                onClick={() => onDelete?.(registro.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <SheetTitle className="text-2xl font-bold text-zinc-900">
            {registro.nombreAnimal}
          </SheetTitle>
          <p className="text-sm text-zinc-500 font-mono">{registro.arete}</p>
        </SheetHeader>

        <div className="space-y-6">
          {/* Main metric */}
          {isLeche ? (
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 flex flex-col items-center justify-center text-center">
              <Droplets className="w-8 h-8 text-blue-600 mb-2" />
              <span className="text-4xl font-black text-blue-900">{registro.cantidad || 0}</span>
              <span className="text-sm font-medium text-blue-700">Litros Producidos</span>
            </div>
          ) : (
            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex flex-col items-center justify-center text-center">
              <Scale className="w-8 h-8 text-amber-600 mb-2" />
              <span className="text-4xl font-black text-amber-900">{registro.pesoCanal || 0}</span>
              <span className="text-sm font-medium text-amber-700">kg en Canal</span>
            </div>
          )}

          <div className="space-y-4">
            {isLeche && registro.numeroProduccion && (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-zinc-100">
                <div className="h-10 w-10 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400">
                  <Hash className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 font-medium">Nro. Producción</p>
                  <p className="text-sm font-bold text-zinc-900 font-mono">{registro.numeroProduccion}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 rounded-lg border border-zinc-100">
              <div className="h-10 w-10 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-medium">Fecha de Registro</p>
                <p className="text-sm font-bold text-zinc-900">{registro.fecha}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg border border-zinc-100">
              <div className="h-10 w-10 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-medium">ID del Animal</p>
                <p className="text-sm font-bold text-zinc-900">{registro.animalId}</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-100 space-y-2">
            <Button variant="ghost" className="w-full text-zinc-500" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
