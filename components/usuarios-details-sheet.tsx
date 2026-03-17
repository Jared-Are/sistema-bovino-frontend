// app/usuarios/usuario-details-sheet.tsx
'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Usuario } from '@/types/usuario';
import {
  User,
  Phone,
  Mail,
  Shield,
  Calendar,
  Key,
  MapPin,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface UsuarioDetailsSheetProps {
  usuario: Usuario | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UsuarioDetailsSheet({
  usuario,
  isOpen,
  onOpenChange,
}: UsuarioDetailsSheetProps) {
  if (!usuario) return null;

  const getRolBadgeColor = (rol: string) => {
    const colors: Record<string, string> = {
      'ADMINISTRADOR': 'bg-purple-100 text-purple-800',
      'SUPERVISOR': 'bg-emerald-100 text-emerald-800',
      'OPERARIO': 'bg-blue-100 text-blue-800',
    };
    return colors[rol] || 'bg-gray-100 text-gray-800';
  };

  const getEstadoBadgeColor = (estado: string) => {
    const colors: Record<string, string> = {
      'ACTIVO': 'bg-emerald-100 text-emerald-800',
      'INACTIVO': 'bg-gray-100 text-gray-800',
      'SUSPENDIDO': 'bg-orange-100 text-orange-800',
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full sm:w-[85%] md:w-[75%] lg:w-[60%] xl:w-[50%] max-w-4xl overflow-y-auto p-0"
      >
        <div className="relative">
          <div className="bg-gradient-to-br from-purple-50 to-emerald-100 p-6 border-b border-zinc-200 sticky top-0 z-10">
            <SheetHeader className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <SheetTitle className="text-3xl font-bold text-zinc-900">
                    {usuario.nombre}
                  </SheetTitle>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge className="bg-purple-600 text-white">{usuario.telefono}</Badge>
                    <Badge variant="outline" className="bg-white">
                      {usuario.rol}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Link href={`/usuarios/${usuario.id}`}>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Key className="w-4 h-4" />
                      <span className="hidden sm:inline">Editar</span>
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4">
                <div className="bg-white rounded-lg p-3 border border-zinc-200">
                  <p className="text-xs text-zinc-500 font-medium">Rol</p>
                  <p className="text-lg font-bold text-zinc-900">{usuario.rol}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-zinc-200">
                  <p className="text-xs text-zinc-500 font-medium">Estado</p>
                  <p className="text-lg font-bold text-zinc-900">{usuario.estado}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-zinc-200">
                  <p className="text-xs text-zinc-500 font-medium">Finca</p>
                  <p className="text-lg font-bold text-zinc-900">{usuario.finca || 'No asignada'}</p>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap pt-2">
                <Badge className={getRolBadgeColor(usuario.rol)}>
                  {usuario.rol}
                </Badge>
                <Badge className={getEstadoBadgeColor(usuario.estado)}>
                  {usuario.estado}
                </Badge>
                {usuario.debeCambiarContrasena && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Debe cambiar contraseña
                  </Badge>
                )}
              </div>
            </SheetHeader>
          </div>
        </div>

        <div className="p-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="actividad">Actividad</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide flex items-center gap-2">
                  <User className="w-4 h-4" /> Información de Contacto
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-zinc-200 rounded-lg p-4 bg-white">
                    <p className="text-xs text-zinc-500 font-medium mb-1">Teléfono</p>
                    <p className="text-base font-bold text-zinc-900 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-zinc-400" />
                      {usuario.telefono}
                    </p>
                  </div>
                  {usuario.email && (
                    <div className="border border-zinc-200 rounded-lg p-4 bg-white">
                      <p className="text-xs text-zinc-500 font-medium mb-1">Email</p>
                      <p className="text-base font-bold text-zinc-900 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-zinc-400" />
                        {usuario.email}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Permisos y Acceso
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-zinc-200 rounded-lg p-4 bg-white">
                    <p className="text-xs text-zinc-500 font-medium mb-1">Rol</p>
                    <p className="text-lg font-bold text-purple-700">{usuario.rol}</p>
                  </div>
                  <div className="border border-zinc-200 rounded-lg p-4 bg-white">
                    <p className="text-xs text-zinc-500 font-medium mb-1">Estado</p>
                    <p className="text-lg font-bold text-emerald-700 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      {usuario.estado}
                    </p>
                  </div>
                  <div className="border border-zinc-200 rounded-lg p-4 bg-white">
                    <p className="text-xs text-zinc-500 font-medium mb-1">Finca</p>
                    <p className="text-base font-bold text-zinc-900">{usuario.finca || 'Sin asignar'}</p>
                  </div>
                  <div className="border border-zinc-200 rounded-lg p-4 bg-white">
                    <p className="text-xs text-zinc-500 font-medium mb-1">Creado</p>
                    <p className="text-base font-bold text-zinc-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-zinc-400" />
                      {formatFecha(usuario.fechaCreacion)}
                    </p>
                  </div>
                </div>
              </div>

              {usuario.debeCambiarContrasena && (
                <div className="space-y-4 pt-6 border-t border-zinc-200">
                  <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide flex items-center gap-2">
                    <Key className="w-4 h-4" /> Seguridad
                  </h3>
                  <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-orange-900">
                          Este usuario debe cambiar su contraseña
                        </p>
                        <p className="text-xs text-orange-700 mt-1">
                          Al iniciar sesión por primera vez, se le pedirá cambiar la contraseña.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="actividad" className="space-y-6">
              <div className="border border-dashed border-zinc-300 rounded-lg p-12 text-center">
                <User className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-zinc-900 mb-2">Historial de Actividad</h3>
                <p className="text-zinc-500">Próximamente: sesiones, acciones y auditoría</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}