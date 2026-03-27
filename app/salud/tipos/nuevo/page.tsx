'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const tipoSchema = z.object({
  nombre: z.string()
    .min(2, "El nombre es muy corto")
    .max(50, "El nombre es muy largo")
    .regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/, "Solo letras y espacios"),
});

export default function NuevoTipoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    nombre: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    try {
      const valid = tipoSchema.parse(formData);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No autorizado');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/salud/tipos-tratamiento`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(valid),
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.message?.includes('ya existe')) {
          setFieldErrors({ nombre: error.message });
          setLoading(false);
          return;
        }
        throw new Error(error.message || 'Error al crear tipo');
      }
      
      toast({ 
        title: "¡Tipo Creado!", 
        description: `${valid.nombre} ha sido registrado.`,
        className: "bg-green-600 text-white"
      });
      
      router.push('/salud/tipos');
    } catch (err: any) {
      const mensaje = err instanceof z.ZodError ? err.errors[0].message : err.message;
      toast({ title: "Error", description: mensaje, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <Link href="/salud/tipos">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Button>
      </Link>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Nuevo Tipo de Tratamiento</CardTitle>
          <CardDescription>Registra una nueva categoría de tratamiento sanitario</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Tipo *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]*$/.test(val)) return;
                  setFormData({ ...formData, nombre: val });
                  if (fieldErrors.nombre) setFieldErrors({ ...fieldErrors, nombre: '' });
                }}
                placeholder="Ej: Vacuna, Desparasitante, Antibiótico..."
                className={fieldErrors.nombre ? "border-red-500 focus-visible:ring-red-500" : ""}
                required
              />
              {fieldErrors.nombre && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {fieldErrors.nombre}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="bg-emerald-600">
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {loading ? "Guardando..." : "Guardar Tipo"}
              </Button>
              <Link href="/salud/tipos">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}