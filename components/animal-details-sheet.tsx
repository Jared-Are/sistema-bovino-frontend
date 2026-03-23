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
  Calendar,
  Weight,
  Heart,
  Stethoscope,
  TrendingUp,
  Plus,
  MapPin,
  User,
  Droplets,
  Scale,
  Baby,
  TreePine,
  CalendarDays,
  Syringe,
  FileText,
  Pencil,
  Trash2,
  Pill,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/modal';

interface Animal {
  id: string;
  arete: string;
  nombre: string;
  lote: string;
  potrero?: string;
  estadoReproductivo: string;
  estadoSalud: string;
  ultimoPeso: number;
  pesoNacimiento?: number;
  raza: string;
  edad: number;
  sexo: string;
  fechaNacimiento: string;
  fechaDestete?: string;
  imagen?: string;
  padre?: string;
  madre?: string;
  montas: any[];
  tratamientos: any[];
  pesajes: any[];
  produccionDiaria?: number;
}

interface AnimalDetailsSheetProps {
  animal: Animal | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  readOnly?: boolean;
}

type TratamientoReal = {
  id: number;
  tipo_tratamiento?: { id: number; nombre: string };
  estado: string;
  fecha: string;
  descripcion?: string;
};

export function AnimalDetailsSheet({
  animal,
  isOpen,
  onOpenChange,
  readOnly = false,
}: AnimalDetailsSheetProps) {
  const [tratamientos, setTratamientos] = useState<TratamientoReal[]>([]);
  const [cargandoTratamientos, setCargandoTratamientos] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const cargarTratamientos = async () => {
    if (!animal) return;
    
    try {
      setCargandoTratamientos(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/salud/tratamientos?animal_id=${animal.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Error al cargar tratamientos');

      const data = await response.json();
      
      const tratamientosDelAnimal = data.filter((t: any) => 
        t.animal?.animal_id?.toString() === animal.id || 
        t.animal_id?.toString() === animal.id
      );
      
      setTratamientos(tratamientosDelAnimal);
    } catch (error) {
      console.error('Error cargando tratamientos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los tratamientos",
        variant: "destructive",
      });
    } finally {
      setCargandoTratamientos(false);
    }
  };

  useEffect(() => {
    if (isOpen && animal) {
      cargarTratamientos();
    }
  }, [isOpen, animal]);

  if (!animal) return null;

  const getReproductivoBadgeColor = (estado: string) => {
    const colors: Record<string, string> = {
      'Vacía': 'bg-blue-100 text-blue-800',
      'Gestante': 'bg-purple-100 text-purple-800',    
      'Lactando': 'bg-emerald-100 text-emerald-800',   
      'Parida': 'bg-amber-100 text-amber-800',      
      'Seca': 'bg-gray-100 text-gray-800',
      'En celo': 'bg-pink-100 text-pink-800',         
      'Inseminada': 'bg-indigo-100 text-indigo-800',   
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  const getSaludBadgeColor = (estado: string) => {
    const colors: Record<string, string> = {
      sano: 'bg-emerald-100 text-emerald-800',
      enfermo: 'bg-red-100 text-red-800',
      tratamiento: 'bg-yellow-100 text-yellow-800',
      critico: 'bg-red-200 text-red-900',
    };
    return colors[estado] || 'bg-emerald-100 text-emerald-800';
  };

  const getEstadoTratamientoColor = (estado: string) => {
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

  const getEstadoIcono = (estado: string) => {
    switch (estado) {
      case "ACTIVO":
        return <Activity className="h-3 w-3" />;
      case "PENDIENTE":
        return <Clock className="h-3 w-3" />;
      case "COMPLETADO":
        return <CheckCircle className="h-3 w-3" />;
      case "CANCELADO":
        return <XCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getIconoTratamiento = (tipoNombre?: string) => {
    if (tipoNombre?.toLowerCase().includes("vacuna")) return <Syringe className="h-4 w-4" />;
    if (tipoNombre?.toLowerCase().includes("desparasit")) return <Pill className="h-4 w-4" />;
    return <Stethoscope className="h-4 w-4" />;
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleNuevoTratamiento = () => {
    router.push(`/salud/nuevo?animalId=${animal.id}`);
    onOpenChange(false);
  };

  const handleDelete = async () => {
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

  const tratamientosActivos = tratamientos.filter(t => t.estado === 'ACTIVO' || t.estado === 'PENDIENTE');
  const tratamientosHistorial = tratamientos.filter(t => t.estado === 'COMPLETADO' || t.estado === 'CANCELADO');

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
                  <p className="text-lg font-black text-zinc-900">{animal.edad} años</p>
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

              <div className="flex gap-2 flex-wrap pt-2">
                <Badge className={getReproductivoBadgeColor(animal.estadoReproductivo)}>
                  {animal.estadoReproductivo}
                </Badge>
                <Badge className={getSaludBadgeColor(animal.estadoSalud)}>
                  {animal.estadoSalud}
                </Badge>
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