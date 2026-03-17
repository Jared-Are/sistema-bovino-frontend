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
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

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
}: AnimalDetailsSheetProps) {
  const [tratamientos, setTratamientos] = useState<TratamientoReal[]>([]);
  const [cargandoTratamientos, setCargandoTratamientos] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const cargarTratamientos = async () => {
    if (!animal) return;
    
    try {
      setCargandoTratamientos(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      // 👇 CORREGIDO: Filtrar por animal_id
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
      
      // 👇 Asegurar que solo muestra los de este animal
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
    'Seca': 'bg-gray-100 text-gray-800',
    'En celo': 'bg-pink-100 text-pink-800',         
    'Inseminada': 'bg-indigo-100 text-indigo-800',   
    'Parida': 'bg-amber-100 text-amber-800',      
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

  const tratamientosActivos = tratamientos.filter(t => t.estado === 'ACTIVO' || t.estado === 'PENDIENTE');
  const tratamientosHistorial = tratamientos.filter(t => t.estado === 'COMPLETADO' || t.estado === 'CANCELADO');

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full sm:w-[85%] md:w-[75%] lg:w-[60%] xl:w-[50%] max-w-4xl overflow-y-auto p-0"
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
                
                <div className="flex gap-2 ml-4">
                  <Link href={`/animales/${animal.id}`}>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Pencil className="w-4 h-4" />
                      <span className="hidden sm:inline">Editar</span>
                    </Button>
                  </Link>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    className="gap-2"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (confirm('¿Estás seguro de eliminar este animal?')) {
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
                            onOpenChange(false);
                            window.location.reload();
                          }
                        } catch (error) {
                          console.error('Error al eliminar:', error);
                        }
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Eliminar</span>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                <div className="bg-white rounded-lg p-3 border border-zinc-200">
                  <p className="text-xs text-zinc-500 font-medium">Edad</p>
                  <p className="text-lg font-bold text-zinc-900">{animal.edad} años</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-zinc-200">
                  <p className="text-xs text-zinc-500 font-medium">Sexo</p>
                  <p className="text-lg font-bold text-zinc-900">{animal.sexo}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-zinc-200">
                  <p className="text-xs text-zinc-500 font-medium">Peso Actual</p>
                  <p className="text-lg font-bold text-zinc-900">{animal.ultimoPeso} kg</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-zinc-200">
                  <p className="text-xs text-zinc-500 font-medium">Lote</p>
                  <p className="text-lg font-bold text-zinc-900">{animal.lote}</p>
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
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="reproduccion">Reproducción</TabsTrigger>
              <TabsTrigger value="salud">Salud</TabsTrigger>
              <TabsTrigger value="produccion">Producción</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              {/* Contenido general igual */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide flex items-center gap-2">
                  <User className="w-4 h-4" /> Información Básica
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-zinc-200 rounded-lg p-4 bg-white">
                    <p className="text-xs text-zinc-500 font-medium mb-1">Arete</p>
                    <p className="text-base font-bold text-zinc-900">{animal.arete}</p>
                  </div>
                  <div className="border border-zinc-200 rounded-lg p-4 bg-white">
                    <p className="text-xs text-zinc-500 font-medium mb-1">Raza</p>
                    <p className="text-base font-bold text-zinc-900">{animal.raza}</p>
                  </div>
                  <div className="border border-zinc-200 rounded-lg p-4 bg-white">
                    <p className="text-xs text-zinc-500 font-medium mb-1">Lote</p>
                    <p className="text-base font-bold text-zinc-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-zinc-400" />
                      {animal.lote}
                    </p>
                  </div>
                  <div className="border border-zinc-200 rounded-lg p-4 bg-white">
                    <p className="text-xs text-zinc-500 font-medium mb-1">Potrero</p>
                    <p className="text-base font-bold text-zinc-900 flex items-center gap-2">
                      <TreePine className="w-4 h-4 text-zinc-400" />
                      {animal.potrero || 'No asignado'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" /> Fechas Importantes
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-zinc-200 rounded-lg p-4 bg-white">
                    <p className="text-xs text-zinc-500 font-medium mb-1">Fecha de Nacimiento</p>
                    <p className="text-base font-bold text-zinc-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-zinc-400" />
                      {formatFecha(animal.fechaNacimiento)}
                    </p>
                  </div>
                  {animal.fechaDestete && (
                    <div className="border border-zinc-200 rounded-lg p-4 bg-white">
                      <p className="text-xs text-zinc-500 font-medium mb-1">Fecha de Destete</p>
                      <p className="text-base font-bold text-zinc-900 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-zinc-400" />
                        {formatFecha(animal.fechaDestete)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide flex items-center gap-2">
                  <Scale className="w-4 h-4" /> Pesos
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-zinc-200 rounded-lg p-4 bg-white">
                    <p className="text-xs text-zinc-500 font-medium mb-1">Peso al Nacer</p>
                    <p className="text-2xl font-bold text-emerald-700 flex items-center gap-2">
                      <Baby className="w-5 h-5 text-emerald-500" />
                      {animal.pesoNacimiento || 0} kg
                    </p>
                  </div>
                  <div className="border border-zinc-200 rounded-lg p-4 bg-white">
                    <p className="text-xs text-zinc-500 font-medium mb-1">Peso Actual</p>
                    <p className="text-2xl font-bold text-emerald-700 flex items-center gap-2">
                      <Weight className="w-5 h-5 text-emerald-500" />
                      {animal.ultimoPeso} kg
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide flex items-center gap-2">
                  <Droplets className="w-4 h-4" /> Genealogía
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {animal.padre ? (
                    <div className="border border-zinc-200 rounded-lg p-4 bg-blue-50">
                      <p className="text-xs text-blue-600 font-medium mb-1 flex items-center gap-1">
                        <User className="w-3 h-3" /> Padre
                      </p>
                      <p className="text-base font-bold text-zinc-900">{animal.padre}</p>
                    </div>
                  ) : (
                    <div className="border border-dashed border-zinc-300 rounded-lg p-4 bg-zinc-50">
                      <p className="text-xs text-zinc-400 font-medium">Padre no registrado</p>
                    </div>
                  )}

                  {animal.madre ? (
                    <div className="border border-zinc-200 rounded-lg p-4 bg-pink-50">
                      <p className="text-xs text-pink-600 font-medium mb-1 flex items-center gap-1">
                        <User className="w-3 h-3" /> Madre
                      </p>
                      <p className="text-base font-bold text-zinc-900">{animal.madre}</p>
                    </div>
                  ) : (
                    <div className="border border-dashed border-zinc-300 rounded-lg p-4 bg-zinc-50">
                      <p className="text-xs text-zinc-400 font-medium">Madre no registrada</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reproduccion" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide flex items-center gap-2">
                    <Heart className="w-4 h-4" /> Historial de Montas
                  </h3>
                  <Link href={`/reproduccion/nuevo?animalId=${animal.id}`}>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="w-4 h-4 mr-1" />
                      Registrar Monta
                    </Button>
                  </Link>
                </div>

                {animal.montas && animal.montas.length > 0 ? (
                  <div className="space-y-3">
                    {animal.montas.map((monta) => (
                      <div key={monta.id} className="border border-zinc-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-zinc-900">{monta.tipo}</p>
                        <p className="text-xs text-zinc-500 mt-1">
                          Fecha: {formatFecha(monta.fecha)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-dashed border-zinc-300 rounded-lg p-6 text-center">
                    <Heart className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                    <p className="text-sm text-zinc-500">Sin registros de montas</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="salud" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Tratamientos Activos
                  </h3>
                  <Button 
                    size="sm" 
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={handleNuevoTratamiento}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Nuevo Tratamiento
                  </Button>
                </div>

                {cargandoTratamientos ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600" />
                  </div>
                ) : tratamientosActivos.length > 0 ? (
                  <div className="space-y-3">
                    {tratamientosActivos.map((t) => (
                      <div key={t.id} className="border border-zinc-200 rounded-lg p-4 bg-white">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getIconoTratamiento(t.tipo_tratamiento?.nombre)}
                            <div>
                              <p className="text-sm font-medium text-zinc-900">
                                {t.tipo_tratamiento?.nombre || 'Tratamiento'}
                              </p>
                              <p className="text-xs text-zinc-500 mt-1">
                                {formatFecha(t.fecha)}
                              </p>
                            </div>
                          </div>
                          <Badge className={getEstadoTratamientoColor(t.estado)}>
                            <span className="flex items-center gap-1">
                              {getEstadoIcono(t.estado)}
                              {t.estado}
                            </span>
                          </Badge>
                        </div>
                        {t.descripcion && (
                          <p className="text-xs text-zinc-600 mt-2 border-t pt-2">
                            {t.descripcion}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-dashed border-zinc-300 rounded-lg p-6 text-center bg-white">
                    <Stethoscope className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                    <p className="text-sm text-zinc-500">No hay tratamientos activos</p>
                  </div>
                )}
              </div>

              {tratamientosHistorial.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-zinc-200">
                  <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Historial
                  </h3>
                  <div className="space-y-3">
                    {tratamientosHistorial.map((t) => (
                      <div key={t.id} className="border border-zinc-200 rounded-lg p-4 bg-zinc-50">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getIconoTratamiento(t.tipo_tratamiento?.nombre)}
                            <div>
                              <p className="text-sm font-medium text-zinc-900">
                                {t.tipo_tratamiento?.nombre || 'Tratamiento'}
                              </p>
                              <p className="text-xs text-zinc-500 mt-1">
                                {formatFecha(t.fecha)}
                              </p>
                            </div>
                          </div>
                          <Badge className={getEstadoTratamientoColor(t.estado)}>
                            <span className="flex items-center gap-1">
                              {getEstadoIcono(t.estado)}
                              {t.estado}
                            </span>
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="produccion" className="space-y-6">
              {animal.sexo === 'Hembra' ? (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Producción de Leche
                  </h3>

                  {animal.produccionDiaria ? (
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-6 border border-emerald-200">
                      <p className="text-xs text-emerald-600 font-medium mb-1">Producción Diaria</p>
                      <p className="text-4xl font-bold text-emerald-900">
                        {animal.produccionDiaria}
                        <span className="text-lg ml-2">L/día</span>
                      </p>
                    </div>
                  ) : (
                    <div className="border border-dashed border-zinc-300 rounded-lg p-6 text-center">
                      <TrendingUp className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                      <p className="text-sm text-zinc-500">Sin datos de producción</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-zinc-900">Historial de Pesajes</h4>
                    {animal.pesajes && animal.pesajes.length > 0 ? (
                      <div className="space-y-2">
                        {animal.pesajes.map((pesaje) => (
                          <div key={pesaje.id} className="border border-zinc-200 rounded-lg p-3">
                            <p className="text-sm font-medium text-zinc-900">{pesaje.peso} kg</p>
                            <p className="text-xs text-zinc-500">{formatFecha(pesaje.fecha)}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border border-dashed border-zinc-300 rounded-lg p-6 text-center">
                        <Scale className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                        <p className="text-sm text-zinc-500">Sin pesajes registrados</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-zinc-300 rounded-lg p-12 text-center">
                  <TrendingUp className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                  <p className="text-sm text-zinc-500">
                    Datos de producción no disponibles para machos
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}