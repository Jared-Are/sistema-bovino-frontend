'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent} from '@/components/ui/tabs';
import {
  Pencil,
  Trash2,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import Modal from "./ui/modal";
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

type Tratamiento = {
  id: number;
  numero_tratamiento?: string;
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
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleDelete = async () => {
    setDeleting(true);
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
      
      toast({
        title: "✅ Tratamiento eliminado",
        description: "El tratamiento se eliminó exitosamente",
        duration: 3000,
      });
      
      onOpenChange(false);
      if (onDelete) onDelete();
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "No se pudo eliminar el tratamiento",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setDeleting(false);
      setModalOpen(false);
    }
  };

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
                  <div className="flex items-center gap-2">
                    <SheetTitle className="text-3xl font-bold text-zinc-900">
                      {tratamiento.tipo_tratamiento?.nombre || 'Tratamiento'}
                    </SheetTitle>
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {tratamiento.numero_tratamiento && (
                      <Badge variant="outline" className="bg-white border-zinc-300 font-mono">
                        {tratamiento.numero_tratamiento}
                      </Badge>
                    )}
                    {tratamiento.animal && (
                      <Badge className="bg-emerald-600 text-white">
                        {tratamiento.animal.arete} - {tratamiento.animal.nombre}
                      </Badge>
                    )}
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
                    <Button size="sm" variant="outline" className="gap-2 bg-white">
                      <Pencil className="aw-4 h-4" />
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
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4">
                <div className="bg-white rounded-xl p-4 border border-zinc-200 flex flex-col items-center justify-center text-center shadow-sm">
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Tipo</p>
                  <div className="flex items-center gap-1 mt-1 text-zinc-900 font-bold text-lg">
                    {tratamiento.tipo_tratamiento?.nombre || 'Sin tipo'}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-zinc-200 flex flex-col items-center justify-center text-center shadow-sm">
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Fecha de Aplicación</p>
                  <p className="text-lg font-black text-zinc-900 mt-1">{formatFecha(tratamiento.fecha)}</p>
                </div>
              </div>
            </SheetHeader>
          </div>
        </div>

        <div className="p-6">
          <Tabs defaultValue="detalle" className="w-full">

            <TabsContent value="detalle" className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-zinc-500">Número de Tratamiento</p>
                  <p className="font-medium">{tratamiento.numero_tratamiento || 'No asignado'}</p>
                </div>
               <div>
                  <p className="text-sm text-zinc-500">Animal</p>
                  <p className="font-medium">{tratamiento.animal?.nombre || 'No asignado'}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Detalle del Tratamiento</p>
                  <p className="font-medium">{tratamiento.descripcion || 'No asignado'}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Fecha de Aplicación</p>
                  <p className="font-medium">{tratamiento.fecha}</p>
                </div>
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
        
        <Modal
          open={modalOpen}
          onOpenChange={setModalOpen}
          title="Eliminar Tratamiento"
          description={`¿Está seguro de eliminar este tratamiento "${tratamiento.tipo_tratamiento?.nombre}" del animal "${tratamiento.animal?.nombre}"? Esta acción no se puede deshacer.`}       
          confirmText="Eliminar"
          cancelText="Cancelar"
          loading={deleting}
          onConfirm={handleDelete}
        />
      </SheetContent>
    </Sheet>
  );
}