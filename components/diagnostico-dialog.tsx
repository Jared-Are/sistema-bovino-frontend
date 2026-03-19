"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { reproduccionApi } from "@/lib/api/reproduccion";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface DiagnosticoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  montaId: number;
  onSuccess: () => void;
}

export function DiagnosticoDialog({ isOpen, onClose, montaId, onSuccess }: DiagnosticoDialogProps) {
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState("");
  const [metodo, setMetodo] = useState("");
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!resultado || !metodo) {
      toast({ title: "Atención", description: "Completa todos los campos", variant: "destructive" });
      return;
    }

    try {
      setCargando(true);
      const token = localStorage.getItem("token");
      await reproduccionApi.createDiagnostico(
        { 
          monta_id: montaId, 
          resultado, 
          metodo, 
          fecha_programacion: new Date().toISOString().split('T')[0] // Fecha de hoy
        }, 
        token!
      );
      toast({ title: "Éxito", description: "Diagnóstico registrado correctamente" });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setCargando(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Diagnóstico</DialogTitle>
          <DialogDescription>
            Confirma el estado de preñez de la vaca para esta monta.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Resultado del Diagnóstico</Label>
            <Select onValueChange={setResultado}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el resultado..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Positivo">Positivo (Preñada)</SelectItem>
                <SelectItem value="Negativo">Negativo (Vacía)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Método de Evaluación</Label>
            <Select onValueChange={setMetodo}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el método..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Palpación">Palpación</SelectItem>
                <SelectItem value="Ultrasonido">Ultrasonido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={cargando}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={cargando} className="bg-emerald-600 hover:bg-emerald-700">
            {cargando && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}