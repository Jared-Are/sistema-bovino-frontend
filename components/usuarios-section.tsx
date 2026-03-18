'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { UsuarioFilters } from '@/app/usuarios/usuario-filters';
import { UsuarioDetailsSheet } from '@/app/usuarios/usuario-details-sheet';
import { UsuarioCards } from '@/app/usuarios/usuario-cards';
import { usuariosApi } from '@/lib/api/usuarios';
import type { Usuario } from '@/types/usuario';
import Link from 'next/link';

const mapBackendToFrontend = (backend: any): Usuario => ({
  id: backend.usuario_id,
  nombre: backend.nombre,
  email: backend.email,
  telefono: backend.telefono,
  rol: backend.rol,
  estado: backend.estado,
  finca: backend.finca?.nombre || undefined,
  fechaCreacion: backend.fecha_creacion.split('T')[0],
  debeCambiarContrasena: backend.debe_cambiar_contrasena,
});

export function UsuariosSection() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [selectedUsuarioId, setSelectedUsuarioId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [filters, setFilters] = useState({
    roles: [] as string[],
    estados: [] as string[],
    search: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const data = await usuariosApi.getAll(token);
      const usuariosMapeados = data.map(mapBackendToFrontend);
      setUsuarios(usuariosMapeados);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Error al cargar los usuarios');
      
      if (err.message === 'No autorizado') {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        router.push('/login');
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const filteredUsuarios = useMemo(() => {
    return usuarios.filter((usuario) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          usuario.nombre.toLowerCase().includes(searchLower) ||
          usuario.telefono.toLowerCase().includes(searchLower) ||
          (usuario.email && usuario.email.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }

      if (filters.roles.length > 0) {
        if (!filters.roles.includes(usuario.rol)) return false;
      }

      if (filters.estados.length > 0) {
        if (!filters.estados.includes(usuario.estado)) return false;
      }

      return true;
    });
  }, [usuarios, filters]);

  const selectedUsuario = usuarios.find((u) => u.id === selectedUsuarioId);

  const opcionesRoles = ['ADMINISTRADOR', 'SUPERVISOR', 'OPERARIO'];
  const opcionesEstados = ['ACTIVO', 'INACTIVO', 'SUSPENDIDO'];

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">
                Usuarios
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                {cargando ? 'Cargando...' : `${filteredUsuarios.length} usuarios encontrados`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {error && (
                <span className="text-sm text-red-600">{error}</span>
              )}
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={cargarUsuarios}
                disabled={cargando}
              >
                {cargando ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Actualizar
              </Button>
              
              <Link href="/usuarios/nuevo">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
                  <Plus className="w-4 h-4" />
                  Nuevo Usuario
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <UsuarioFilters 
          onFiltersChange={setFilters}
          roles={opcionesRoles}
          estados={opcionesEstados}
        />

        {cargando ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <>
            <div className="mt-6">
              <UsuarioCards
                usuarios={filteredUsuarios}
                selectedUsuario={selectedUsuarioId || undefined}
                onUsuarioSelect={(id) => {
                  setSelectedUsuarioId(id);
                  setIsSheetOpen(true);
                }}
              />
            </div>

            {filteredUsuarios.length === 0 && !cargando && (
              <div className="text-center py-12">
                <p className="text-zinc-500">No se encontraron usuarios</p>
                <Link href="/usuarios/nuevo">
                  <Button 
                    variant="link" 
                    className="text-purple-600 mt-2"
                  >
                    Crear tu primer usuario
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div> 

      <UsuarioDetailsSheet
        usuario={selectedUsuario || null}
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
    </div>
  );
}