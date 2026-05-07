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
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import Modal from '@/components/ui/modal';
type Raza = {
  raza_id: number;
  nombre: string;
  descripcion?: string;
};

export default function RazasPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [razas, setRazas] = useState<Raza[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [razaToDelete, setRazaToDelete] = useState<Raza | null>(null);

  const fetchRazas = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/parametros/razas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Error al cargar razas');
      
      const data = await response.json();
      setRazas(data);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRazas();
  }, []);

  const filteredRazas = razas.filter(r => 
    r.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (raza: Raza) => {
    setRazaToDelete(raza);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!razaToDelete) return;
    
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/parametros/razas/${razaToDelete.raza_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.message?.includes('hay animales asociados')) {
          toast({ 
            title: "❌ No se puede eliminar", 
            description: error.message,
            variant: "destructive",
            className: "text-white" ,
            duration: 5000,
          });
          setModalOpen(false); 
          return;
        }
        throw new Error(error.message || 'Error al eliminar');
      }
      
      setRazas(razas.filter(r => r.raza_id !== razaToDelete.raza_id));
      toast({ 
        title: "✅ Raza eliminada", 
        description: `${razaToDelete.nombre} ha sido eliminada`,
        duration: 3000,
      });
      setModalOpen(false);
    } catch (error: any) {
      toast({ 
        title: "❌ Error", 
        description: error.message, 
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setDeleting(false);
      setRazaToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="mb-6">
        <Link href="/animales">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Volver a Animales
          </Button>
        </Link>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">Razas</h1>
            <p className="text-zinc-500 mt-1">Gestiona las razas de animales</p>
          </div>
          <Link href="/parametros/razas/nuevo">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Raza
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Razas</CardTitle>
            <div className="relative w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-zinc-400" />
              </span>
              <Input
                type="text"
                placeholder="Buscar raza..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                className="w-full border border-zinc-300 rounded-md"
              />
            </div>
          </div>
          <CardDescription>
            Total: {filteredRazas.length} {filteredRazas.length === 1 ? 'raza' : 'razas'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : filteredRazas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-500">No hay razas registradas</p>
              <Link href="/parametros/razas/nuevo">
                <Button variant="link" className="text-emerald-600 mt-2">
                  Crear primera raza
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">Nombre</TableHead>
                    <TableHead className="w-[50%]">Descripción</TableHead>
                    <TableHead className="w-[20%] text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRazas.map((raza) => (
                    <TableRow key={raza.raza_id}>
                      <TableCell className="font-medium">{raza.nombre}</TableCell>
                      <TableCell>{raza.descripcion || '—'}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/parametros/razas/${raza.raza_id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteClick(raza)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Eliminar Raza"
        description={`¿Está seguro de eliminar la raza "${razaToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        variant="destructive"
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}