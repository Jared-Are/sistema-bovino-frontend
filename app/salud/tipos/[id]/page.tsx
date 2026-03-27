'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Loader2, AlertTriangle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const tipoSchema = z.object({
  nombre: z.string()
    .min(2, "El nombre es muy corto")
    .max(50, "El nombre es muy largo")
    .regex(/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/, "Solo letras y espacios"),
});

export default function EditarTipoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    nombre: '',
  });

  useEffect(() => {
    const fetchTipo = async () => {
      if (!id) {
        setError("ID no válido");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/');
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/salud/tipos-tratamiento/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Error al cargar tipo');
        
        const data = await response.json();
        
        setFormData({
          nombre: data.nombre || '',
        });

      } catch (err: any) {
        setError(err.message);
        toast({ title: "Error", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchTipo();
  }, [id, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFieldErrors({});

    try {
      const valid = tipoSchema.parse(formData);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No autorizado');

      // Verificar si el nombre ya existe (excluyendo el actual)
      const checkResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/salud/tipos-tratamiento/check-nombre?nombre=${encodeURIComponent(valid.nombre)}&excludeId=${id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        if (checkData.exists) {
          setFieldErrors({ nombre: `El tipo "${valid.nombre}" ya está registrado` });
          setSaving(false);
          return;
        }
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/salud/tipos-tratamiento/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(valid),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar');
      }
      
      toast({ 
        title: "¡Tipo Actualizado!", 
        description: `${valid.nombre} ha sido actualizado.`,
        className: "bg-green-600 text-white"
      });
      
      router.push('/salud/tipos');

    } catch (err: any) {
      const mensaje = err instanceof z.ZodError ? err.errors[0].message : err.message;
      toast({ title: "Error", description: mensaje, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 p-8">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 p-8">
        <div className="flex flex-col items-center justify-center h-64 text-center p-6 bg-red-50 rounded-lg border border-red-100">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-bold text-red-700 mb-2">Error al cargar tipo</h3>
          <p className="text-muted-foreground max-w-md">{error}</p>
          <Button className="mt-4" onClick={() => router.push("/salud/tipos")}>
            Volver a la lista
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <Link href="/salud/tipos">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Button>
      </Link>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Editar Tipo de Tratamiento</CardTitle>
          <CardDescription>Modifica el nombre del tipo</CardDescription>
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
                placeholder="Ej: Vacuna, Desparasitante..."
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
              <Button type="submit" disabled={saving} className="bg-emerald-600">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {saving ? "Guardando..." : "Actualizar Tipo"}
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