'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const loteSchema = z.object({
  nombre: z.string()
    .min(2, "El nombre es muy corto")
    .max(50, "El nombre es muy largo")
    .regex(/^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ\s]+$/, "Solo letras, números y espacios"),
});

export default function NuevoLotePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const valid = loteSchema.parse(formData);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No autorizado');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/parametros/lotes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(valid),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear lote');
      }
      
      toast({ 
        title: "¡Lote Creado!", 
        description: `${valid.nombre} ha sido registrado.`,
        className: "bg-green-600 text-white"
      });
      
      router.push('/parametros/lotes');
    } catch (err: any) {
      const mensaje = err instanceof z.ZodError ? err.errors[0].message : err.message;
      toast({ title: "Error", description: mensaje, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <Link href="/parametros/lotes">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver a Lotes
        </Button>
      </Link>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Nuevo Lote</CardTitle>
          <CardDescription>Registra un nuevo lote de animales</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Lote *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!/^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ\s]*$/.test(val)) return;
                  setFormData({ ...formData, nombre: val });
                }}
                placeholder="Ej: Lote A - Engorde"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="bg-emerald-600">
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Guardar Lote
              </Button>
              <Link href="/parametros/lotes">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}