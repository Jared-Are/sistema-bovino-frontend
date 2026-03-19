"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { reproduccionApi } from "@/lib/api/reproduccion";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface PartoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  diagnosticoId: number; // Necesitamos el ID del diagnóstico previo
  onSuccess: () => void;
}

export function PartoDialog({ isOpen, onClose, diagnosticoId, onSuccess }: PartoDialogProps) {
  const [cargando, setCargando] = useState(false);
  const [tipoParto, setTipoParto] = useState("");
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!tipoParto) {
      toast({ title: "Atención", description: "Selecciona el tipo de parto", variant: "destructive" });
      return;
    }

    try {
      setCargando(true);
      const token = localStorage.getItem("token");
      await reproduccionApi.createParto(
        { 
          diagnostico_prenez_id: diagnosticoId, 
          tipo_parto: tipoParto,
          numero_parto: `P-${Date.now().toString().slice(-4)}` // Autogeneramos un número por ahora
        }, 
        token!
      );
      toast({ title: "Éxito", description: "Parto registrado correctamente" });
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
          <DialogTitle>Registrar Parto</DialogTitle>
          <DialogDescription>
            Registra el nacimiento resultante de esta gestación.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Tipo de Parto</Label>
            <Select onValueChange={setTipoParto}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="Distocico">Distócico (Con Complicaciones)</SelectItem>
                <SelectItem value="Aborto">Aborto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={cargando}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={cargando} className="bg-emerald-600 hover:bg-emerald-700">
            {cargando && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Guardar Parto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}