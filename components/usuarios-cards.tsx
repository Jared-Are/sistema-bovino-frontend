import { Badge } from '@/components/ui/badge';
import { User, Phone, Mail, Shield, Calendar } from 'lucide-react';
import type { Usuario } from '@/types/usuario';
import { useState } from 'react';

interface UsuarioCardsProps {
  usuarios: Usuario[];
  selectedUsuario?: string;
  onUsuarioSelect: (usuarioId: string) => void;
}

const getRolColor = (rol: string) => {
  const colores: Record<string, string> = {
    'ADMINISTRADOR': 'bg-purple-50 text-purple-700 border-purple-200',
    'SUPERVISOR': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'OPERARIO': 'bg-blue-50 text-blue-700 border-blue-200',
  };
  return colores[rol] || 'bg-gray-50 text-gray-700 border-gray-200';
};

const getEstadoColor = (estado: string) => {
  const colores: Record<string, string> = {
    'ACTIVO': 'bg-emerald-100 text-emerald-800',
    'INACTIVO': 'bg-gray-100 text-gray-800',
    'SUSPENDIDO': 'bg-orange-100 text-orange-800',
  };
  return colores[estado] || 'bg-gray-100 text-gray-800';
};

export function UsuarioCards({ usuarios, selectedUsuario, onUsuarioSelect }: UsuarioCardsProps) {
  if (usuarios.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <p className="text-zinc-500">No hay usuarios para mostrar</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {usuarios.map((usuario) => (
        <div
          key={usuario.id}
          onClick={() => onUsuarioSelect(usuario.id)}
          className={`cursor-pointer rounded-xl border transition-all shadow-sm hover:shadow-md overflow-hidden ${
            selectedUsuario === usuario.id 
              ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-200' 
              : 'border-zinc-200 bg-white hover:border-emerald-300'
          }`}
        >
          <div className="w-full h-48 bg-gradient-to-br from-purple-50 to-emerald-100 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/5 to-transparent" />
            <div className="absolute top-4 left-4">
              <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                <User className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <div className="absolute top-4 right-4">
              <Badge className="bg-white/90 text-purple-700 border border-purple-200 shadow-sm">
                {usuario.rol}
              </Badge>
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0 pr-2">
                <h3 className="text-lg font-bold text-zinc-900 truncate">{usuario.nombre}</h3>
                <div className="flex items-center gap-1 mt-1">
                  <Badge variant="secondary" className="bg-zinc-100 text-zinc-700 font-mono text-xs">
                    {usuario.telefono}
                  </Badge>
                </div>
              </div>
              <Badge variant="outline" className={`${getEstadoColor(usuario.estado)} shrink-0`}>
                {usuario.estado}
              </Badge>
            </div>

            <div className="space-y-2 mb-3">
              {usuario.email && (
                <div className="flex items-center text-sm text-zinc-600">
                  <Mail className="w-4 h-4 mr-2 text-zinc-400 shrink-0" />
                  <span className="truncate">{usuario.email}</span>
                </div>
              )}
              {usuario.finca && (
                <div className="flex items-center text-sm text-zinc-600">
                  <Shield className="w-4 h-4 mr-2 text-zinc-400 shrink-0" />
                  <span>{usuario.finca}</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-zinc-100 flex justify-between items-center">
              <span className="text-xs text-zinc-500">
                Creado {new Date(usuario.fechaCreacion).toLocaleDateString('es-ES')}
              </span>
              {usuario.debeCambiarContrasena && (
                <Badge variant="destructive" className="text-xs">
                  Cambiar contraseña
                </Badge>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}