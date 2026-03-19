'use client';

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
  Stethoscope,
  Syringe,
  Pill,
  FileText,
  Pencil,
  Trash2,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import Link from 'next/link';

type Tratamiento = {
  id: number;
  tipo_tratamiento?: { id: number; nombre: string };
  animal?: { animal_id: number; arete: string; nombre: string };
  estado: string;
  fecha: string;
  descripcion?: string;
  fecha_creacion?: string;
};

interface TratamientoDetailsSheetProps {
  tratamiento: Tratamiento | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: () => void;
}

export function TratamientoDetailsSheet({
  tratamiento,
  isOpen,
  onOpenChange,
  onDelete,
}: TratamientoDetailsSheetProps) {
  if (!tratamiento) return null;

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

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "ACTIVO":
        return <Activity className="h-4 w-4" />;
      case "PENDIENTE":
        return <Clock className="h-4 w-4" />;
      case "COMPLETADO":
        return <CheckCircle className="h-4 w-4" />;
      case "CANCELADO":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getIcono = (tipoNombre?: string) => {
    if (tipoNombre?.toLowerCase().includes("vacuna")) return <Syringe className="h-5 w-5" />;
    if (tipoNombre?.toLowerCase().includes("desparasit")) return <Pill className="h-5 w-5" />;
    return <Stethoscope className="h-5 w-5" />;
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este tratamiento?')) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/salud/tratamientos/${tratamiento.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Error al eliminar');
      
      onOpenChange(false);
      if (onDelete) onDelete();
      window.location.reload();
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

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
                  <div className="flex items-center gap-2">
                    {getIcono(tratamiento.tipo_tratamiento?.nombre)}
                    <SheetTitle className="text-2xl font-bold text-zinc-900">
                      {tratamiento.tipo_tratamiento?.nombre || 'Tratamiento'}
                    </SheetTitle>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getEstadoColor(tratamiento.estado)}>
                      <span className="flex items-center gap-1">
                        {getEstadoIcon(tratamiento.estado)}
                        {tratamiento.estado}
                      </span>
                    </Badge>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Link href={`/salud/${tratamiento.id}`}>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Pencil className="w-4 h-4" />
                      <span className="hidden sm:inline">Editar</span>
                    </Button>
                  </Link>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    className="gap-2"
                    onClick={handleDelete}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Eliminar</span>
                  </Button>
                </div>
              </div>
            </SheetHeader>
          </div>
        </div>

        <div className="p-6">
          <Tabs defaultValue="detalle" className="w-full">

            <TabsContent value="detalle" className="space-y-6">
              {/* Información del Animal */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Animal
                </h3>

                <div className="border border-zinc-200 rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-zinc-500 font-medium mb-1">Arete</p>
                      <p className="text-lg font-bold text-zinc-900">{tratamiento.animal?.arete || 'Sin arete'}</p>
                      <p className="text-sm text-zinc-600 mt-1">
                        {tratamiento.animal?.nombre || 'Sin nombre'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detalles del Tratamiento */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Detalles del Tratamiento
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-zinc-200 rounded-lg p-4 bg-white">
                    <p className="text-xs text-zinc-500 font-medium mb-1">Tipo</p>
                    <p className="text-base font-bold text-zinc-900 flex items-center gap-2">
                      {getIcono(tratamiento.tipo_tratamiento?.nombre)}
                      {tratamiento.tipo_tratamiento?.nombre || 'Sin tipo'}
                    </p>
                  </div>

                  <div className="border border-zinc-200 rounded-lg p-4 bg-white">
                    <p className="text-xs text-zinc-500 font-medium mb-1">Fecha de Aplicación</p>
                    <p className="text-base font-bold text-zinc-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-zinc-400" />
                      {formatFecha(tratamiento.fecha)}
                    </p>
                  </div>
                </div>

                {tratamiento.descripcion && (
                  <div className="border border-zinc-200 rounded-lg p-4 bg-white">
                    <p className="text-xs text-zinc-500 font-medium mb-2">Descripción / Observaciones</p>
                    <p className="text-sm text-zinc-700 whitespace-pre-wrap">{tratamiento.descripcion}</p>
                  </div>
                )}
              </div>

              {/* Estado */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Estado
                </h3>

                <div className="border border-zinc-200 rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-500 font-medium mb-1">Estado Actual</p>
                      <div className="flex items-center gap-2">
                        <Badge className={getEstadoColor(tratamiento.estado)}>
                          <span className="flex items-center gap-1">
                            {getEstadoIcon(tratamiento.estado)}
                            {tratamiento.estado}
                          </span>
                        </Badge>
                      </div>
                    </div>
                    {tratamiento.fecha_creacion && (
                      <p className="text-xs text-zinc-400">
                        Registrado: {formatFecha(tratamiento.fecha_creacion)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

           
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}