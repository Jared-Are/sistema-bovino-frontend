'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Loader2,
  Mail,
  Phone,
  User,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import Modal from '@/components/ui/modal';

type Usuario = {
  usuario_id: string;
  nombre: string;
  telefono: string;
  email?: string;
  rol: 'propietario' | 'veterinario' | 'operario';
  estado: 'ACTIVO' | 'INVITADO' | 'BLOQUEADO';
  debe_cambiar_contrasena: boolean;
};

export default function UsuariosPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [usuarioActual, setUsuarioActual] = useState<{ usuario_id: string; rol: string } | null>(null);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState<Usuario | null>(null);

  useEffect(() => {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      try {
        const usuario = JSON.parse(usuarioStr);
        setUsuarioActual({
          usuario_id: usuario.usuario_id,
          rol: usuario.rol
        });
      } catch (e) {
        console.error('Error parsing usuario:', e);
      }
    }
  }, []);

  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuarios`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Error al cargar usuarios');
      
      const data = await response.json();
      setUsuarios(data);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const filteredUsuarios = usuarios.filter(u => 
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.telefono.includes(searchTerm) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (usuario: Usuario) => {
    if (usuario.rol === 'propietario') {
      toast({ 
        title: "⚠️ No se puede eliminar", 
        description: "El propietario no puede ser eliminado",
        variant: "destructive" 
      });
      return;
    }
    setUsuarioToDelete(usuario);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!usuarioToDelete) return;
    
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuarios/${usuarioToDelete.usuario_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Error al eliminar');
      
      setUsuarios(usuarios.filter(u => u.usuario_id !== usuarioToDelete.usuario_id));
      toast({ 
        title: "✅ Usuario eliminado", 
        description: `${usuarioToDelete.nombre} ha sido eliminado`,
        duration: 3000,
      });
    } catch (error: any) {
      toast({ 
        title: "❌ Error", 
        description: error.message, 
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setDeleting(false);
      setModalOpen(false);
      setUsuarioToDelete(null);
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch(estado) {
      case 'ACTIVO':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          text: 'Activo',
          className: 'bg-green-100 text-green-700 border-green-200'
        };
      case 'INVITADO':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          text: 'Invitado',
          className: 'bg-yellow-100 text-yellow-700 border-yellow-200'
        };
      case 'BLOQUEADO':
        return {
          icon: <XCircle className="h-4 w-4" />,
          text: 'Bloqueado',
          className: 'bg-red-100 text-red-700 border-red-200'
        };
      default:
        return {
          icon: <XCircle className="h-4 w-4" />,
          text: estado,
          className: 'bg-gray-100 text-gray-700 border-gray-200'
        };
    }
  };

  const getRolColor = (rol: string) => {
    switch(rol) {
      case 'propietario': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'veterinario': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'operario':    return 'bg-blue-100 text-blue-700 border-blue-200';
      default:            return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRolLabel = (rol: string) => {
    switch(rol) {
      case 'propietario': return 'Propietario';
      case 'veterinario': return 'Veterinario';
      case 'operario':    return 'Operario';
      default:            return rol;
    }
  };

  const puedeEditar = (usuario: Usuario) => {
    return usuarioActual?.rol === 'propietario';
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">Usuarios</h1>
            <p className="text-zinc-500 mt-1">Gestiona los usuarios de tu finca</p>
          </div>
          <Link href="/usuarios/nuevo">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Usuarios</CardTitle>
            <div className="relative w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-zinc-400" />
              </span>
              <Input
                type="text"
                placeholder="Buscar usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                className="w-full border border-zinc-300 rounded-md"
              />
            </div>
          </div>
          <CardDescription>
            Total: {filteredUsuarios.length} {filteredUsuarios.length === 1 ? 'usuario' : 'usuarios'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : filteredUsuarios.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-500">No hay usuarios registrados</p>
              <Link href="/usuarios/nuevo">
                <Button variant="link" className="text-emerald-600 mt-2">
                  Crear primer usuario
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsuarios.map((usuario) => {
                    const estadoBadge = getEstadoBadge(usuario.estado);
                    
                    return (
                      <TableRow key={usuario.usuario_id} className="hover:bg-zinc-50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-emerald-600" />
                            </div>
                            <span className="font-medium">{usuario.nombre}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3 text-zinc-400" />
                              <span>{usuario.telefono}</span>
                            </div>
                            {usuario.email && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-3 w-3 text-zinc-400" />
                                <span className="text-zinc-600">{usuario.email}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${estadoBadge.className} w-fit`}>
                            {estadoBadge.icon}
                            {estadoBadge.text}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRolColor(usuario.rol)}`}>
                            {getRolLabel(usuario.rol)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            {puedeEditar(usuario) && (
                              <Link href={`/usuarios/${usuario.usuario_id}`}>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                  title="Editar usuario"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                            
                            {usuario.rol !== 'propietario' && usuario.usuario_id !== usuarioActual?.usuario_id && (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleDeleteClick(usuario)}
                                title="Eliminar usuario"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Eliminar Usuario"
        description={`¿Está seguro de eliminar al usuario "${usuarioToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        variant="destructive"
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}