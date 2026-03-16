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
import { razasApi } from '@/lib/api/razas';
import type { RazaBackend } from '@/lib/types/raza';

export default function RazasPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [razas, setRazas] = useState<RazaBackend[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRazas = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      const data = await razasApi.getAll(token);
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
            <div className="relative w-72">
              <Input
                placeholder="Buscar raza..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRazas.map((raza) => (
                  <TableRow key={raza.raza_id}>
                    <TableCell className="font-medium">{raza.nombre}</TableCell>
                    <TableCell>{raza.descripcion || '—'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/parametros/razas/${raza.raza_id}`}>
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-red-500"
                          onClick={async () => {
                            if (confirm(`¿Eliminar raza ${raza.nombre}?`)) {
                              try {
                                const token = localStorage.getItem('token')!;
                                await razasApi.delete(raza.raza_id, token);
                                setRazas(razas.filter(r => r.raza_id !== raza.raza_id));
                                toast({ title: "Raza eliminada" });
                              } catch (error: any) {
                                toast({ title: "Error", description: error.message, variant: "destructive" });
                              }
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}