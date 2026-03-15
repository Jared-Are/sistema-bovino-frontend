'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { mockAnimals, Animal } from '@/lib/mock-data';

const getEstadoReproductivoBadge = (estado: string) => {
  const config: Record<string, { className: string; label: string }> = {
    vacia: { className: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Vacía' },
    gestacion: { className: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Gestación' },
    lactancia: { className: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Lactancia' },
    seco: { className: 'bg-gray-50 text-gray-700 border-gray-200', label: 'Seco' },
    preparto: { className: 'bg-orange-50 text-orange-700 border-orange-200', label: 'Preparto' },
  };
  return config[estado] || config['vacia'];
};

const getEstadoSaludBadge = (estado: string) => {
  const config: Record<string, { className: string; label: string }> = {
    sano: { className: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Sano' },
    enfermo: { className: 'bg-red-50 text-red-700 border-red-200', label: 'Enfermo' },
    tratamiento: { className: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'Tratamiento' },
    critico: { className: 'bg-red-100 text-red-800 border-red-300', label: 'Crítico' },
  };
  return config[estado] || config['sano'];
};

interface InventoryTableProps {
  animals?: Animal[];
  selectedAnimal?: string;
  onAnimalSelect?: (animalId: string) => void;
}

export function InventoryTable({ 
  animals = mockAnimals, 
  selectedAnimal, 
  onAnimalSelect 
}: InventoryTableProps) {
  return (
    <div className="rounded-lg border border-zinc-200 overflow-hidden bg-white">
      <Table>
        <TableHeader className="bg-zinc-50">
          <TableRow className="border-b border-zinc-200 hover:bg-zinc-50">
            <TableHead className="font-semibold text-zinc-700">Arete</TableHead>
            <TableHead className="font-semibold text-zinc-700">Nombre</TableHead>
            <TableHead className="font-semibold text-zinc-700">Lote</TableHead>
            <TableHead className="font-semibold text-zinc-700">Estado Reproductivo</TableHead>
            <TableHead className="font-semibold text-zinc-700">Estado Salud</TableHead>
            <TableHead className="font-semibold text-zinc-700">Último Peso</TableHead>
            <TableHead className="font-semibold text-zinc-700 text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {animals.map((animal) => {
            const reproductivoBadge = getEstadoReproductivoBadge(animal.estadoReproductivo);
            const saludBadge = getEstadoSaludBadge(animal.estadoSalud);
            const isSelected = selectedAnimal === animal.id;

            return (
              <TableRow
                key={animal.id}
                className={`border-b border-zinc-100 transition-colors cursor-pointer ${
                  isSelected ? 'bg-emerald-50' : 'hover:bg-zinc-50'
                }`}
                onClick={() => onAnimalSelect?.(animal.id)}
              >
                <TableCell className="py-4">
                  <span className="font-medium text-zinc-900">{animal.arete}</span>
                </TableCell>
                <TableCell className="py-4 text-zinc-700 font-medium">{animal.nombre}</TableCell>
                <TableCell className="py-4 text-sm text-zinc-600">{animal.lote}</TableCell>
                <TableCell className="py-4">
                  <Badge variant="outline" className={reproductivoBadge.className}>
                    {reproductivoBadge.label}
                  </Badge>
                </TableCell>
                <TableCell className="py-4">
                  <Badge variant="outline" className={saludBadge.className}>
                    {saludBadge.label}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 text-zinc-700">{animal.ultimoPeso} kg</TableCell>
                <TableCell className="py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-zinc-100"
                      >
                        <MoreHorizontal className="w-4 h-4 text-zinc-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                        <Edit className="w-4 h-4 text-zinc-500" />
                        <span>Editar</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                        <span>Eliminar</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
