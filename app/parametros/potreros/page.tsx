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
  ArrowLeft,
  MapPin
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { potrerosApi } from '@/lib/api/potreros';
import type { PotreroBackend } from '@/lib/types/potrero';

export default function PotrerosPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [potreros, setPotreros] = useState<PotreroBackend[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPotreros = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      const data = await potrerosApi.getAll(token);
      setPotreros(data);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPotreros();
  }, []);

  const filteredPotreros = potreros.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.ubicacion && p.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()))
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
            <h1 className="text-3xl font-bold text-zinc-900">Potreros</h1>
            <p className="text-zinc-500 mt-1">Gestiona los potreros de la finca</p>
          </div>
          <Link href="/parametros/potreros/nuevo">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Potrero
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Potreros</CardTitle>
            <div className="relative w-72">
              <Input
                placeholder="Buscar potrero..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <CardDescription>
            Total: {filteredPotreros.length} {filteredPotreros.length === 1 ? 'potrero' : 'potreros'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : filteredPotreros.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-500">No hay potreros registrados</p>
              <Link href="/parametros/potreros/nuevo">
                <Button variant="link" className="text-emerald-600 mt-2">
                  Crear primer potrero
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPotreros.map((potrero) => (
                  <TableRow key={potrero.potrero_id}>
                    <TableCell className="font-medium">{potrero.nombre}</TableCell>
                    <TableCell>
                      {potrero.ubicacion ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-zinc-400" />
                          {potrero.ubicacion}
                        </div>
                      ) : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/parametros/potreros/${potrero.potrero_id}`}>
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-red-500"
                          onClick={async () => {
                            if (confirm(`¿Eliminar potrero ${potrero.nombre}?`)) {
                              try {
                                const token = localStorage.getItem('token');
                                if (!token) return;
                                await potrerosApi.delete(potrero.potrero_id, token);
                                setPotreros(potreros.filter(p => p.potrero_id !== potrero.potrero_id));
                                toast({ title: "Potrero eliminado" });
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