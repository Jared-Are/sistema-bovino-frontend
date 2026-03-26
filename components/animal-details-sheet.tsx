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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  TreePine,
  Pencil,
  Trash2,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/modal';
import { formatEdad } from '@/lib/api/age-utils';
import { TratamientoCard } from './tratamiento-card';
import { ReproduccionCards } from './reproduccion-cards';
import { ProduccionCards } from './produccion-cards';

type SexoAnimal = 'Macho' | 'Hembra';

interface Animal {
  id: string;
  arete: string;
  nombre: string;
  lote: string;
  potrero?: string;
  ultimoPeso: number;
  pesoNacimiento: number;
  raza: string | { raza_id: number; nombre: string; descripcion?: string };
  edad: number;
  sexo: SexoAnimal;
  fechaNacimiento: string;
  fechaDestete?: string;
  imagen?: string;
  padre?: string;
  madre?: string;
  padreId?: string;
  madreId?: string;
}

interface AnimalDetailsSheetProps {
  animal: Animal | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  readOnly?: boolean;
}

const formatFecha = (fecha: string) => {
  if (!fecha) return 'No registrada';
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export function AnimalDetailsSheet({
  animal,
  isOpen,
  onOpenChange,
  readOnly = false,
}: AnimalDetailsSheetProps) {
  const [tratamientos, setTratamientos] = useState<any[]>([]);
  const [reproducciones, setReproducciones] = useState<any[]>([]);
  const [producciones, setProducciones] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [animalPadre, setAnimalPadre] = useState<Animal | null>(null);
  const [animalMadre, setAnimalMadre] = useState<Animal | null>(null);
  const [cargandoPadres, setCargandoPadres] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  
  const cargarHistoriales = async () => {
    if (!animal) return;
    
    setCargando(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const tratamientosRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/salud/tratamientos?animalId=${animal.id}&limit=3`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (tratamientosRes.ok) {
        const data = await tratamientosRes.json();
        const tratamientosFormateados = data.map((t: any) => ({
          id: t.id,
          numero_tratamiento: t.numero_tratamiento,
          tipo_tratamiento: t.tipo_tratamiento,
          animal: {
            animal_id: parseInt(animal.id),
            arete: animal.arete,
            nombre: animal.nombre
          },
          estado: t.estado,
          fecha: t.fecha,
          descripcion: t.descripcion
        }));
        setTratamientos(tratamientosFormateados);
      }

      const reproduccionesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reproduccion/montas?animalId=${animal.id}&limit=3`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (reproduccionesRes.ok) {
        const data = await reproduccionesRes.json();
        const reproduccionesFormateadas = data.map((r: any) => ({
          id: r.id,
          numeroMonta: r.numero_monta,
          fecha: r.fecha_programacion,
          tipoMonta: r.tipo_monta,
          estado: r.estado,
          animalId: animal.id,
          arete: animal.arete,
          nombreAnimal: animal.nombre
        }));
        setReproducciones(reproduccionesFormateadas);
      }

      const [lecheRes, carneRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/produccion/leche?animalId=${animal.id}&limit=3`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/produccion/carne?animalId=${animal.id}&limit=3`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      let produccionesData: any[] = [];

      if (lecheRes.ok) {
        const lecheData = await lecheRes.json();
        const lecheFormateada = lecheData.map((l: any) => ({
          id: l.id.toString(),
          tipo: 'leche',
          animalId: animal.id,
          arete: animal.arete,
          nombreAnimal: animal.nombre,
          numeroProduccion: l.numero_produccion,
          cantidad: l.cantidad,
          fecha: l.fecha_creacion?.split('T')[0] || '',
        }));
        produccionesData = [...produccionesData, ...lecheFormateada];
      }

      if (carneRes.ok) {
        const carneData = await carneRes.json();
        const carneFormateada = carneData.map((c: any) => ({
          id: c.id.toString(),
          tipo: 'carne',
          animalId: animal.id,
          arete: animal.arete,
          nombreAnimal: animal.nombre,
          numeroProduccion: c.numero_produccion,
          pesoCanal: c.peso_canal,
          fecha: c.fecha_creacion?.split('T')[0] || '',
        }));
        produccionesData = [...produccionesData, ...carneFormateada];
      }

      produccionesData.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      setProducciones(produccionesData.slice(0, 3));

    } catch (error) {
      console.error('Error cargando historiales:', error);
    } finally {
      setCargando(false);
    }
  };

const cargarPadres = async () => {
  if (!animal) return;
  
  setCargandoPadres(true);
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (animal.madreId) {
      const madreRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/animales/${animal.madreId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (madreRes.ok) {
        const madre = await madreRes.json();
        setAnimalMadre({
          ...madre,
          id: madre.animal_id?.toString() 
        });
      }
    }

    if (animal.padreId) {
      const padreRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/animales/${animal.padreId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (padreRes.ok) {
        const padre = await padreRes.json();
        setAnimalPadre({
          ...padre,
          id: padre.animal_id?.toString() 
        });
      }
    }
  } catch (error) {
    console.error('Error cargando padres:', error);
  } finally {
    setCargandoPadres(false);
  }
};
  useEffect(() => {
    if (isOpen && animal) {
      cargarHistoriales();
      cargarPadres();
    }
  }, [isOpen, animal]);

  const handleNuevoRegistro = (ruta: string) => {
    router.push(`${ruta}?animalId=${animal?.id}`);
    onOpenChange(false);
  };

  const handleVerTodos = (modulo: string) => {
    router.push(`/${modulo}/animal/${animal?.id}`);
    onOpenChange(false);
  };

  const handleRegistroSelect = (registro: any) => {
    if (registro.id) {
      router.push(`/reproduccion/${registro.id}`);
      onOpenChange(false);
    }
  };

  const handleTratamientoSelect = (tratamiento: any) => {
    if (tratamiento.id) {
      router.push(`/salud/${tratamiento.id}`);
      onOpenChange(false);
    }
  };

  const handleProduccionSelect = (id: string) => {
    router.push(`/produccion/${id}`);
    onOpenChange(false);
  };

  const handleParentClick = (parentId: string) => {
    router.push(`/animales/${parentId}`);
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!animal) return;
    
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/animales/${animal.id}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.ok) {
        toast({
          title: "✅ Animal eliminado",
          description: `${animal.nombre} ha sido eliminado exitosamente`,
          duration: 3000,
        });
        onOpenChange(false);
        window.location.reload();
      } else {
        throw new Error('Error al eliminar');
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "No se pudo eliminar el animal",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setDeleting(false);
      setModalOpen(false);
    }
  };

  if (!animal) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full sm:w-[94%] md:w-[88%] lg:w-[75%] xl:w-[65%] max-w-5xl overflow-y-auto p-0"
      >
        <div className="relative">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 border-b border-zinc-200 sticky top-0 z-10">
            <SheetHeader className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <SheetTitle className="text-3xl font-bold text-zinc-900">
                    {animal.nombre}
                  </SheetTitle>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge className="bg-emerald-600 text-white">{animal.arete}</Badge>
                    <Badge variant="outline" className="bg-white">
                       {typeof animal.raza === 'object' ? animal.raza.nombre : animal.raza}
                    </Badge>
                    {animal.potrero && (
                      <Badge variant="outline" className="bg-white flex items-center gap-1">
                        <TreePine className="w-3 h-3" />
                        {animal.potrero}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {!readOnly && (
                  <div className="flex gap-2 ml-4">
                    <Link href={`/animales/${animal.id}`}>
                      <Button size="sm" variant="outline" className="gap-2 bg-white">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => setModalOpen(true)}
                      disabled={deleting}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4">
                <div className="bg-white rounded-xl p-4 border border-zinc-200 flex flex-col items-center justify-center text-center shadow-sm">
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Edad</p>
                  <p className="text-lg font-black text-zinc-900">{formatEdad(animal.fechaNacimiento)}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-zinc-200 flex flex-col items-center justify-center text-center shadow-sm">
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Sexo</p>
                  <p className="text-lg font-black text-zinc-900">{animal.sexo}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-zinc-200 flex flex-col items-center justify-center text-center shadow-sm">
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Peso Actual</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-zinc-900">{animal.ultimoPeso}</span>
                    <span className="text-xs text-zinc-400 font-bold">kg</span>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-zinc-200 flex flex-col items-center justify-center text-center shadow-sm">
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Lote</p>
                  <p className="text-base font-black text-zinc-900 leading-tight">{animal.lote}</p>
                </div>
              </div>
            </SheetHeader>
          </div>
        </div>

        <div className="p-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="flex gap-2 mb-6 bg-transparent h-auto p-0 flex-wrap">
              <TabsTrigger 
                value="general" 
                className="flex-1 py-2 px-4 rounded-lg border border-zinc-300 bg-white shadow-sm data-[state=active]:border-zinc-900 data-[state=active]:text-zinc-900 transition-all"
              >
                General
              </TabsTrigger>
              <TabsTrigger 
                value="reproduccion"
                className="flex-1 py-2 px-4 rounded-lg border border-zinc-300 bg-white shadow-sm data-[state=active]:border-zinc-900 data-[state=active]:text-zinc-900 transition-all"
              >
                Reproducción
              </TabsTrigger>
              <TabsTrigger 
                value="salud"
                className="flex-1 py-2 px-4 rounded-lg border border-zinc-300 bg-white shadow-sm data-[state=active]:border-zinc-900 data-[state=active]:text-zinc-900 transition-all"
              >
                Salud
              </TabsTrigger>
              <TabsTrigger 
                value="produccion"
                className="flex-1 py-2 px-4 rounded-lg border border-zinc-300 bg-white shadow-sm data-[state=active]:border-zinc-900 data-[state=active]:text-zinc-900 transition-all"
              >
                Producción
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-zinc-500">Fecha de Nacimiento</p>
                  <p className="font-medium">{formatFecha(animal.fechaNacimiento)}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Peso al Nacer</p>
                  <p className="font-medium">{animal.pesoNacimiento} kg</p>
                </div>
                {animal.fechaDestete && (
                  <div>
                    <p className="text-sm text-zinc-500">Fecha de Destete</p>
                    <p className="font-medium">{formatFecha(animal.fechaDestete)}</p>
                  </div>
                )}
              </div>

              {(animal.madreId || animal.padreId) && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-zinc-900 mb-3">Genealogía</h3>
                  {cargandoPadres ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {animalMadre && (
                        <div
                          onClick={() => handleParentClick(animalMadre.id.toString())}
                          className="cursor-pointer rounded-lg border border-zinc-200 bg-white p-3 hover:border-emerald-300 hover:shadow-md transition-all"
                        >
                          <p className="text-xs text-zinc-500 mb-1">Madre</p>
                          <p className="font-bold text-emerald-700">{animalMadre.nombre}</p>
                          <p className="text-sm text-zinc-600">Arete: {animalMadre.arete}</p>
                          <p className="text-xs text-zinc-500 mt-1">Raza: {(animalMadre?.raza as any)?.nombre || animalMadre?.raza || 'No registrada'}</p>
                        </div>
                      )}
                      {animalPadre && (
                        <div
                          onClick={() => handleParentClick(animalPadre.id.toString())}
                          className="cursor-pointer rounded-lg border border-zinc-200 bg-white p-3 hover:border-emerald-300 hover:shadow-md transition-all"
                        >
                          <p className="text-xs text-zinc-500 mb-1">Padre</p>
                          <p className="font-bold text-emerald-700">{animalPadre.nombre}</p>
                          <p className="text-sm text-zinc-600">Arete: {animalPadre.arete}</p>
                         <p className="text-xs text-zinc-500 mt-1">Raza: {(animalPadre?.raza as any)?.nombre || animalPadre?.raza || 'No registrada'}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reproduccion" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Historial de Reproducción</h3>
                <Button 
                  size="sm" 
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => handleNuevoRegistro('/reproduccion/nuevo')}
                >
                  <Plus className="w-4 h-4" />
                  Registrar Servicio
                </Button>
              </div>

              {cargando ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                </div>
              ) : reproducciones.length > 0 ? (
                <>
                  <div className="flex flex-col gap-4">
                    {reproducciones.map((registro) => (
                      <div
                        key={registro.id}
                        onClick={() => handleRegistroSelect(registro)}
                        className="cursor-pointer rounded-lg border border-zinc-200 bg-white p-4 hover:border-emerald-300 hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-xs text-zinc-500">N° Monta: {registro.numeroMonta}</p>
                            <p className="font-bold text-emerald-700 mt-1">{registro.nombreAnimal}</p>
                            <p className="text-sm text-zinc-600">Arete: {registro.arete}</p>
                          </div>
                          <Badge className={
                            registro.estado === 'Confirmada' ? 'bg-emerald-100 text-emerald-800' :
                            registro.estado === 'Fallida' ? 'bg-red-100 text-red-800' :
                            'bg-amber-100 text-amber-800'
                          }>
                            {registro.estado}
                          </Badge>
                        </div>
                        <div className="mt-2 pt-2 border-t border-zinc-100">
                          <p className="text-sm text-zinc-600">Fecha: {new Date(registro.fecha).toLocaleDateString()}</p>
                          <p className="text-sm text-zinc-600">Tipo: {registro.tipoMonta}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button 
                    variant="ghost" 
                    className="w-full mt-4"
                    onClick={() => handleVerTodos('reproduccion')}
                  >
                    Ver historial completo de reproducción
                  </Button>
                </>
                ) : (
                <p className="text-center text-zinc-500 py-8">No hay registros de reproducción</p>
              )}
            </TabsContent>

            <TabsContent value="salud" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Historial de Salud</h3>
                <Button 
                  size="sm" 
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => handleNuevoRegistro('/salud/nuevo')}
                >
                  <Plus className="w-4 h-4" />
                  Registrar Tratamiento
                </Button>
              </div>
              
              {cargando ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                </div>
              ) : tratamientos.length > 0 ? (
                <>
                  <div className="flex flex-col ">
                    {tratamientos.map((tratamiento) => (
                      <TratamientoCard 
                        key={tratamiento.id} 
                        tratamiento={tratamiento}
                        onClick={() => handleTratamientoSelect(tratamiento)}
                      />
                    ))}
                  </div>
                  {tratamientos.length === 3 && (
                    <Button 
                      variant="ghost" 
                      className="w-full mt-4"
                      onClick={() => handleVerTodos('salud')}
                    >
                      Ver historial completo de salud
                    </Button>
                  )}
                </>
              ) : (
                <p className="text-center text-zinc-500 py-8">No hay registros de salud</p>
              )}
            </TabsContent>

            <TabsContent value="produccion" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Historial de Producción</h3>
                <Button 
                  size="sm" 
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => handleNuevoRegistro('/produccion/nuevo')}
                >
                  <Plus className="w-4 h-4" />
                  Registrar Producción
                </Button>
              </div>

              {cargando ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                </div>
              ) : producciones.length > 0 ? (
                <>
                  <ProduccionCards
                    registros={producciones}
                    onSelect={handleProduccionSelect}
                  />
                  <Button 
                    variant="ghost" 
                    className="w-full mt-4"
                    onClick={() => handleVerTodos('produccion')}
                  >
                    Ver historial completo de producción
                  </Button>
                </>
              ) : (
                <p className="text-center text-zinc-500 py-8">No hay registros de producción</p>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        <Modal
          open={modalOpen}
          onOpenChange={setModalOpen}
          title="Eliminar Animal"
          description={`¿Está seguro de eliminar al animal "${animal.nombre} (${animal.arete})"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          loading={deleting}
          onConfirm={handleDelete}
        />
      </SheetContent>
    </Sheet>
  );
}