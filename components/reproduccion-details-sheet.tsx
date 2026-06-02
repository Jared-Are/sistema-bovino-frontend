'use client';

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Heart, Pencil, Stethoscope, Syringe, Trash2, User, Info } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import type { RegistroReproduccion } from "@/lib/types/reproduccion";
import Modal from "./ui/modal";
import { formatFechaLocal } from "@/lib/utils";

interface ReproduccionDetailsSheetProps {
  registro: RegistroReproduccion | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ReproduccionDetailsSheet({
  registro,
  isOpen,
  onOpenChange,
  onSuccess
}: ReproduccionDetailsSheetProps) {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!registro) return null;

  const formatFecha = (fecha?: string) => {
    if (!fecha) return "No registrada";
    return formatFechaLocal(fecha, { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const getEstadoBadgeColor = (estado: string) => {
    const est = estado.toLowerCase();
    if (est.includes("confirmada") || est.includes("gestante")) return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (est.includes("fallida")) return "bg-red-100 text-red-800 border-red-200";
    if (est.includes("aborto")) return "bg-rose-100 text-rose-800 border-rose-200";
    if (est.includes("parto")) return "bg-purple-100 text-purple-800 border-purple-200";
    return "bg-blue-100 text-blue-800 border-blue-200";
  };

  const estadoActual = registro.estado.toLowerCase();
  const mostrarDiagnostico = estadoActual.includes("evaluación") || estadoActual.includes("evaluacion");
  const mostrarParto = estadoActual.includes("confirmada") || estadoActual.includes("gestante");

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reproduccion/montas/${registro.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("No se pudo eliminar el registro.");
      
      toast({ 
        title: "✅ Eliminado", 
        description: "El registro fue borrado exitosamente.",
        duration: 3000,
      });
      onOpenChange(false);
      onSuccess(); 
    } catch (error: any) {
      toast({ 
        title: "❌ Error", 
        description: error.message, 
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
      <SheetContent side="right" className="w-full sm:w-[94%] md:w-[88%] lg:w-[75%] xl:w-[65%] max-w-5xl overflow-y-auto p-0">
        <div className="relative">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 border-b border-zinc-200 sticky top-0 z-10">
            <SheetHeader className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <SheetTitle className="text-3xl font-bold text-zinc-900 flex items-center gap-2">
                    <User className="h-8 w-8 text-emerald-600" />
                    {registro.nombreAnimal !== "Sin nombre" ? registro.nombreAnimal : "Vaca sin nombre"}
                  </SheetTitle>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge className="bg-emerald-600 text-white text-sm py-1">
                      Arete: {registro.arete}
                    </Badge>
                    <Badge variant="outline" className="bg-white text-sm py-1 border border-zinc-300 text-zinc-600">
                      Servicio: {registro.numeroMonta}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4 flex-wrap justify-end">
                  <Link href={`/reproduccion/${registro.id}`}>
                    <Button size="sm" variant="outline" className="gap-2 bg-white">
                      <Pencil className="w-4 h-4" />
                      <span className="hidden sm:inline">Editar</span>
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
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Método</p>
                  <div className="flex items-center gap-1 mt-1 text-zinc-900 font-bold text-lg">
                    {registro.tipoMonta === 'Monta Natural' ? <Heart className="w-5 h-5 text-rose-500" /> : <Syringe className="w-5 h-5 text-blue-500" />}
                    {registro.tipoMonta}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-zinc-200 flex flex-col items-center justify-center text-center shadow-sm">
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Fecha de Servicio</p>
                  <p className="text-lg font-black text-zinc-900 mt-1">{formatFecha(registro.fecha)}</p>
                </div>
              </div>
            </SheetHeader>
          </div>
        </div>

        <div className="p-6">
          <Tabs defaultValue="estado" className="w-full">
            <TabsList className="flex gap-2 mb-6 bg-transparent h-auto p-0 flex-wrap">
              <TabsTrigger value="estado" className="flex-1 py-2 px-4 rounded-lg border border-zinc-300 bg-white shadow-sm data-[state=active]:border-zinc-900 data-[state=active]:text-zinc-900 transition-all">
                Estado Reproductivo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="estado" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" /> Seguimiento del Servicio
                </h3>
                
                <div className="border border-zinc-200 rounded-lg p-6 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${mostrarParto ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                        <Stethoscope className={`w-8 h-8 ${mostrarParto ? 'text-emerald-600' : 'text-blue-600'}`} />
                      </div>
                      <div>
                        <p className="text-sm text-zinc-500 font-medium">Estado Actual</p>
                        <Badge variant="outline" className={`mt-1 text-sm py-1 border ${getEstadoBadgeColor(registro.estado)}`}>
                          {registro.estado}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-100 flex gap-3">
                    {mostrarDiagnostico && (
                      <Link href={`/reproduccion/diagnosticos/nuevo?montaId=${registro.id}`} className="w-full">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm gap-2 h-12 text-md">
                          <Stethoscope className="w-5 h-5" />
                          Evaluar Preñez
                        </Button>
                      </Link>
                    )}
                    {mostrarParto && (
                      <Link href="/reproduccion/partos" className="w-full">
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm gap-2 h-12 text-md">
                          <Heart className="w-5 h-5" />
                          Ir a Registrar Parto
                        </Button>
                      </Link>
                    )}
                    {!mostrarDiagnostico && !mostrarParto && (
                      <div className="flex items-center justify-center w-full py-2 bg-zinc-50 rounded-md border border-zinc-200">
                        <p className="text-sm text-zinc-500 flex items-center gap-2">
                          <Info className="w-4 h-4" /> Proceso concluido para este servicio.
                        </p>
                      </div>
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
          title="Eliminar Servicio"
          description={`¿Está seguro de eliminar el servicio "${registro.numeroMonta}" del animal "${registro.nombreAnimal}"? Esta acción no se puede deshacer.`}
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