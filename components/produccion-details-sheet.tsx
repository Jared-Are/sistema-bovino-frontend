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
  Trash2,
  Pencil,
  Scale,
  Hash
} from 'lucide-react';
import Link from 'next/link';
import type { RegistroProduccion } from '@/lib/types/produccion';
import Modal from "./ui/modal";
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ProduccionDetailsSheetProps {
  registro: RegistroProduccion | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export function ProduccionDetailsSheet({
  registro,
  isOpen,
  onOpenChange,
  onDelete
}: ProduccionDetailsSheetProps) {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!registro) return null;

  const isLeche = registro.tipo === 'leche';

  const handleDelete = async () => {
    setDeleting(true);
    try {
      if (onDelete) {
        const result = await onDelete(registro.id);
        if (result.success) {
          toast({
            title: "✅ Registro eliminado",
            description: `El registro de ${isLeche ? 'leche' : 'carne'} se eliminó exitosamente`,
            duration: 3000,
          });
          onOpenChange(false);
        } else {
          throw new Error(result.error || 'Error al eliminar');
        }
      }
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "No se pudo eliminar el registro",
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
              {registro.numeroProduccion && (
                <div className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 bg-white shadow-sm">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${isLeche ? 'bg-blue-50 text-blue-500' : 'bg-amber-50 text-amber-500'}`}>
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
          </div>
        </div>
        
        <Modal
          open={modalOpen}
          onOpenChange={setModalOpen}
          title="Eliminar Registro"
          description={`¿Está seguro de eliminar el registro de ${isLeche ? 'leche' : 'carne'} "${registro.numeroProduccion}" del animal "${registro.nombreAnimal}"? Esta acción no se puede deshacer.`}
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