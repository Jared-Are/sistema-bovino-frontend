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
import { lotesApi } from '@/lib/api/lotes';
import type { LoteBackend } from '@/lib/types/lote';

export default function LotesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [lotes, setLotes] = useState<LoteBackend[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLotes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }
      const data = await lotesApi.getAll(token);
      setLotes(data);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLotes();
  }, []);

  const filteredLotes = lotes.filter(l => 
    l.nombre.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-3xl font-bold text-zinc-900">Lotes</h1>
            <p className="text-zinc-500 mt-1">Gestiona los lotes de animales</p>
          </div>
          <Link href="/parametros/lotes/nuevo">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Lote
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Lotes</CardTitle>
            <div className="relative w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-zinc-400" />
              </span>
              <Input
                type="text"
                placeholder="Buscar lote..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                className="w-full border border-zinc-300 rounded-md"
              />
            </div>
          </div>
          <CardDescription>
            Total: {filteredLotes.length} {filteredLotes.length === 1 ? 'lote' : 'lotes'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : filteredLotes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-500">No hay lotes registrados</p>
              <Link href="/parametros/lotes/nuevo">
                <Button variant="link" className="text-emerald-600 mt-2">
                  Crear primer lote
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[70%]">Nombre</TableHead>
                    <TableHead className="w-[30%] text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLotes.map((lote) => (
                    <TableRow key={lote.lote_id}>
                      <TableCell className="font-medium">{lote.nombre}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/parametros/lotes/${lote.lote_id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={async () => {
                              if (confirm(`¿Eliminar lote ${lote.nombre}?`)) {
                                try {
                                  const token = localStorage.getItem('token');
                                  if (!token) return;
                                  await lotesApi.delete(lote.lote_id, token);
                                  setLotes(lotes.filter(l => l.lote_id !== lote.lote_id));
                                  toast({ title: "Lote eliminado" });
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}