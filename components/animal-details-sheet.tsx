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
  Heart,
  Plus,
  TreePine,
  Syringe,
  Milk,
  Pencil,
  Trash2,
  Calendar,
  Scale,
  Droplets,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/modal';
import { formatEdad } from '@/lib/api/age-utils';
import { ReproduccionCards } from './reproduccion-cards';
import { TratamientoCard } from './tratamiento-card';
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
  raza: string;
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
  const [montas, setMontas] = useState<any[]>([]);
  const [tratamientos, setTratamientos] = useState<any[]>([]);
  const [produccion, setProduccion] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const cargarHistoriales = async () => {
    if (!animal) return;
    
    setCargando(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // 1. Cargar montas/reproducción (últimos 3)
      const montasRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/montas/animal/${animal.id}?limit=3`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (montasRes.ok) {
        const data = await montasRes.json();
        const montasFormateadas = data.map((m: any) => ({
          id: m.id,
          numeroMonta: m.numero_monta,
          arete: animal.arete,
          nombreAnimal: animal.nombre,
          fecha: m.fecha_programacion,
          tipoMonta: m.tipo_monta === 'NATURAL' ? 'Monta Natural' : 'Inseminación Artificial',
          estado: m.estado,
          toro: m.animal_macho?.arete || m.codigo_pajilla || 'No especificado'
        }));
        setMontas(montasFormateadas);
      }

      // 2. Cargar tratamientos/salud (últimos 3)
      const tratamientosRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tratamientos/animal/${animal.id}?limit=3`, {
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

      // 3. Cargar producción lechera (últimos 3)
      const produccionRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/produccion-lechera/animal/${animal.id}?limit=3`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (produccionRes.ok) {
        const data = await produccionRes.json();
        const produccionFormateada = data.map((p: any) => ({
          id: p.id.toString(),
          tipo: 'leche',
          arete: animal.arete,
          nombreAnimal: animal.nombre,
          cantidad: p.cantidad,
          fecha: new Date(p.fecha_creacion).toLocaleDateString(),
          numeroProduccion: p.numero_produccion
        }));
        setProduccion(produccionFormateada);
      }
    } catch (error) {
      console.error('Error cargando historiales:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (isOpen && animal) {
      cargarHistoriales();
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
                      {animal.raza}
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
                        <span className="hidden sm:inline">Editar</span>
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      className="gap-2 bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => setModalOpen(true)}
                      disabled={deleting}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">{deleting ? "Borrando..." : "Eliminar"}</span>
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

            {/* TAB GENERAL - Con madre y padre */}
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
                {/* 👇 GENEALOGÍA: Madre y Padre */}
                {animal.madre && (
                  <div>
                    <p className="text-sm text-zinc-500">Madre</p>
                    <p className="font-medium">{animal.madre}</p>
                  </div>
                )}
                {animal.padre && (
                  <div>
                    <p className="text-sm text-zinc-500">Padre</p>
                    <p className="font-medium">{animal.padre}</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB REPRODUCCIÓN - Últimos 3 registros */}
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
                <p className="text-center text-zinc-500 py-8">Cargando...</p>
              ) : montas.length > 0 ? (
                <>
                  <ReproduccionCards 
                    registros={montas}
                    selectedRegistro={undefined}
                    onRegistroSelect={handleRegistroSelect}
                  />
                  {montas.length === 3 && (
                    <Button 
                      variant="ghost" 
                      className="w-full mt-4"
                      onClick={() => handleVerTodos('reproduccion')}
                    >
                      Ver historial completo de reproducción
                    </Button>
                  )}
                </>
              ) : (
                <p className="text-center text-zinc-500 py-8">No hay registros de reproducción</p>
              )}
            </TabsContent>

            {/* TAB SALUD - Últimos 3 registros */}
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
                <p className="text-center text-zinc-500 py-8">Cargando...</p>
              ) : tratamientos.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

            {/* TAB PRODUCCIÓN - Últimos 3 registros */}
            <TabsContent value="produccion" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Historial de Producción Lechera</h3>
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
                <p className="text-center text-zinc-500 py-8">Cargando...</p>
              ) : produccion.length > 0 ? (
                <>
                  <ProduccionCards 
                    registros={produccion}
                    onSelect={handleProduccionSelect}
                  />
                  {produccion.length === 3 && (
                    <Button 
                      variant="ghost" 
                      className="w-full mt-4"
                      onClick={() => handleVerTodos('produccion')}
                    >
                      Ver historial completo de producción
                    </Button>
                  )}
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
          variant="destructive"
          confirmText="Eliminar"
          cancelText="Cancelar"
          loading={deleting}
          onConfirm={handleDelete}
        />
      </SheetContent>
    </Sheet>
  );
}