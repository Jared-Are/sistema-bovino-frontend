'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  AlertCircle,
  Phone,
  Mail,
  User
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const usuarioSchema = z.object({
  nombre: z.string().min(2, "El nombre es muy corto"),
  telefono: z.string().min(8, "Teléfono inválido"),
  email: z.string().email("Email inválido"),
  rol: z.enum(['operario', 'veterinario']),
});

type FormData = {
  nombre: string;
  telefono: string;
  email: string;
  rol: 'operario' | 'veterinario';
};

export default function NuevoUsuarioPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    telefono: '',
    email: '',
    rol: 'operario',
  });

  const validateField = (field: keyof FormData, value: string) => {
    try {
      const fieldSchema = z.object({ [field]: usuarioSchema.shape[field] });
      fieldSchema.parse({ [field]: value });
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.errors[0]?.message || 'Campo inválido';
        setFieldErrors(prev => ({ ...prev, [field]: message }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const valid = usuarioSchema.parse(formData);
      setLoading(true);
      setFieldErrors({});

      const token = localStorage.getItem('token');

      const payload = {
        nombre: valid.nombre,
        telefono: valid.telefono,
        email: valid.email,
        rol: valid.rol,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuarios`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.message?.toLowerCase().includes('email')) {
          setFieldErrors(prev => ({ ...prev, email: 'Este email ya está registrado' }));
        } else if (data.message?.toLowerCase().includes('teléfono')) {
          setFieldErrors(prev => ({ ...prev, telefono: 'Este teléfono ya está registrado' }));
        } else {
          setFieldErrors(prev => ({ ...prev, nombre: data.message || 'Error al crear usuario' }));
        }
        throw new Error(data.message);
      }
      
      toast({ 
        title: "¡Usuario Creado!", 
        description: `Se enviaron las credenciales a ${valid.email}`,
        className: "bg-green-600 text-white"
      });
      
      router.push('/usuarios');

    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach(e => {
          if (e.path[0]) errors[e.path[0].toString()] = e.message;
        });
        setFieldErrors(errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <Link href="/usuarios">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver a Usuarios
        </Button>
      </Link>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Nuevo Usuario</CardTitle>
          <CardDescription>Registra un nuevo usuario en la finca</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Completo *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="nombre"
                  className={`pl-10 ${fieldErrors.nombre ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  value={formData.nombre}
                  onChange={(e) => {
                    setFormData({...formData, nombre: e.target.value});
                    validateField('nombre', e.target.value);
                  }}
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              {fieldErrors.nombre && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {fieldErrors.nombre}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="telefono"
                  className={`pl-10 ${fieldErrors.telefono ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  value={formData.telefono}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setFormData({...formData, telefono: val});
                    validateField('telefono', val);
                  }}
                  placeholder="88880000"
                  maxLength={15}
                />
              </div>
              {fieldErrors.telefono && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {fieldErrors.telefono}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  className={`pl-10 ${fieldErrors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({...formData, email: e.target.value});
                    validateField('email', e.target.value);
                  }}
                  placeholder="usuario@ejemplo.com"
                />
              </div>
              {fieldErrors.email && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Rol *</Label>
              <Select 
                value={formData.rol} 
                onValueChange={(v: 'operario' | 'veterinario') => {
                  setFormData({...formData, rol: v});
                  validateField('rol', v);
                }}
              >
                <SelectTrigger className={fieldErrors.rol ? 'border-red-500 focus-visible:ring-red-500' : ''}>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operario">Operario</SelectItem>
                  <SelectItem value="veterinario">Veterinario</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.rol && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {fieldErrors.rol}
                </p>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {loading ? "Creando..." : "Crear Usuario"}
              </Button>
              <Link href="/usuarios">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}