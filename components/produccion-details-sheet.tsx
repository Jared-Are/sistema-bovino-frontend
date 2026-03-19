'use client';

import { useState, useEffect } from 'react';
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
  Trash2, 
  Pencil,
  Scale,
  Hash,
  MapPin,
  Weight,
  Loader2,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import type { RegistroProduccion } from '@/lib/types/produccion';
import { AnimalDetailsSheet } from './animal-details-sheet';

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
  const [animal, setAnimal] = useState<any>(null);
  const [loadingAnimal, setLoadingAnimal] = useState(false);
  const [isAnimalSheetOpen, setIsAnimalSheetOpen] = useState(false);

  useEffect(() => {
    if (isOpen && registro?.animalId) {
      const fetchAnimal = async () => {
        setLoadingAnimal(true);
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/animales/${registro.animalId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setAnimal(data);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingAnimal(false);
        }
      };
      fetchAnimal();
    } else if (!isOpen) {
      setAnimal(null);
    }
  }, [isOpen, registro?.animalId]);

  if (!registro) return null;

  const isLeche = registro.tipo === 'leche';
  
  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto [&>button]:hidden">
          <SheetHeader className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <Badge className={isLeche ? 'bg-blue-600 text-white' : 'bg-amber-600 text-white'}>
                {isLeche ? 'Producción Lechera' : 'Producción Cárnica'}
              </Badge>
              <div className="flex gap-2">
                <Link href={`/produccion/${registro.id}`}>
                  <Button variant="outline" size="sm" className="h-9 gap-2 text-zinc-600 hover:text-emerald-600 hover:border-emerald-200">
                    <Pencil className="w-4 h-4" />
                    <span className="font-medium">Editar</span>
                  </Button>
                </Link>
                <Button 
                  variant="destructive" 
                  size="sm"
                  className="h-9 gap-2"
                  onClick={() => onDelete?.(registro.id)}
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="font-medium">Borrar</span>
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
              <h4 className="text-sm font-semibold text-zinc-900 px-1">Detalles de Producción</h4>
              
              <div className="grid grid-cols-1 gap-3">
                {isLeche && registro.numeroProduccion && (
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 bg-white shadow-sm">
                    <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                      <Hash className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Etiqueta</p>
                      <p className="text-sm font-bold text-zinc-900 font-mono">{registro.numeroProduccion}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 bg-white shadow-sm">
                  <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Fecha de Registro</p>
                    <p className="text-sm font-bold text-zinc-900">{registro.fecha}</p>
                  </div>
                </div>
              </div>

              {/* Animal Card */}
              <div className="mt-8">
                <h4 className="text-sm font-semibold text-zinc-900 mb-3 px-1">Información del Animal</h4>
                {loadingAnimal ? (
                  <div className="flex items-center justify-center p-8 bg-zinc-50 rounded-xl border border-dashed">
                    <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                  </div>
                ) : animal ? (
                  <div 
                    onClick={() => setIsAnimalSheetOpen(true)}
                    className="group cursor-pointer bg-white rounded-xl border border-zinc-200 overflow-hidden hover:border-emerald-400 transition-all hover:shadow-md"
                  >
                    <div className="flex gap-4 p-3 font-sans">
                      <div className="h-20 w-20 rounded-lg bg-zinc-100 overflow-hidden shrink-0 border border-zinc-100">
                        {animal.imagen ? (
                          <img 
                            src={animal.imagen} 
                            alt={animal.nombre} 
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-zinc-50">
                            <Beef className="w-8 h-8 text-zinc-200" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h5 className="font-bold text-zinc-900 truncate group-hover:text-emerald-600 transition-colors uppercase">
                          {animal.nombre || 'Sin nombre'}
                        </h5>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-[10px] py-0 font-mono bg-zinc-50">
                            {animal.arete}
                          </Badge>
                          <span className="text-xs text-zinc-400 truncate tracking-tight">{animal.raza?.nombre || 'Sin raza'}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-zinc-500">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate max-w-[80px]">{animal.lote?.nombre || 'S/L'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Weight className="w-3 h-3" />
                            <span>{animal.peso_actual} kg</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-center pr-1">
                        <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-emerald-400 transition-colors" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-zinc-50 rounded-xl border border-dashed text-center">
                    <p className="text-xs text-zinc-400">No se pudo cargar la información del animal</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Sheet para ver detalles del animal (lectura) */}
      {animal && (
        <AnimalDetailsSheet
          animal={{
            id: animal.animal_id.toString(),
            arete: animal.arete,
            nombre: animal.nombre || 'Sin nombre',
            sexo: animal.sexo,
            raza: animal.raza?.nombre || 'Sin raza',
            fechaNacimiento: animal.fecha_nacimiento?.split('T')[0] || '',
            edad: 0,
            ultimoPeso: animal.peso_actual,
            pesoNacimiento: animal.peso_nacimiento,
            lote: animal.lote?.nombre || 'Sin lote',
            potrero: animal.potrero?.nombre || undefined,
            estadoReproductivo: animal.estado_reproductivo,
            estadoSalud: 'sano',
            imagen: animal.imagen,
            madre: animal.madre?.nombre,
            padre: animal.padre?.nombre,
            montas: [],
            tratamientos: [],
            pesajes: [],
          }}
          isOpen={isAnimalSheetOpen}
          onOpenChange={setIsAnimalSheetOpen}
          readOnly={true}
        />
      )}
    </>
  );
}
