'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

type UsuarioData = {
  usuario_id: string;
  nombre: string;
  telefono: string;
  email: string;
  rol: string;
  estado: 'ACTIVO' | 'INVITADO' | 'BLOQUEADO';
  debe_cambiar_contrasena: boolean;
};

export default function EditarUsuarioPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [usuarioActual, setUsuarioActual] = useState<UsuarioData | null>(null);
  const [usuarioLogueado, setUsuarioLogueado] = useState<{ usuario_id: string; rol: string } | null>(null);
  
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    email: "",
    rol: "",
    estado: "ACTIVO" as 'ACTIVO' | 'BLOQUEADO',
  });

  useEffect(() => {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      try {
        const usuario = JSON.parse(usuarioStr);
        setUsuarioLogueado({
          usuario_id: usuario.usuario_id,
          rol: usuario.rol
        });
      } catch (e) {
        console.error('Error parsing usuario:', e);
      }
    }
  }, []);

  useEffect(() => {
    const fetchUsuario = async () => {
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

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuarios/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Usuario no encontrado");
          }
          throw new Error("Error al cargar usuario");
        }

        const data = await response.json();
        setUsuarioActual(data);
        
        setFormData({
          nombre: data.nombre || "",
          telefono: data.telefono || "",
          email: data.email || "",
          rol: data.rol || "",
          estado: data.estado === 'ACTIVO' ? 'ACTIVO' : 'BLOQUEADO',
        });

      } catch (err: any) {
        setError(err.message);
        toast({ title: "Error", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchUsuario();
  }, [id, router, toast]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.nombre || formData.nombre.length < 2) {
      errors.nombre = "El nombre es muy corto";
    }
    
    if (!formData.telefono || formData.telefono.length < 8) {
      errors.telefono = "El teléfono debe tener al menos 8 dígitos";
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Email inválido";
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);

    try {
      const payload: any = {};
      
      if (formData.nombre !== usuarioActual?.nombre) {
        payload.nombre = formData.nombre;
      }
      
      if (formData.telefono !== usuarioActual?.telefono) {
        payload.telefono = formData.telefono;
      }
      
      if (formData.email !== usuarioActual?.email) {
        if (usuarioActual?.estado === 'INVITADO') {
          toast({ 
            title: "No permitido", 
            description: "No se puede cambiar el email de un usuario INVITADO",
            variant: "destructive"
          });
          setSaving(false);
          return;
        }
        payload.email = formData.email;
      }
      
      if (formData.rol !== usuarioActual?.rol) {
        payload.rol = formData.rol;
      }
      
      if (formData.estado !== usuarioActual?.estado) {
        if (usuarioLogueado?.usuario_id === usuarioActual?.usuario_id) {
          toast({ 
            title: "No permitido", 
            description: "No puedes cambiar tu propio estado",
            variant: "destructive"
          });
          setSaving(false);
          return;
        }
        if (usuarioActual?.estado === 'INVITADO') {
          toast({ 
            title: "No permitido", 
            description: "No se puede cambiar el estado de un usuario INVITADO",
            variant: "destructive"
          });
          setSaving(false);
          return;
        }
        payload.estado = formData.estado;
      }

      if (Object.keys(payload).length === 0) {
        toast({ 
          title: "Sin cambios", 
          description: "No se detectaron cambios para actualizar",
        });
        router.push('/usuarios');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) throw new Error('No autorizado');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuarios/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.message?.toLowerCase().includes('email')) {
          setFieldErrors({ email: 'Este email ya está registrado' });
          toast({ title: "Error", description: "Este email ya está registrado", variant: "destructive" });
        } else if (data.message?.toLowerCase().includes('teléfono')) {
          setFieldErrors({ telefono: 'Este teléfono ya está registrado' });
          toast({ title: "Error", description: "Este teléfono ya está registrado", variant: "destructive" });
        } else {
          throw new Error(data.message || 'Error al actualizar usuario');
        }
        return;
      }

      toast({ 
        title: "¡Usuario Actualizado!", 
        description: data.mensaje || "Los datos del usuario se actualizaron correctamente.",
        className: "bg-green-600 text-white"
      });
      
      router.push("/usuarios");

    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const getRolLabel = (rol: string) => {
    switch(rol) {
      case 'propietario': return 'Propietario';
      case 'veterinario': return 'Veterinario';
      case 'operario': return 'Operario';
      default: return rol;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 p-8 flex justify-center items-center">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error || !usuarioActual) {
    return (
      <div className="min-h-screen bg-zinc-50 p-8">
        <div className="flex flex-col items-center justify-center h-64 text-center p-6 bg-red-50 rounded-lg border border-red-100">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-bold text-red-700 mb-2">Error al cargar usuario</h3>
          <p className="text-muted-foreground max-w-md">{error || "Usuario no encontrado"}</p>
          <Button className="mt-4" onClick={() => router.push("/usuarios")}>
            Volver a la lista
          </Button>
        </div>
      </div>
    );
  }

  const puedeEditarRol = usuarioActual.rol !== 'propietario';
  const esUsuarioActual = usuarioLogueado?.usuario_id === usuarioActual.usuario_id;

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <Link href="/usuarios">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver a Usuarios
        </Button>
      </Link>

      <Card className="max-w-2xl mx-auto">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre Completo</Label>
                <Input
                  id="nombre"
                  className={fieldErrors.nombre ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  placeholder="Ej: Juan Pérez"
                />
                {fieldErrors.nombre && (
                  <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {fieldErrors.nombre}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  className={fieldErrors.telefono ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  value={formData.telefono}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setFormData({...formData, telefono: val});
                  }}
                  placeholder="88880000"
                  maxLength={15}
                />
                {fieldErrors.telefono && (
                  <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {fieldErrors.telefono}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  className={fieldErrors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="usuario@ejemplo.com"
                />
                {fieldErrors.email && (
                  <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {puedeEditarRol && (
                <div className="space-y-2">
                  <Label htmlFor="rol">Rol</Label>
                  <Select 
                    value={formData.rol} 
                    onValueChange={(v) => setFormData({...formData, rol: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="veterinario">Veterinario</SelectItem>
                      <SelectItem value="operario">Operario</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {!puedeEditarRol && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-600">Rol</Label>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700">
                      {getRolLabel(usuarioActual.rol)}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select 
                  value={formData.estado} 
                  onValueChange={(v: 'ACTIVO' | 'BLOQUEADO') => setFormData({...formData, estado: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVO">Activo</SelectItem>
                    <SelectItem value="BLOQUEADO">Bloqueado</SelectItem>
                  </SelectContent>
                </Select>
                {esUsuarioActual && (
                  <p className="text-xs text-red-500">
                    No puedes cambiar tu propio estado
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {saving ? "Guardando..." : "Guardar Cambios"}
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